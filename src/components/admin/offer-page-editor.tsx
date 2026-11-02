"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { TbExternalLink, TbPlus, TbTrash } from "react-icons/tb";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import { AdminSlider } from "@/components/ui/admin-slider";
import { Field, PageHeading, fieldClass, primaryButton, subtleButton, surfaceClass } from "@/components/ui/admin-fields";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import { OfferFormalitiesSection, OfferProcessSection, OfferFloristSection } from "@/components/offer/offer-sections";
import OfferExplorer from "@/components/offer/offer-explorer";
import { DEFAULT_SERVICE_CATALOG, parseServiceCatalog, type ServiceCatalog } from "@/lib/offer/service-catalog";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/settings/schema";
import { parseSubpageBlock, subpageDefault, type SubpageBlock } from "@/lib/subpages/schema";
import {
  OFFER_DEFAULTS, parseOfferSection,
  type OfferIntro, type OfferCatalog, type OfferFormalities, type OfferProcess, type OfferFlorist,
} from "@/lib/offer/schema";

// Stable parser references: useCmsEditor includes `parse` in its load effect dependencies.
// Inline arrow parsers here would cause a fetch loop after every state update.
const parseIntro = (value: unknown) => parseOfferSection("intro", value);
const parseCatalog = (value: unknown) => parseOfferSection("catalog", value);
const parseFormalities = (value: unknown) => parseOfferSection("formalities", value);
const parseProcess = (value: unknown) => parseOfferSection("process", value);
const parseFlorist = (value: unknown) => parseOfferSection("florist", value);

