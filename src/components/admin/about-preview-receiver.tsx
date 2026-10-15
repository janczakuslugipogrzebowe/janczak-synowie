"use client";

import { useEffect, useState } from "react";
import HomeAboutSection from "@/components/home-about/home-about-section";
import { parseHomeAbout, type HomeAboutContent } from "@/lib/home-about/schema";

const CHANGE = "janczak:home-about-preview:v1";
const READY = "janczak:home-about-preview:ready:v1";

export default function AboutPreviewReceiver() {
  const [data, setData] = useState<HomeAboutContent | null>(null);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== CHANGE) return;
      try { setData(parseHomeAbout(event.data.content)); }
      catch { /* Ignore invalid preview payload. */ }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({type: READY}, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return <main id="main" className="min-h-dvh bg-[#14241c]">{data && <HomeAboutSection data={data} preview />}</main>;
}
