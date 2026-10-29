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
import ObituariesListPreview from "@/components/obituaries/obituaries-list-preview";
import ObituariesInformationSection from "@/components/obituaries/obituaries-information-section";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/settings/schema";
import { parseSubpageBlock, subpageDefault, type SubpageBlock } from "@/lib/subpages/schema";
import {
  DEFAULT_OBITUARIES_LISTING,
  DEFAULT_OBITUARIES_INFORMATION,
  parseObituariesListing,
  parseObituariesInformation,
} from "@/lib/obituaries-page/schema";

function EditorLayout({
  title,
  children,
  preview,
  phase,
  error,
  retry,
}: {
  title: string;
  children: ReactNode;
  preview: ReactNode;
  phase: "loading" | "ready" | "error";
  error: string;
  retry: () => void;
}) {
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Nekrologi" title={title}>
        <Link href="/nekrologi" target="_blank" rel="noopener noreferrer" className={subtleButton}>
          <TbExternalLink /> Otwórz podstronę
        </Link>
      </PageHeading>
      <EditorState phase={phase} error={error} retry={retry} />
      {phase === "ready" && (
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
      )}
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
const SHARED_DEFAULTS = {
  hero: subpageDefault("nekrologi", "hero"),
  bottom: subpageDefault("nekrologi", "bottom"),
};

export function ObituariesSharedEditor({ section }: { section: "hero" | "bottom" }) {
  const ed = useCmsEditor(
    `/api/admin/subpages/nekrologi/${section}`,
    SHARED_DEFAULTS[section],
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
  return (
    <EditorLayout
      title={section === "hero" ? "Hero" : "Kontaktowe CTA"}
      phase={ed.phase}
      error={ed.error}
      retry={ed.retry}
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
        hint={`Plik w public/: ${section === "hero" ? "hero-nekrologi.png" : "bottom-nekrologi.png"}`}
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
            update("overlay", SHARED_DEFAULTS[section].overlay);
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

export function ObituariesListingEditor() {
  const ed = useCmsEditor(
    "/api/admin/obituaries-page/listing",
    DEFAULT_OBITUARIES_LISTING,
    parseObituariesListing,
  );
  return (
    <EditorLayout
      title="Ostatnie pożegnania"
      phase={ed.phase}
      error={ed.error}
      retry={ed.retry}
      preview={<ObituariesListPreview data={ed.draft} />}
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
      <Link href="/admin/obituaries" className={subtleButton}>
        <TbFileText /> Zarządzaj nekrologami
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

export function ObituariesInformationEditor() {
  const ed = useCmsEditor(
    "/api/admin/obituaries-page/information",
    DEFAULT_OBITUARIES_INFORMATION,
    parseObituariesInformation,
  );
  return (
    <EditorLayout
      title="Informacje dla bliskich"
      phase={ed.phase}
      error={ed.error}
      retry={ed.retry}
      preview={<ObituariesInformationSection data={ed.draft} preview />}
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
      <Field label="Opis">
        <textarea
          rows={5}
          className={fieldClass}
          value={ed.draft.description}
          onChange={(e) => ed.update("description", e.target.value)}
        />
      </Field>
      <div className="space-y-5 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Termin uroczystości</h2>
        <Field label="Tytuł">
          <input
            className={fieldClass}
            value={ed.draft.ceremonyTitle}
            onChange={(e) => ed.update("ceremonyTitle", e.target.value)}
          />
        </Field>
        <Field label="Opis">
          <textarea
            rows={3}
            className={fieldClass}
            value={ed.draft.ceremonyDescription}
            onChange={(e) => ed.update("ceremonyDescription", e.target.value)}
          />
        </Field>
      </div>
      <div className="space-y-5 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Miejsce pochówku</h2>
        <Field label="Tytuł">
          <input
            className={fieldClass}
            value={ed.draft.burialTitle}
            onChange={(e) => ed.update("burialTitle", e.target.value)}
          />
        </Field>
        <Field label="Opis">
          <textarea
            rows={3}
            className={fieldClass}
            value={ed.draft.burialDescription}
            onChange={(e) => ed.update("burialDescription", e.target.value)}
          />
        </Field>
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
