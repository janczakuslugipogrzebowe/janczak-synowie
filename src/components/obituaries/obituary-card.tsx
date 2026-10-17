import Link from "next/link";
import {TbArrowUpRight,TbCalendarEvent,TbCandle,TbCross,TbFlower} from "react-icons/tb";
import type {ObituaryRecord} from "@/lib/obituaries/schema";
const symbol={flower:TbFlower,candle:TbCandle,cross:TbCross,none:null};
export function formatObituaryDate(date:string){if(!date)return "";const [y,m,d]=date.slice(0,10).split("-");return `${d}.${m}.${y}`;}
export function ObituaryCard({data,preview=false,compact=false}:{data:ObituaryRecord;preview?:boolean;compact?:boolean}){
  const Icon=symbol[data.symbol]??null;
  const ceremony=data.ceremonyDate?`${formatObituaryDate(data.ceremonyDate)} · ${data.ceremonyDate.slice(11,16)}`:null;
  const inner=<article className={`group relative flex h-full flex-col items-center overflow-hidden border border-[#a89065]/70 bg-[linear-gradient(155deg,#22372a_0%,#14251d_64%,#101f19_100%)] px-[clamp(.7rem,1.25vw,1.7rem)] py-7 text-center text-[#faf3e8] shadow-[0_22px_44px_-25px_rgba(13,24,20,.55)] transition-[box-shadow,border-color] duration-300 hover:border-[#dec395] hover:shadow-[0_28px_48px_-21px_rgba(13,24,20,.55)] ${compact?"min-h-[280px] 2xl:min-h-[340px]":"min-h-[310px]"}`}>
    <span aria-hidden="true" className="pointer-events-none absolute inset-[6px] border border-[#d6b98b]/20"/>
    <div className="relative flex flex-col items-center">
      <span aria-hidden="true" className="mb-3 h-px w-9 bg-[#bca477]/55"/>
      <div className="flex size-10 items-center justify-center text-[#dac398]">{Icon?<Icon size={29} strokeWidth={1.2}/>:<span className="block h-px w-8 bg-[#dac398]"/>}</div>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.22em] text-[#d1bb94]">Z pamięcią i szacunkiem</p>
    </div>
    <div className="relative my-auto w-full px-1 py-5">
      <h3 className="break-words font-display font-medium leading-[1.09] tracking-[-.025em] [font-size:clamp(calc(1.55rem*var(--ob-card,1)),calc(1.9vw*var(--ob-card,1)),calc(2.5rem*var(--ob-card,1)))]">{data.firstName} {data.lastName}</h3>
      {(data.birthDate||data.deathDate)&&<p className="mt-3 text-[12px] tracking-[.08em] text-[#d5c29f]">{data.birthDate?data.birthDate.slice(0,4):""}{data.birthDate&&data.deathDate?" – ":""}{data.deathDate?data.deathDate.slice(0,4):""}</p>}
      {ceremony&&<p className="mt-5 inline-flex items-center justify-center gap-2 text-[11px] leading-snug text-[#e4d3b9]"><TbCalendarEvent className="shrink-0" size={16}/>{ceremony}</p>}
    </div>
    <div className="relative w-full border-t border-[#d3b788]/30 pt-4 text-xs font-semibold tracking-[.01em] text-[#edcf9a]"><span className="inline-flex items-center gap-1.5">Informacje o uroczystości <TbArrowUpRight className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={16}/></span></div>
  </article>;
  return preview?<div className="h-full">{inner}</div>:<Link href={`/nekrologi/${encodeURIComponent(data.slug)}`} className="block h-full cursor-pointer transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9844b]" aria-label={`Nekrolog – ${data.firstName} ${data.lastName}`}>{inner}</Link>;
}
