"use client";

import { useState } from "react";
import Link from "next/link";
import { TbArrowDown, TbArrowUp, TbDeviceDesktop, TbDeviceMobile, TbExternalLink } from "react-icons/tb";
import { AdminSlider } from "@/components/ui/admin-slider";
import { CustomSelect } from "@/components/ui/custom-select";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import EditorState from "@/components/admin/editor-state";
import FooterLivePreview from "@/components/admin/footer-live-preview";
import {
  Field,
  PageHeading,
  fieldClass,
  primaryButton,
  subtleButton,
  surfaceClass,
} from "@/components/ui/admin-fields";
import {
  DEFAULT_FOOTER,
  SOCIAL_LABELS,
  parseFooter,
  type FooterContent,
  type FooterLink,
  type FooterSocial,
} from "@/lib/footer/schema";

const visibility = [
  { key: "showDescription", label: "Opis firmy" },
  { key: "showPrimaryPhone", label: "Telefon całodobowy" },
  { key: "showHighlightedContact", label: "Wyróżnij telefon w górnej części stopki" },
  { key: "showSecondaryPhone", label: "Drugi numer telefonu" },
  { key: "showEmail", label: "Adres e-mail" },
  { key: "showAddress", label: "Adres firmy" },
  { key: "showAvailability", label: "Informacja o dostępności" },
  { key: "showSocials", label: "Ikony mediów społecznościowych" },
  { key: "showBackToTop", label: "Link «Do góry»" },
] as const;

const sliders = [
  { key: "headingScale", label: "Wielkość logo i nagłówka", min: 65, max: 145 },
  { key: "textScale", label: "Teksty stopki", min: 65, max: 145 },
  { key: "iconScale", label: "Ikony społecznościowe", min: 65, max: 145 },
  { key: "columnGapScale", label: "Odstępy między kolumnami", min: 65, max: 145 },
  { key: "paddingScale", label: "Odstępy pionowe", min: 65, max: 145 },
] as const;

