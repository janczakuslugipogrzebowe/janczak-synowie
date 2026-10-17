"use client";

import type {CSSProperties} from "react";
import Image from "next/image";
import Link from "next/link";
import {motion,useReducedMotion} from "motion/react";
import {TbArrowUpRight,TbFlower,TbHeartHandshake,TbBuildingStore} from "react-icons/tb";
import type {HomeFloristContent} from "@/lib/home-florist/schema";

const FEATURE_ICONS=[TbFlower,TbHeartHandshake,TbBuildingStore] as const;
const unit=(value:number,scale:number,u:"rem"|"cqw")=>`${Number((value*scale/100).toFixed(3))}${u}`;

type Props={data:HomeFloristContent;preview?:boolean;joinsServices?:boolean};
export default function HomeFloristSection({data,preview=false,joinsServices=false}:Props){
  const reduce=useReducedMotion();
  const reveal=(delay:number)=>({
    initial:reduce||preview?false:{opacity:0,y:22},
    whileInView:{opacity:1,y:0},viewport:{once:true,amount:.15},
    transition:{duration:.78,delay,ease:[.2,.65,.2,1] as [number,number,number,number]},
  });
  const vars={
    "--florist-title-min":unit(3,data.headingScale,"rem"),
    "--florist-title-fluid":unit(5.2,data.headingScale,"cqw"),
    "--florist-title-max":unit(8.7,data.headingScale,"rem"),
    "--florist-tagline-min":unit(1.5,data.taglineScale,"rem"),
    "--florist-tagline-max":unit(2.7,data.taglineScale,"rem"),
    "--florist-desc":unit(1.04,data.descriptionScale,"rem"),
    "--florist-feature":unit(1,data.featureScale,"rem"),
    "--florist-icon":`${Number((2.55*data.iconScale/100).toFixed(3))}rem`,
    "--florist-gap":data.spacingScale/100,
  } as CSSProperties;
  // The left and right gradients protect copy, while the middle remains visually clear.
  // They intentionally sit BEHIND the content and do not obscure the floral centerpiece.
  const leftAlpha=(data.leftShade/100*.91).toFixed(3);
  const rightAlpha=(data.rightShade/100*.84).toFixed(3);
  return <section aria-labelledby="home-florist-title" style={vars} className={`@container/florist relative isolate overflow-hidden bg-[#0d1814] text-ivory ${joinsServices?"-mt-[clamp(48px,6.9vw,140px)]":""}`}>
    <Image src={data.imageUrl} alt="" fill quality={75} loading={preview?"eager":"lazy"} sizes="100vw" style={{objectPosition:`${data.imagePositionX}% ${data.imagePositionY}%`}} className="pointer-events-none -z-30 object-cover"/>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-[#06100c]" style={{opacity:data.overlayOpacity/100}}/>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{background:`linear-gradient(90deg,rgba(5,15,11,${leftAlpha}) 0%,rgba(5,15,11,.35) 28%,transparent 49%,rgba(5,15,11,.14) 66%,rgba(5,15,11,${rightAlpha}) 100%)`}}/>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#06100c]/50 via-transparent to-[#06100c]/15"/>
    <div className={`relative mx-auto grid w-[min(90%,1680px)] items-center gap-[calc(clamp(2rem,4vw,6rem)*var(--florist-gap))] pb-[clamp(8rem,11vw,15rem)] ${joinsServices?"pt-[calc(clamp(48px,6.9vw,140px)+clamp(4rem,6vw,7rem))]":"pt-[clamp(6rem,9vw,12rem)]"} lg:min-h-[clamp(630px,54vw,850px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] 3xl:w-[min(88%,2200px)] 3xl:min-h-[900px] 3xl:gap-[clamp(5rem,7vw,12rem)] 4xl:w-[min(85%,3000px)]`}>
      <div className="relative max-w-[min(100%,650px)] 3xl:max-w-[940px]">
        <motion.p {...reveal(0)} className="mb-[clamp(1rem,2vw,2.1rem)] flex items-center gap-3 text-[clamp(.72rem,.77cqw,.99rem)] font-bold uppercase tracking-[.25em] text-champagne"><span className="h-px w-10 bg-champagne"/>{data.eyebrow}</motion.p>
        <motion.h2 {...reveal(.1)} id="home-florist-title" className="font-display font-medium leading-[.88] tracking-[-.035em] text-[#fbf5eb] [font-size:clamp(var(--florist-title-min),var(--florist-title-fluid),var(--florist-title-max))]">{data.headline}</motion.h2>
        <motion.h3 {...reveal(.17)} className="mt-[clamp(1.2rem,2vw,2.5rem)] max-w-[24ch] font-display font-medium leading-[1.08] text-champagne [font-size:clamp(var(--florist-tagline-min),2.25cqw,var(--florist-tagline-max))]">{data.tagline}</motion.h3>
        <motion.p {...reveal(.24)} className="mt-[clamp(1rem,1.7vw,2rem)] max-w-[58ch] whitespace-pre-line leading-[1.78] text-white/85 [font-size:clamp(.94rem,var(--florist-desc),1.42rem)]">{data.description}</motion.p>
        <motion.div {...reveal(.32)} className="mt-[clamp(1.7rem,3vw,3.7rem)]">
          {preview?<span className="inline-flex min-h-13 items-center justify-center gap-4 rounded-full bg-champagne px-7 py-3 font-bold text-forest-deep">{data.buttonLabel}<TbArrowUpRight aria-hidden="true" size={21}/></span>
          :<Link href={data.buttonHref} className="group inline-flex min-h-13 items-center justify-center gap-4 rounded-full bg-champagne px-7 py-3 font-bold text-forest-deep shadow-[0_14px_35px_-18px_rgba(0,0,0,.6)] transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:bg-[#f1dbaf] hover:shadow-[0_17px_40px_-17px_rgba(0,0,0,.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{data.buttonLabel}<TbArrowUpRight aria-hidden="true" size={21} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"/></Link>}
        </motion.div>
      </div>
      <motion.div {...reveal(.16)} className="relative w-full max-w-[520px] justify-self-end 3xl:max-w-[680px]">
        <ul className="divide-y divide-champagne/20 border-y border-champagne/20 bg-[#08140d]/25 px-[clamp(.5rem,1vw,1.3rem)] backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-0">
          {data.features.map((feature,index)=>{const Icon=FEATURE_ICONS[index];return <li key={index} className="flex items-center gap-[clamp(1rem,1.55vw,2rem)] py-[clamp(1.05rem,2vw,2.2rem)]">
            <span className="flex size-[calc(var(--florist-icon)*1.65)] shrink-0 items-center justify-center rounded-full border border-champagne/50 text-champagne"><Icon aria-hidden="true" style={{width:"var(--florist-icon)",height:"var(--florist-icon)"}} strokeWidth={1.4}/></span>
            <div className="min-w-0 [font-size:var(--florist-feature)]"><h3 className="font-semibold leading-[1.4] text-[#fbf6ed]">{feature.title}</h3><p className="mt-1 leading-[1.55] text-white/75 [font-size:.86em]">{feature.description}</p></div>
          </li>;})}
        </ul>
      </motion.div>
    </div>
    {/* The next light section will join this lower wave without introducing another mask. */}
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 150" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-px left-0 z-20 h-[clamp(54px,7vw,145px)] w-full fill-ivory"><path d="M0 78 C183 23 332 37 495 79 C651 113 813 50 978 53 C1140 56 1270 98 1440 76 L1440 150 L0 150 Z"/></svg>
  </section>;
}
