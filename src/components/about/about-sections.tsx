"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight } from "react-icons/tb";
import SubpageContainer from "@/components/subpages/subpage-container";
import type {
  AboutBase,
  AboutHistory,
  AboutPeople,
  AboutValues,
  AboutVillage,
  AboutPhoto,
} from "@/lib/about-page/schema";

type Preview = { preview?: boolean };

function useEnter(preview: boolean, delay = 0) {
  const reduced = useReducedMotion();
  return {
    initial: preview || reduced ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.75, delay, ease: [0.22, 0.62, 0.22, 1] as [number, number, number, number] },
  };
}
function SectionHeading({ data, id, dark = false }: { data: AboutBase; id: string; dark?: boolean }) {
  return <>
    {data.eyebrow && <p className={`mb-6 flex items-center gap-3 text-[.72rem] font-bold uppercase tracking-[.22em] ${dark ? "text-[#E6C991]" : "text-[#a28355]"}`}>
      <span aria-hidden="true" className={`h-px w-9 shrink-0 ${dark ? "bg-[#E6C991]" : "bg-[#ad9368]"}`}/>{data.eyebrow}
    </p>}
    <h2 id={id} className={`max-w-[18ch] font-display font-medium leading-[1.05] tracking-[-.045em] ${dark ? "text-[#faf6ee]" : "text-[#1d3528]"}`}
      style={{ fontSize: `clamp(2.5rem, ${4.15 * data.headingScale / 100}vw, ${5.45 * data.headingScale / 100}rem)` }}>
      {data.title}
    </h2>
    {data.lead && <p className={`mt-6 max-w-[65ch] text-[clamp(1.04rem,1.25vw,1.3rem)] leading-[1.75] ${dark ? "text-[#e2e5dc]" : "text-[#4d6254]"}`}>{data.lead}</p>}
  </>;
}
function AboutPhotoView({ data, alt, priority = false, fillParent = false, className = "" }: {
  data: AboutPhoto;
  alt: string;
  priority?: boolean;
  /** Fill an already positioned parent; do not combine relative and absolute on the same element. */
  fillParent?: boolean;
  className?: string;
}) {
  return <div className={`${fillParent ? "absolute inset-0" : "relative"} overflow-hidden bg-[#d8d8cc] ${className}`}>
    {data.imageUrl ? <Image src={data.imageUrl} alt={alt} fill priority={priority} sizes="(max-width: 1024px) 90vw, (max-width: 2200px) 46vw, 1200px"
      className="object-cover transition-transform duration-700 hover:scale-[1.025] motion-reduce:transform-none"
      style={{ objectPosition: `${data.imagePositionX}% ${data.imagePositionY}%` }} />
      : <div className="absolute inset-0 bg-gradient-to-br from-[#dfded2] to-[#b5c2b2]"/>}
  </div>;
}

export function AboutHistorySection({ data, preview = false }: { data: AboutHistory } & Preview) {
  const enter = useEnter(preview);
  const photoEnter = useEnter(preview, .13);
  return <section aria-labelledby="about-history-title" className="relative overflow-hidden bg-[#f8f4ec] py-[clamp(5.5rem,9vw,10rem)] text-[#1d3528]">
    <SubpageContainer className="grid items-center gap-[clamp(2.5rem,4.5vw,5rem)] lg:grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)]">
      <motion.div {...enter}>
        <SectionHeading id="about-history-title" data={data}/>
        <div className="mt-8 max-w-[68ch] whitespace-pre-line text-[clamp(1rem,1.13vw,1.16rem)] leading-[1.95] text-[#56685b]">{data.description}</div>
        {data.milestones.length > 0 && <div className="mt-10 grid gap-4 border-t border-[#d9cdb9] pt-8 sm:grid-cols-2">
          {data.milestones.map((item, index) => <div key={`${index}-${item.year}`} className="border-l-2 border-[#c1a472] pl-4">
            <span className="font-display text-3xl text-[#9b794a]">{item.year}</span>
            <h3 className="mt-2 text-base font-semibold text-[#1d3528]">{item.title}</h3>
            <p className="mt-2 text-sm leading-[1.75] text-[#5d6b60]">{item.description}</p>
          </div>)}
        </div>}
      </motion.div>
      <motion.div {...photoEnter} className="relative min-w-0 w-full">
        <div aria-hidden="true" className="absolute -bottom-5 -left-5 hidden h-[72%] w-[70%] rounded-[1.35rem] border border-[#b59b6c]/40 lg:block"/>
        <AboutPhotoView data={data} alt="Białe lilie i zapalony lampion" className="aspect-[4/3] rounded-[1.3rem] shadow-[0_28px_60px_-42px_rgba(22,40,28,.45)] lg:aspect-[6/5]"/>
      </motion.div>
    </SubpageContainer>
  </section>;
}

