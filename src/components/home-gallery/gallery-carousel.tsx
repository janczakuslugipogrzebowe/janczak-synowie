"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TbArrowLeft, TbArrowRight, TbX } from "react-icons/tb";
import type { GalleryPhoto } from "@/lib/gallery/schema";

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange, { passive: true });
  return () => window.removeEventListener("resize", onChange);
}

function visibleColumns() {
  return window.innerWidth >= 1180 ? 3 : window.innerWidth >= 700 ? 2 : 1;
}

function serverColumns() {
  return 3;
}

// Preserve the server/client hydration boundary without setting React state
// synchronously in an effect. The portal renders only after hydration.
function subscribeToHydration() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export default function GalleryCarousel({
  photos,
  seconds,
  preview = false,
}: {
  photos: GalleryPhoto[];
  seconds: number;
  preview?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const columns = useSyncExternalStore(subscribe, visibleColumns, serverColumns);
  const perPage = Math.min(columns, Math.max(1, photos.length));
  const pageCount = Math.max(1, Math.ceil(photos.length / perPage));
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const [naturalSize, setNaturalSize] = useState<{ id: string; ratio: number } | null>(null);
  const touchStartX = useRef<number | null>(null);

  const requestedPage = Math.min(current, pageCount - 1);
  const shown = useMemo(
    () => photos.slice(requestedPage * perPage, (requestedPage + 1) * perPage),
    [perPage, photos, requestedPage],
  );
  const lightboxIndex = photos.findIndex((photo) => photo.id === selected);
  const lightboxRatio = naturalSize?.id === selected ? naturalSize.ratio : 3 / 2;
  // Calculate the width limits in JS: CSS calc() multiplication by a runtime
  // number is not supported consistently in all browsers.
  const lightboxWidth = `min(94vw, 1600px, ${lightboxRatio * 76}dvh, calc(${lightboxRatio * 100}dvh - ${lightboxRatio * 180}px))`;

  const go = useCallback(
    (step: number) => {
      setDirection(step >= 0 ? 1 : -1);
      setCurrent((page) => (Math.min(page, pageCount - 1) + step + pageCount) % pageCount);
    },
    [pageCount],
  );

  const goTo = useCallback(
    (index: number) => {
      setDirection(index >= requestedPage ? 1 : -1);
      setCurrent(index);
    },
    [requestedPage],
  );

  useEffect(() => {
    if (preview || reducedMotion || paused || selected || pageCount <= 1) return;
    const timer = window.setInterval(() => go(1), seconds * 1000);
    return () => window.clearInterval(timer);
  }, [go, pageCount, paused, preview, reducedMotion, seconds, selected]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") {
        setSelected(
          (active) =>
            photos[(photos.findIndex((photo) => photo.id === active) + 1) % photos.length]?.id ?? null,
        );
      }
      if (event.key === "ArrowLeft") {
        setSelected(
          (active) =>
            photos[(photos.findIndex((photo) => photo.id === active) + photos.length - 1) % photos.length]
              ?.id ?? null,
        );
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [photos, selected]);

  useEffect(() => {
    if (!selected || preview || !mounted) return;
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const previousOverscroll = documentElement.style.overscrollBehavior;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, [mounted, preview, selected]);

  if (!photos.length) {
    return (
      <div className="mx-auto flex min-h-[280px] max-w-[650px] items-center justify-center rounded-[1.5rem] border border-[#cfc2ab] bg-[#fffcf6]/70 px-8 text-center font-display text-2xl text-[#465348]">
        Zdjęcia pojawią się tutaj po ich opublikowaniu.
      </div>
    );
  }

  const lightbox =
    selected && lightboxIndex >= 0 && !preview && mounted
      ? createPortal(
          <div
            role="presentation"
            className="fixed inset-0 z-[400] overflow-y-auto overscroll-contain bg-[#07150d]/66 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <div className="flex min-h-full items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Zdjęcie: ${photos[lightboxIndex].title}`}
                className="relative flex w-full flex-col items-center"
                onClick={(event) => event.stopPropagation()}
              >
                {/* Only the photograph is visible: the image frame follows its real
                    proportions, instead of forcing a 16:10 black letterbox. */}
                <div
                  className="relative mx-auto overflow-hidden rounded-[clamp(.6rem,1vw,1rem)] shadow-[16px_22px_65px_-30px_rgba(0,0,0,.62)]"
                  style={{
                    width: lightboxWidth,
                    aspectRatio: lightboxRatio,
                  }}
                >
                  <button
                    type="button"
                    aria-label="Zamknij zdjęcie"
                    onClick={() => setSelected(null)}
                    className="absolute right-3 top-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#102018]/60 text-white backdrop-blur-sm transition hover:bg-[#102018]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8bb87]"
                  >
                    <TbX size={24} />
                  </button>
                  <Image
                    key={photos[lightboxIndex].id}
                    src={photos[lightboxIndex].imageUrl}
                    alt={photos[lightboxIndex].alt}
                    fill
                    sizes="(min-width: 1600px) 1600px, 94vw"
                    quality={85}
                    className="object-contain"
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget;
                      if (naturalWidth && naturalHeight) {
                        const id = photos[lightboxIndex].id;
                        const ratio = naturalWidth / naturalHeight;
                        setNaturalSize((old) =>
                          old?.id === id && old.ratio === ratio ? old : { id, ratio },
                        );
                      }
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-col items-center gap-2.5 text-center text-[#f8f1e6]">
                  <p className="font-display text-[clamp(1.3rem,2vw,2rem)] leading-tight">
                    {photos[lightboxIndex].title}
                  </p>
                  {photos[lightboxIndex].description ? (
                    <p className="max-w-[70ch] text-sm leading-relaxed text-[#f8f1e6]/78">
                      {photos[lightboxIndex].description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-4">
                    <button
                      type="button"
                      aria-label="Poprzednie zdjęcie"
                      onClick={() =>
                        setSelected(photos[(lightboxIndex + photos.length - 1) % photos.length].id)
                      }
                      className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#baa57e] bg-white/6 text-[#e5c58e] transition hover:bg-white/12"
                    >
                      <TbArrowLeft size={20} />
                    </button>
                    <button
                      type="button"
                      aria-label="Następne zdjęcie"
                      onClick={() => setSelected(photos[(lightboxIndex + 1) % photos.length].id)}
                      className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#baa57e] bg-white/6 text-[#e5c58e] transition hover:bg-white/12"
                    >
                      <TbArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className="mx-auto w-full max-w-[1820px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false);
        }}
      >
        <div
          className="overflow-hidden py-4"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const distance = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(distance) > 55) go(distance < 0 ? 1 : -1);
          }}
        >
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={`${requestedPage}-${perPage}`}
              custom={direction}
              initial={reducedMotion ? false : { opacity: 0, x: direction * 64, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 64, filter: "blur(6px)" }}
              transition={{ duration: reducedMotion ? 0.01 : 0.54, ease: [0.23, 0.7, 0.2, 1] }}
              className="grid gap-[calc(clamp(1rem,1.8vw,2rem)*var(--gallery-gap))]"
              style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0,1fr))` }}
            >
              {shown.map((photo, index) => (
                <button
                  type="button"
                  key={photo.id}
                  onClick={() => !preview && setSelected(photo.id)}
                  disabled={preview}
                  aria-label={`Powiększ zdjęcie: ${photo.title}`}
                  className="group relative block w-full min-w-0 cursor-pointer overflow-hidden rounded-[1.6rem] border border-[#dacdb8] bg-[#f7f2e8]/92 p-[clamp(.38rem,.5vw,.55rem)] text-left shadow-[10px_12px_26px_-17px_rgba(23,32,24,.26),4px_5px_14px_-10px_rgba(23,32,24,.12)] transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-[#c3af8b] hover:shadow-[14px_18px_34px_-18px_rgba(23,32,24,.28),6px_8px_16px_-11px_rgba(23,32,24,.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8c7046] disabled:cursor-default"
                >
                  <span className="pointer-events-none absolute inset-[clamp(.38rem,.5vw,.55rem)] rounded-[1.2rem] border border-white/65" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-[#ddd2c0]">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.alt}
                      fill
                      priority={!preview && requestedPage === 0 && index === 0}
                      quality={75}
                      sizes="(min-width: 1180px) 30vw, (min-width: 700px) 46vw, 92vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.045] motion-reduce:transform-none"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#08130f]/82 via-[#08130f]/18 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 px-[clamp(1rem,2vw,1.65rem)] pb-[clamp(1rem,2vw,1.45rem)] text-[#fff8ee]">
                      <span className="block font-display leading-[1.08] [font-size:clamp(calc(1.15rem*var(--gallery-card)),calc(1.4cqw*var(--gallery-card)),calc(1.75rem*var(--gallery-card)))]">
                        {photo.title}
                      </span>
                      {photo.description ? (
                        <span className="mt-1.5 line-clamp-2 block text-[clamp(.78rem,.72vw,.92rem)] leading-relaxed text-[#fff8ee]/82">
                          {photo.description}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {pageCount > 1 ? (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="order-2 flex items-center gap-3 sm:order-1">
              <div className="flex items-center gap-2" role="group" aria-label="Wybierz stronę galerii">
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Strona ${index + 1}`}
                    aria-current={index === requestedPage ? "true" : undefined}
                    onClick={() => goTo(index)}
                    className={`size-3 cursor-pointer rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#937346] ${
                      index === requestedPage
                        ? "border-[#9c7a4f] bg-[#9c7a4f]"
                        : "border-[#ccbca2] bg-transparent hover:border-[#9c7a4f] hover:bg-[#9c7a4f]/25"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="order-1 flex items-center gap-3 sm:order-2">
              <button
                type="button"
                aria-label="Poprzednie zdjęcia"
                onClick={() => go(-1)}
                className="flex size-12 cursor-pointer items-center justify-center rounded-full border border-[#b8a27d] bg-[#fffaf1]/85 text-[#203529] transition-colors hover:bg-[#e6cf9e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#937346]"
              >
                <TbArrowLeft size={21} />
              </button>
              <button
                type="button"
                aria-label="Kolejne zdjęcia"
                onClick={() => go(1)}
                className="flex size-12 cursor-pointer items-center justify-center rounded-full border border-[#b8a27d] bg-[#fffaf1]/85 text-[#203529] transition-colors hover:bg-[#e6cf9e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#937346]"
              >
                <TbArrowRight size={21} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {lightbox}
    </>
  );
}
