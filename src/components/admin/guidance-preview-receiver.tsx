"use client";
import { useEffect, useState } from "react";
import HomeGuidanceSection from "@/components/home-guidance/home-guidance-section";
import { parseHomeGuidance, type HomeGuidanceContent } from "@/lib/home-guidance/schema";
import { parseSiteSettings, type SiteSettings } from "@/lib/settings/schema";
const CHANGE = "janczak:home-guidance-preview:v1";
const READY = "janczak:home-guidance-preview:ready:v1";
export default function GuidancePreviewReceiver() {
  const [state, setState] = useState<{ data: HomeGuidanceContent; settings: SiteSettings } | null>(null);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== CHANGE
      )
        return;
      try {
        setState({
          data: parseHomeGuidance(event.data.content),
          settings: parseSiteSettings(event.data.settings),
        });
      } catch {
        /** Invalid drafts must not render. */
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <main id="main" className="min-h-dvh bg-ivory">
      {state && <HomeGuidanceSection data={state.data} settings={state.settings} preview />}
    </main>
  );
}
