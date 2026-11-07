"use client";
import { useEffect } from "react";
/** Expand a linked service before scrolling when homepage directs to /oferta#service-id. */
export default function OfferHashOpen() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement && el.matches("[data-offer-service]")) {
        el.open = true;
        requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior: "auto" }));
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
