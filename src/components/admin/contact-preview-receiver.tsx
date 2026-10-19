"use client";
import { useEffect, useState } from "react";
import HomeContactSection from "@/components/home-contact/home-contact-section";
import { parseHomeContact, type HomeContactContent } from "@/lib/home-contact/schema";
import type { SiteSettings } from "@/lib/settings/schema";

const CHANGE = "janczak:home-contact-preview:v1";
const READY = "janczak:home-contact-preview:ready:v1";

export default function ContactPreviewReceiver({ settings }: { settings: SiteSettings }) {
  const [data, setData] = useState<HomeContactContent | null>(null);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== CHANGE
      )
        return;
      try {
        setData(parseHomeContact(event.data.content));
      } catch {
        /* Ignore incomplete edits. */
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <main id="main" className="min-h-dvh bg-[#14241c]">
      {data && <HomeContactSection data={data} settings={settings} preview joinsFaq />}
    </main>
  );
}
