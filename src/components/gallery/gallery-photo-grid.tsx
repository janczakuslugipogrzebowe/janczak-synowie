"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { TbArrowLeft, TbArrowRight, TbX } from "react-icons/tb";
import type { GalleryPhoto } from "@/lib/gallery/schema";
const subscribe = () => () => {};
const client = () => true;
const server = () => false;
export default function GalleryPhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const hydrated = useSyncExternalStore(subscribe, client, server);
  useEffect(() => {
    if (selected === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight") setSelected((i) => (i === null ? null : (i + 1) % photos.length));
      if (e.key === "ArrowLeft")
        setSelected((i) => (i === null ? null : (i + photos.length - 1) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected, photos.length]);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            type="button"
            key={photo.id}
            onClick={() => setSelected(index)}
            className="group relative aspect-[1.4/1] cursor-zoom-in overflow-hidden rounded-xl border border-[#dbcba8] bg-[#e5dbcd] text-left shadow-[10px_13px_25px_-23px_rgba(17,26,19,.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b18f58]"
          >
            <Image
              src={photo.imageUrl}
              alt={photo.alt}
              fill
              sizes="(min-width:1600px) 24vw, (min-width:1024px) 30vw, (min-width:640px) 44vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101d16]/80 to-transparent px-5 pb-4 pt-10 font-display text-xl text-white">
              {photo.title}
            </span>
          </button>
        ))}
      </div>
      {hydrated &&
        selected !== null &&
        photos[selected] &&
        createPortal(
          <div
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07120c]/80 px-4 py-12 backdrop-blur-xl sm:px-8"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Zdjęcie: ${photos[selected].title}`}
              className="relative flex max-h-[94dvh] w-full max-w-[1450px] flex-col items-center gap-4"
            >
              <button
                type="button"
                autoFocus
                aria-label="Zamknij zdjęcie"
                onClick={() => setSelected(null)}
                className="absolute -top-11 right-0 grid size-10 cursor-pointer place-items-center rounded-full border border-[#e9d7ad]/50 text-[#f9f2e2] hover:bg-white/15"
              >
                <TbX size={22} />
              </button>
              <div className="relative flex max-h-[77dvh] w-full items-center justify-center">
                <Image
                  src={photos[selected].imageUrl}
                  alt={photos[selected].alt}
                  width={1700}
                  height={1200}
                  sizes="94vw"
                  className="h-auto max-h-[77dvh] w-auto max-w-full rounded-[10px] object-contain"
                />
              </div>
              <div className="flex w-full items-center justify-between gap-4 text-[#f9f3e9]">
                <button
                  type="button"
                  aria-label="Poprzednie zdjęcie"
                  onClick={() => setSelected((selected + photos.length - 1) % photos.length)}
                  className="grid size-11 cursor-pointer place-items-center rounded-full border border-[#ead9b8]/50 hover:bg-white/10"
                >
                  <TbArrowLeft size={21} />
                </button>
                <p className="text-center font-display text-xl">{photos[selected].title}</p>
                <button
                  type="button"
                  aria-label="Następne zdjęcie"
                  onClick={() => setSelected((selected + 1) % photos.length)}
                  className="grid size-11 cursor-pointer place-items-center rounded-full border border-[#ead9b8]/50 hover:bg-white/10"
                >
                  <TbArrowRight size={21} />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
