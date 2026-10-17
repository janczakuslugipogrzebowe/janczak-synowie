"use client";
import Image from "next/image";
import Link from "next/link";
import {useState,useSyncExternalStore,type CSSProperties} from "react";
import {motion,useReducedMotion} from "motion/react";
import {TbArrowUpRight,TbChevronLeft,TbChevronRight} from "react-icons/tb";
import {ObituaryCard} from "@/components/obituaries/obituary-card";
import type {ObituaryRecord} from "@/lib/obituaries/schema";
import type {HomeObituariesContent} from "@/lib/home-obituaries/schema";

// The number of visible cards follows the real viewport (including the CMS iframe),
// rather than assuming that the desktop and phone previews share the same width.
function subscribeToViewport(onChange:()=>void){
  window.addEventListener("resize",onChange,{passive:true});
  return ()=>window.removeEventListener("resize",onChange);
}
function viewportColumns(){return window.innerWidth>=1280?3:window.innerWidth>=640?2:1;}
function serverViewportColumns(){return 3;}

export default function HomeObituariesSection({data,entries,preview=false,joinsFlorist=false}:{data:HomeObituariesContent;entries:ObituaryRecord[];preview?:boolean;joinsFlorist?:boolean}){
  const reduce=useReducedMotion();
  const columns=useSyncExternalStore(subscribeToViewport,viewportColumns,serverViewportColumns);
  const pageSize=Math.min(columns,data.visibleCount);
  const recent=entries.slice(0,12);
  const pageCount=Math.max(1,Math.ceil(recent.length/pageSize));
  const [requestedPage,setRequestedPage]=useState(0);
  const page=Math.min(requestedPage,pageCount-1);
  const start=page*pageSize;
  const displayed=recent.slice(start,start+pageSize);
  const reveal=(delay:number)=>({initial:preview||reduce?false:{opacity:0,y:24},whileInView:{opacity:1,y:0},viewport:{once:true,amount:.12},transition:{duration:.72,delay,ease:[.2,.65,.2,1] as [number,number,number,number]}});
  const vars={"--ob-heading":data.headingScale/100,"--ob-desc":data.descriptionScale/100,"--ob-card":data.cardScale/100,"--ob-gap":data.spacingScale/100} as CSSProperties;
  return <section aria-labelledby="home-obituaries-title" style={vars} className={`@container/obituaries relative isolate overflow-hidden bg-ivory text-forest-deep ${joinsFlorist?"-mt-[clamp(54px,7vw,145px)]":""}`}>
    <Image src={data.imageUrl} alt="" fill sizes="100vw" quality={75} loading={preview?"eager":"lazy"} className="pointer-events-none -z-30 object-cover" style={{objectPosition:`${data.imagePositionX}% ${data.imagePositionY}%`,opacity:data.imageOpacity/100}}/>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20" style={{background:`linear-gradient(90deg,rgba(246,241,232,${(data.leftShade/100).toFixed(2)}) 0%,rgba(246,241,232,.86) 35%,rgba(246,241,232,.5) 69%,rgba(246,241,232,.75) 100%)`}}/>
    <div className={`relative mx-auto grid w-[min(90%,1680px)] items-center gap-[clamp(2.5rem,4vw,6rem)] pb-[clamp(8rem,11vw,14rem)] ${joinsFlorist?"pt-[calc(clamp(54px,7vw,145px)+clamp(4rem,5.5vw,8rem))]":"pt-[clamp(6rem,9vw,13rem)]"} xl:grid-cols-[minmax(0,.83fr)_minmax(0,1.65fr)] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)]`}>
      <div className="max-w-[660px]">
        <motion.p {...reveal(0)} className="mb-5 flex items-center gap-3 text-[clamp(.7rem,.7cqw,.95rem)] font-bold uppercase tracking-[.26em] text-[#a78453]"><span className="h-px w-9 bg-[#a78453]"/>{data.eyebrow}</motion.p>
        <motion.h2 {...reveal(.09)} id="home-obituaries-title" className="font-display font-medium leading-[.96] tracking-[-.03em] [font-size:clamp(calc(3.7rem*var(--ob-heading)),calc(4.8cqw*var(--ob-heading)),calc(7rem*var(--ob-heading)))]">{data.headline}</motion.h2>
        <motion.p {...reveal(.17)} className="mt-[clamp(1.3rem,2vw,2.5rem)] max-w-[52ch] leading-[1.8] text-[#526057] [font-size:clamp(.95rem,calc(1.05rem*var(--ob-desc)),1.4rem)]">{data.description}</motion.p>
        <motion.div {...reveal(.23)} className="mt-[clamp(1.5rem,2.5vw,3rem)]">{preview?<span className="inline-flex min-h-12 items-center gap-3 rounded-full bg-champagne px-7 py-3 text-sm font-semibold">{data.buttonLabel}<TbArrowUpRight size={19}/></span>:<Link href="/nekrologi" className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-champagne px-7 py-3 text-sm font-semibold shadow-[0_10px_30px_-20px_#2d352b] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-deep">{data.buttonLabel}<TbArrowUpRight size={19} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"/></Link>}</motion.div>
      </div>
      <div className="min-w-0" aria-label="Najnowsze nekrologi">
        {recent.length>0&&<>
          <div className="grid items-stretch gap-[calc(clamp(.8rem,1.25vw,1.5rem)*var(--ob-gap))]" style={{gridTemplateColumns:`repeat(${pageSize},minmax(0,1fr))`}}>
            {displayed.map((item,index)=><motion.div key={item.id} initial={preview||reduce?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.35,delay:index*.065}} className="min-w-0 [font-size:calc(1rem*var(--ob-card))]"><ObituaryCard data={item} compact preview={preview}/></motion.div>)}
          </div>
          {recent.length>pageSize&&<nav aria-label="Przewijanie nekrologów" className="mt-6 flex items-center justify-end gap-3">
            
            <button type="button" onClick={()=>setRequestedPage(Math.max(0,page-1))} disabled={page===0} aria-label="Poprzednie nekrologi" className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#b39b76]/65 bg-[#f9f5ee]/80 text-[#26372a] shadow-sm transition-colors hover:border-[#98784e] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d8053] disabled:cursor-not-allowed disabled:opacity-35"><TbChevronLeft size={22}/></button>
            <button type="button" onClick={()=>setRequestedPage(Math.min(pageCount-1,page+1))} disabled={page===pageCount-1} aria-label="Kolejne nekrologi" className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#b39b76]/65 bg-[#f9f5ee]/80 text-[#26372a] shadow-sm transition-colors hover:border-[#98784e] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d8053] disabled:cursor-not-allowed disabled:opacity-35"><TbChevronRight size={22}/></button>
          </nav>}
        </>}
        {recent.length===0&&<div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[#dcd2be] bg-[#f8f5ec]/80 px-8 text-center"><p className="max-w-[32ch] font-display text-3xl text-[#506153]">Aktualnie nie ma opublikowanych nekrologów.</p></div>}
      </div>
    </div>
    <svg aria-hidden="true" viewBox="0 0 1440 130" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-px z-10 h-[clamp(55px,7vw,130px)] w-full fill-forest-deep"><path d="M0 75 C200 33 328 93 522 86 C708 79 869 32 1035 48 C1220 66 1333 92 1440 67 L1440 130 L0 130 Z"/></svg>
  </section>;
}
