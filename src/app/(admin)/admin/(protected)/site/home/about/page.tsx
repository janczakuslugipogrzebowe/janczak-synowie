"use client";
import { AdminSlider } from "@/components/ui/admin-slider";
import { useState } from "react";
import Link from "next/link";
import { TbDeviceMobile, TbDeviceDesktop, TbExternalLink } from "react-icons/tb";
import AboutLivePreview from "@/components/admin/about-live-preview";
import EditorState from "@/components/admin/editor-state";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import { DEFAULT_HOME_ABOUT, parseHomeAbout, type HomeAboutContent } from "@/lib/home-about/schema";

const controls = [
  { key: "headingScale", label: "Wielkość nagłówka", min: 75, max: 130 },
  { key: "descriptionScale", label: "Wielkość opisu", min: 80, max: 135 },
  { key: "buttonScale", label: "Wielkość przycisku", min: 80, max: 130 },
  { key: "imageWidthScale", label: "Proporcje zdjęcia", min: 80, max: 120 },
  { key: "spacingScale", label: "Odstępy pionowe", min: 75, max: 125 },
] as const;

export default function HomeAboutEditor() {
  const ed = useCmsEditor<HomeAboutContent>("/api/admin/home/about", DEFAULT_HOME_ABOUT, parseHomeAbout);
  const [phone, setPhone] = useState(false);
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja O nas" />
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Edycja O nas" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
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
                rows={3}
                className={`${fieldClass} resize-y`}
                value={ed.draft.headline}
                onChange={(e) => ed.update("headline", e.target.value)}
              />
            </Field>
            <Field label="Opis">
              <textarea
                rows={6}
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
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Fotografia</h2>
              <Field label="Ścieżka zdjęcia">
                <input
                  className={fieldClass}
                  value={ed.draft.imageUrl}
                  onChange={(e) => ed.update("imageUrl", e.target.value)}
                />
              </Field>
              {(
                [
                  ["imagePositionX", "Kadrowanie poziome"],
                  ["imagePositionY", "Kadrowanie pionowe"],
                ] as const
              ).map(([key, label]) => (
                <AdminSlider
                  key={key}
                  label={label}
                  value={ed.draft[key]}
                  min={0}
                  max={100}
                  onChange={(v) => ed.update(key, v)}
                />
              ))}
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {controls.map(({ key, label, min, max }) => (
                <AdminSlider
                  key={key}
                  label={label}
                  value={ed.draft[key]}
                  min={min}
                  max={max}
                  onChange={(v) => ed.update(key, v)}
                />
              ))}
              <button
                type="button"
                className={subtleButton}
                onClick={() => controls.forEach(({ key }) => ed.update(key, DEFAULT_HOME_ABOUT[key]))}
              >
                Przywróć proporcje
              </button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5">
              <button
                className={subtleButton}
                type="button"
                disabled={ed.busy || !ed.unsaved}
                onClick={() => void ed.save(false)}
              >
                Zapisz szkic
              </button>
              <button
                className={primaryButton}
                type="button"
                disabled={ed.busy || (!ed.unsaved && !ed.unpublished)}
                onClick={() => void ed.save(true)}
              >
                {ed.busy ? "Zapisywanie…" : "Opublikuj"}
              </button>
            </div>
          </section>
          <section
            aria-label="Podgląd O nas"
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
                  <TbExternalLink />
                  Strona
                </Link>
              </div>
            </div>
            <AboutLivePreview data={ed.draft} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