export function AboutPeopleSection({ data, preview = false }: { data: AboutPeople } & Preview) {
  const enter = useEnter(preview);
  const textEnter = useEnter(preview, .12);
  return <section aria-labelledby="about-people-title" className="relative isolate overflow-hidden bg-[#172d22] py-[clamp(5.5rem,8vw,9.5rem)] text-[#faf6ee]">
    <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 size-[700px] rounded-full border border-[#E6C991]/10"/>
    <SubpageContainer className="grid items-center gap-[clamp(3rem,7vw,8rem)] lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
      <motion.figure {...enter} className="relative order-2 max-w-[850px] lg:order-1">
        <AboutPhotoView data={data} alt="Ilustracyjna fotografia osób w eleganckich strojach" className="aspect-[4/3] rounded-[1.3rem] lg:aspect-[4/4]"/>
        {data.photoCaption && <figcaption className="mt-4 text-sm text-[#d9dccf]/85">{data.photoCaption}</figcaption>}
      </motion.figure>
      <motion.div {...textEnter} className="order-1 lg:order-2">
        <SectionHeading id="about-people-title" data={data} dark/>
        <p className="mt-8 max-w-[65ch] whitespace-pre-line text-[clamp(1rem,1.12vw,1.16rem)] leading-[1.95] text-[#d0dacf]">{data.description}</p>
        {data.people.length > 0 && <div className="mt-9 grid gap-5 border-t border-[#E6C991]/30 pt-8 sm:grid-cols-2">
          {data.people.map((person, index) => <div key={`${person.name}-${index}`}>
            <h3 className="font-display text-[clamp(1.6rem,2vw,2.2rem)] text-[#fff8ed]">{person.name}</h3>
            {person.role && <p className="mt-1 text-xs font-bold uppercase tracking-[.16em] text-[#E6C991]">{person.role}</p>}
            {person.description && <p className="mt-3 text-sm leading-[1.8] text-[#d0dacf]">{person.description}</p>}
          </div>)}
        </div>}
      </motion.div>
    </SubpageContainer>
  </section>;
}

function ValueItem({ item, index, preview }: { item: {title: string; description: string}; index: number; preview: boolean }) {
  const enter = useEnter(preview, index * .09);
  return <motion.article {...enter} className="border-b border-[#d8ccbb] py-8 md:border-b-0 md:px-[clamp(1rem,2.8vw,3.4rem)] md:py-11 first:md:pl-0 last:md:pr-0">
    <span className="font-display text-[clamp(2.2rem,3.5vw,4.5rem)] leading-none text-[#ae9062]">{String(index + 1).padStart(2, "0")}</span>
    <h3 className="mt-7 font-display text-[clamp(1.75rem,2.15vw,2.7rem)] leading-[1.12] text-[#1e3829]">{item.title}</h3>
    <p className="mt-5 max-w-[43ch] text-[clamp(.96rem,1.04vw,1.12rem)] leading-[1.85] text-[#54665a]">{item.description}</p>
  </motion.article>;
}

export function AboutValuesSection({ data, preview = false }: { data: AboutValues } & Preview) {
  const enter = useEnter(preview);
  return <section aria-labelledby="about-values-title" className="bg-[#f8f4ec] py-[clamp(5.5rem,8vw,9rem)]">
    <SubpageContainer>
      <motion.div {...enter} className="max-w-4xl"><SectionHeading id="about-values-title" data={data}/></motion.div>
      <div className="mt-[clamp(2.8rem,5vw,5rem)] grid gap-0 border-t border-[#cfc0a7] md:grid-cols-3 md:divide-x md:divide-[#d8ccbb]">
        {data.principles.map((item, index) => <ValueItem key={`${index}-${item.title}`} item={item} index={index} preview={preview}/>) }
      </div>
    </SubpageContainer>
  </section>;
}

export function AboutVillageSection({ data, preview = false }: { data: AboutVillage } & Preview) {
  const enter = useEnter(preview);
  const textEnter = useEnter(preview, .1);
  return <section aria-labelledby="about-village-title" className="bg-[#f4eee5] py-[clamp(5rem,8vw,9rem)]">
    <SubpageContainer className="grid items-stretch gap-0 overflow-hidden rounded-[1.4rem] bg-[#e9dfd1] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] shadow-[0_28px_65px_-50px_rgba(22,38,28,.4)]">
      <motion.div {...enter} className="relative min-h-[320px] lg:min-h-[650px]">
        <AboutPhotoView data={data} alt="Ilustracja miejscowości Żelazków w świetle zachodzącego słońca" fillParent/>
      </motion.div>
      <motion.div {...textEnter} className="flex flex-col justify-center px-[clamp(1.5rem,4vw,5.5rem)] py-[clamp(3rem,5vw,6rem)]">
        <SectionHeading id="about-village-title" data={data}/>
        <p className="mt-7 max-w-[63ch] whitespace-pre-line text-[clamp(1rem,1.1vw,1.17rem)] leading-[1.9] text-[#4b6052]">{data.description}</p>
        <Link href="/kontakt" className="mt-9 inline-flex w-fit items-center gap-3 border-b border-[#9b7a49] pb-2 text-sm font-semibold text-[#7f613b] transition-colors hover:text-[#1d3528] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a28355]">
          {data.buttonLabel}<TbArrowUpRight size={19}/>
        </Link>
      </motion.div>
    </SubpageContainer>
  </section>;
}

