"use client";
import { useEffect, useState } from "react";
import HomeGallerySection from "@/components/home-gallery/home-gallery-section";
import { parseHomeGallery, type HomeGalleryContent } from "@/lib/home-gallery/schema";
import { parseGalleryLibrary, type GalleryPhoto } from "@/lib/gallery/schema";
const CHANGE = "janczak:home-gallery-preview:v1";
const READY = "janczak:home-gallery-preview:ready:v1";
export default function GalleryPreviewReceiver() {
  const [payload, setPayload] = useState<{ data: HomeGalleryContent; photos: GalleryPhoto[] } | null>(null);
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== CHANGE
      )
        return;
      try {
        setPayload({
          data: parseHomeGallery(event.data.data),
          photos: parseGalleryLibrary(event.data.photos),
        });
      } catch {
        /* Ignore incomplete edits. */
      }
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <main id="main" className="min-h-dvh bg-[#14241c]">
      {payload && <HomeGallerySection data={payload.data} photos={payload.photos} preview />}
    </main>
  );
}
