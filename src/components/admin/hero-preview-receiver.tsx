"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/hero/hero-section";
import { parseHero, type HeroContent } from "@/lib/hero/schema";
import { parseSiteSettings, type SiteSettings } from "@/lib/settings/schema";

const MESSAGE_TYPE = "janczak:hero-preview:v1";
const READY_TYPE = "janczak:hero-preview:ready:v1";

export default function HeroPreviewReceiver() {
  const [state, setState] = useState<{ hero: HeroContent; settings: SiteSettings } | null>(null);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== MESSAGE_TYPE
      )
        return;
      try {
        setState({
          hero: parseHero(event.data.hero),
          settings: parseSiteSettings(event.data.settings),
        });
      } catch {
        // Never render unvalidated CMS content in the preview.
      }
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: READY_TYPE }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);

  return (
    <main id="main" className="min-h-svh bg-forest-deep">
      {state && <HeroSection data={state.hero} settings={state.settings} preview />}
    </main>
  );
}
