"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {TbDeviceDesktop,TbDeviceMobile,TbExternalLink} from "react-icons/tb";
import GuidanceLivePreview from "@/components/admin/guidance-live-preview";
import EditorState from "@/components/admin/editor-state";
import {useCmsEditor} from "@/components/admin/use-cms-editor";
import {Field,PageHeading,fieldClass,primaryButton,subtleButton,surfaceClass} from "@/components/ui/admin-fields";
import {DEFAULT_HOME_GUIDANCE,parseHomeGuidance,type HomeGuidanceContent} from "@/lib/home-guidance/schema";
import {DEFAULT_SITE_SETTINGS,parseSiteSettings,type SiteSettings} from "@/lib/settings/schema";

const controls=[
 {key:"headingScale",label:"Wielkość nagłówka",min:75,max:130},
 {key:"descriptionScale",label:"Wielkość opisu",min:80,max:135},
 {key:"buttonScale",label:"Wielkość przycisków",min:80,max:130},
 {key:"stepsScale",label:"Wielkość tekstów kroków",min:80,max:135},
 {key:"spacingScale",label:"Odstępy pionowe",min:75,max:125},
] as const;
const imageControls=[
 {key:"imagePositionX",label:"Kadrowanie poziome",min:0,max:100},
 {key:"imagePositionY",label:"Kadrowanie pionowe",min:0,max:100},
 {key:"overlayOpacity",label:"Przyciemnienie",min:35,max:95},
 {key:"panelOpacity",label:"Przezroczystość panelu",min:35,max:95},
] as const;

export default function GuidanceEditor(){
 const ed=useCmsEditor<HomeGuidanceContent>("/api/admin/home/guidance",DEFAULT_HOME_GUIDANCE,parseHomeGuidance);
 const [phone,setPhone]=useState(false),[settings,setSettings]=useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
 useEffect(()=>{const controller=new AbortController();fetch("/api/admin/settings",{signal:controller.signal,cache:"no-store"}).then(r=>r.json()).then(p=>{if(!controller.signal.aborted&&p.published)setSettings(parseSiteSettings(p.published));}).catch(()=>{});return()=>controller.abort();},[]);
 const changeStep=(index:number,key:"title"|"description",value:string)=>ed.update("steps",ed.draft.steps.map((step,i)=>i===index?{...step,[key]:value}:step));
 return <main id="main"><PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Co zrobić"/>
  <EditorState phase={ed.phase} error={ed.error} retry={ed.retry}/>
  {ed.phase==="ready"&&<div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
   <section aria-label="Formularz sekcji Co zrobić" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
    <h2 className="font-display text-3xl font-semibold">Treści</h2>
    <Field label="Etykieta"><input className={fieldClass} value={ed.draft.eyebrow} onChange={e=>ed.update("eyebrow",e.target.value)}/></Field>
    <Field label="Nagłówek"><textarea rows={3} className={`${fieldClass} resize-y`} value={ed.draft.headline} onChange={e=>ed.update("headline",e.target.value)}/></Field>
    <Field label="Opis"><textarea rows={5} className={`${fieldClass} resize-y`} value={ed.draft.description} onChange={e=>ed.update("description",e.target.value)}/></Field>
    <Field label="Opis przycisku telefonu"><input className={fieldClass} value={ed.draft.phoneButtonLabel} onChange={e=>ed.update("phoneButtonLabel",e.target.value)}/></Field>
    <Field label="Tekst przycisku do oferty"><input className={fieldClass} value={ed.draft.offerButtonLabel} onChange={e=>ed.update("offerButtonLabel",e.target.value)}/></Field>
    <Field label="Link przycisku"><input className={fieldClass} value={ed.draft.offerButtonHref} onChange={e=>ed.update("offerButtonHref",e.target.value)}/></Field>
    <div className="space-y-5 border-t border-[#ece9e1] pt-5"><h2 className="font-display text-3xl font-semibold">Cztery kroki</h2>
     {ed.draft.steps.map((step,index)=><div key={index} className="space-y-3 rounded-xl border border-[#eeece5] bg-[#fbfaf7] p-4"><p className="text-xs font-bold tracking-wide text-[#9e835a]">{String(index+1).padStart(2,"0")}</p>
      <Field label="Tytuł"><input className={fieldClass} value={step.title} onChange={e=>changeStep(index,"title",e.target.value)}/></Field>
      <Field label="Opis"><textarea rows={2} className={`${fieldClass} resize-y`} value={step.description} onChange={e=>changeStep(index,"description",e.target.value)}/></Field>
     </div>)}
    </div>
    <div className="space-y-5 border-t border-[#ece9e1] pt-5"><h2 className="font-display text-3xl font-semibold">Fotografia</h2>
     <Field label="Ścieżka zdjęcia"><input className={fieldClass} value={ed.draft.imageUrl} onChange={e=>ed.update("imageUrl",e.target.value)}/></Field>
     {imageControls.map(({key,label,min,max})=><label key={key} className="block space-y-2"><span className="flex items-center justify-between text-xs font-semibold text-[#415044]"><span>{label}</span><span>{ed.draft[key]}%</span></span><input type="range" className="w-full accent-[#9e835a]" min={min} max={max} step={1} value={ed.draft[key]} onChange={e=>ed.update(key,Number(e.target.value))}/></label>)}
    </div>
    <div className="space-y-5 border-t border-[#ece9e1] pt-5"><h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
     {controls.map(({key,label,min,max})=><label key={key} className="block space-y-2"><span className="flex items-center justify-between text-xs font-semibold text-[#415044]"><span>{label}</span><span className="rounded-md bg-[#f1eee7] px-2 py-1 tabular-nums text-[#655137]">{ed.draft[key]}%</span></span><input type="range" className="w-full accent-[#9e835a]" min={min} max={max} step={1} value={ed.draft[key]} onChange={e=>ed.update(key,Number(e.target.value))}/></label>)}
     <button type="button" className={subtleButton} onClick={()=>controls.forEach(({key})=>ed.update(key,DEFAULT_HOME_GUIDANCE[key]))}>Przywróć proporcje</button>
    </div>
    <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5"><button type="button" className={subtleButton} disabled={ed.busy||!ed.unsaved} onClick={()=>void ed.save(false)}>Zapisz szkic</button><button type="button" className={primaryButton} disabled={ed.busy||(!ed.unsaved&&!ed.unpublished)} onClick={()=>void ed.save(true)}>{ed.busy?"Zapisywanie…":"Opublikuj"}</button></div>
    {ed.message&&<p role="status" className="text-sm text-[#64765d]">{ed.message}</p>}
   </section>
   <section aria-label="Podgląd Co zrobić" className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span><div className="flex gap-2"><button type="button" className={subtleButton} onClick={()=>setPhone(x=>!x)}>{phone?<TbDeviceDesktop/>:<TbDeviceMobile/>}{phone?"Desktop":"Telefon"}</button><Link href="/" target="_blank" rel="noopener noreferrer" className={subtleButton}><TbExternalLink/>Strona</Link></div></div>
    <GuidanceLivePreview data={ed.draft} settings={settings} phone={phone}/>
   </section>
  </div>}
 </main>;
}
