"use client";
import { AdminSlider } from "@/components/ui/admin-slider";
import { CustomSelect } from "@/components/ui/custom-select";
import { useState } from "react";
import Link from "next/link";
import { TbDeviceDesktop, TbDeviceMobile, TbExternalLink, TbFileText } from "react-icons/tb";
import ObituariesLivePreview from "@/components/admin/obituaries-live-preview";
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
  DEFAULT_HOME_OBITUARIES,
  parseHomeObituaries,
  type HomeObituariesContent,
} from "@/lib/home-obituaries/schema";
const imageSliders = [
  { key: "imagePositionX", label: "Kadrowanie poziome", min: 0, max: 100 },
  { key: "imagePositionY", label: "Kadrowanie pionowe", min: 0, max: 100 },
  { key: "imageOpacity", label: "Widoczność fotografii", min: 0, max: 95 },
  { key: "leftShade", label: "Rozjaśnienie po lewej", min: 0, max: 100 },
] as const;
const typography = [
  { key: "headingScale", label: "Nagłówek", min: 75, max: 145 },
  { key: "descriptionScale", label: "Tekst opisu", min: 75, max: 135 },
  { key: "cardScale", label: "Rozmiar kart", min: 75, max: 145 },
  { key: "spacingScale", label: "Odstępy", min: 75, max: 145 },
] as const;
export default function HomeObituariesEditor() {
  const ed = useCmsEditor<HomeObituariesContent>(
    "/api/admin/home/obituaries",
    DEFAULT_HOME_OBITUARIES,
    parseHomeObituaries,
  );
  const [phone, setPhone] = useState(false);
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Nekrologi">
        <Link className={subtleButton} href="/admin/obituaries">
          <TbFileText /> Zarządzaj nekrologami
        </Link>
      </PageHeading>
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Edycja sekcji nekrologów" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
            <h2 className="font-display text-3xl font-semibold">Treści</h2>
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
            <Field label="Przycisk">
              <input
                className={fieldClass}
                value={ed.draft.buttonLabel}
                onChange={(e) => ed.update("buttonLabel", e.target.value)}
              />
            </Field>
            <Field label="Liczba kart">
              <CustomSelect
                value={String(ed.draft.visibleCount)}
                onChange={(v) => ed.update("visibleCount", Number(v))}
                label="Liczba kart"
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                ]}
              />
            </Field>
            <div className="space-y-5 border-t border-[#eae7df] pt-5">
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
            <div className="space-y-5 border-t border-[#eae7df] pt-5">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {typography.map(({ key, label, min, max }) => (
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
                onClick={() => typography.forEach(({ key }) => ed.update(key, DEFAULT_HOME_OBITUARIES[key]))}
              >
                Przywróć proporcje
              </button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#eae7df] pt-5">
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
            aria-label="Podgląd sekcji"
            className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button type="button" className={subtleButton} onClick={() => setPhone((v) => !v)}>
                  {phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}
                  {phone ? "Desktop" : "Telefon"}
                </button>
                <Link href="/" target="_blank" rel="noopener noreferrer" className={subtleButton}>
                  <TbExternalLink />
                  Strona
                </Link>
              </div>
            </div>
            <ObituariesLivePreview data={ed.draft} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
