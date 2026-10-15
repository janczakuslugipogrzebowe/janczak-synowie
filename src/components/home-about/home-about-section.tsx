"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight } from "react-icons/tb";
import type { HomeAboutContent } from "@/lib/home-about/schema";

/** The same component powers the public homepage and the editor preview. */
export default function HomeAboutSection({data, preview = false}: {data: HomeAboutContent; preview?: boolean}) {
  const reduced = useReducedMotion();
  const enter = (delay: number) => ({
    initial: reduced || preview ? false : {opacity: 0, y: 20},
    whileInView: {opacity: 1, y: 0},
    viewport: {once: true, amount: .25},
    transition: {duration: .8, delay, ease: [.22, .62, .22, 1] as [number,number,number,number]},
  });
  const size = (n:number, scale:number, unit:"rem"|"cqw") => `${Number((n * scale / 100).toFixed(3))}${unit}`;
  const style = {
    "--about-h-min":size(2.6,data.headingScale,"rem"),
    "--about-h-fluid":size(5,data.headingScale,"cqw"),
    "--about-h-max":size(7.5,data.headingScale,"rem"),
    "--about-text-min":size(.94,data.descriptionScale,"rem"),
    "--about-text-fluid":size(1.12,data.descriptionScale,"cqw"),
    "--about-text-max":size(1.35,data.descriptionScale,"rem"),
    "--about-button-size":size(.96,data.buttonScale,"rem"),
    "--about-photo-width":`${Math.round(data.imageWidthScale*.68)}%`,
    "--about-padding":`${Number((data.spacingScale/100).toFixed(2))}`,
    // One continuous SVG clipping curve replaces the former angular polygon.
    // It clips the image and ivory background as a single visual layer.
    clipPath: "url(#home-about-top-wave)",
  } as CSSProperties;
  const photoPosition = {objectPosition:`${data.imagePositionX}% ${data.imagePositionY}%`};

  return <>
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="home-about-top-wave" clipPathUnits="objectBoundingBox">
          <path d="M0 .085 C .14 .025 .26 .15 .47 .085 C .67 .018 .76 .015 .88 .065 C .95 .085 .98 .067 1 .055 L 1 1 L 0 1 Z" />
        </clipPath>
      </defs>
    </svg>
    <section aria-labelledby="home-about-title" style={style} className="@container/about relative isolate overflow-hidden bg-ivory pt-[clamp(3.5rem,6vw,6rem)] text-[#1c2a21]">
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden h-full lg:block lg:w-[var(--about-photo-width)]" aria-hidden="true">
      <Image src={data.imageUrl} alt="" fill quality={75} loading={preview?"eager":"lazy"} sizes="(min-width:1024px) 72vw, 100vw" style={photoPosition} className="object-cover saturate-[.9] contrast-[1.03] [mask-image:linear-gradient(to_right,transparent_0%,black_26%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f6f1e8]/82 via-[#f6f1e8]/24 to-[#1c2a21]/6" />
    </div>
    <div className="relative z-10 mx-auto flex w-[min(90%,1680px)] flex-col lg:min-h-[clamp(36rem,44vw,50rem)] lg:justify-center 3xl:min-h-[clamp(43rem,38vw,60rem)] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)]">
      <div className="relative max-w-[42rem] pb-[calc(3rem*var(--about-padding))] pt-[calc(4.4rem*var(--about-padding))] lg:max-w-[min(45%,720px)] lg:py-[clamp(4.8rem,calc(6.5vw*var(--about-padding)),9.5rem)] 3xl:max-w-[min(45%,1020px)] 4xl:max-w-[min(45%,1350px)]">
        <motion.p {...enter(0)} className="mb-[clamp(1rem,2cqw,2rem)] flex items-center gap-3 text-[clamp(.7rem,.8cqw,.95rem)] font-bold uppercase tracking-[.21em] text-champagne">
          <span className="h-px w-9 shrink-0 bg-champagne 3xl:w-14" />{data.eyebrow}
        </motion.p>
        <motion.h2 {...enter(.12)} id="home-about-title" className="max-w-[17ch] font-display font-medium leading-[.93] tracking-[-.045em] [font-size:clamp(var(--about-h-min),var(--about-h-fluid),var(--about-h-max))]">{data.headline}</motion.h2>
        <motion.p {...enter(.24)} className="mt-[clamp(1.3rem,2.4cqw,2.75rem)] max-w-[49ch] whitespace-pre-line leading-[1.75] text-[#4b564e] [font-size:clamp(var(--about-text-min),var(--about-text-fluid),var(--about-text-max))]">{data.description}</motion.p>
        <motion.div {...enter(.34)} className="mt-[clamp(1.5rem,3cqw,3rem)]">
          {preview ? <span className="inline-flex min-h-13 items-center justify-center gap-4 rounded-full bg-champagne px-7 font-bold text-forest-deep [font-size:var(--about-button-size)]"><>{data.buttonLabel}</><TbArrowUpRight aria-hidden="true" className="size-[1.35em]" /></span>
            : <Link href={data.buttonHref} className="group inline-flex min-h-13 items-center justify-center gap-4 rounded-full bg-champagne px-7 font-bold text-forest-deep shadow-[0_12px_30px_-15px_rgba(70,49,22,.35)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:bg-[#f1dbaf] hover:shadow-[0_16px_36px_-16px_rgba(70,49,22,.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#866741] [font-size:var(--about-button-size)]">{data.buttonLabel}<TbArrowUpRight aria-hidden="true" className="size-[1.35em] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>}
        </motion.div>
      </div>
    </div>
    <div aria-hidden="true" className="relative h-[clamp(18rem,65vw,35rem)] w-full lg:hidden">
      <Image src={data.imageUrl} alt="" fill quality={75} loading={preview?"eager":"lazy"} sizes="100vw" style={photoPosition} className="object-cover saturate-[.86] [mask-image:linear-gradient(to_bottom,transparent_0%,black_23%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#14241c]/20 to-transparent" />
    </div>
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 170" preserveAspectRatio="none" className="pointer-events-none absolute bottom-[-1px] left-0 z-20 h-[72px] w-full fill-[#14241c] sm:h-[100px] lg:h-[clamp(100px,8vw,170px)]">
      <path d="M0 80 C158 32 278 116 478 100 C678 84 772 37 962 79 C1104 110 1301 121 1440 50 L1440 170 L0 170Z" />
    </svg>
    </section>
  </>;
}