const headings = { hero: "Hero", intro: "Przegląd oferty", catalog: "Przegląd oferty", formalities: "Formalności i rozliczenia", process: "Etapy współpracy", florist: "Kwiaciarnia", bottom: "Kontaktowe CTA" };
function useCompanySettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => {
    const ac = new AbortController();
    void fetch("/api/admin/settings", { signal: ac.signal, cache: "no-store", credentials: "same-origin" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!ac.signal.aborted && (d?.draft || d?.published)) setSettings(d.draft ?? d.published); })
      .catch(() => {});
    return () => ac.abort();
  }, []);
  return settings;
}
function Layout({ section, children, preview, phase, error, retry }: { section: keyof typeof headings; children: ReactNode; preview: ReactNode; phase: "loading" | "ready" | "error"; error: string; retry: () => void }) {
  return <main id="main">
    <PageHeading eyebrow="Edytor witryny / Oferta" title={headings[section]}>
      <Link href="/oferta" target="_blank" rel="noopener noreferrer" className={subtleButton}><TbExternalLink/> Otwórz ofertę</Link>
    </PageHeading>
    <EditorState phase={phase} error={error} retry={retry}/>
    {phase === "ready" && <div className="grid items-start gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(430px,520px)_minmax(0,1fr)]">
      <section aria-label="Edycja sekcji" className={`${surfaceClass} min-w-0 space-y-5 p-6 3xl:p-8`}>{children}</section>
      <section aria-label="Podgląd na żywo" className="min-w-0"><p className="mb-3 text-xs font-semibold text-[#657166]">Podgląd na żywo — szkic, przed publikacją</p><div className="sticky top-5 max-h-[80vh] overflow-auto rounded-xl border border-[#dfdacd] shadow-lg">{preview}</div></section>
    </div>}
  </main>;
}
function Actions({ busy, unsaved, unpublished, save }: { busy: boolean; unsaved: boolean; unpublished: boolean; save: (publish: boolean) => Promise<void> }) {
  return <div className="flex flex-wrap gap-2 border-t border-[#e6e0d4] pt-6"><button type="button" className={subtleButton} disabled={busy || !unsaved} onClick={() => void save(false)}>Zapisz szkic</button><button type="button" className={primaryButton} disabled={busy || (!unsaved && !unpublished)} onClick={() => void save(true)}>{busy ? "Zapisywanie…" : "Opublikuj"}</button>{unpublished && <p className="w-full text-xs text-[#927347]">Masz zmiany, które nie zostały opublikowane.</p>}</div>;
}
function MainTextFields({ value, update }: { value: OfferIntro; update: (key: keyof OfferIntro, value: string | number) => void }) {
  return <>
    <h2 className="font-display text-3xl text-[#1c3026]">Treści sekcji</h2>
    <Field label="Etykieta"><input className={fieldClass} value={value.eyebrow} onChange={e=>update("eyebrow",e.target.value)}/></Field>
    <Field label="Nagłówek"><input className={fieldClass} value={value.title} onChange={e=>update("title",e.target.value)}/></Field>
    <Field label="Opis"><textarea rows={5} className={fieldClass} value={value.description} onChange={e=>update("description",e.target.value)}/></Field>
    <AdminSlider label="Wielkość nagłówka" min={65} max={150} value={value.headingScale} onChange={v=>update("headingScale",v)}/>
  </>;
}
const DEFAULTS = { hero: subpageDefault("oferta", "hero"), bottom: subpageDefault("oferta", "bottom") };
export function OfferSharedEditor({ section }: { section: "hero" | "bottom" }) {
  const ed = useCmsEditor(`/api/admin/subpages/oferta/${section}`, DEFAULTS[section], parseSubpageBlock);
  const settings = useCompanySettings();
  return <Layout section={section} phase={ed.phase} error={ed.error} retry={ed.retry} preview={section === "hero" ? <SubpageHero data={ed.draft} preview/> : <SubpageBottomCta data={ed.draft} settings={settings} preview/>}>
    <h2 className="font-display text-3xl text-[#1c3026]">Treści</h2>
    {section === "bottom" && <Field label="Etykieta"><input className={fieldClass} value={ed.draft.eyebrow} onChange={e=>ed.update("eyebrow", e.target.value)}/></Field>}
    <Field label="Nagłówek"><input className={fieldClass} value={ed.draft.title} onChange={e=>ed.update("title",e.target.value)}/></Field>
    <Field label="Opis"><textarea rows={5} className={fieldClass} value={ed.draft.description} onChange={e=>ed.update("description",e.target.value)}/></Field>
    {section === "bottom" && <Field label="Tekst przycisku"><input className={fieldClass} value={ed.draft.ctaText} onChange={e=>ed.update("ctaText",e.target.value)}/></Field>}
    <Field label="Ścieżka zdjęcia" hint="Możesz wskazać publiczny plik, np. /hero-oferta.png lub /bottom-oferta.png."><input className={fieldClass} value={ed.draft.imageUrl} onChange={e=>ed.update("imageUrl",e.target.value)}/></Field>
    <AdminSlider label="Wielkość nagłówka" min={65} max={150} value={ed.draft.headingScale} onChange={v=>ed.update("headingScale",v)}/>
    <AdminSlider label="Przyciemnienie zdjęcia" min={0} max={95} value={ed.draft.overlay} onChange={v=>ed.update("overlay",v)}/>
    <Actions busy={ed.busy} unsaved={ed.unsaved} unpublished={ed.unpublished} save={ed.save}/>
  </Layout>;
}
function useServicesPreview() {
  const [catalog, setCatalog] = useState<ServiceCatalog>(DEFAULT_SERVICE_CATALOG);
  useEffect(() => {
    const ac = new AbortController();
    void fetch("/api/admin/services", { credentials:"same-origin", cache:"no-store", signal:ac.signal })
      .then(r => r.ok ? r.json() : null)
      .then(v => { if (!ac.signal.aborted && v) setCatalog(parseServiceCatalog(v.draft ?? v.published)); })
      .catch(() => {});
    return () => ac.abort();
  }, []);
  return catalog;
}
/** Intro and catalog headings stay in their existing Firestore documents for zero-loss migration.
 * One editorial screen manages both parts; the separate service manager owns categories and items. */
