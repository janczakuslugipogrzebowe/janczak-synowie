"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { TbArrowUpRight, TbMapPin, TbPhoneCall } from "react-icons/tb";
import { safeImageUrl, type HeroContent } from "@/lib/hero/schema";
import { directionsUrl, normalizePhone, type SiteSettings } from "@/lib/settings/schema";
import HeroHighlights from "./hero-highlights";
import { HeroWave } from "./hero-wave";

export default function HeroSection({ data, settings, preview=false, showWave=true }: { data:HeroContent;settings:SiteSettings;preview?:boolean;showWave?:boolean }) {
  const reduce = useReducedMotion();
  const directions = directionsUrl(settings);
  const image = safeImageUrl(data.imageUrl) ? data.imageUrl : "/hero.png";
  const backdropStyle: CSSProperties = { objectPosition: `${data.imagePositionX}% ${data.imagePositionY}%` };
  const fade = (delay:number) => ({ initial: reduce || preview ? false : { opacity:0,y:22 }, animate: { opacity:1,y:0 }, transition:{duration:.85, delay, ease:[.2,.65,.2,1] as [number,number,number,number]} });
  // Fluid typography based on Hero container width; admin sliders scale all viewports
  // proportionally. Precomputed lengths avoid CSS calc multiplication compatibility issues.
  const fluidVars = (prefix: string, min: number, fluid: number, max: number, scale: number) => {
    const length = (n: number, unit: "rem" | "cqw") => `${Number((n * scale / 100).toFixed(4))}${unit}`;
    return {
      [`${prefix}-min`]: length(min, "rem"),
      [`${prefix}-fluid`]: length(fluid, "cqw"),
      [`${prefix}-max`]: length(max, "rem"),
    };
  };
  const scales = {
    ...fluidVars("--hero-eyebrow", .625, .68, 1, data.eyebrowScale),
    ...fluidVars("--hero-heading", 3.05, 6.6, 14.5, data.headingScale),
    ...fluidVars("--hero-description", .875, 1.05, 1.625, data.descriptionScale),
    ...fluidVars("--hero-button", .8, .87, 1.5, data.buttonScale),
    ...fluidVars("--hero-icon", 1.8, 1.75, 3.3, data.highlightIconScale),
    ...fluidVars("--hero-highlight-title", .85, .85, 1.5, data.highlightTitleScale),
    ...fluidVars("--hero-highlight-description", .77, .74, 1.35, data.highlightDescriptionScale),
    ...fluidVars("--hero-highlight-gap", 1.5, 7, 12, data.highlightGapScale),
    "--hero-heading-height": `${Number((8.8 * data.headingScale / 100).toFixed(3))}svh`,
    "--hero-heading-compact": `${Number((6.9 * data.headingScale / 100).toFixed(3))}svh`,
    "--hero-description-compact": `${Number((2.05 * data.descriptionScale / 100).toFixed(3))}svh`,
  } as CSSProperties;
  return <section style={scales} aria-label="Janczak i Synowie – Usługi Pogrzebowe" className="@container/hero relative isolate min-h-svh overflow-hidden bg-forest-deep text-ivory">
    <Image src={image} alt="" fill preload={!preview} loading={preview ? "eager" : undefined} sizes="100vw" style={backdropStyle} className="-z-20 object-cover" quality={85} />
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06110c]/95 via-[#08130e]/70 to-[#08120b]/12" style={{opacity:.25+data.overlayOpacity/100*.75}} />
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06120f]/95 via-[#06120f]/15 to-[#06120f]/20" />
    <div className="relative mx-auto flex min-h-svh w-[min(90%,1680px)] flex-col justify-between pt-[calc(78px+clamp(2.25rem,5svh,5rem))] md:pt-[calc(88px+clamp(2.5rem,5svh,6rem))] pb-[clamp(5rem,9svh,9rem)] 3xl:w-[min(88%,2200px)] 3xl:pb-[clamp(8rem,12svh,12rem)] 4xl:w-[min(85%,3000px)] [@media(max-height:850px)]:pt-[calc(78px+clamp(2rem,4svh,3rem))] md:[@media(max-height:850px)]:pt-[calc(88px+clamp(2.5rem,4svh,3.25rem))] [@media(max-height:850px)]:pb-[clamp(4.75rem,8svh,5.5rem)]">
      <div className="max-w-[min(100%,860px)] 3xl:max-w-[min(58%,1150px)] 4xl:max-w-[1500px]">
        <motion.p {...fade(.05)} className="mb-[clamp(.875rem,1.8svh,1.5rem)] [@media(max-height:850px)]:mb-[clamp(.5rem,1svh,.875rem)] flex items-center gap-3 font-bold uppercase tracking-[.22em] text-champagne [font-size:clamp(var(--hero-eyebrow-min),var(--hero-eyebrow-fluid),var(--hero-eyebrow-max))]"><span className="h-px w-8 bg-champagne 3xl:w-12" />{data.eyebrow}</motion.p>
        <motion.h1 {...fade(.15)} className="font-display font-medium leading-[.85] tracking-[-.052em] text-[#fbf6ec] [font-size:clamp(var(--hero-heading-min),min(var(--hero-heading-fluid),var(--hero-heading-height)),var(--hero-heading-max))] [@media(max-height:850px)]:[font-size:clamp(var(--hero-heading-min),min(var(--hero-heading-fluid),var(--hero-heading-compact)),var(--hero-heading-max))]">
          <span className="block">{data.headline}</span><span className="mt-[.09em] block">{data.headlineSecond}</span>
        </motion.h1>
        <motion.p {...fade(.3)} className="mt-[clamp(1rem,2.6svh,2.25rem)] [@media(max-height:850px)]:mt-[clamp(.65rem,1.8svh,1rem)] max-w-[42rem] leading-[1.7] text-white/90 [font-size:clamp(var(--hero-description-min),var(--hero-description-fluid),var(--hero-description-max))] [@media(max-height:850px)]:[font-size:clamp(var(--hero-description-min),min(var(--hero-description-fluid),var(--hero-description-compact)),var(--hero-description-max))] 3xl:max-w-[62rem]">{data.description}</motion.p>
        <motion.div {...fade(.43)} className="mt-[clamp(1rem,2.8svh,2rem)] [@media(max-height:850px)]:mt-[clamp(.625rem,1.5svh,1rem)] flex flex-wrap items-center gap-3 3xl:gap-5 [font-size:clamp(var(--hero-button-min),var(--hero-button-fluid),var(--hero-button-max))]">
          {preview ? <div className="inline-flex min-h-12 items-center gap-3 rounded-full bg-champagne px-6 font-bold text-forest-deep 3xl:min-h-16 3xl:px-10"><TbPhoneCall className="size-[1.4em]" />{settings.primaryPhone}</div> : <a href={`tel:${normalizePhone(settings.primaryPhone)}`} aria-label={`${data.primaryLabel}: ${settings.primaryPhone}`} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-champagne px-6 font-bold text-forest-deep transition-[transform,background-color] hover:-translate-y-1 hover:bg-[#f1dbaf] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white 3xl:min-h-16 3xl:px-10"><TbPhoneCall className="size-[1.4em]" />{settings.primaryPhone}</a>}
          {directions && (preview ? <span className="inline-flex min-h-12 items-center gap-3 rounded-full border border-champagne/75 px-6 font-semibold text-white 3xl:min-h-16 3xl:px-10"><TbMapPin className="size-[1.4em]" />{data.secondaryLabel}<TbArrowUpRight className="size-[1.1em]" /></span> : <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-champagne/75 px-6 font-semibold text-white transition-[transform,background-color] hover:-translate-y-1 hover:bg-white/10 3xl:min-h-16 3xl:px-10"><TbMapPin className="size-[1.4em]" />{data.secondaryLabel}<TbArrowUpRight className="size-[1.1em]" /></a>)}
        </motion.div>
        <motion.p {...fade(.49)} className="mt-[clamp(.5rem,1.5svh,1rem)] [@media(max-height:850px)]:mt-[.375rem] text-[11px] font-medium tracking-wide text-white/70 3xl:text-sm">{settings.availability}</motion.p>
      </div>
      <motion.div {...fade(.55)}><HeroHighlights data={data} settings={settings} preview={preview}/></motion.div>
    </div>
    {showWave && <HeroWave />}
  </section>;
}
