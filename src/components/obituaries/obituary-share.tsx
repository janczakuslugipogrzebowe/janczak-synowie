"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TbBrandFacebook, TbCheck, TbCopy, TbShare2, TbX } from "react-icons/tb";
import { resolveObituaryShareUrl } from "@/lib/obituaries/share-url";
import { obituaryActionClass } from "./obituary-action-style";

type Props = { slug: string; name: string };

export default function ObituaryShare({ slug, name }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const manualInput = useRef<HTMLInputElement>(null);
  const menuId = useId();

  const publicUrl = () =>
    resolveObituaryShareUrl(slug, window.location.origin, process.env.NEXT_PUBLIC_SITE_URL);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>("[data-share-trigger]")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (manualUrl) {
      manualInput.current?.focus();
      manualInput.current?.select();
    }
  }, [manualUrl]);

  function requirePublicUrl() {
    const url = publicUrl();
    if (!url) {
      setStatus("Facebook wymaga publicznego adresu HTTPS. Ustaw NEXT_PUBLIC_SITE_URL na adres produkcyjny i uruchom dev ponownie.");
      setOpen(false);
    }
    return url;
  }

  async function copyLink() {
    const url = publicUrl();
    if (!url) {
      setStatus("Do skopiowania publicznego linku ustaw NEXT_PUBLIC_SITE_URL na adres produkcyjny.");
      setOpen(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setManualUrl("");
      setStatus("Skopiowano link do nekrologu.");
      setOpen(false);
    } catch {
      setManualUrl(url);
      setStatus("Zaznaczony link można skopiować.");
      setOpen(false);
    }
  }

  function openFacebook() {
    const url = requirePublicUrl();
    if (!url) return;
    const sharer = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    // Only public URLs can be scraped to render a link card in Facebook.
    window.open(sharer, "_blank", "noopener,noreferrer");
    setStatus("");
    setOpen(false);
  }

  async function shareWithDevice() {
    const url = requirePublicUrl();
    if (!url) return;
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title: `Nekrolog – ${name}`, text: `Nekrolog: ${name}`, url });
      setOpen(false);
      setStatus("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("Nie udało się udostępnić. Możesz skopiować link.");
    }
  }

  return (
    <div ref={root} className="relative flex flex-col items-center sm:items-end">
      <button
        type="button"
        data-share-trigger
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((value) => !value);
          setStatus("");
          setManualUrl("");
        }}
        className={obituaryActionClass}
      >
        <TbShare2 aria-hidden="true" size={17} strokeWidth={1.8} />
        Udostępnij
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute bottom-[calc(100%+0.6rem)] right-0 z-20 w-[min(290px,calc(100vw-4rem))] rounded-xl border border-[#dbcfb8] bg-[#fffdf8] p-2 text-left shadow-[0_18px_55px_-20px_rgba(20,40,29,.32)]"
        >
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <p className="text-xs font-semibold text-[#263b2e]">Udostępnij nekrolog</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zamknij menu udostępniania"
              className="grid size-8 place-items-center rounded-full text-[#786d5a] hover:bg-[#f1eadf] focus-visible:outline-2 focus-visible:outline-[#a88c61]"
            >
              <TbX size={16} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={openFacebook}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[#2c3e32] hover:bg-[#f3eee5] focus-visible:outline-2 focus-visible:outline-[#a88c61]"
          >
            <TbBrandFacebook size={21} aria-hidden="true" className="text-[#1877f2]" />
            Facebook
          </button>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[#2c3e32] hover:bg-[#f3eee5] focus-visible:outline-2 focus-visible:outline-[#a88c61]"
          >
            <TbCopy size={20} aria-hidden="true" className="text-[#9b8057]" />
            Kopiuj link
          </button>
          <button
            type="button"
            onClick={() => void shareWithDevice()}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[#2c3e32] hover:bg-[#f3eee5] focus-visible:outline-2 focus-visible:outline-[#a88c61] sm:hidden"
          >
            <TbShare2 size={20} aria-hidden="true" className="text-[#9b8057]" />
            Więcej opcji
          </button>
        </div>
      )}
      {manualUrl && (
        <input
          ref={manualInput}
          type="text"
          readOnly
          value={manualUrl}
          onFocus={(event) => event.target.select()}
          aria-label="Link do nekrologu — zaznacz i skopiuj"
          className="mt-2 w-[min(290px,calc(100vw-4rem))] rounded-lg border border-[#ccb896] bg-white px-3 py-2 text-xs text-[#293d30] focus-visible:outline-2 focus-visible:outline-[#9c7c4b]"
        />
      )}
      <span role="status" aria-live="polite" className={status ? "mt-2 max-w-[290px] text-xs leading-relaxed text-[#677465]" : "sr-only"}>
        {status.startsWith("Skopiowano") && <TbCheck aria-hidden="true" className="mr-1 inline" size={15} />}
        {status}
      </span>
    </div>
  );
}
