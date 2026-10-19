"use client";
import { useState } from "react";
import Link from "next/link";
import { TbDeviceDesktop, TbDeviceMobile, TbExternalLink } from "react-icons/tb";
import { AdminSlider } from "@/components/ui/admin-slider";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import ContactLivePreview from "@/components/admin/contact-live-preview";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import { DEFAULT_HOME_CONTACT, parseHomeContact, type HomeContactContent } from "@/lib/home-contact/schema";

const typography = [
  { key: "headingScale", label: "Nagłówek", min: 70, max: 145 },
  { key: "descriptionScale", label: "Tekst opisu", min: 70, max: 145 },
  { key: "phoneScale", label: "Dane kontaktowe", min: 70, max: 145 },
  { key: "iconScale", label: "Ikony", min: 70, max: 145 },
  { key: "spacingScale", label: "Odstępy", min: 65, max: 155 },
] as const;
const photo = [
  { key: "imagePositionX", label: "Kadrowanie poziome", min: 0, max: 100 },
  { key: "imagePositionY", label: "Kadrowanie pionowe", min: 0, max: 100 },
  { key: "overlayOpacity", label: "Przyciemnienie", min: 0, max: 85 },
] as const;
const visibility = [
  { key: "showSecondaryPhone", label: "Pokaż drugi telefon" },
  { key: "showAddress", label: "Pokaż adres" },
  { key: "showEmail", label: "Pokaż adres e-mail, jeśli jest wpisany" },
] as const;

export default function HomeContactEditor() {
  const ed = useCmsEditor<HomeContactContent>(
    "/api/admin/home/contact",
    DEFAULT_HOME_CONTACT,
    parseHomeContact,
  );
  const [phone, setPhone] = useState(false);
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Kontakt" />
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Edycja sekcji Kontakt" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
            <h2 className="font-display text-3xl font-semibold">Treści</h2>
            <Field label="Etykieta">
              <input
                className={fieldClass}
                value={ed.draft.eyebrow}
                onChange={(e) => ed.update("eyebrow", e.target.value)}
              />
            </Field>
            <Field label="Nagłówek">
              <textarea
                rows={2}
                className={`${fieldClass} resize-y`}
                value={ed.draft.headline}
                onChange={(e) => ed.update("headline", e.target.value)}
              />
            </Field>
            <Field label="Opis">
              <textarea
                rows={4}
                className={`${fieldClass} resize-y`}
                value={ed.draft.description}
                onChange={(e) => ed.update("description", e.target.value)}
              />
            </Field>
            <Field label="Tekst przycisku">
              <input
                className={fieldClass}
                value={ed.draft.buttonLabel}
                onChange={(e) => ed.update("buttonLabel", e.target.value)}
              />
            </Field>
            <Field label="Link przycisku">
              <input
                className={fieldClass}
                value={ed.draft.buttonHref}
                onChange={(e) => ed.update("buttonHref", e.target.value)}
              />
            </Field>
            <div className="space-y-4 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Informacje kontaktowe</h2>
              {visibility.map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 text-sm text-[#304034]">
                  <input
                    type="checkbox"
                    checked={ed.draft[key]}
                    onChange={(e) => ed.update(key, e.target.checked)}
                    className="size-4 cursor-pointer accent-[#1c382b]"
                  />
                  {label}
                </label>
              ))}
              <Link className={`${subtleButton} w-fit`} href="/admin/company">
                Edytuj dane firmy
              </Link>
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Fotografia</h2>
              <Field label="Ścieżka zdjęcia">
                <input
                  className={fieldClass}
                  value={ed.draft.imageUrl}
                  onChange={(e) => ed.update("imageUrl", e.target.value)}
                />
              </Field>
              {photo.map(({ key, label, min, max }) => (
                <AdminSlider
                  key={key}
                  label={label}
                  value={ed.draft[key]}
                  min={min}
                  max={max}
                  onChange={(value) => ed.update(key, value)}
                />
              ))}
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {typography.map(({ key, label, min, max }) => (
                <AdminSlider
                  key={key}
                  label={label}
                  value={ed.draft[key]}
                  min={min}
                  max={max}
                  onChange={(value) => ed.update(key, value)}
                />
              ))}
              <button
                type="button"
                className={subtleButton}
                onClick={() => typography.forEach(({ key }) => ed.update(key, DEFAULT_HOME_CONTACT[key]))}
              >
                Przywróć proporcje
              </button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5">
              <button
                type="button"
                className={subtleButton}
                disabled={ed.busy || !ed.unsaved}
                onClick={() => void ed.save(false)}
              >
                Zapisz szkic
              </button>
              <button
                type="button"
                className={primaryButton}
                disabled={ed.busy || (!ed.unsaved && !ed.unpublished)}
                onClick={() => void ed.save(true)}
              >
                {ed.busy ? "Zapisywanie…" : "Opublikuj"}
              </button>
            </div>
          </section>
          <section
            aria-label="Podgląd Kontakt"
            className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button type="button" className={subtleButton} onClick={() => setPhone((x) => !x)}>
                  {phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}
                  {phone ? "Desktop" : "Telefon"}
                </button>
                <Link href="/" target="_blank" rel="noopener noreferrer" className={subtleButton}>
                  <TbExternalLink /> Strona
                </Link>
              </div>
            </div>
            <ContactLivePreview data={ed.draft} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
