"use client";
import { useEffect, useState } from "react";
import HomeFloristSection from "@/components/home-florist/home-florist-section";
import { parseHomeFlorist, type HomeFloristContent } from "@/lib/home-florist/schema";
const CHANGE = "janczak:home-florist-preview:v1";
const READY = "janczak:home-florist-preview:ready:v1";
export default function FloristPreviewReceiver() {
  const [data, setData] = useState<HomeFloristContent | null>(null);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== CHANGE
      )
        return;
      try {
        setData(parseHomeFlorist(event.data.content));
      } catch {
        /* A temporary invalid draft must not crash preview. */
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <main id="main" className="min-h-dvh bg-ivory">
      {data && <HomeFloristSection data={data} preview />}
    </main>
  );
}
