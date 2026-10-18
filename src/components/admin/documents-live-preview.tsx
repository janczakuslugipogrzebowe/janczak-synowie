"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeDocumentsContent } from "@/lib/home-documents/schema";
import type { PublicDocument } from "@/lib/documents/schema";

const CHANGE = "janczak:home-documents-preview:v1";
const READY = "janczak:home-documents-preview:ready:v1";

export default function DocumentsLivePreview({
  data,
  documents,
  phone,
}: {
  data: HomeDocumentsContent;
  documents: PublicDocument[];
  phone: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [dims, setDims] = useState({ width: 1440, height: 1200, available: 0 });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => {
      const next = {
        width: phone ? 390 : window.innerWidth,
        height: phone ? 1900 : Math.max(1150, window.innerHeight),
        available: el.clientWidth,
      };
      setDims((previous) =>
        previous.width === next.width &&
        previous.height === next.height &&
        previous.available === next.available
          ? previous
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [phone]);

  const send = useCallback(
    () =>
      frame.current?.contentWindow?.postMessage(
        { type: CHANGE, content: data, documents },
        window.location.origin,
      ),
    [data, documents],
  );
  useEffect(() => {
    const onReady = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === READY
      )
        send();
    };
    window.addEventListener("message", onReady);
    return () => window.removeEventListener("message", onReady);
  }, [send]);
  useEffect(() => send(), [send]);
  const scale = dims.available ? Math.min(1, dims.available / dims.width) : 0;

  return (
    <div
      ref={host}
      className="w-full overflow-hidden rounded-xl border border-[#e4e0d6] bg-forest-deep shadow-lg"
    >
      <div
        className="relative mx-auto overflow-hidden"
        style={{ width: dims.width * scale, height: dims.height * scale }}
        aria-label={phone ? "Podgląd telefonu" : "Podgląd desktopu"}
      >
        <iframe
          ref={frame}
          title="Podgląd sekcji Dokumenty"
          src="/admin/preview/documents"
          onLoad={send}
          className="absolute left-0 top-0 block border-0"
          style={{
            width: dims.width,
            height: dims.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
