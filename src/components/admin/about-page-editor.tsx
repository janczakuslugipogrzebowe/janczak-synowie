"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { TbArrowDown, TbArrowUp, TbExternalLink, TbPlus, TbTrash } from "react-icons/tb";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
import AboutPagePreview, { type AboutPreviewSection } from "@/components/admin/about-page-preview";
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
import {
  ABOUT_DEFAULTS,
  parseAboutSection,
  type AboutHistory,
  type AboutPeople,
  type AboutValues,
  type AboutVillage,
  type AboutPhoto,
  type AboutBase,
} from "@/lib/about-page/schema";
import { parseSubpageBlock, subpageDefault, type SubpageBlock } from "@/lib/subpages/schema";

const parseHistory = (v: unknown) => parseAboutSection("history", v);
const parsePeople = (v: unknown) => parseAboutSection("people", v);
const parseValues = (v: unknown) => parseAboutSection("values", v);
const parseVillage = (v: unknown) => parseAboutSection("village", v);
const SHARED_DEFAULTS = { hero: subpageDefault("o-nas", "hero"), bottom: subpageDefault("o-nas", "bottom") };

const LABELS: Record<AboutPreviewSection, string> = {
  hero: "Hero",
  history: "Rodzinna firma i historia",
  people: "Właściciele i zespół",
  values: "Nasze podejście",
  village: "Żelazków",
  bottom: "Kontaktowe CTA",
};
function EditorLayout({
  section,
  phase,
  error,
  retry,
  preview,
  children,
}: {
  section: AboutPreviewSection;
  phase: "loading" | "ready" | "error";
  error: string;
  retry: () => void;
  preview: ReactNode;
  children: ReactNode;
}) {
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / O nas" title={LABELS[section]}>
        <Link href="/o-nas" target="_blank" rel="noopener noreferrer" className={subtleButton}>
          <TbExternalLink /> Otwórz podstronę
        </Link>
      </PageHeading>
      <EditorState phase={phase} error={error} retry={retry} />
      {phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(330px,420px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)]">
          <section className={`${surfaceClass} min-w-0 space-y-5 p-6 3xl:p-8`} aria-label="Edycja sekcji">
            {children}
          </section>
          <section className="sticky top-5 min-w-0" aria-label="Podgląd sekcji">
            {preview}
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
  save,
}: {
  busy: boolean;
  unsaved: boolean;
  unpublished: boolean;
  save: (publish: boolean) => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-[#e3dbcf] pt-6">
      <button
        type="button"
        className={subtleButton}
        disabled={busy || !unsaved}
        onClick={() => void save(false)}
      >
        Zapisz szkic
      </button>
      <button
        type="button"
        className={primaryButton}
        disabled={busy || (!unsaved && !unpublished)}
        onClick={() => void save(true)}
      >
        {busy ? "Zapisywanie…" : "Opublikuj"}
      </button>
      {unpublished && (
        <p className="w-full text-xs leading-relaxed text-[#897149]">
          Aktualny szkic różni się od opublikowanej wersji.
        </p>
      )}
    </div>
  );
}
function BaseFields({
  data,
  change,
}: {
  data: AboutBase;
  change: (key: keyof AboutBase, value: string | number) => void;
}) {
  return (
    <>
      <h2 className="font-display text-3xl text-[#1c3026]">Treści</h2>
      <Field label="Etykieta">
        <input
          className={fieldClass}
          value={data.eyebrow}
          onChange={(e) => change("eyebrow", e.target.value)}
        />
      </Field>
      <Field label="Nagłówek">
        <input className={fieldClass} value={data.title} onChange={(e) => change("title", e.target.value)} />
      </Field>
      <Field label="Krótkie wprowadzenie">
        <textarea
          rows={3}
          className={fieldClass}
          value={data.lead}
          onChange={(e) => change("lead", e.target.value)}
        />
      </Field>
      <AdminSlider
        label="Wielkość nagłówka"
        min={65}
        max={150}
        value={data.headingScale}
        onChange={(value) => change("headingScale", value)}
      />
    </>
  );
}
function PhotoFields({
  data,
  change,
  hint,
}: {
  data: AboutPhoto;
  change: (key: keyof AboutPhoto, value: string | number) => void;
  hint: string;
}) {
  return (
    <div className="space-y-5 border-t border-[#e6e0d4] pt-6">
      <h2 className="font-display text-3xl text-[#1c3026]">Fotografia</h2>
      <Field label="Ścieżka zdjęcia" hint={hint}>
        <input
          className={fieldClass}
          value={data.imageUrl}
          onChange={(e) => change("imageUrl", e.target.value)}
          placeholder="/onas1.jpg"
        />
      </Field>
      <AdminSlider
        label="Kadr poziomy"
        min={0}
        max={100}
        value={data.imagePositionX}
        onChange={(v) => change("imagePositionX", v)}
      />
      <AdminSlider
        label="Kadr pionowy"
        min={0}
        max={100}
        value={data.imagePositionY}
        onChange={(v) => change("imagePositionY", v)}
      />
      <p className="text-xs leading-relaxed text-[#647468]">
        Podgląd po prawej pokazuje rzeczywisty kadr zdjęcia na stronie. Wskazuj obrazy dostępne w katalogu
        public/.
      </p>
    </div>
  );
}
function move<T>(items: T[], index: number, direction: -1 | 1) {
  const other = index + direction;
  if (other < 0 || other >= items.length) return items;
  const next = [...items];
  [next[index], next[other]] = [next[other], next[index]];
  return next;
}
function ListButtons({
  index,
  count,
  onUp,
  onDown,
  onRemove,
}: {
  index: number;
  count: number;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={subtleButton}
        aria-label="Przenieś wyżej"
        title="Przenieś wyżej"
        disabled={index === 0}
        onClick={onUp}
      >
        <TbArrowUp />
      </button>
      <button
        type="button"
        className={subtleButton}
        aria-label="Przenieś niżej"
        title="Przenieś niżej"
        disabled={index === count - 1}
        onClick={onDown}
      >
        <TbArrowDown />
      </button>
      <button
        type="button"
        className={subtleButton}
        aria-label="Usuń pozycję"
        title="Usuń"
        onClick={onRemove}
      >
        <TbTrash />
      </button>
    </div>
  );
}

