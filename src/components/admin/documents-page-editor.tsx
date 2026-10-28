"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { TbExternalLink, TbFileText } from "react-icons/tb";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import { AdminSlider } from "@/components/ui/admin-slider";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import DocumentsDownloadsSection from "@/components/documents/documents-downloads-section";
import DocumentsGuidanceSection from "@/components/documents/documents-guidance-section";
import {
  DEFAULT_DOWNLOADS,
  DEFAULT_GUIDANCE,
  parseDownloadsContent,
  parseGuidanceContent,
  type GuidanceContent,
} from "@/lib/documents-page/schema";
import { parseDocumentLibrary, DEFAULT_DOCUMENTS, type PublicDocument } from "@/lib/documents/schema";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/settings/schema";
import { parseSubpageBlock, subpageDefault, type SubpageBlock } from "@/lib/subpages/schema";

function EditorLayout({
  title,
  children,
  preview,
}: {
  title: string;
  children: ReactNode;
  preview: ReactNode;
}) {
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Dokumenty" title={title}>
        <Link href="/dokumenty" target="_blank" rel="noopener noreferrer" className={subtleButton}>
          <TbExternalLink /> Otwórz podstronę
        </Link>
      </PageHeading>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(390px,500px)_minmax(0,1fr)]">
        <section className={`${surfaceClass} space-y-5 p-6 3xl:p-8`} aria-label="Edycja sekcji">
          {children}
        </section>
        <section className="min-w-0" aria-label="Podgląd na żywo">
          <p className="mb-3 text-xs font-semibold text-[#657166]">Podgląd sekcji na żywo</p>
          <div className="sticky top-5 overflow-hidden rounded-xl border border-[#dfdacd] shadow-[0_10px_40px_-29px_rgba(17,35,20,.45)]">
            {preview}
          </div>
        </section>
      </div>
    </main>
  );
}

