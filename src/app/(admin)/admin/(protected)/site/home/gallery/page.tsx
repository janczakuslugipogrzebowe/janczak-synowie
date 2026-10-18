"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TbDeviceDesktop, TbDeviceMobile, TbExternalLink, TbPhoto } from "react-icons/tb";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import GalleryLivePreview from "@/components/admin/gallery-live-preview";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import {
  DEFAULT_GALLERY,
  parseGalleryLibrary,
  recentGalleryPhotos,
  type GalleryPhoto,
} from "@/lib/gallery/schema";
import { DEFAULT_HOME_GALLERY, parseHomeGallery, type HomeGalleryContent } from "@/lib/home-gallery/schema";

const sliders = [
  { key: "backgroundOpacity", label: "Rozjaśnienie tła", min: 0, max: 85 },
  { key: "headingScale", label: "Nagłówek", min: 75, max: 135 },
  { key: "descriptionScale", label: "Tekst opisu", min: 75, max: 135 },
  { key: "cardScale", label: "Podpisy zdjęć", min: 75, max: 130 },
  { key: "gapScale", label: "Odstępy między zdjęciami", min: 65, max: 150 },
  { key: "autoplaySeconds", label: "Czas zmiany slajdu (s)", min: 3, max: 12 },
] as const;
export default function HomeGalleryEditor() {
  const editor = useCmsEditor<HomeGalleryContent>(
    "/api/admin/home/gallery",
    DEFAULT_HOME_GALLERY,
    parseHomeGallery,
  );
  const [phone, setPhone] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/gallery", { cache: "no-store", credentials: "same-origin", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw Error("Nie udało się pobrać galerii");
        return response.json();
      })
      .then((result) => {
        if (!controller.signal.aborted)
          setPhotos(recentGalleryPhotos(parseGalleryLibrary(result.published ?? DEFAULT_GALLERY)));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Galeria">
        <Link href="/admin/gallery" className={subtleButton}>
          <TbPhoto /> Zarządzaj zdjęciami
        </Link>
      </PageHeading>
      <EditorState phase={editor.phase} error={editor.error} retry={editor.retry} />
      {editor.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section className={`${surfaceClass} space-y-5 p-6 3xl:p-8`} aria-label="Edycja sekcji Galeria">
            <h2 className="font-display text-3xl">Treści</h2>
            <Field label="Etykieta">
              <input
                className={fieldClass}
                value={editor.draft.eyebrow}
                onChange={(e) => editor.update("eyebrow", e.target.value)}
              />
            </Field>
            <Field label="Nagłówek">
              <input
                className={fieldClass}
                value={editor.draft.headline}
                onChange={(e) => editor.update("headline", e.target.value)}
              />
            </Field>
            <Field label="Opis">
              <textarea
                className={`${fieldClass} resize-y`}
                rows={5}
                value={editor.draft.description}
                onChange={(e) => editor.update("description", e.target.value)}
              />
            </Field>
            <Field label="Tekst przycisku">
              <input
                className={fieldClass}
                value={editor.draft.buttonLabel}
                onChange={(e) => editor.update("buttonLabel", e.target.value)}
              />
            </Field>
            <div className="space-y-5 border-t border-[#eae7df] pt-5">
              <h2 className="font-display text-3xl">Tło</h2>
              <Field label="Ścieżka zdjęcia">
                <input
                  className={fieldClass}
                  value={editor.draft.backgroundImageUrl}
                  onChange={(e) => editor.update("backgroundImageUrl", e.target.value)}
                />
              </Field>
            </div>
            <div className="space-y-5 border-t border-[#eae7df] pt-5">
              <h2 className="font-display text-3xl">Typografia i slider</h2>
              {sliders.map(({ key, label, min, max }) => (
                <label key={key} className="block space-y-2">
                  <span className="flex items-center justify-between text-xs font-semibold text-[#425046]">
                    <span>{label}</span>
                    <span>
                      {editor.draft[key]}
                      {key === "autoplaySeconds" ? " s" : "%"}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    className="w-full cursor-pointer accent-[#9e835a]"
                    value={editor.draft[key]}
                    onChange={(e) => editor.update(key, Number(e.target.value))}
                  />
                </label>
              ))}
              <button
                type="button"
                className={`${subtleButton} cursor-pointer`}
                onClick={() => sliders.forEach(({ key }) => editor.update(key, DEFAULT_HOME_GALLERY[key]))}
              >
                Przywróć proporcje
              </button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#eae7df] pt-5">
              <button
                type="button"
                className={`${subtleButton} cursor-pointer`}
                disabled={editor.busy || !editor.unsaved}
                onClick={() => void editor.save(false)}
              >
                Zapisz szkic
              </button>
              <button
                type="button"
                className={`${primaryButton} cursor-pointer`}
                disabled={editor.busy || (!editor.unsaved && !editor.unpublished)}
                onClick={() => void editor.save(true)}
              >
                {editor.busy ? "Zapisywanie…" : "Opublikuj"}
              </button>
            </div>
            {editor.message && (
              <p role="status" className="text-sm text-[#637b66]">
                {editor.message}
              </p>
            )}
          </section>
          <section
            aria-label="Podgląd galerii"
            className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`${subtleButton} cursor-pointer`}
                  onClick={() => setPhone((v) => !v)}
                >
                  {phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}
                  {phone ? "Desktop" : "Telefon"}
                </button>
                <Link href="/" target="_blank" className={subtleButton}>
                  <TbExternalLink />
                  Strona
                </Link>
              </div>
            </div>
            <GalleryLivePreview data={editor.draft} photos={photos} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
