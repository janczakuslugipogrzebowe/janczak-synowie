"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { TbExternalLink } from "react-icons/tb";
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
import ContactDetailsSection from "@/components/contact/contact-details-section";
import ContactFormSection from "@/components/contact/contact-form-section";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/settings/schema";
import { parseSubpageBlock, subpageDefault, type SubpageBlock } from "@/lib/subpages/schema";
import {
  DEFAULT_CONTACT_DETAILS,
  DEFAULT_CONTACT_FORM,
  parseContactDetails,
  parseContactFormSection,
} from "@/lib/contact-page/schema";

function EditorLayout({
  title,
  phase,
  error,
  retry,
  preview,
  children,
}: {
  title: string;
  phase: "loading" | "ready" | "error";
  error: string;
  retry: () => void;
  preview: ReactNode;
  children: ReactNode;
}) {
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Kontakt" title={title}>
        <Link href="/kontakt" target="_blank" rel="noopener noreferrer" className={subtleButton}>
          <TbExternalLink /> Otwórz podstronę
        </Link>
      </PageHeading>
      <EditorState phase={phase} error={error} retry={retry} />
      {phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,390px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(390px,500px)_minmax(0,1fr)]">
          <section className={`${surfaceClass} space-y-5 p-6 3xl:p-8`} aria-label="Edycja sekcji">
            {children}
          </section>
          <section aria-label="Podgląd na żywo" className="min-w-0">
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
function useCompanySettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => {
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
  }, []);
  return settings;
}
const DEFAULTS = { hero: subpageDefault("kontakt", "hero"), bottom: subpageDefault("kontakt", "bottom") };
export function ContactSharedEditor({ section }: { section: "hero" | "bottom" }) {
  const ed = useCmsEditor(`/api/admin/subpages/kontakt/${section}`, DEFAULTS[section], parseSubpageBlock);
  const settings = useCompanySettings();
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
          <SubpageBottomCta data={ed.draft} settings={settings} preview phoneOnly />
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
      <Field
        label="Zdjęcie w tle"
        hint={`Plik w public/: ${section === "hero" ? "hero-kontakt.png" : "bottom-kontakt.png"}`}
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
            update("overlay", DEFAULTS[section].overlay);
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
export function ContactDetailsEditor() {
  const ed = useCmsEditor("/api/admin/contact-page/details", DEFAULT_CONTACT_DETAILS, parseContactDetails);
  const settings = useCompanySettings();
  return (
    <EditorLayout
      title="Dane kontaktowe"
      phase={ed.phase}
      error={ed.error}
      retry={ed.retry}
      preview={<ContactDetailsSection data={ed.draft} settings={settings} preview />}
    >
      <h2 className="font-display text-3xl text-[#1c3026]">Treści</h2>
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
      <Field label="Nagłówek pod mapą">
        <input
          className={fieldClass}
          value={ed.draft.mapTitle}
          onChange={(e) => ed.update("mapTitle", e.target.value)}
        />
      </Field>
      <Link href="/admin/company" className={subtleButton}>
        Edytuj telefon, e-mail, adres i mapę
      </Link>
      <div className="border-t border-[#e6e0d4] pt-5">
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
export function ContactFormEditor() {
  const ed = useCmsEditor("/api/admin/contact-page/form", DEFAULT_CONTACT_FORM, parseContactFormSection);
  const settings = useCompanySettings();
  return (
    <EditorLayout
      title="Formularz i informacje"
      phase={ed.phase}
      error={ed.error}
      retry={ed.retry}
      preview={<ContactFormSection data={ed.draft} settings={settings} preview />}
    >
      <h2 className="font-display text-3xl text-[#1c3026]">Treści</h2>
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
          rows={4}
          className={fieldClass}
          value={ed.draft.description}
          onChange={(e) => ed.update("description", e.target.value)}
        />
      </Field>
      <div className="space-y-4 border-t border-[#e6e0d4] pt-5">
        <h2 className="font-display text-3xl text-[#1c3026]">Panel obok formularza</h2>
        <Field label="Etykieta">
          <input
            className={fieldClass}
            value={ed.draft.helpEyebrow}
            onChange={(e) => ed.update("helpEyebrow", e.target.value)}
          />
        </Field>
        <Field label="Nagłówek">
          <input
            className={fieldClass}
            value={ed.draft.helpTitle}
            onChange={(e) => ed.update("helpTitle", e.target.value)}
          />
        </Field>
        <Field label="Opis">
          <textarea
            rows={5}
            className={fieldClass}
            value={ed.draft.helpDescription}
            onChange={(e) => ed.update("helpDescription", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Tekst przycisku wysyłki">
        <input
          className={fieldClass}
          value={ed.draft.submitLabel}
          onChange={(e) => ed.update("submitLabel", e.target.value)}
        />
      </Field>
      <p className="text-xs leading-relaxed text-[#647367]">
        SMTP, adres odbiorcy i zabezpieczenia formularza konfiguruje się wyłącznie przez ENV, nie w CMS.
      </p>
      <div className="border-t border-[#e6e0d4] pt-5">
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
