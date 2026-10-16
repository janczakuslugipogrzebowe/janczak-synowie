"use client";
import { useEffect, useMemo, useState } from "react";
import { TbAlertCircle,TbArrowUpRight,TbCheck,TbRefresh } from "react-icons/tb";
import { DEFAULT_SITE_SETTINGS,parseSiteSettings,isAllowedMapsUrl,type SiteSettings } from "@/lib/settings/schema";
import { Field,PageHeading,fieldClass,primaryButton,subtleButton,surfaceClass } from "@/components/ui/admin-fields";

type Group={title:string;fields:{key:keyof SiteSettings;label:string;placeholder?:string}[]};
const groups:Group[]=[
  {title:"Firma",fields:[{key:"companyName",label:"Nazwa firmy"},{key:"companyDescription",label:"Krótki opis"},{key:"availability",label:"Dostępność"},{key:"trustSubtitle",label:"Wartości firmy"}]},
  {title:"Telefony i e-mail",fields:[{key:"primaryPhone",label:"Telefon główny"},{key:"secondaryPhone",label:"Telefon dodatkowy"},{key:"email",label:"Adres e-mail (opcjonalnie)"}]},
  {title:"Siedziba i lokalizacja",fields:[{key:"addressLine",label:"Adres"},{key:"postalCity",label:"Kod pocztowy i miejscowość"},{key:"mapsUrl",label:"Link do wizytówki Google Maps",placeholder:"https://maps.app.goo.gl/..."}]},
];
export default function CompanyPage(){
 const [data,setData]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS),[saved,setSaved]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS),[published,setPublished]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
 const [state,setState]=useState<"loading"|"ready"|"error">("loading"),[error,setError]=useState(""),[feedback,setFeedback]=useState(""),[retry,setRetry]=useState(0),[busy,setBusy]=useState(false);
 useEffect(()=>{const ac=new AbortController();let gone=false;const timer=setTimeout(()=>ac.abort(),15000);async function load(){setState("loading");setError("");try{const r=await fetch("/api/admin/settings",{cache:"no-store",signal:ac.signal});const p=await r.json();if(!r.ok)throw new Error(p.error??"Nie udało się wczytać danych.");if(gone)return;const live=parseSiteSettings(p.published),draft=p.draft?parseSiteSettings(p.draft):live;setPublished(live);setSaved(draft);setData(draft);setState("ready");}catch(e){if(!gone){setError(ac.signal.aborted?"Przekroczono czas oczekiwania.":e instanceof Error?e.message:"Błąd pobierania.");setState("error");}}finally{clearTimeout(timer);}}void load();return()=>{gone=true;clearTimeout(timer);ac.abort();};},[retry]);
 const unsaved=useMemo(()=>JSON.stringify(data)!==JSON.stringify(saved),[data,saved]);
 const unpublished=useMemo(()=>JSON.stringify(data)!==JSON.stringify(published),[data,published]);
 function update(key:keyof SiteSettings,value:string){setData(x=>({...x,[key]:value}));setFeedback("");}
 async function persist(publish:boolean){if(busy)return;setBusy(true);setFeedback("");try{const clean=parseSiteSettings(data);const r=await fetch("/api/admin/settings",{method:publish?"POST":"PUT",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(clean),signal:AbortSignal.timeout(20000)});const p=await r.json();if(!r.ok)throw new Error(p.error??"Zapis nie powiódł się.");setSaved(clean);setData(clean);if(publish)setPublished(clean);setFeedback(publish?"Zmiany opublikowane.":"Zapisano szkic.");}catch(e){setFeedback(e instanceof Error?e.message:"Błąd zapisu.");}finally{setBusy(false);}}
 return <main id="main"><PageHeading eyebrow="Ustawienia globalne" title="Firma i kontakt" />
 {state==="loading"&&<p role="status" className="text-sm text-[#718072]">Wczytywanie…</p>}
 {state==="error"&&<div role="alert" className={`${surfaceClass} max-w-[680px] p-7`}><p className="mb-5 flex items-center gap-2 text-sm text-red-700"><TbAlertCircle size={19}/>{error}</p><button className={subtleButton} onClick={()=>setRetry(x=>x+1)}><TbRefresh/>Ponów</button></div>}
 {state==="ready"&&<div className="max-w-[1060px] space-y-5">{groups.map(group=><section key={group.title} className={`${surfaceClass} p-6 md:p-9`}><h2 className="mb-6 font-display text-[32px] font-semibold">{group.title}</h2><div className="grid gap-5 md:grid-cols-2">{group.fields.map(f=><div key={f.key} className={f.key==="mapsUrl"||f.key==="companyDescription"?"md:col-span-2":""}><Field label={f.label}><input className={fieldClass} type={f.key==="email"?"email":f.key==="mapsUrl"?"url":"text"} value={data[f.key]} placeholder={f.placeholder} onChange={e=>update(f.key,e.target.value)} /></Field>{f.key==="mapsUrl"&&<div className="mt-2 flex items-center gap-4">{data.mapsUrl&&isAllowedMapsUrl(data.mapsUrl)?<a className="inline-flex items-center gap-1 text-xs font-semibold text-[#886c43] underline underline-offset-4" href={data.mapsUrl} target="_blank" rel="noopener noreferrer">Sprawdź lokalizację <TbArrowUpRight size={15}/></a>:data.mapsUrl?<span className="text-xs text-red-700">Nieprawidłowy adres Google Maps</span>:null}</div>}</div>)}</div></section>)}
 <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e0d8] bg-white/95 px-5 py-4 shadow-lg backdrop-blur-lg"><span className="text-xs text-[#69746b]">{unsaved?"Niezapisane zmiany":unpublished?"Szkic oczekuje na publikację":"Aktualne dane"}</span><div className="flex gap-2"><button disabled={busy||!unsaved} onClick={()=>void persist(false)} className={subtleButton}>Zapisz szkic</button><button disabled={busy||(!unsaved&&!unpublished)} onClick={()=>void persist(true)} className={primaryButton}>{busy?"Zapisywanie…":"Opublikuj"}</button></div></div>
 {feedback&&<p role="status" className="flex items-center gap-2 text-sm"><TbCheck size={18}/>{feedback}</p>}
 </div>}
 </main>;
}
