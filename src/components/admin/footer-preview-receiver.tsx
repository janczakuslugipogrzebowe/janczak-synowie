"use client";

import { useEffect, useState } from "react";
import SiteFooter from "@/components/footer/site-footer";
import { parseFooter, type FooterContent } from "@/lib/footer/schema";
import type { SiteSettings } from "@/lib/settings/schema";

const CHANGE = "janczak:site-footer-preview:v1";
const READY = "janczak:site-footer-preview:ready:v1";

export default function FooterPreviewReceiver({
  settings,
  copyrightYear,
}: {
  settings: SiteSettings;
  copyrightYear: number;
}) {
  const [data, setData] = useState<FooterContent | null>(null);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== CHANGE
      )
        return;
      try {
        setData(parseFooter(event.data.content));
      } catch {
        /* Incomplete edits remain in the form. */
      }
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: READY }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return (
    <div className="min-h-dvh bg-[#0f1c16]">
      {data && <SiteFooter data={data} settings={settings} copyrightYear={copyrightYear} preview />}
    </div>
  );
}