function BodyEditor<T extends object>({
  section,
  defaults,
  parse,
  fields,
}: {
  section: "history" | "people" | "values" | "village";
  defaults: T;
  parse: (value: unknown) => T;
  fields: (draft: T, update: <K extends keyof T>(key: K, value: T[K]) => void) => ReactNode;
}) {
  const editor = useCmsEditor(`/api/admin/about-page/${section}`, defaults, parse);
  return (
    <EditorLayout
      section={section}
      phase={editor.phase}
      error={editor.error}
      retry={editor.retry}
      preview={<AboutPagePreview section={section} content={editor.draft} />}
    >
      {fields(editor.draft, editor.update)}
      <SaveActions
        busy={editor.busy}
        unsaved={editor.unsaved}
        unpublished={editor.unpublished}
        save={editor.save}
      />
    </EditorLayout>
  );
}

export function AboutSharedEditor({ section }: { section: "hero" | "bottom" }) {
  const editor = useCmsEditor(
    `/api/admin/subpages/o-nas/${section}`,
    SHARED_DEFAULTS[section],
    parseSubpageBlock,
  );
  const change = <K extends keyof SubpageBlock>(key: K, value: SubpageBlock[K]) => editor.update(key, value);
  return (
    <EditorLayout
      section={section}
      phase={editor.phase}
      error={editor.error}
      retry={editor.retry}
      preview={<AboutPagePreview section={section} content={editor.draft} />}
    >
      <h2 className="font-display text-3xl text-[#1c3026]">Treści</h2>
      {section === "bottom" && (
        <Field label="Etykieta">
          <input
            className={fieldClass}
            value={editor.draft.eyebrow}
            onChange={(e) => change("eyebrow", e.target.value)}
          />
        </Field>
      )}
      <Field label="Nagłówek">
        <input
          className={fieldClass}
          value={editor.draft.title}
          onChange={(e) => change("title", e.target.value)}
        />
      </Field>
      <Field label="Opis">
        <textarea
          rows={5}
          className={fieldClass}
          value={editor.draft.description}
          onChange={(e) => change("description", e.target.value)}
        />
      </Field>
      {section === "bottom" && (
        <Field label="Etykieta przycisku">
          <input
            className={fieldClass}
            value={editor.draft.ctaText}
            onChange={(e) => change("ctaText", e.target.value)}
          />
        </Field>
      )}
      <Field
        label="Ścieżka zdjęcia"
        hint={section === "hero" ? "Plik /hero-onas.png" : "Plik /bottom-onas.png"}
      >
        <input
          className={fieldClass}
          value={editor.draft.imageUrl}
          onChange={(e) => change("imageUrl", e.target.value)}
        />
      </Field>
      <div className="space-y-5 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Wygląd</h2>
        <AdminSlider
          label="Wielkość nagłówka"
          min={65}
          max={150}
          value={editor.draft.headingScale}
          onChange={(v) => change("headingScale", v)}
        />
        <AdminSlider
          label="Przyciemnienie zdjęcia"
          min={0}
          max={95}
          value={editor.draft.overlay}
          onChange={(v) => change("overlay", v)}
        />
      </div>
      <SaveActions
        busy={editor.busy}
        unsaved={editor.unsaved}
        unpublished={editor.unpublished}
        save={editor.save}
      />
    </EditorLayout>
  );
}

