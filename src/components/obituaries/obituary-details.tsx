import Link from "next/link";
import {TbArrowLeft,TbCalendarEvent,TbMapPin,TbFlower,TbCandle,TbCross} from "react-icons/tb";
import {formatObituaryDate} from "./obituary-card";
import type {ObituaryInput} from "@/lib/obituaries/schema";
const icons={cross:TbCross,candle:TbCandle,flower:TbFlower,none:null};
export default function ObituaryDetails({entry,preview=false}:{entry:ObituaryInput;preview?:boolean}){
  const Icon=icons[entry.symbol];
  return <article className="relative mx-auto max-w-[900px] overflow-hidden rounded-[1.5rem] border border-[#dcd2bc] bg-[#fbf9f4] p-6 text-center shadow-[0_25px_90px_-58px_#324339] sm:p-12 lg:p-16">
    <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[1rem] border border-[#c5b394]/55"/>
    <div className="relative mx-auto mb-5 flex size-12 items-center justify-center text-[#a3875c]">{Icon?<Icon size={40} strokeWidth={1.25}/>:<span className="h-px w-12 bg-[#b79d75]"/>}</div>
    <p className="relative text-[11px] font-bold uppercase tracking-[.26em] text-[#a48c66]">Z pamięcią i szacunkiem</p>
    <h1 className="relative mt-4 break-words font-display text-[clamp(3.1rem,6vw,5.9rem)] font-medium leading-[.96] tracking-[-.035em] text-[#1b2b22]">{entry.firstName||"Imię"} {entry.lastName||"i nazwisko"}</h1>
    {(entry.birthDate||entry.deathDate)&&<p className="relative mt-5 font-display text-2xl text-[#687267]">{entry.birthDate&&formatObituaryDate(entry.birthDate)}{entry.birthDate&&entry.deathDate?" — ":""}{entry.deathDate&&formatObituaryDate(entry.deathDate)}</p>}
    {entry.farewell&&<p className="relative mx-auto mt-10 max-w-[64ch] whitespace-pre-line text-base leading-[1.95] text-[#455348]">{entry.farewell}</p>}
    {(entry.ceremonyDate||entry.ceremonyPlace||entry.ceremonyAddress||entry.burialPlace)&&<div className="relative mx-auto mt-10 grid max-w-[690px] gap-6 border-t border-[#dbcab0] pt-9 text-left sm:grid-cols-2">
      {(entry.ceremonyDate||entry.ceremonyPlace||entry.ceremonyAddress)&&<div className="flex gap-3"><TbCalendarEvent className="mt-1 shrink-0 text-[#aa8c60]" size={23}/><div><h2 className="font-semibold text-[#22352a]">Uroczystość pożegnalna</h2>{entry.ceremonyDate&&<p className="mt-2 text-sm text-[#566358]">{formatObituaryDate(entry.ceremonyDate)} · {entry.ceremonyDate.slice(11,16)}</p>}{entry.ceremonyPlace&&<p className="mt-1 text-sm text-[#566358]">{entry.ceremonyPlace}</p>}{entry.ceremonyAddress&&<p className="mt-1 text-sm text-[#566358]">{entry.ceremonyAddress}</p>}</div></div>}
      {entry.burialPlace&&<div className="flex gap-3"><TbMapPin className="mt-1 shrink-0 text-[#aa8c60]" size={23}/><div><h2 className="font-semibold text-[#22352a]">Miejsce pochówku</h2><p className="mt-2 text-sm text-[#566358]">{entry.burialPlace}</p></div></div>}
    </div>}
    {!preview&&<div className="relative mt-12"><Link href="/nekrologi" className="inline-flex items-center gap-2 border-b border-[#bfa77c] pb-1 text-sm font-semibold text-[#675337] transition-colors hover:text-[#172b20]"><TbArrowLeft size={17}/> Wróć do nekrologów</Link></div>}
  </article>;
}
