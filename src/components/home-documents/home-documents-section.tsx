"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight } from "react-icons/tb";
import type { HomeDocumentsContent } from "@/lib/home-documents/schema";
import type { PublicDocument } from "@/lib/documents/schema";

type Props = {
  data: HomeDocumentsContent;
  // Kept for compatibility with the homepage and the CMS preview.
  // Downloads are intentionally available only on /dokumenty.
  documents?: PublicDocument[];
  preview?: boolean;
  joinsObituaries?: boolean;
  /** Gallery owns the shared wavy edge when it follows this section. */
  followedByGallery?: boolean;
};

const TOP_WAVE_HEIGHT = "clamp(55px,7vw,130px)";

export default function HomeDocumentsSection({
  data,
  preview = false,
  joinsObituaries = false,
  followedByGallery = false,
}: Props) {
  const reducedMotion = useReducedMotion();
  const vars = {
    "--docs-heading-scale": data.headingScale / 100,
    "--docs-description-scale": data.descriptionScale / 100,
    "--docs-note-scale": data.listScale / 100,
    "--docs-spacing-scale": data.spacingScale / 100,
    "--docs-wave-height": TOP_WAVE_HEIGHT,
  } as CSSProperties;

  // This is the only photographic darkening control. Unlike the old design,
  // it is not compounded by a permanently opaque horizontal gradient.
  const photographicShade = Math.min(0.82, 0.15 + data.overlayOpacity / 100);

  function reveal(delay: number) {
    return {
      initial: preview || reducedMotion ? false : { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.18 },
      transition: {
        duration: 0.72,
        delay,
        ease: [0.2, 0.65, 0.2, 1] as [number, number, number, number],
      },
    };
  }

  return (
    <section
      aria-labelledby="home-documents-title"
      style={vars}
      className={`@container/documents relative isolate overflow-hidden bg-[#17241d] text-[#f8f3e9] ${
        joinsObituaries ? "-mt-[clamp(55px,7vw,130px)]" : ""
      }`}
    >
      <Image
        src={data.imageUrl}
        alt=""
        fill
        quality={75}
        loading={preview ? "eager" : "lazy"}
        sizes="100vw"
        className="pointer-events-none -z-30 object-cover"
        style={{
          objectPosition: `${data.imagePositionX}% ${data.imagePositionY}%`,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[#091810]"
        style={{ opacity: photographicShade }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_69%_at_50%_48%,rgba(5,16,11,.41)_0%,rgba(5,16,11,.18)_58%,rgba(5,16,11,.08)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[36%] bg-gradient-to-t from-[#07150f]/45 to-transparent"
      />

      {/* A single editorial composition replaces the redundant downloads card. */}
      <div
        className={`relative mx-auto flex min-h-[clamp(620px,75svh,1050px)] w-[min(90%,1680px)] flex-col items-center justify-center text-center 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)] ${
          joinsObituaries
            ? "pt-[calc(clamp(55px,7vw,130px)+clamp(6rem,7vw,9rem))]"
            : "pt-[clamp(7rem,9vw,12rem)]"
        } pb-[clamp(10rem,12vw,17rem)]`}
      >
        <div className="relative mx-auto flex w-full max-w-[1150px] flex-col items-center 3xl:max-w-[1480px]">
          <motion.div
            {...reveal(0)}
            className="flex max-w-full items-center justify-center gap-[clamp(.8rem,1.8vw,1.75rem)]"
          >
            <span
              aria-hidden="true"
              className="h-px w-[clamp(1.5rem,4.5vw,5rem)] bg-gradient-to-l from-[#e4c68e]/85 to-transparent"
            />
            <p className="text-balance text-[clamp(.68rem,.75cqw,.88rem)] font-bold uppercase tracking-[.2em] text-[#e5c58c] [text-shadow:0_2px_16px_rgba(0,0,0,.5)]">
              {data.eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px w-[clamp(1.5rem,4.5vw,5rem)] bg-gradient-to-r from-[#e4c68e]/85 to-transparent"
            />
          </motion.div>

          <motion.h2
            {...reveal(0.08)}
            id="home-documents-title"
            className="mt-[calc(clamp(1.4rem,2.6vw,3.25rem)*var(--docs-spacing-scale))] max-w-[19ch] text-balance font-display font-medium leading-[1.06] tracking-[-.035em] [font-size:clamp(calc(2.45rem*var(--docs-heading-scale)),calc(5cqw*var(--docs-heading-scale)),calc(6.7rem*var(--docs-heading-scale)))] [text-shadow:0_3px_34px_rgba(0,0,0,.30)]"
          >
            {data.headline}
          </motion.h2>

          <motion.div
            {...reveal(0.14)}
            aria-hidden="true"
            className="mt-[calc(clamp(1.5rem,2.5vw,3rem)*var(--docs-spacing-scale))] h-px w-[clamp(60px,7vw,112px)] bg-[#dec18b]/75"
          />

          <motion.p
            {...reveal(0.2)}
            className="mt-[calc(clamp(1.4rem,2.5vw,2.8rem)*var(--docs-spacing-scale))] max-w-[64ch] text-balance leading-[1.78] text-[#f5f0e8]/93 [font-size:clamp(calc(.98rem*var(--docs-description-scale)),calc(1.23cqw*var(--docs-description-scale)),calc(1.52rem*var(--docs-description-scale)))] [text-shadow:0_2px_22px_rgba(0,0,0,.55)]"
          >
            {data.description}
          </motion.p>

          <motion.div
            {...reveal(0.28)}
            className="mt-[calc(clamp(1.85rem,3.2vw,4rem)*var(--docs-spacing-scale))] flex flex-col items-center gap-4"
          >
            {preview ? (
              <span className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#e5c991] px-[clamp(1.5rem,2.5vw,2.3rem)] py-3 font-semibold text-[#15251c] shadow-[0_14px_38px_rgba(0,0,0,.18)]">
                {data.buttonLabel}
                <TbArrowUpRight size={21} aria-hidden="true" />
              </span>
            ) : (
              <Link
                href="/dokumenty"
                className="group inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-3 rounded-full bg-[#e5c991] px-[clamp(1.5rem,2.5vw,2.3rem)] py-3 font-semibold text-[#15251c] shadow-[0_14px_38px_rgba(0,0,0,.18)] transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:bg-[#f4daac] hover:shadow-[0_20px_44px_rgba(0,0,0,.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {data.buttonLabel}
                <TbArrowUpRight
                  size={21}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            )}
            <p className="max-w-[48ch] text-balance leading-[1.5] tracking-[.015em] text-[#f5f0e8]/79 [font-size:clamp(calc(.78rem*var(--docs-note-scale)),calc(.85cqw*var(--docs-note-scale)),calc(.96rem*var(--docs-note-scale)))] [text-shadow:0_2px_12px_rgba(0,0,0,.65)]">
              Potrzebne wnioski i formularze znajdują się na podstronie Dokumenty.
            </p>
          </motion.div>
        </div>
      </div>

      {/* In the homepage composition, Gallery alone draws the shared edge. */}
      {!followedByGallery && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -bottom-px left-0 z-20 h-[clamp(66px,8vw,160px)] w-full fill-forest-deep"
        >
          <path d="M0 96 C240 96 390 47 720 32 C1050 47 1200 96 1440 96 L1440 160 L0 160 Z" />
        </svg>
      )}
    </section>
  );
}
