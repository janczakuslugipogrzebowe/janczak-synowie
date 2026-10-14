"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import { TbArrowLeft,TbDeviceDesktop,TbDeviceMobile,TbExternalLink } from "react-icons/tb";
import HeroSection from "@/components/hero/hero-section";
import {useCmsEditor} from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import {Field,PageHeading,fieldClass,primaryButton,subtleButton,surfaceClass} from "@/components/ui/admin-fields";
import {DEFAULT_HERO,parseHero,type HeroContent} from "@/lib/hero/schema";
import {DEFAULT_SITE_SETTINGS,parseSiteSettings,type SiteSettings} from "@/lib/settings/schema";

const fields:[keyof HeroContent,string,boolean?][]=[
 ["eyebrow","Etykieta"],["headline","Nagłówek – pierwszy wiersz"],["headlineSecond","Nagłówek – drugi wiersz"],["description","Opis",true],["primaryLabel","Opis przycisku telefonu"],["secondaryLabel","Tekst przycisku dojazdu"],["detailOne","Wyróżnik pierwszy"],["detailTwo","Opis wyróżnika"],["detailThree","Wyróżnik trzeci"],
];

const responsiveControls = [
  { key: "headingScale", label: "Nagłówek główny", min:75, max:135 },
  { key: "eyebrowScale", label: "Etykieta nad nagłówkiem", min:75, max:140 },
  { key: "descriptionScale", label: "Tekst opisu", min:80, max:140 },
  { key: "buttonScale", label: "Tekst i ikony przycisków", min:80, max:135 },
  { key: "highlightIconScale", label: "Ikony informacji", min:70, max:155 },
  { key: "highlightTitleScale", label: "Nagłówki informacji", min:80, max:145 },
  { key: "highlightDescriptionScale", label: "Podpisy informacji", min:80, max:145 },
  { key: "highlightGapScale", label: "Odstępy między informacjami", min:65, max:145 },
] as const;

export default function HeroEditor(){
 const ed=useCmsEditor("/api/admin/hero",DEFAULT_HERO,parseHero);
 const [settings,setSettings]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS),[phone,setPhone]=useState(false);
 useEffect(()=>{const ac=new AbortController();fetch("/api/admin/settings",{signal:ac.signal,cache:"no-store"}).then(r=>r.json()).then(p=>{if(!ac.signal.aborted&&p.published)setSettings(parseSiteSettings(p.published));}).catch(()=>{});return()=>ac.abort();},[]);
 return <main id="main"><PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Hero"><Link href="/admin/site" className={subtleButton}><TbArrowLeft/>Podstrony</Link></PageHeading>
 <EditorState phase={ed.phase} error={ed.error} retry={ed.retry}/>
 {ed.phase==="ready"&&<div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
 <section aria-label="Formularz Hero" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}><h2 className="font-display text-3xl font-semibold">Teksty</h2>
 {fields.map(([key,label,multi])=><Field key={key} label={label}>{multi?<textarea className={`${fieldClass} min-h-32`} value={String(ed.draft[key])} onChange={e=>ed.update(key,e.target.value)}/>:<input className={fieldClass} value={String(ed.draft[key])} onChange={e=>ed.update(key,e.target.value)}/>}</Field>)}
 <div className="space-y-5 border-t border-[#ece9e1] pt-5">
   <div><h2 className="font-display text-3xl font-semibold">Typografia i układ</h2><p className="mt-2 text-xs leading-relaxed text-[#657469]">Jedna skala na wszystkie urządzenia. Wielkości dopasowują się płynnie do dostępnej szerokości, bez osobnego ustawiania telefonu, laptopa i 4K.</p></div>
   {responsiveControls.map(({key,label,min,max})=><label key={key} className="block space-y-2">
     <span className="flex items-center justify-between gap-3 text-xs font-semibold text-[#415044]"><span>{label}</span><span className="rounded-md bg-[#f1eee7] px-2 py-1 tabular-nums text-[#655137]">{ed.draft[key]}%</span></span>
     <input type="range" className="w-full accent-[#9e835a]" min={min} max={max} step="1" value={ed.draft[key]} onChange={event=>ed.update(key,Number(event.target.value))}/>
   </label>)}
   <button type="button" className={subtleButton} onClick={()=>responsiveControls.forEach(({key})=>ed.update(key,DEFAULT_HERO[key]))}>Przywróć domyślne proporcje</button>
 </div>
 <div className="border-t border-[#ece9e1] pt-5"><h2 className="mb-5 font-display text-3xl font-semibold">Zdjęcie</h2><Field label="Ścieżka zdjęcia"><input className={fieldClass} value={ed.draft.imageUrl} onChange={e=>ed.update("imageUrl",e.target.value)}/></Field></div>
 {([ ["imagePositionX","Kadrowanie poziome",0,100], ["imagePositionY","Kadrowanie pionowe",0,100],["overlayOpacity","Przyciemnienie",35,85] ] as const).map(([key,label,min,max])=><label key={key} className="block"><span className="mb-2 flex justify-between text-xs font-semibold text-[#415044]"><span>{label}</span><span>{ed.draft[key]}%</span></span><input className="w-full accent-[#9e835a]" type="range" min={min} max={max} value={ed.draft[key]} onChange={e=>ed.update(key,Number(e.target.value))}/></label>)}
 <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5"><button disabled={ed.busy||!ed.unsaved} className={subtleButton} onClick={()=>void ed.save(false)}>Zapisz szkic</button><button disabled={ed.busy||(!ed.unsaved&&!ed.unpublished)} className={primaryButton} onClick={()=>void ed.save(true)}>Opublikuj</button></div>
 {ed.message&&<p role="status" className="text-sm text-[#64765d]">{ed.message}</p>}
 </section>
 <section aria-label="Podgląd Hero" className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span><div className="flex gap-2"><button onClick={()=>setPhone(v=>!v)} className={subtleButton} type="button">{phone?<TbDeviceDesktop/>:<TbDeviceMobile/>}{phone?"Desktop":"Telefon"}</button><Link href="/" target="_blank" rel="noopener noreferrer" className={subtleButton}><TbExternalLink/>Strona</Link></div></div><div className={`overflow-hidden rounded-xl border border-[#e4e0d6] bg-white shadow-lg ${phone?"mx-auto max-w-[390px]":"w-full"}`}><HeroSection data={ed.draft} settings={settings} preview compact={phone}/></div></section>
 </div>}
 </main>;
}
