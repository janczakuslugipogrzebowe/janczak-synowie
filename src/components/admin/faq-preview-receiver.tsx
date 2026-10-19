"use client";
import { useEffect, useState } from "react";
import HomeFaqSection from "@/components/home-faq/home-faq-section";
import { parseHomeFaq, type HomeFaqContent } from "@/lib/home-faq/schema";

const CHANGE = "janczak:home-faq-preview:v1";
const READY = "janczak:home-faq-preview:ready:v1";

export default function FaqPreviewReceiver() {
  const [data, setData] = useState<HomeFaqContent | null>(null);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== CHANGE
      )
        return;
      try {
        setData(parseHomeFaq(event.data.content));
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
      {data && <HomeFaqSection data={data} preview joinsGallery />}
    </main>
  );
}
