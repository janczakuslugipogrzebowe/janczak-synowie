"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TbArrowDown, TbArrowUp, TbDeviceDesktop, TbDeviceMobile, TbExternalLink,
  TbEye, TbEyeOff, TbPlus, TbTrash,
} from "react-icons/tb";
import { AdminSlider } from "@/components/ui/admin-slider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import FaqLivePreview from "@/components/admin/faq-live-preview";
import { Field, PageHeading, fieldClass, primaryButton, subtleButton, surfaceClass } from "@/components/ui/admin-fields";
import { DEFAULT_HOME_FAQ, parseHomeFaq, type FaqItem, type HomeFaqContent } from "@/lib/home-faq/schema";

const textSliders = [
  { key: "headingScale", label: "Wielkość nagłówka", min: 75, max: 140 },
  { key: "descriptionScale", label: "Wielkość opisu", min: 75, max: 140 },
  { key: "questionScale", label: "Teksty pytań", min: 75, max: 140 },
  { key: "answerScale", label: "Teksty odpowiedzi", min: 75, max: 140 },
  { key: "iconScale", label: "Wielkość ikon", min: 75, max: 140 },
  { key: "spacingScale", label: "Odstępy", min: 65, max: 150 },
  { key: "columnGapScale", label: "Odstęp między kolumnami", min: 65, max: 150 },
] as const;
const imageSliders = [
  { key: "imagePositionX", label: "Kadrowanie poziome", min: 0, max: 100 },
  { key: "imagePositionY", label: "Kadrowanie pionowe", min: 0, max: 100 },
  { key: "overlayOpacity", label: "Przyciemnienie zdjęcia", min: 0, max: 85 },
] as const;

