"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AboutSection } from "@/lib/about-page/schema";

export const ABOUT_PREVIEW_CHANGE = "janczak:about-page:change:v1";
export const ABOUT_PREVIEW_READY = "janczak:about-page:ready:v1";
export type AboutPreviewSection = AboutSection | "hero" | "bottom";

export default function AboutPagePreview({
  section,
  content,
}: {
  section: AboutPreviewSection;
  content: unknown;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [phone, setPhone] = useState(false);
  const [available, setAvailable] = useState(0);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setAvailable(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      { type: ABOUT_PREVIEW_CHANGE, section, content },
      window.location.origin,
    );
  }, [section, content]);
  useEffect(() => {
    function ready(event: MessageEvent) {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === ABOUT_PREVIEW_READY
      )
        send();
    }
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [send]);
  useEffect(() => {
    send();
  }, [send]);
  const width = phone ? 390 : 1440;
  const height = phone ? 1660 : 1020;
  const scale = available ? Math.min(1, available / width) : 0;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[#657166]">Podgląd na żywo — przed publikacją</p>
        <div
          className="flex rounded-lg border border-[#dcd4c5] p-1 text-xs"
          role="group"
          aria-label="Rozmiar podglądu"
        >
          <button
            type="button"
            onClick={() => setPhone(false)}
            aria-pressed={!phone}
            className={`rounded-md px-3 py-1.5 ${!phone ? "bg-[#183528] text-white" : "text-[#516556]"}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setPhone(true)}
            aria-pressed={phone}
            className={`rounded-md px-3 py-1.5 ${phone ? "bg-[#183528] text-white" : "text-[#516556]"}`}
          >
            Telefon
          </button>
        </div>
      </div>
      <div
        ref={host}
        className="w-full overflow-hidden rounded-xl border border-[#ddd4c8] bg-[#f8f4ec] shadow-[0_16px_45px_-32px_rgba(16,34,24,.45)]"
      >
        <div
          className="relative mx-auto overflow-hidden"
          style={{ width: width * scale, height: height * scale }}
        >
          <iframe
            ref={frame}
            title={`Podgląd sekcji O nas: ${section}`}
            src="/admin/preview/about-page"
            onLoad={send}
            className="absolute left-0 top-0 border-0"
            style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        </div>
      </div>
    </div>
  );
}
