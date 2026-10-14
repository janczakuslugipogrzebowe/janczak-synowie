"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TbArrowLeft, TbExternalLink } from "react-icons/tb";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import {Field,PageHeading,fieldClass,primaryButton,subtleButton,surfaceClass} from "@/components/ui/admin-fields";
import SubpageIntro from "@/components/subpage-intro";
import {PAGE_DEFAULTS,PAGE_LABELS,isPageSlug,parsePageContent,type PageSlug} from "@/lib/pages/schema";

function PageEditor({slug}:{slug:PageSlug}){
 const ed=useCmsEditor(`/api/admin/pages/${slug}`,PAGE_DEFAULTS[slug],parsePageContent);
 return <main id="main"><PageHeading eyebrow={`Edytor witryny / ${PAGE_LABELS[slug]}`} title="Sekcja wprowadzająca"><Link href="/admin/site" className={subtleButton}><TbArrowLeft/>Podstrony</Link></PageHeading>
 <EditorState phase={ed.phase} error={ed.error} retry={ed.retry}/>
 {ed.phase==="ready"&&<div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
  <section className={`${surfaceClass} space-y-5 p-6 3xl:p-8`} aria-label="Edycja sekcji"><h2 className="font-display text-3xl font-semibold">Teksty</h2>
   <Field label="Etykieta"><input className={fieldClass} value={ed.draft.eyebrow} onChange={e=>ed.update("eyebrow",e.target.value)}/></Field>
   <Field label="Nagłówek"><input className={fieldClass} value={ed.draft.title} onChange={e=>ed.update("title",e.target.value)}/></Field>
   <Field label="Opis"><textarea className={`${fieldClass} min-h-40`} value={ed.draft.description} onChange={e=>ed.update("description",e.target.value)}/></Field>
   <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5"><button type="button" onClick={()=>void ed.save(false)} className={subtleButton} disabled={ed.busy||!ed.unsaved}>Zapisz szkic</button><button type="button" onClick={()=>void ed.save(true)} className={primaryButton} disabled={ed.busy||(!ed.unsaved&&!ed.unpublished)}>Opublikuj</button></div>
   {ed.message&&<p role="status" className="text-sm text-[#5f735d]">{ed.message}</p>}
  </section>
  <section aria-label="Podgląd na żywo" className="min-w-0"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-[#657166]">Podgląd sekcji</span><a target="_blank" rel="noopener noreferrer" href={`/${slug}`} className="flex items-center gap-1 text-xs text-[#987d59]">Otwórz stronę <TbExternalLink/></a></div><div className="overflow-hidden rounded-xl border border-[#e5e0d4] shadow-lg"><SubpageIntro content={ed.draft} preview/></div></section>
 </div>}
 </main>;
}
export default function EditPage(){const params=useParams<{slug:string}>();if(!isPageSlug(params.slug))return <main id="main"><p>Nie znaleziono podstrony.</p></main>;return <PageEditor slug={params.slug}/>;}