export default function HomeFaqEditor() {
  const ed = useCmsEditor<HomeFaqContent>("/api/admin/home/faq", DEFAULT_HOME_FAQ, parseHomeFaq);
  const [phone, setPhone] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function updateItem(id: string, update: Partial<FaqItem>) {
    ed.update("items", ed.draft.items.map((item) => item.id === id ? { ...item, ...update } : item));
  }
  function reorder(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= ed.draft.items.length) return;
    const next = [...ed.draft.items];
    [next[index], next[destination]] = [next[destination], next[index]];
    ed.update("items", next);
  }
  function addItem() {
    if (ed.draft.items.length >= 40) return;
    ed.update("items", [
      ...ed.draft.items,
      { id: `faq-${crypto.randomUUID()}`, question: "Nowe pytanie", answer: "Wpisz odpowiedź na pytanie.", visible: true },
    ]);
  }

  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Strona główna" title="Sekcja FAQ" />
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Edycja sekcji FAQ" className={`${surfaceClass} space-y-5 p-6 3xl:p-8`}>
            <h2 className="font-display text-3xl font-semibold">Treści</h2>
            <Field label="Etykieta"><input className={fieldClass} value={ed.draft.eyebrow} onChange={(e) => ed.update("eyebrow", e.target.value)} /></Field>
            <Field label="Nagłówek"><textarea rows={2} className={`${fieldClass} resize-y`} value={ed.draft.headline} onChange={(e) => ed.update("headline", e.target.value)} /></Field>
            <Field label="Opis"><textarea rows={5} className={`${fieldClass} resize-y`} value={ed.draft.description} onChange={(e) => ed.update("description", e.target.value)} /></Field>
            <Field label="Tekst przycisku"><input className={fieldClass} value={ed.draft.buttonLabel} onChange={(e) => ed.update("buttonLabel", e.target.value)} /></Field>
            <Field label="Link przycisku"><input className={fieldClass} value={ed.draft.buttonHref} onChange={(e) => ed.update("buttonHref", e.target.value)} /></Field>

            <div className="space-y-4 border-t border-[#ece9e1] pt-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-3xl font-semibold">Pytania i odpowiedzi</h2>
                <button type="button" className={subtleButton} onClick={addItem} disabled={ed.draft.items.length >= 40} aria-label="Dodaj pytanie">
                  <TbPlus size={18} /> Dodaj
                </button>
              </div>
              {ed.draft.items.map((item, index) => (
                <div key={item.id} className="space-y-4 rounded-xl border border-[#e9e5db] bg-[#fbfaf7] p-4 3xl:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tabular-nums tracking-[.17em] text-[#98774c]">{String(index + 1).padStart(2, "0")}</span>
                    <div className="flex gap-1">
                      <button type="button" aria-label="Przesuń pytanie wyżej" title="Wyżej" disabled={index === 0} onClick={() => reorder(index, -1)} className="cursor-pointer rounded-lg p-2 hover:bg-[#ece8df] disabled:cursor-not-allowed disabled:opacity-30"><TbArrowUp size={18} /></button>
                      <button type="button" aria-label="Przesuń pytanie niżej" title="Niżej" disabled={index === ed.draft.items.length - 1} onClick={() => reorder(index, 1)} className="cursor-pointer rounded-lg p-2 hover:bg-[#ece8df] disabled:cursor-not-allowed disabled:opacity-30"><TbArrowDown size={18} /></button>
                      <button type="button" aria-label={item.visible ? "Ukryj pytanie" : "Pokaż pytanie"} title={item.visible ? "Ukryj" : "Pokaż"} onClick={() => updateItem(item.id, { visible: !item.visible })} className="cursor-pointer rounded-lg p-2 hover:bg-[#ece8df]">{item.visible ? <TbEye size={18} /> : <TbEyeOff size={18} />}</button>
                      <button type="button" aria-label="Usuń pytanie" title="Usuń" onClick={() => setPendingDeleteId(item.id)} className="cursor-pointer rounded-lg p-2 text-[#9e4940] hover:bg-[#f8e6e1]"><TbTrash size={18} /></button>
                    </div>
                  </div>
                  <Field label="Pytanie"><textarea rows={2} className={`${fieldClass} resize-y`} value={item.question} onChange={(e) => updateItem(item.id, { question: e.target.value })} /></Field>
                  <Field label="Odpowiedź"><textarea rows={5} className={`${fieldClass} resize-y`} value={item.answer} onChange={(e) => updateItem(item.id, { answer: e.target.value })} /></Field>
                </div>
              ))}
              <button type="button" className={subtleButton} onClick={addItem} disabled={ed.draft.items.length >= 40}><TbPlus size={18} /> Dodaj kolejne pytanie</button>
            </div>

            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Fotografia</h2>
              <Field label="Ścieżka zdjęcia"><input className={fieldClass} value={ed.draft.imageUrl} onChange={(e) => ed.update("imageUrl", e.target.value)} /></Field>
              {imageSliders.map(({ key, label, min, max }) => <AdminSlider key={key} label={label} value={ed.draft[key]} min={min} max={max} onChange={(value) => ed.update(key, value)} />)}
            </div>
            <div className="space-y-5 border-t border-[#ece9e1] pt-5">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {textSliders.map(({ key, label, min, max }) => <AdminSlider key={key} label={label} value={ed.draft[key]} min={min} max={max} onChange={(value) => ed.update(key, value)} />)}
              <button type="button" className={subtleButton} onClick={() => textSliders.forEach(({ key }) => ed.update(key, DEFAULT_HOME_FAQ[key]))}>Przywróć proporcje</button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5">
              <button type="button" className={subtleButton} disabled={ed.busy || !ed.unsaved} onClick={() => void ed.save(false)}>Zapisz szkic</button>
              <button type="button" className={primaryButton} disabled={ed.busy || (!ed.unsaved && !ed.unpublished)} onClick={() => void ed.save(true)}>{ed.busy ? "Zapisywanie…" : "Opublikuj"}</button>
            </div>
          </section>
          <section aria-label="Podgląd FAQ" className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button type="button" className={subtleButton} onClick={() => setPhone((x) => !x)}>{phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}{phone ? "Desktop" : "Telefon"}</button>
                <Link href="/" target="_blank" rel="noopener noreferrer" className={subtleButton}><TbExternalLink /> Strona</Link>
              </div>
            </div>
            <FaqLivePreview data={ed.draft} phone={phone} />
          </section>
        </div>
      )}
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Usunąć pytanie?"
        description="Pytanie i odpowiedź zostaną usunięte z edytowanego szkicu. Zmiany na stronie pojawią się dopiero po opublikowaniu."
        confirmLabel="Usuń pytanie"
        destructive
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          ed.update("items", ed.draft.items.filter((item) => item.id !== pendingDeleteId));
          setPendingDeleteId(null);
        }}
      />
    </main>
  );
}
