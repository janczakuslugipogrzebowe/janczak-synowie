"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeGalleryContent } from "@/lib/home-gallery/schema";
import type { GalleryPhoto } from "@/lib/gallery/schema";

const CHANGE = "janczak:home-gallery-preview:v1";
const READY = "janczak:home-gallery-preview:ready:v1";
export default function GalleryLivePreview({
  data,
  photos,
  phone,
}: {
  data: HomeGalleryContent;
  photos: GalleryPhoto[];
  phone: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [dims, setDims] = useState({ width: 1440, height: 1100, available: 0 });
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    function measure() {
      const next = {
        width: phone ? 390 : window.innerWidth,
        height: phone ? 1500 : Math.max(950, window.innerHeight),
        available: el?.clientWidth ?? 0,
      };
      setDims((prev) =>
        prev.width === next.width && prev.height === next.height && prev.available === next.available
          ? prev
          : next,
      );
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [phone]);
  const send = useCallback(
    () => frame.current?.contentWindow?.postMessage({ type: CHANGE, data, photos }, window.location.origin),
    [data, photos],
  );
  useEffect(() => {
    function onReady(event: MessageEvent) {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === READY
      )
        send();
    }
    window.addEventListener("message", onReady);
    return () => window.removeEventListener("message", onReady);
  }, [send]);
  useEffect(() => {
    send();
  }, [send]);
  const scale = dims.available ? Math.min(1, dims.available / dims.width) : 0;
  return (
    <div ref={host} className="w-full overflow-hidden rounded-xl border border-[#e4e0d6] bg-ivory shadow-lg">
      <div
        className="relative mx-auto overflow-hidden"
        style={{ width: dims.width * scale, height: dims.height * scale }}
      >
        <iframe
          ref={frame}
          title="Podgląd galerii"
          src="/admin/preview/gallery"
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