function HistoryFields(
  data: AboutHistory,
  update: <K extends keyof AboutHistory>(key: K, value: AboutHistory[K]) => void,
) {
  return (
    <>
      <BaseFields data={data} change={(key, value) => update(key, value as never)} />
      <Field label="Historia firmy (akapity)">
        <textarea
          rows={10}
          className={fieldClass}
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>
      <PhotoFields data={data} change={(key, value) => update(key, value as never)} hint="Plik /onas1.jpg" />
      <div className="space-y-4 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Historia i wydarzenia</h2>
        <p className="text-sm leading-relaxed text-[#657166]">
          Opcjonalne. Dodaj tylko prawdziwe daty i wydarzenia potwierdzone przez firmę.
        </p>
        {data.milestones.map((item, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-[#e5dfd5] bg-[#faf8f4] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-sm">Wydarzenie {i + 1}</span>
              <ListButtons
                index={i}
                count={data.milestones.length}
                onUp={() => update("milestones", move(data.milestones, i, -1))}
                onDown={() => update("milestones", move(data.milestones, i, 1))}
                onRemove={() =>
                  update(
                    "milestones",
                    data.milestones.filter((_, n) => n !== i),
                  )
                }
              />
            </div>
            <Field label="Rok lub okres">
              <input
                className={fieldClass}
                value={item.year}
                onChange={(e) =>
                  update(
                    "milestones",
                    data.milestones.map((x, n) => (n === i ? { ...x, year: e.target.value } : x)),
                  )
                }
              />
            </Field>
            <Field label="Nazwa wydarzenia">
              <input
                className={fieldClass}
                value={item.title}
                onChange={(e) =>
                  update(
                    "milestones",
                    data.milestones.map((x, n) => (n === i ? { ...x, title: e.target.value } : x)),
                  )
                }
              />
            </Field>
            <Field label="Opis">
              <textarea
                rows={3}
                className={fieldClass}
                value={item.description}
                onChange={(e) =>
                  update(
                    "milestones",
                    data.milestones.map((x, n) => (n === i ? { ...x, description: e.target.value } : x)),
                  )
                }
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          className={subtleButton}
          disabled={data.milestones.length >= 8}
          onClick={() => update("milestones", [...data.milestones, { year: "", title: "", description: "" }])}
        >
          <TbPlus /> Dodaj wydarzenie
        </button>
      </div>
    </>
  );
}
function PeopleFields(
  data: AboutPeople,
  update: <K extends keyof AboutPeople>(key: K, value: AboutPeople[K]) => void,
) {
  return (
    <>
      <BaseFields data={data} change={(key, value) => update(key, value as never)} />
      <Field label="Opis ludzi tworzących firmę">
        <textarea
          rows={8}
          className={fieldClass}
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>
      <PhotoFields
        data={data}
        change={(key, value) => update(key, value as never)}
        hint="Plik /onas2.jpg — potwierdź osoby przed podpisaniem"
      />
      <Field label="Podpis fotografii (opcjonalnie)" hint="Nie wpisuj fikcyjnych imion ani nazwisk.">
        <input
          className={fieldClass}
          value={data.photoCaption}
          onChange={(e) => update("photoCaption", e.target.value)}
        />
      </Field>
      <div className="space-y-4 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Przedstawienie właścicieli</h2>
        <p className="text-sm leading-relaxed text-[#657166]">
          Osoby pozostają niewidoczne na stronie, dopóki nie dodasz ich rzeczywistych danych.
        </p>
        {data.people.map((person, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-[#e5dfd5] bg-[#faf8f4] p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Osoba {i + 1}</span>
              <ListButtons
                index={i}
                count={data.people.length}
                onUp={() => update("people", move(data.people, i, -1))}
                onDown={() => update("people", move(data.people, i, 1))}
                onRemove={() =>
                  update(
                    "people",
                    data.people.filter((_, n) => n !== i),
                  )
                }
              />
            </div>
            <Field label="Imię i nazwisko">
              <input
                className={fieldClass}
                value={person.name}
                onChange={(e) =>
                  update(
                    "people",
                    data.people.map((x, n) => (n === i ? { ...x, name: e.target.value } : x)),
                  )
                }
              />
            </Field>
            <Field label="Funkcja">
              <input
                className={fieldClass}
                value={person.role}
                onChange={(e) =>
                  update(
                    "people",
                    data.people.map((x, n) => (n === i ? { ...x, role: e.target.value } : x)),
                  )
                }
              />
            </Field>
            <Field label="Krótki opis">
              <textarea
                rows={3}
                className={fieldClass}
                value={person.description}
                onChange={(e) =>
                  update(
                    "people",
                    data.people.map((x, n) => (n === i ? { ...x, description: e.target.value } : x)),
                  )
                }
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          className={subtleButton}
          disabled={data.people.length >= 6}
          onClick={() => update("people", [...data.people, { name: "", role: "", description: "" }])}
        >
          <TbPlus /> Dodaj osobę
        </button>
      </div>
    </>
  );
}
function ValuesFields(
  data: AboutValues,
  update: <K extends keyof AboutValues>(key: K, value: AboutValues[K]) => void,
) {
  return (
    <>
      <BaseFields data={data} change={(key, value) => update(key, value as never)} />
      <div className="space-y-4 border-t border-[#e6e0d4] pt-6">
        <h2 className="font-display text-3xl text-[#1c3026]">Zasady pracy</h2>
        {data.principles.map((item, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-[#e5dfd5] bg-[#faf8f4] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Zasada {i + 1}</span>
              <ListButtons
                index={i}
                count={data.principles.length}
                onUp={() => update("principles", move(data.principles, i, -1))}
                onDown={() => update("principles", move(data.principles, i, 1))}
                onRemove={() => {
                  if (data.principles.length > 1)
                    update(
                      "principles",
                      data.principles.filter((_, n) => n !== i),
                    );
                }}
              />
            </div>
            <Field label="Nagłówek">
              <input
                className={fieldClass}
                value={item.title}
                onChange={(e) =>
                  update(
                    "principles",
                    data.principles.map((x, n) => (n === i ? { ...x, title: e.target.value } : x)),
                  )
                }
              />
            </Field>
            <Field label="Opis">
              <textarea
                rows={4}
                className={fieldClass}
                value={item.description}
                onChange={(e) =>
                  update(
                    "principles",
                    data.principles.map((x, n) => (n === i ? { ...x, description: e.target.value } : x)),
                  )
                }
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          className={subtleButton}
          disabled={data.principles.length >= 6}
          onClick={() => update("principles", [...data.principles, { title: "", description: "" }])}
        >
          <TbPlus /> Dodaj zasadę
        </button>
      </div>
    </>
  );
}
function VillageFields(
  data: AboutVillage,
  update: <K extends keyof AboutVillage>(key: K, value: AboutVillage[K]) => void,
) {
  return (
    <>
      <BaseFields data={data} change={(key, value) => update(key, value as never)} />
      <Field label="Opis lokalnego związku z Żelazkowem">
        <textarea
          rows={9}
          className={fieldClass}
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>
      <Field label="Etykieta odnośnika do Kontaktu">
        <input
          className={fieldClass}
          value={data.buttonLabel}
          onChange={(e) => update("buttonLabel", e.target.value)}
        />
      </Field>
      <PhotoFields
        data={data}
        change={(key, value) => update(key, value as never)}
        hint="Plik /onas3.jpg — ilustracyjna fotografia miejscowości"
      />
    </>
  );
}
export function AboutHistoryEditor() {
  return (
    <BodyEditor<AboutHistory>
      section="history"
      defaults={ABOUT_DEFAULTS.history}
      parse={parseHistory}
      fields={HistoryFields}
    />
  );
}
export function AboutPeopleEditor() {
  return (
    <BodyEditor<AboutPeople>
      section="people"
      defaults={ABOUT_DEFAULTS.people}
      parse={parsePeople}
      fields={PeopleFields}
    />
  );
}
export function AboutValuesEditor() {
  return (
    <BodyEditor<AboutValues>
      section="values"
      defaults={ABOUT_DEFAULTS.values}
      parse={parseValues}
      fields={ValuesFields}
    />
  );
}
export function AboutVillageEditor() {
  return (
    <BodyEditor<AboutVillage>
      section="village"
      defaults={ABOUT_DEFAULTS.village}
      parse={parseVillage}
      fields={VillageFields}
    />
  );
}
