"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight } from "react-icons/tb";
import GalleryCarousel from "./gallery-carousel";
import type { GalleryPhoto } from "@/lib/gallery/schema";
import type { HomeGalleryContent } from "@/lib/home-gallery/schema";

// A symmetric, C1-continuous raised curve connects the gallery to Documents.
// At the apex both Bezier handles are horizontal (y=62), eliminating the cusp.
// The same mask clips the photo and every background overlay together.
const TOP_MASK =
  'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201440%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M0%20138%20C260%20138%20470%2062%20720%2062%20C970%2062%201180%20138%201440%20138%20L1440%20180%20L0%20180Z%22%2F%3E%3C%2Fsvg%3E")';

export default function HomeGallerySection({
  data,
  photos,
  preview = false,
  joinsDocuments = false,
  followedByFaq = false,
}: {
  data: HomeGalleryContent;
  photos: GalleryPhoto[];
  preview?: boolean;
  joinsDocuments?: boolean;
  followedByFaq?: boolean;
}) {
  const reduced = useReducedMotion();
  const vars = {
    "--gallery-heading": data.headingScale / 100,
    "--gallery-desc": data.descriptionScale / 100,
    "--gallery-card": data.cardScale / 100,
    "--gallery-gap": data.gapScale / 100,
    ...(joinsDocuments
      ? {
          "--gallery-top-wave": "clamp(76px, 8.5vw, 170px)",
          maskImage: `linear-gradient(#000,#000),${TOP_MASK}`,
          maskPosition: "bottom left,top left",
          maskSize:
            "100% calc(100% - var(--gallery-top-wave) + 1px),100% var(--gallery-top-wave)",
          maskRepeat: "no-repeat",
          WebkitMaskImage: `linear-gradient(#000,#000),${TOP_MASK}`,
          WebkitMaskPosition: "bottom left,top left",
          WebkitMaskSize:
            "100% calc(100% - var(--gallery-top-wave) + 1px),100% var(--gallery-top-wave)",
          WebkitMaskRepeat: "no-repeat",
        }
      : {}),
  } as CSSProperties;

  const reveal = (delay: number) => ({
    initial: preview || reduced ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: {
      duration: 0.72,
      delay,
      ease: [0.2, 0.68, 0.2, 1] as [number, number, number, number],
    },
  });

  return (
    <section
      aria-labelledby="home-gallery-title"
      style={vars}
      className={`@container/gallery relative isolate overflow-hidden bg-[#f6f0e5] text-[#17291f] ${
        joinsDocuments ? "z-20 -mt-[clamp(76px,8.5vw,170px)]" : ""
      }`}
    >
      <Image
        src={data.backgroundImageUrl}
        alt=""
        fill
        loading={preview ? "eager" : "lazy"}
        quality={75}
        sizes="100vw"
        className="pointer-events-none -z-30 object-cover"
        style={{ opacity: (100 - data.backgroundOpacity) / 100 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[#fbf6eb]"
        style={{ opacity: data.backgroundOpacity / 100 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,253,247,.72),rgba(255,253,247,.2)_68%,transparent)]"
      />

      <div
        className={`relative mx-auto w-[min(90%,1680px)] pb-[clamp(8rem,11vw,14rem)] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)] ${
          joinsDocuments
            ? "pt-[calc(clamp(76px,8.5vw,170px)+clamp(5.25rem,6vw,8.5rem))]"
            : "pt-[clamp(6rem,8vw,11rem)]"
        }`}
      >
        <header className="mx-auto mb-[clamp(2.8rem,4vw,5.2rem)] max-w-[970px] text-center">
          <motion.p
            {...reveal(0)}
            className="flex items-center justify-center gap-3 text-[clamp(.7rem,.8cqw,.95rem)] font-bold uppercase tracking-[.28em] text-[#97744a]"
          >
            <span className="h-px w-9 bg-[#b0956c]" />
            {data.eyebrow}
            <span className="h-px w-9 bg-[#b0956c]" />
          </motion.p>
          <motion.h2
            {...reveal(0.08)}
            id="home-gallery-title"
            className="mt-5 text-balance font-display font-medium leading-[1.03] tracking-[-.037em] [font-size:clamp(calc(2.6rem*var(--gallery-heading)),calc(4.1cqw*var(--gallery-heading)),calc(6rem*var(--gallery-heading)))]"
          >
            {data.headline}
          </motion.h2>
          <motion.p
            {...reveal(0.15)}
            className="mx-auto mt-6 max-w-[63ch] text-balance leading-[1.75] text-[#58665c] [font-size:clamp(calc(.9rem*var(--gallery-desc)),calc(1.02cqw*var(--gallery-desc)),calc(1.3rem*var(--gallery-desc)))]"
          >
            {data.description}
          </motion.p>
        </header>

        <motion.div {...reveal(0.18)}>
          <GalleryCarousel photos={photos.slice(0, 12)} seconds={data.autoplaySeconds} preview={preview} />
        </motion.div>

        <motion.div {...reveal(0.22)} className="mt-[clamp(2.25rem,3vw,4rem)] text-center">
          {preview ? (
            <span className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#bda374] bg-[#e5c991] px-7 py-3 text-sm font-semibold">
              {data.buttonLabel}
              <TbArrowUpRight size={19} />
            </span>
          ) : (
            <Link
              href="/galeria"
              className="group inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full border border-[#bda374] bg-[#e5c991] px-7 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-1 hover:bg-[#f1d9a9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#846437]"
            >
              {data.buttonLabel}
              <TbArrowUpRight
                size={19}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          )}
        </motion.div>
      </div>

      {!followedByFaq && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1440 150"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -bottom-px left-0 z-20 h-[clamp(56px,7vw,150px)] w-full fill-[#14241c]"
        >
          <path d="M0 65 C310 102 420 129 720 134 C1020 129 1130 102 1440 65 L1440 150 L0 150Z" />
        </svg>
      )}
    </section>
  );
}
