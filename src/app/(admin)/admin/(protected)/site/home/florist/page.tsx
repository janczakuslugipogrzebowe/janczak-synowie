"use client";
import { AdminSlider } from "@/components/ui/admin-slider";
import { useState } from "react";
import Link from "next/link";
import { TbDeviceDesktop, TbDeviceMobile, TbExternalLink } from "react-icons/tb";
import FloristLivePreview from "@/components/admin/florist-live-preview";
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
import {
  DEFAULT_HOME_FLORIST,
  parseHomeFlorist,
  type FloristFeature,
  type HomeFloristContent,
} from "@/lib/home-florist/schema";
const sliders = [
  { key: "headingScale", label: "Wielkość nagłówka", min: 75, max: 140 },
  { key: "taglineScale", label: "Wielkość podtytułu", min: 80, max: 140 },
  { key: "descriptionScale", label: "Wielkość opisu", min: 80, max: 140 },
  { key: "featureScale", label: "Tekst wyróżników", min: 80, max: 135 },
  { key: "iconScale", label: "Wielkość ikon", min: 75, max: 140 },
  { key: "spacingScale", label: "Odstępy", min: 75, max: 140 },
] as const;
const imageSliders = [
  { key: "imagePositionX", label: "Kadrowanie poziome", min: 0, max: 100 },
  { key: "imagePositionY", label: "Kadrowanie pionowe", min: 0, max: 100 },
  { key: "overlayOpacity", label: "Przyciemnienie zdjęcia", min: 0, max: 80 },
  { key: "leftShade", label: "Gradient po lewej", min: 0, max: 95 },
  { key: "rightShade", label: "Gradient po prawej", min: 0, max: 95 },
] as const;
export default function FloristEditor() {
  const ed = useCmsEditor<HomeFloristContent>(
    "/api/admin/home/florist",
    DEFAULT_HOME_FLORIST,
    parseHomeFlorist,
  );
  const [phone, setPhone] = useState(false);
  const updateFeature = (index: number, key: keyof FloristFeature, value: string) =>
    ed.update(
      "features",
      ed.draft.features.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Kwiaciarnia" />
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Edycja sekcji kwiaciarni" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
            <h2 className="font-display text-3xl font-semibold">Treści</h2>
            <Field label="Etykieta">
              <input
                className={fieldClass}
                value={ed.draft.eyebrow}
                onChange={(e) => ed.update("eyebrow", e.target.value)}
              />
            </Field>
            <Field label="Nazwa kwiaciarni">
              <input
                className={fieldClass}
                value={ed.draft.headline}
                onChange={(e) => ed.update("headline", e.target.value)}
              />
            </Field>
            <Field label="Podtytuł">
              <textarea
                rows={2}
                className={`${fieldClass} resize-y`}
                value={ed.draft.tagline}
                onChange={(e) => ed.update("tagline", e.target.value)}
              />
            </Field>
            <Field label="Opis">
              <textarea
                rows={7}
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
            <Field label="Adres oferty">
              <input
                className={fieldClass}
                value={ed.draft.buttonHref}
                onChange={(e) => ed.update("buttonHref", e.target.value)}
              />
            </Field>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Wyróżniki</h2>
              {ed.draft.features.map((feature, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-xl border border-[#eae7df] bg-[#fbfaf7] p-4 3xl:p-5"
                >
                  <span className="text-xs font-bold tabular-nums tracking-[.17em] text-[#98774c]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Field label="Tytuł">
                    <input
                      className={fieldClass}
                      value={feature.title}
                      onChange={(e) => updateFeature(index, "title", e.target.value)}
                    />
                  </Field>
                  <Field label="Opis">
                    <textarea
                      rows={3}
                      className={`${fieldClass} resize-y`}
                      value={feature.description}
                      onChange={(e) => updateFeature(index, "description", e.target.value)}
                    />
                  </Field>
                </div>
              ))}
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
              {imageSliders.map(({ key, label, min, max }) => (
                <AdminSlider
                  key={key}
                  label={label}
                  value={ed.draft[key]}
                  min={min}
                  max={max}
                  onChange={(v) => ed.update(key, v)}
                />
              ))}
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {sliders.map(({ key, label, min, max }) => (
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
                onClick={() => sliders.forEach(({ key }) => ed.update(key, DEFAULT_HOME_FLORIST[key]))}
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
            aria-label="Podgląd kwiaciarni"
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
            <FloristLivePreview data={ed.draft} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
