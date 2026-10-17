import type {Metadata} from "next";
import Link from "next/link";
import {Suspense} from "react";
import {TbArrowRight,TbSearch} from "react-icons/tb";
import {ObituaryCard} from "@/components/obituaries/obituary-card";
import {getPublicObituaries} from "@/lib/obituaries/data";
export const metadata:Metadata={title:"Nekrologi",description:"Nekrologi i informacje o uroczystościach pożegnalnych – Janczak i Synowie, Żelazków.",robots:{index:false,follow:true}};
type Query={q?:string;cursor?:string};
async function List({searchParams}:{searchParams:Promise<Query>}){
  const {q="",cursor=""}=await searchParams;
  const search=q.trim().slice(0,90);
  const {items,nextCursor}=await getPublicObituaries(search,/^[a-zA-Z0-9_-]{8,90}$/.test(cursor)?cursor:"",12);
  return <><form action="/nekrologi" method="GET" className="mt-10 flex max-w-xl items-center gap-3 rounded-2xl border border-[#ddd6c7] bg-white px-4 py-2 shadow-sm"><TbSearch size={21} className="text-[#927951]"/><label className="sr-only" htmlFor="obituary-search">Wyszukaj imię lub nazwisko</label><input id="obituary-search" type="search" name="q" maxLength={90} defaultValue={search} placeholder="Wyszukaj imię lub nazwisko" className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"/><button type="submit" className="rounded-xl bg-[#21372b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#365142]">Szukaj</button></form>
    {items.length>0?<div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">{items.map(x=><ObituaryCard key={x.id} data={x}/>)}</div>:<div className="mt-10 rounded-2xl border border-[#ddd6c7] bg-white/75 px-6 py-16 text-center"><p className="font-display text-3xl">{search?"Nie znaleziono nekrologów dla podanego wyszukiwania.":"Aktualnie nie ma opublikowanych nekrologów."}</p></div>}
    {nextCursor&&<div className="mt-9 flex justify-center"><Link className="inline-flex items-center gap-2 rounded-full border border-[#b9a07a] px-6 py-3 text-sm font-semibold hover:bg-white" href={`/nekrologi?${new URLSearchParams({...(search?{q:search}:{}),cursor:nextCursor}).toString()}`}>Pokaż kolejne <TbArrowRight size={17}/></Link></div>}
  </>;
}
export default function ObituariesPage({searchParams}:{searchParams:Promise<Query>}){
  return <main id="main" className="min-h-dvh bg-ivory px-5 pb-24 pt-[clamp(9rem,14vw,14rem)] text-forest-deep md:px-10"><div className="mx-auto max-w-[1600px] 3xl:max-w-[2200px]"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#a48354]">JANCZAK I SYNOWIE</p><h1 className="mt-4 font-display text-[clamp(4rem,8vw,7rem)] leading-none">Nekrologi</h1><p className="mt-5 max-w-[600px] text-sm leading-[1.9] text-[#5b695d] md:text-base">Informacje o osobach zmarłych i uroczystościach pożegnalnych.</p><Suspense fallback={<p className="mt-12 text-[#647265]">Wczytywanie nekrologów…</p>}><List searchParams={searchParams}/></Suspense></div></main>;
}