export default function FooterEditor() {
  const editor = useCmsEditor<FooterContent>("/api/admin/site/footer", DEFAULT_FOOTER, parseFooter);
  const [phone, setPhone] = useState(false);

  function updateNav(index: number, patch: Partial<FooterLink>) {
    editor.update(
      "navLinks",
      editor.draft.navLinks.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  }
  function moveNav(index: number, delta: number) {
    const next = [...editor.draft.navLinks];
    const swap = index + delta;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    editor.update("navLinks", next);
  }
  function updateSocial(index: number, patch: Partial<FooterSocial>) {
    editor.update(
      "socialLinks",
      editor.draft.socialLinks.map((social, i) => (i === index ? { ...social, ...patch } : social)),
    );
  }

  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Element globalny" title="Stopka" />
      <EditorState phase={editor.phase} error={editor.error} retry={editor.retry} />
      {editor.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(380px,490px)_minmax(0,1fr)]">
          <section aria-label="Ustawienia stopki" className={`${surfaceClass} space-y-6 p-6 3xl:p-8`}>
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-semibold">Treść</h2>
              <Field label="Mała etykieta nad nazwą firmy">
                <input
                  className={fieldClass}
                  value={editor.draft.footerEyebrow}
                  onChange={(e) => editor.update("footerEyebrow", e.target.value)}
                />
              </Field>
              <Field label="Duży nagłówek w stopce">
                <textarea
                  rows={2}
                  className={`${fieldClass} resize-y`}
                  value={editor.draft.introHeading}
                  onChange={(e) => editor.update("introHeading", e.target.value)}
                />
              </Field>
              <Field label="Podpis pod logo">
                <input
                  className={fieldClass}
                  value={editor.draft.brandSubtitle}
                  onChange={(e) => editor.update("brandSubtitle", e.target.value)}
                />
              </Field>
              <Field label="Krótki opis firmy (puste = opis z danych firmy)">
                <textarea
                  rows={3}
                  className={`${fieldClass} resize-y`}
                  value={editor.draft.descriptionOverride}
                  onChange={(e) => editor.update("descriptionOverride", e.target.value)}
                />
              </Field>
              <Field label="Podpis pod copyright">
                <input
                  className={fieldClass}
                  value={editor.draft.copyrightSuffix}
                  onChange={(e) => editor.update("copyrightSuffix", e.target.value)}
                />
              </Field>
              <Field label="Tekst w dolnym prawym rogu">
                <input
                  className={fieldClass}
                  value={editor.draft.endingText}
                  onChange={(e) => editor.update("endingText", e.target.value)}
                />
              </Field>
            </div>

            <div className="space-y-4 border-t border-[#e7e6df] pt-6">
              <h2 className="font-display text-3xl font-semibold">Nawigacja</h2>
              <Field label="Nagłówek grupy Firma">
                <input
                  className={fieldClass}
                  value={editor.draft.navTitle}
                  onChange={(e) => editor.update("navTitle", e.target.value)}
                />
              </Field>
              <Field label="Nagłówek grupy Informacje">
                <input
                  className={fieldClass}
                  value={editor.draft.navSecondaryTitle}
                  onChange={(e) => editor.update("navSecondaryTitle", e.target.value)}
                />
              </Field>
              <div className="space-y-2">
                {editor.draft.navLinks.map((item, index) => (
                  <div
                    key={item.href}
                    className="flex min-w-0 items-center gap-2 rounded-xl border border-[#e8e5dc] bg-[#faf9f6] p-2"
                  >
                    <input
                      type="checkbox"
                      aria-label={`Pokaż ${item.label}`}
                      title="Widoczność"
                      checked={item.visible}
                      onChange={(e) => updateNav(index, { visible: e.target.checked })}
                      className="size-4 shrink-0 cursor-pointer accent-[#1c382b]"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        aria-label={`Etykieta: ${item.href}`}
                        className={`${fieldClass} !min-h-9 !py-1.5`}
                        value={item.label}
                        onChange={(e) => updateNav(index, { label: e.target.value })}
                      />
                      <p className="mt-1 truncate text-[10px] text-[#7e847b]">{item.href}</p>
                      <CustomSelect
                        label={`Grupa: ${item.label}`}
                        className="mt-2"
                        value={item.group}
                        onChange={(group) => updateNav(index, { group: group as FooterLink["group"] })}
                        options={[
                          { value: "company", label: "Firma" },
                          { value: "information", label: "Informacje" },
                        ]}
                      />
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        aria-label={`Przenieś ${item.label} w górę`}
                        disabled={index === 0}
                        onClick={() => moveNav(index, -1)}
                        className="cursor-pointer rounded-md border border-[#e1ddd4] p-1 text-[#5d685e] hover:bg-[#f0ece3] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <TbArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Przenieś ${item.label} w dół`}
                        disabled={index === editor.draft.navLinks.length - 1}
                        onClick={() => moveNav(index, 1)}
                        className="cursor-pointer rounded-md border border-[#e1ddd4] p-1 text-[#5d685e] hover:bg-[#f0ece3] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <TbArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-[#e7e6df] pt-6">
              <h2 className="font-display text-3xl font-semibold">Dane kontaktowe</h2>
              <Field label="Etykieta nad wyróżnionym telefonem">
                <input
                  className={fieldClass}
                  value={editor.draft.contactTitle}
                  onChange={(e) => editor.update("contactTitle", e.target.value)}
                />
              </Field>
              {visibility.map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 text-sm text-[#304034]">
                  <input
                    type="checkbox"
                    className="size-4 cursor-pointer accent-[#1c382b]"
                    checked={editor.draft[key]}
                    onChange={(e) => editor.update(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
              <Link href="/admin/company" className={`${subtleButton} w-fit`}>
                Edytuj dane firmy
              </Link>
            </div>

            <div className="space-y-4 border-t border-[#e7e6df] pt-6">
              <h2 className="font-display text-3xl font-semibold">Social media</h2>
              <Field label="Nagłówek profili">
                <input
                  className={fieldClass}
                  value={editor.draft.socialTitle}
                  onChange={(e) => editor.update("socialTitle", e.target.value)}
                />
              </Field>
              <div className="space-y-4">
                {editor.draft.socialLinks.map((entry, index) => (
                  <div
                    key={entry.platform}
                    className="space-y-2 rounded-xl border border-[#e8e5dc] bg-[#faf9f6] p-3"
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#29392f]">
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer accent-[#1c382b]"
                        checked={entry.visible}
                        onChange={(e) => updateSocial(index, { visible: e.target.checked })}
                      />
                      {SOCIAL_LABELS[entry.platform]}
                    </label>
                    <Field label="Link do profilu">
                      <input
                        type="url"
                        inputMode="url"
                        placeholder={`https://${entry.platform}.com/...`}
                        className={fieldClass}
                        value={entry.url}
                        onChange={(e) => updateSocial(index, { url: e.target.value })}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-[#e7e6df] pt-6">
              <h2 className="font-display text-3xl font-semibold">Typografia i układ</h2>
              {sliders.map(({ key, label, min, max }) => (
                <AdminSlider
                  key={key}
                  label={label}
                  value={editor.draft[key]}
                  min={min}
                  max={max}
                  onChange={(value) => editor.update(key, value)}
                />
              ))}
              <button
                type="button"
                className={subtleButton}
                onClick={() => sliders.forEach(({ key }) => editor.update(key, DEFAULT_FOOTER[key]))}
              >
                Przywróć proporcje
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#e7e6df] pt-5">
              <button
                type="button"
                className={subtleButton}
                disabled={editor.busy || !editor.unsaved}
                onClick={() => void editor.save(false)}
              >
                Zapisz szkic
              </button>
              <button
                type="button"
                className={primaryButton}
                disabled={editor.busy || (!editor.unsaved && !editor.unpublished)}
                onClick={() => void editor.save(true)}
              >
                {editor.busy ? "Zapisywanie…" : "Opublikuj"}
              </button>
            </div>
          </section>

          <section
            aria-label="Podgląd stopki"
            className="min-w-0 xl:sticky xl:top-5 xl:max-h-[calc(100dvh-2.5rem)] xl:self-start xl:overflow-y-auto xl:[scrollbar-width:thin]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#647067]">Podgląd na żywo</span>
              <div className="flex gap-2">
                <button type="button" className={subtleButton} onClick={() => setPhone((value) => !value)}>
                  {phone ? <TbDeviceDesktop /> : <TbDeviceMobile />}
                  {phone ? "Desktop" : "Telefon"}
                </button>
                <Link href="/" target="_blank" rel="noopener noreferrer" className={subtleButton}>
                  <TbExternalLink /> Strona
                </Link>
              </div>
            </div>
            <FooterLivePreview data={editor.draft} phone={phone} />
          </section>
        </div>
      )}
    </main>
  );
}
