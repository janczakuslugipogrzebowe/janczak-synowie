"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroContent } from "@/lib/hero/schema";
import type { SiteSettings } from "@/lib/settings/schema";

const MESSAGE_TYPE = "janczak:hero-preview:v1";
const READY_TYPE = "janczak:hero-preview:ready:v1";

/**
 * A real isolated viewport rather than squeezing Hero into a CMS column.
 * The iframe has the same width and height as the user's browser (desktop),
 * or a 390x844 viewport (phone), then is visually scaled to the available
 * editor width. Both views therefore use the SAME responsive CSS rules.
 */
export default function HeroLivePreview({
  hero,
  settings,
  phone,
}: {
  hero: HeroContent;
  settings: SiteSettings;
  phone: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1440, height: 900, available: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const next = {
        width: phone ? 390 : window.innerWidth,
        height: phone ? 844 : window.innerHeight,
        available: host.clientWidth,
      };
      setDimensions((prev) =>
        prev.width === next.width && prev.height === next.height && prev.available === next.available
          ? prev
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [phone]);

  const sendState = useCallback(() => {
    const receiver = frameRef.current?.contentWindow;
    if (!receiver) return;
    receiver.postMessage({ type: MESSAGE_TYPE, hero, settings }, window.location.origin);
  }, [hero, settings]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === READY_TYPE
      ) sendState();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendState]);

  useEffect(() => {
    // Live update when the editor changes a field, without reloading the iframe.
    sendState();
  }, [sendState]);

  const scale = dimensions.available > 0
    ? Math.min(1, dimensions.available / dimensions.width)
    : 0;

  return (
    <div ref={hostRef} className="w-full overflow-hidden rounded-xl border border-[#e4e0d6] bg-forest-deep shadow-lg">
      <div
        aria-label={phone ? "Podgląd Hero na telefonie" : "Podgląd Hero na desktopie"}
        className="relative mx-auto overflow-hidden"
        style={{
          width: dimensions.width * scale,
          height: dimensions.height * scale,
        }}
      >
        <iframe
          ref={frameRef}
          title="Podgląd sekcji Hero"
          src="/admin/preview/hero"
          onLoad={sendState}
          className="absolute left-0 top-0 block border-0 bg-forest-deep"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