export function OfferOverviewEditor() {
  const intro = useCmsEditor<OfferIntro>("/api/admin/offer/intro", OFFER_DEFAULTS.intro, parseIntro);
  const catalog = useCmsEditor<OfferCatalog>("/api/admin/offer/catalog", OFFER_DEFAULTS.catalog, parseCatalog);
  const services = useServicesPreview();
  const phase = intro.phase === "error" || catalog.phase === "error" ? "error" : intro.phase === "ready" && catalog.phase === "ready" ? "ready" : "loading";
  const busy = intro.busy || catalog.busy;
  const unsaved = intro.unsaved || catalog.unsaved;
  const unpublished = intro.unpublished || catalog.unpublished;
  const save = async (publish: boolean) => {
    // Preserve existing separate section documents, updating only parts needing a save.
    await Promise.all([
      (intro.unsaved || (publish && intro.unpublished)) ? intro.save(publish) : Promise.resolve(),
      (catalog.unsaved || (publish && catalog.unpublished)) ? catalog.save(publish) : Promise.resolve(),
    ]);
  };
  return <Layout section="catalog" phase={phase} error={intro.error || catalog.error} retry={() => {intro.retry();catalog.retry();}} preview={<OfferExplorer intro={intro.draft} heading={catalog.draft} catalog={services} preview/>}>
    <div className="rounded-xl bg-[#eff3eb] p-4 text-sm leading-relaxed text-[#4b654f]">Tutaj edytujesz tylko wprowadzenie i nagłówek katalogu. Kategorie, zdjęcia oraz opisy usług mają osobny menedżer.</div>
    <h2 className="font-display text-3xl text-[#1c3026]">Wprowadzenie do oferty</h2>
    <Field label="Etykieta"><input className={fieldClass} value={intro.draft.eyebrow} onChange={e=>intro.update("eyebrow",e.target.value)}/></Field>
    <Field label="Główny nagłówek"><input className={fieldClass} value={intro.draft.title} onChange={e=>intro.update("title",e.target.value)}/></Field>
    <Field label="Krótki opis"><textarea className={fieldClass} rows={3} value={intro.draft.description} onChange={e=>intro.update("description",e.target.value)}/></Field>
    <AdminSlider label="Wielkość nagłówka" min={65} max={150} value={intro.draft.headingScale} onChange={v=>intro.update("headingScale",v)}/>
    <div className="space-y-4 border-t border-[#e6e0d4] pt-6">
      <h2 className="font-display text-3xl text-[#1c3026]">Nawigacja katalogu</h2>
      <Field label="Etykieta nawigacji"><input className={fieldClass} value={catalog.draft.eyebrow} onChange={e=>catalog.update("eyebrow",e.target.value)}/></Field>
      <p className="text-xs leading-relaxed text-[#6a7d6e]">Nazwy i liczba zakładek zmieniają się automatycznie wraz z publikacją kategorii w menedżerze usług.</p>
    </div>
    <Link href="/admin/services" className={`${primaryButton} mt-3`}><TbExternalLink/> Otwórz menedżer usług</Link>
    <Actions busy={busy} unsaved={unsaved} unpublished={unpublished} save={save}/>
  </Layout>;
}
export function OfferIntroEditor() { return <OfferOverviewEditor/>; }
export function OfferCatalogEditor() { return <OfferOverviewEditor/>; }
export function OfferFormalitiesEditor() {
  const ed=useCmsEditor<OfferFormalities>("/api/admin/offer/formalities",OFFER_DEFAULTS.formalities,parseFormalities);
  const benefits=ed.draft.benefits;
  const benefitUpdate=(index:number,key:keyof OfferFormalities["benefits"][number],value:string|string[])=>ed.update("benefits",benefits.map((b,i)=>i===index?{...b,[key]:value}:b));
  return <Layout section="formalities" phase={ed.phase} error={ed.error} retry={ed.retry} preview={<OfferFormalitiesSection data={ed.draft}/>}>
    <MainTextFields value={ed.draft} update={(key,value)=>ed.update(key,value as never)}/>
    {benefits.map((b,i)=><div key={i} className="space-y-4 border-t border-[#e5ded1] pt-5"><h2 className="font-display text-2xl">Obszar {i+1}</h2><Field label="Tytuł"><input className={fieldClass} value={b.title} onChange={e=>benefitUpdate(i,"title",e.target.value)}/></Field><Field label="Opis"><textarea rows={4} className={fieldClass} value={b.description} onChange={e=>benefitUpdate(i,"description",e.target.value)}/></Field><Field label="Punkty — jeden w wierszu"><textarea rows={4} className={fieldClass} value={b.points.join("\n")} onChange={e=>benefitUpdate(i,"points",e.target.value.split("\n").filter(Boolean))}/></Field></div>)}
    <Field label="Informacja pod sekcją"><textarea rows={3} className={fieldClass} value={ed.draft.note} onChange={e=>ed.update("note",e.target.value)}/></Field>
    <Actions busy={ed.busy} unsaved={ed.unsaved} unpublished={ed.unpublished} save={ed.save}/>
  </Layout>;
}
export function OfferProcessEditor() {
  const ed=useCmsEditor<OfferProcess>("/api/admin/offer/process",OFFER_DEFAULTS.process,parseProcess);
  const steps=ed.draft.steps;
  const updateStep=(i:number,field:"title"|"description",value:string)=>ed.update("steps",steps.map((s,j)=>j===i?{...s,[field]:value}:s));
  return <Layout section="process" phase={ed.phase} error={ed.error} retry={ed.retry} preview={<OfferProcessSection data={ed.draft}/>}>
    <MainTextFields value={ed.draft} update={(key,value)=>ed.update(key,value as never)}/>
    <h2 className="font-display text-3xl">Etapy współpracy</h2>
    {steps.map((step,i)=><div key={i} className="space-y-3 border-t border-[#e6e1d7] pt-4"><div className="flex items-center justify-between gap-2"><strong className="text-sm text-[#354a3b]">Etap {i+1}</strong><button type="button" className={subtleButton} disabled={steps.length<=2} onClick={()=>ed.update("steps",steps.filter((_,j)=>j!==i))}><TbTrash/> Usuń</button></div><Field label="Tytuł"><input className={fieldClass} value={step.title} onChange={e=>updateStep(i,"title",e.target.value)}/></Field><Field label="Opis"><textarea rows={4} className={fieldClass} value={step.description} onChange={e=>updateStep(i,"description",e.target.value)}/></Field></div>)}
    <button className={subtleButton} disabled={steps.length>=6} type="button" onClick={()=>ed.update("steps",[...steps,{title:"Nowy etap",description:"Opis etapu do uzupełnienia."}])}><TbPlus/> Dodaj etap</button>
    <Actions busy={ed.busy} unsaved={ed.unsaved} unpublished={ed.unpublished} save={ed.save}/>
  </Layout>;
}
export function OfferFloristEditor() {
  const ed=useCmsEditor<OfferFlorist>("/api/admin/offer/florist",OFFER_DEFAULTS.florist,parseFlorist);
  return <Layout section="florist" phase={ed.phase} error={ed.error} retry={ed.retry} preview={<OfferFloristSection data={ed.draft}/>}>
    <MainTextFields value={ed.draft} update={(key,value)=>ed.update(key,value as never)}/>
    <Field label="Zakres florystyki — po jednym w wierszu"><textarea rows={5} className={fieldClass} value={ed.draft.points.join("\n")} onChange={e=>ed.update("points",e.target.value.split("\n").filter(Boolean))}/></Field>
    <Field label="Zdjęcie kwiaciarni"><input className={fieldClass} value={ed.draft.imageUrl} onChange={e=>ed.update("imageUrl",e.target.value)}/></Field>
    <AdminSlider label="Kadr w poziomie" min={0} max={100} value={ed.draft.imagePositionX} onChange={v=>ed.update("imagePositionX",v)}/>
    <AdminSlider label="Kadr w pionie" min={0} max={100} value={ed.draft.imagePositionY} onChange={v=>ed.update("imagePositionY",v)}/>
    <Field label="Godziny kwiaciarni (opcjonalnie)"><input className={fieldClass} value={ed.draft.hours} onChange={e=>ed.update("hours",e.target.value)}/></Field>
    <Actions busy={ed.busy} unsaved={ed.unsaved} unpublished={ed.unpublished} save={ed.save}/>
  </Layout>;
}
