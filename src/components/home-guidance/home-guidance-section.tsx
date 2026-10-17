"use client";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight, TbBuildingChurch, TbFileDescription, TbHeartHandshake, TbPhoneCall } from "react-icons/tb";
import { normalizePhone, type SiteSettings } from "@/lib/settings/schema";
import type { HomeGuidanceContent } from "@/lib/home-guidance/schema";

const STEP_ICONS = [TbPhoneCall, TbFileDescription, TbBuildingChurch, TbHeartHandshake] as const;
// The third section and the services photo share ONE exact boundary.
// The opaque area above the original ivory wave keeps the guidance image visible,
// while the transparent area below reveals the underlying services photograph.
const GUIDANCE_LOWER_MASK = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201440%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M0%200%20H1440%20V109%20C1180%2093%20994%2035%20700%2037%20C405%2035%20252%2090%200%20112%20Z%22%2F%3E%3C%2Fsvg%3E")';
export default function HomeGuidanceSection({data, settings, preview = false, followedByServices = false}: {data: HomeGuidanceContent; settings: SiteSettings; preview?: boolean; followedByServices?: boolean}) {
  const reducedMotion = useReducedMotion();
  const show = (delay: number) => ({
    initial: reducedMotion || preview ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.8, delay, ease: [0.2, 0.65, 0.2, 1] as [number, number, number, number] },
  });
  const val = (n: number, scale: number, unit: "rem" | "cqw") => `${Number((n * scale / 100).toFixed(3))}${unit}`;
  const vars = {
    "--guide-h-min": val(2.6, data.headingScale, "rem"), "--guide-h-fluid": val(4.7, data.headingScale, "cqw"),
    "--guide-h-max": val(7, data.headingScale, "rem"), "--guide-p-min": val(.94, data.descriptionScale, "rem"),
    "--guide-p-fluid": val(1.02, data.descriptionScale, "cqw"), "--guide-p-max": val(1.45, data.descriptionScale, "rem"),
    "--guide-button-size": val(.92, data.buttonScale, "rem"), "--guide-step-size": val(1, data.stepsScale, "rem"),
    "--guide-spacing": data.spacingScale / 100,
    // Clip the whole section, including its photo, to one continuous upper curve.
    clipPath: "url(#home-guidance-top-wave)",
    ...(followedByServices ? {
      "--guidance-bottom-wave-height": "clamp(50px,6.5vw,135px)",
      // The first mask layer retains the whole section above the wave band;
      // the second, SVG-shaped layer follows the original Bézier curve exactly.
      maskImage: `linear-gradient(#000,#000), ${GUIDANCE_LOWER_MASK}`,
      maskSize: "100% calc(100% - var(--guidance-bottom-wave-height)), 100% var(--guidance-bottom-wave-height)",
      maskPosition: "top left, bottom left",
      maskRepeat: "no-repeat",
      WebkitMaskImage: `linear-gradient(#000,#000), ${GUIDANCE_LOWER_MASK}`,
      WebkitMaskSize: "100% calc(100% - var(--guidance-bottom-wave-height)), 100% var(--guidance-bottom-wave-height)",
      WebkitMaskPosition: "top left, bottom left",
      WebkitMaskRepeat: "no-repeat",
    } : {}),
  } as CSSProperties;
  const tel = `tel:${normalizePhone(settings.primaryPhone)}`;
  // The only full-image dimmer: its opacity comes directly from the CMS setting.
  // Keep a small safety floor for legibility without flattening the photograph.
  const dimmerOpacity = .08 + (data.overlayOpacity - 35) / 60 * .52;
  // Glass transparency is intentionally gentler than the old opaque background.
  const glassOpacity = .12 + data.panelOpacity / 100 * .42;
  return <>
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="home-guidance-top-wave" clipPathUnits="objectBoundingBox">
          <path d="M0 .075 C .14 .035 .29 .025 .45 .075 C .62 .12 .78 .018 1 .065 L1 1 L0 1 Z" />
        </clipPath>
      </defs>
    </svg>
    <section aria-labelledby="home-guidance-title" style={vars} className={`@container/guidance relative isolate z-30 overflow-hidden bg-forest-deep text-ivory ${preview ? "" : "-mt-[clamp(3.25rem,5vw,5.75rem)]"}`}>

    <Image src={data.imageUrl} alt="" fill quality={75} loading={preview ? "eager" : "lazy"} sizes="100vw"
      style={{objectPosition:`${data.imagePositionX}% ${data.imagePositionY}%`}} className="pointer-events-none -z-30 object-cover" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-[#07120e]" style={{opacity: dimmerOpacity}} />
    {/* Protect only the text area, not the photo behind the steps. */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#06100c]/70 via-[#06100c]/15 to-transparent" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#06100c]/30 via-transparent to-transparent" />
    <div className="relative mx-auto grid w-[min(90%,1680px)] items-center gap-[clamp(2.5rem,5vw,8rem)] pb-[calc(clamp(7rem,10vw,14rem)*var(--guide-spacing))] pt-[calc(clamp(5.5rem,7vw,10rem)*var(--guide-spacing))] lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] xl:grid-cols-[minmax(0,1fr)_minmax(350px,480px)] 3xl:w-[min(88%,2200px)] 3xl:grid-cols-[minmax(0,1fr)_minmax(440px,560px)] 3xl:gap-[clamp(6rem,8vw,14rem)] 4xl:w-[min(85%,3000px)] [@media(max-height:850px)]:pt-[calc(4rem*var(--guide-spacing))] [@media(max-height:850px)]:pb-[calc(7rem*var(--guide-spacing))]">
      <div className="max-w-[800px] 3xl:max-w-[1080px]">
        <motion.p {...show(.03)} className="mb-[clamp(1rem,2vw,2rem)] flex items-center gap-3 text-[clamp(.7rem,.73cqw,.94rem)] font-bold uppercase tracking-[.22em] text-champagne"><span className="h-px w-9 shrink-0 bg-champagne 3xl:w-14" />{data.eyebrow}</motion.p>
        <motion.h2 {...show(.12)} id="home-guidance-title" className="max-w-[16ch] font-display font-medium leading-[.96] tracking-[-.04em] text-[#fbf6ec] [font-size:clamp(var(--guide-h-min),var(--guide-h-fluid),var(--guide-h-max))]">{data.headline}</motion.h2>
        <motion.p {...show(.23)} className="mt-[clamp(1.4rem,2.5cqw,2.8rem)] max-w-[57ch] whitespace-pre-line leading-[1.75] text-white/85 [font-size:clamp(var(--guide-p-min),var(--guide-p-fluid),var(--guide-p-max))]">{data.description}</motion.p>
        <motion.div {...show(.34)} className="mt-[clamp(1.75rem,3vw,3rem)] flex flex-wrap items-center gap-4 3xl:gap-6 [font-size:var(--guide-button-size)]">
          {preview ? <span className="inline-flex min-h-13 items-center gap-3 rounded-full bg-champagne px-6 font-bold text-forest-deep 3xl:min-h-16 3xl:px-9"><TbPhoneCall className="size-[1.4em]" /><span><span className="block">{settings.primaryPhone}</span><span className="block text-[.72em] font-medium opacity-70">{data.phoneButtonLabel}</span></span></span> :
            <a href={tel} aria-label={`${data.phoneButtonLabel}: ${settings.primaryPhone}`} className="inline-flex min-h-13 items-center gap-3 rounded-full bg-champagne px-6 font-bold text-forest-deep transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-[#f1dbaf] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white 3xl:min-h-16 3xl:px-9"><TbPhoneCall className="size-[1.4em]" /><span><span className="block">{settings.primaryPhone}</span><span className="block text-[.72em] font-medium opacity-70">{data.phoneButtonLabel}</span></span></a>}
          {preview ? <span className="inline-flex min-h-13 items-center gap-3 border-b border-champagne/65 px-2 font-semibold text-ivory">{data.offerButtonLabel}<TbArrowUpRight className="size-[1.3em] text-champagne" /></span> :
            <Link href={data.offerButtonHref} className="group inline-flex min-h-13 items-center gap-3 border-b border-champagne/65 px-2 font-semibold text-ivory transition-colors hover:border-champagne hover:text-champagne focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{data.offerButtonLabel}<TbArrowUpRight className="size-[1.3em] text-champagne transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>}
        </motion.div>
      </div>
      <motion.div {...show(.22)} className="relative overflow-hidden rounded-[clamp(1.1rem,1.5vw,2rem)] border border-champagne/25 p-[clamp(.75rem,1.25vw,1.5rem)] shadow-[0_24px_80px_-28px_rgba(0,0,0,.4)] backdrop-blur-[6px] lg:justify-self-end lg:w-full" style={{backgroundColor:`rgba(15,25,20,${glassOpacity})`}}>
        <ol className="divide-y divide-white/10">{data.steps.map((step,index)=>{const Icon=STEP_ICONS[index];return <li key={index} className="grid grid-cols-[clamp(3.35rem,4vw,5rem)_minmax(0,1fr)] items-center gap-[clamp(1rem,1.5vw,2rem)] py-[clamp(1rem,1.7vw,2rem)] first:pt-[clamp(.55rem,1vw,1rem)] last:pb-[clamp(.55rem,1vw,1rem)]">
          <span className="relative flex aspect-square items-center justify-center rounded-full border border-champagne/45 text-champagne"><Icon aria-hidden="true" className="size-[45%]" strokeWidth={1.45}/><span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-[#15241d] font-sans text-[10px] font-bold text-champagne ring-1 ring-champagne/35">{index+1}</span></span>
          <div className="min-w-0" style={{fontSize:"var(--guide-step-size)"}}><h3 className="font-semibold leading-[1.35] text-[#f7f3eb]">{step.title}</h3><p className="mt-1 text-[.83em] leading-[1.55] text-white/65">{step.description}</p></div>
        </li>;})}</ol>
      </motion.div>
    </div>
    {!followedByServices && <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 150" preserveAspectRatio="none" className="pointer-events-none absolute bottom-[-1px] left-0 z-20 h-[clamp(50px,6.5vw,135px)] w-full fill-ivory"><path d="M0 112 C252 90 405 35 700 37 C994 35 1180 93 1440 109 L1440 150 L0 150 Z" /></svg>}
  </section>
  </>;
}
