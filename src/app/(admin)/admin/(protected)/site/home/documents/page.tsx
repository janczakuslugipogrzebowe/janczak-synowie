"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TbDeviceDesktop, TbDeviceMobile, TbExternalLink, TbFiles } from "react-icons/tb";
import DocumentsLivePreview from "@/components/admin/documents-live-preview";
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
  DEFAULT_HOME_DOCUMENTS,
  parseHomeDocuments,
  type HomeDocumentsContent,
} from "@/lib/home-documents/schema";
import { DEFAULT_DOCUMENTS, parseDocumentLibrary, type PublicDocument } from "@/lib/documents/schema";

const photoSliders = [
  { key: "imagePositionX", label: "Kadrowanie poziome", min: 0, max: 100 },
  { key: "imagePositionY", label: "Kadrowanie pionowe", min: 0, max: 100 },
  { key: "overlayOpacity", label: "Przyciemnienie zdjęcia", min: 0, max: 70 },
] as const;
const typography = [
  { key: "headingScale", label: "Nagłówek", min: 75, max: 140 },
  { key: "descriptionScale", label: "Tekst opisu", min: 75, max: 140 },
  { key: "listScale", label: "Dopisek pod przyciskiem", min: 75, max: 140 },
  { key: "spacingScale", label: "Odstępy treści", min: 75, max: 140 },
] as const;

export default function DocumentsSectionEditor() {
  const ed = useCmsEditor<HomeDocumentsContent>(
    "/api/admin/home/documents",
    DEFAULT_HOME_DOCUMENTS,
    parseHomeDocuments,
  );
  const [phone, setPhone] = useState(false);
  const [documents, setDocuments] = useState<PublicDocument[]>(DEFAULT_DOCUMENTS);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/documents", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const state = await response.json();
        setDocuments(parseDocumentLibrary(state.published));
      })
      .catch(() => {
        /* Preview uses safe built-in document titles when unavailable. */
      });
    return () => controller.abort();
  }, []);

  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja Dokumenty">
        <Link className={subtleButton} href="/admin/documents">
          <TbFiles size={18} /> Zarządzaj dokumentami
        </Link>
      </PageHeading>
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Edycja sekcji Dokumenty" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
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
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Fotografia</h2>
              <Field label="Ścieżka zdjęcia">
                <input
                  className={fieldClass}
                  value={ed.draft.imageUrl}
                  onChange={(e) => ed.update("imageUrl", e.target.value)}
                />
              </Field>
              {photoSliders.map(({ key, label, min, max }) => (
                <label key={key} className="block space-y-2">
                  <span className="flex items-center justify-between text-xs font-semibold text-[#415044]">
                    <span>{label}</span>
                    <span className="tabular-nums">{ed.draft[key]}%</span>
                  </span>
                  <input
                    type="range"
                    className="w-full cursor-pointer accent-[#9e835a]"
                    min={min}
                    max={max}
                    value={ed.draft[key]}
                    onChange={(e) => ed.update(key, Number(e.target.value))}
                  />
                </label>
              ))}
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {typography.map(({ key, label, min, max }) => (
                <label key={key} className="block space-y-2">
                  <span className="flex items-center justify-between text-xs font-semibold text-[#415044]">
                    <span>{label}</span>
                    <span className="rounded-md bg-[#f1eee7] px-2 py-1 tabular-nums text-[#655137]">
                      {ed.draft[key]}%
                    </span>
                  </span>
                  <input
                    type="range"
                    className="w-full cursor-pointer accent-[#9e835a]"
                    min={min}
                    max={max}
                    value={ed.draft[key]}
                    onChange={(e) => ed.update(key, Number(e.target.value))}
                  />
                </label>
              ))}
              <button
                type="button"
                className={subtleButton}
                onClick={() => typography.forEach(({ key }) => ed.update(key, DEFAULT_HOME_DOCUMENTS[key]))}
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
            {ed.message && (
              <p role="status" className="text-sm text-[#64765d]">
                {ed.message}
              </p>
            )}
          </section>
          <section
            aria-label="Podgląd na żywo"
            className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button type="button" className={subtleButton} onClick={() => setPhone((value) => !value)}>
                  {phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}
                  {phone ? "Desktop" : "Telefon"}
                </button>
                <Link className={subtleButton} href="/" target="_blank" rel="noopener noreferrer">
                  <TbExternalLink /> Strona
                </Link>
              </div>
            </div>
            <DocumentsLivePreview data={ed.draft} documents={documents} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
