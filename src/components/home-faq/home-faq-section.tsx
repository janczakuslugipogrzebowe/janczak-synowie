"use client";

import { useId, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight, TbMinus, TbPlus } from "react-icons/tb";
import type { HomeFaqContent } from "@/lib/home-faq/schema";

// This is exactly the shape that Gallery used to paint with its bottom SVG.
// FAQ now owns the single shared photographic edge, with no extra overlay seam.
const TOP_MASK =
  'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201440%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M0%2065%20C310%20102%20420%20129%20720%20134%20C1020%20129%201130%20102%201440%2065%20L1440%20150%20L0%20150Z%22%2F%3E%3C%2Fsvg%3E")';

export default function HomeFaqSection({
  data,
  preview = false,
  joinsGallery = false,
}: {
  data: HomeFaqContent;
  preview?: boolean;
  joinsGallery?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [opened, setOpened] = useState<string | null | undefined>(undefined);
  const headingId = useId();
  const items = data.items.filter((item) => item.visible);
  const activeId = opened === undefined ? items[0]?.id : opened;
  const vars = {
    "--faq-heading": data.headingScale / 100,
    "--faq-desc": data.descriptionScale / 100,
    "--faq-question": data.questionScale / 100,
    "--faq-answer": data.answerScale / 100,
    "--faq-icon": data.iconScale / 100,
    "--faq-spacing": data.spacingScale / 100,
    "--faq-column-gap": data.columnGapScale / 100,
    ...(joinsGallery
      ? {
          "--faq-top-wave": "clamp(56px,7vw,150px)",
          maskImage: `linear-gradient(#000,#000),${TOP_MASK}`,
          maskPosition: "bottom left,top left",
          maskSize: "100% calc(100% - var(--faq-top-wave) + 1px),100% var(--faq-top-wave)",
          maskRepeat: "no-repeat",
          WebkitMaskImage: `linear-gradient(#000,#000),${TOP_MASK}`,
          WebkitMaskPosition: "bottom left,top left",
          WebkitMaskSize: "100% calc(100% - var(--faq-top-wave) + 1px),100% var(--faq-top-wave)",
          WebkitMaskRepeat: "no-repeat",
        }
      : {}),
  } as CSSProperties;

  const reveal = (delay: number) => ({
    initial: preview || reducedMotion ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.16 },
    transition: { duration: 0.65, delay, ease: [0.2, 0.68, 0.2, 1] as [number, number, number, number] },
  });

  return (
    <section
      aria-labelledby={headingId}
      style={vars}
      className={`@container/faq relative isolate overflow-hidden bg-[#14241c] text-[#f8f2e8] ${
        joinsGallery ? "z-30 -mt-[clamp(56px,7vw,150px)]" : ""
      }`}
    >
      <Image
        src={data.imageUrl}
        alt=""
        fill
        loading={preview ? "eager" : "lazy"}
        sizes="100vw"
        quality={75}
        className="pointer-events-none -z-30 object-cover"
        style={{ objectPosition: `${data.imagePositionX}% ${data.imagePositionY}%` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[#091910]"
        style={{ opacity: data.overlayOpacity / 100 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,18,13,.58)_0%,rgba(5,18,13,.28)_43%,rgba(6,19,14,.23)_100%)]"
      />
      <div className={`relative mx-auto w-[min(90%,1680px)] pb-[clamp(9rem,11vw,15rem)] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)] ${
        joinsGallery ? "pt-[calc(clamp(56px,7vw,150px)+clamp(5rem,7vw,10rem))]" : "pt-[clamp(7rem,10vw,13rem)]"
      }`}>
        <div className="grid items-start gap-[calc(clamp(3rem,5vw,9rem)*var(--faq-column-gap))] lg:grid-cols-[minmax(0,0.91fr)_minmax(0,1.09fr)]">
          <motion.div {...reveal(0)} className="max-w-[760px]">
            <p className="flex items-center gap-4 text-[clamp(.68rem,.8cqw,.92rem)] font-bold uppercase tracking-[.26em] text-[#e4c791]">
              <span aria-hidden="true" className="h-px w-10 bg-[#dfc38d]" />
              {data.eyebrow}
            </p>
            <h2
              id={headingId}
              className="mt-[clamp(1.2rem,2vw,2.5rem)] max-w-[14ch] text-balance font-display font-medium leading-[1.06] tracking-[-.038em] [font-size:clamp(calc(2.5rem*var(--faq-heading)),calc(4.3cqw*var(--faq-heading)),calc(6.25rem*var(--faq-heading)))]"
            >
              {data.headline}
            </h2>
            <p className="mt-[calc(clamp(1.4rem,2.4vw,2.8rem)*var(--faq-spacing))] max-w-[57ch] leading-[1.85] text-white/80 [font-size:clamp(calc(.95rem*var(--faq-desc)),calc(1cqw*var(--faq-desc)),calc(1.35rem*var(--faq-desc)))]">
              {data.description}
            </p>
            <div className="mt-[calc(clamp(2rem,3vw,4rem)*var(--faq-spacing))]">
              {preview ? (
                <span className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#d7b87f] px-7 py-3 text-sm font-semibold text-[#e8ce9c]">
                  {data.buttonLabel}<TbArrowUpRight size={19} />
                </span>
              ) : (
                <Link
                  href={data.buttonHref}
                  className="group inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full border border-[#d6bc88]/65 px-7 py-3 text-sm font-semibold text-[#ebd39e] transition-colors hover:bg-[#e4c791] hover:text-[#102017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6c994]"
                >
                  {data.buttonLabel}
                  <TbArrowUpRight size={19} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div {...reveal(0.13)} className="space-y-[calc(clamp(.6rem,.9vw,1.2rem)*var(--faq-spacing))]">
            {items.map((item) => {
              const isOpen = activeId === item.id;
              const answerId = `${headingId}-${item.id}-answer`;
              const buttonId = `${headingId}-${item.id}-button`;
              return (
                <div key={item.id} className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isOpen ? "border-[#dac190]/55 bg-[#091911]/55" : "border-[#d6bb89]/25 bg-[#071910]/30 hover:border-[#dac190]/50"
                }`}>
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpened(isOpen ? null : item.id)}
                      className="group flex w-full cursor-pointer items-center justify-between gap-5 p-[calc(clamp(1rem,1.35vw,1.75rem)*var(--faq-spacing))] text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e4c791]"
                    >
                      <span className="font-medium leading-[1.5] text-[#faf5eb] [font-size:clamp(calc(.95rem*var(--faq-question)),calc(1.05cqw*var(--faq-question)),calc(1.3rem*var(--faq-question)))]">
                        {item.question}
                      </span>
                      <span className="flex size-[calc(2.15rem*var(--faq-icon))] shrink-0 items-center justify-center rounded-full border border-[#d7ba85]/45 text-[#e6c994] transition-transform group-hover:scale-105">
                        {isOpen ? <TbMinus size={19} /> : <TbPlus size={19} />}
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={answerId}
                        role="region"
                        aria-labelledby={buttonId}
                        key="answer"
                        initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mx-[calc(clamp(1rem,1.35vw,1.75rem)*var(--faq-spacing))] border-t border-[#e1cc9d]/20 pb-[calc(clamp(1.2rem,1.4vw,2rem)*var(--faq-spacing))] pt-4">
                          <p className="max-w-[65ch] whitespace-pre-line leading-[1.85] text-white/74 [font-size:clamp(calc(.9rem*var(--faq-answer)),calc(.95cqw*var(--faq-answer)),calc(1.17rem*var(--faq-answer)))]">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 160" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-px inset-x-0 h-[clamp(55px,7vw,160px)] w-full fill-[#f6f0e5]">
        <path d="M0 92 C146 78 271 66 413 72 C559 79 668 103 806 108 C939 112 1064 94 1187 84 C1285 77 1368 78 1440 86 L1440 160 L0 160Z" />
      </svg>
    </section>
  );
}