function SaveActions({
  busy,
  unsaved,
  unpublished,
  onSave,
}: {
  busy: boolean;
  unsaved: boolean;
  unpublished: boolean;
  onSave: (publish: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-[#e6e0d4] pt-6">
      <button
        type="button"
        className={subtleButton}
        disabled={busy || !unsaved}
        onClick={() => onSave(false)}
      >
        Zapisz szkic
      </button>
      <button
        type="button"
        className={primaryButton}
        disabled={busy || (!unsaved && !unpublished)}
        onClick={() => onSave(true)}
      >
        {busy ? "Zapisywanie…" : "Opublikuj"}
      </button>
    </div>
  );
}

const COMMON_DEFAULTS = {
  hero: subpageDefault("dokumenty", "hero"),
  bottom: subpageDefault("dokumenty", "bottom"),
};

export function DocumentsSharedSectionEditor({ section }: { section: "hero" | "bottom" }) {
  const ed = useCmsEditor(
    `/api/admin/subpages/dokumenty/${section}`,
    COMMON_DEFAULTS[section],
    parseSubpageBlock,
  );
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => {
    if (section !== "bottom") return;
    const controller = new AbortController();
    void fetch("/api/admin/settings", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!controller.signal.aborted && (data?.draft || data?.published))
          setSettings(data.draft ?? data.published);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [section]);
  const update = <K extends keyof SubpageBlock>(key: K, value: SubpageBlock[K]) => ed.update(key, value);
  if (ed.phase !== "ready")
    return (
      <main id="main">
        <PageHeading
          eyebrow="Edytor witryny / Dokumenty"
          title={section === "hero" ? "Hero" : "Kontaktowe CTA"}
        />
        <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      </main>
    );
  return (
    <EditorLayout
      title={section === "hero" ? "Hero" : "Kontaktowe CTA"}
      preview={
        section === "hero" ? (
          <SubpageHero data={ed.draft} preview />
        ) : (
          <SubpageBottomCta data={ed.draft} settings={settings} preview />
        )
      }
    >
      <h2 className="font-display text-3xl text-[#1c3026]">Treści</h2>
      {section === "bottom" && (
        <Field label="Etykieta">
          <input
            className={fieldClass}
            value={ed.draft.eyebrow}
            onChange={(e) => update("eyebrow", e.target.value)}
          />
        </Field>
      )}
      <Field label="Nagłówek">
        <input
          className={fieldClass}
          value={ed.draft.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </Field>
      <Field label="Opis">
        <textarea
          rows={5}
          className={fieldClass}
          value={ed.draft.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>
      {section === "bottom" && (
        <Field label="Tekst przycisku">
          <input
            className={fieldClass}
            value={ed.draft.ctaText}
            onChange={(e) => update("ctaText", e.target.value)}
          />
        </Field>
      )}
      <Field
        label="Zdjęcie w tle"
        hint={`Oczekiwany plik w public/: ${section === "hero" ? "hero-dokumenty.png" : "bottom-dokumenty.png"}`}
      >
        <input
          className={fieldClass}
          value={ed.draft.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
        />
      </Field>
      <div className="space-y-5 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Wygląd</h2>
        <AdminSlider
          label="Wielkość nagłówka"
          min={65}
          max={150}
          value={ed.draft.headingScale}
          onChange={(v) => update("headingScale", v)}
        />
        <AdminSlider
          label="Przyciemnienie zdjęcia"
          min={0}
          max={95}
          value={ed.draft.overlay}
          onChange={(v) => update("overlay", v)}
        />
        <button
          type="button"
          className={subtleButton}
          onClick={() => {
            update("headingScale", 100);
            update("overlay", COMMON_DEFAULTS[section].overlay);
          }}
        >
          Przywróć proporcje
        </button>
      </div>
      <SaveActions
        busy={ed.busy}
        unsaved={ed.unsaved}
        unpublished={ed.unpublished}
        onSave={(publish) => void ed.save(publish)}
      />
    </EditorLayout>
  );
}

export function DocumentsDownloadsEditor() {
  const ed = useCmsEditor("/api/admin/documents-page/downloads", DEFAULT_DOWNLOADS, parseDownloadsContent);
  const [documents, setDocuments] = useState<PublicDocument[]>(DEFAULT_DOCUMENTS);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/documents", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (controller.signal.aborted || !data) return;
        const library = parseDocumentLibrary(data.draft ?? data.published ?? DEFAULT_DOCUMENTS);
        setDocuments(library.filter((item) => item.published));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  if (ed.phase !== "ready")
    return (
      <main id="main">
        <PageHeading eyebrow="Edytor witryny / Dokumenty" title="Dokumenty do pobrania" />
        <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      </main>
    );
  return (
    <EditorLayout
      title="Dokumenty do pobrania"
      preview={<DocumentsDownloadsSection data={ed.draft} documents={documents} />}
    >
      <h2 className="font-display text-3xl text-[#1c3026]">Treści sekcji</h2>
      <Field label="Etykieta">
        <input
          className={fieldClass}
          value={ed.draft.eyebrow}
          onChange={(e) => ed.update("eyebrow", e.target.value)}
        />
      </Field>
      <Field label="Nagłówek">
        <input
          className={fieldClass}
          value={ed.draft.title}
          onChange={(e) => ed.update("title", e.target.value)}
        />
      </Field>
      <Field label="Opis sekcji">
        <textarea
          rows={5}
          className={fieldClass}
          value={ed.draft.description}
          onChange={(e) => ed.update("description", e.target.value)}
        />
      </Field>
      <Field label="Informacja pod dokumentami">
        <textarea
          rows={3}
          className={fieldClass}
          value={ed.draft.note}
          onChange={(e) => ed.update("note", e.target.value)}
        />
      </Field>
      <Link href="/admin/documents" className={subtleButton}>
        <TbFileText /> Zarządzaj formularzami PDF
      </Link>
      <div className="space-y-4 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Wygląd</h2>
        <AdminSlider
          label="Wielkość nagłówka"
          min={65}
          max={150}
          value={ed.draft.headingScale}
          onChange={(v) => ed.update("headingScale", v)}
        />
      </div>
      <SaveActions
        busy={ed.busy}
        unsaved={ed.unsaved}
        unpublished={ed.unpublished}
        onSave={(publish) => void ed.save(publish)}
      />
    </EditorLayout>
  );
}

export function DocumentsGuidanceEditor() {
  const ed = useCmsEditor("/api/admin/documents-page/guidance", DEFAULT_GUIDANCE, parseGuidanceContent);
  const updateStep = (index: number, key: "title" | "description", value: string) => {
    const steps = ed.draft.steps.map((step, i) =>
      i === index ? { ...step, [key]: value } : step,
    ) as GuidanceContent["steps"];
    ed.update("steps", steps);
  };
  if (ed.phase !== "ready")
    return (
      <main id="main">
        <PageHeading eyebrow="Edytor witryny / Dokumenty" title="Pomoc w formalnościach" />
        <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      </main>
    );
  return (
    <EditorLayout title="Pomoc w formalnościach" preview={<DocumentsGuidanceSection data={ed.draft} />}>
      <h2 className="font-display text-3xl text-[#1c3026]">Treści sekcji</h2>
      <Field label="Etykieta">
        <input
          className={fieldClass}
          value={ed.draft.eyebrow}
          onChange={(e) => ed.update("eyebrow", e.target.value)}
        />
      </Field>
      <Field label="Nagłówek">
        <input
          className={fieldClass}
          value={ed.draft.title}
          onChange={(e) => ed.update("title", e.target.value)}
        />
      </Field>
      <Field label="Opis sekcji">
        <textarea
          rows={5}
          className={fieldClass}
          value={ed.draft.description}
          onChange={(e) => ed.update("description", e.target.value)}
        />
      </Field>
      <div className="space-y-6 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Kroki</h2>
        {ed.draft.steps.map((step, index) => (
          <div key={index} className="space-y-4 border-l-2 border-[#c2a577] pl-4">
            <h3 className="text-xs font-bold uppercase tracking-[.18em] text-[#987b52]">
              Krok {String(index + 1).padStart(2, "0")}
            </h3>
            <Field label={`Tytuł kroku ${index + 1}`}>
              <input
                className={fieldClass}
                value={step.title}
                onChange={(e) => updateStep(index, "title", e.target.value)}
              />
            </Field>
            <Field label={`Opis kroku ${index + 1}`}>
              <textarea
                rows={3}
                className={fieldClass}
                value={step.description}
                onChange={(e) => updateStep(index, "description", e.target.value)}
              />
            </Field>
          </div>
        ))}
      </div>
      <div className="space-y-4 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Wygląd</h2>
        <AdminSlider
          label="Wielkość nagłówka"
          min={65}
          max={150}
          value={ed.draft.headingScale}
          onChange={(v) => ed.update("headingScale", v)}
        />
      </div>
      <SaveActions
        busy={ed.busy}
        unsaved={ed.unsaved}
        unpublished={ed.unpublished}
        onSave={(publish) => void ed.save(publish)}
      />
    </EditorLayout>
  );
}
