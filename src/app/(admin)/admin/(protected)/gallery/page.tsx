"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TbArrowLeft, TbDeviceFloppy, TbExternalLink, TbPlus, TbSearch, TbTrash, TbX } from "react-icons/tb";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { notify } from "@/components/ui/toast-provider";
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
  safeGalleryImage,
  type GalleryPhoto,
} from "@/lib/gallery/schema";

type Filter = "all" | "published" | "draft";
const rowButton = `${subtleButton} cursor-pointer`;
export default function GalleryManager() {
  const [items, setItems] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [saved, setSaved] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [published, setPublished] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchGallery = async () => {
      try {
        const response = await fetch("/api/admin/gallery", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw Error(result.error ?? "Nie udało się pobrać galerii.");
        const live = parseGalleryLibrary(result.published ?? DEFAULT_GALLERY);
        const edit = result.draft ? parseGalleryLibrary(result.draft) : live;
        if (controller.signal.aborted) return;
        setItems(edit);
        setSaved(edit);
        setPublished(live);
        setLoadError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "Nie udało się pobrać galerii.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchGallery();
    return () => controller.abort();
  }, [reloadKey]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  const active = items.find((item) => item.id === editing);
  const dirty = JSON.stringify(items) !== JSON.stringify(saved);
  const unpublished = JSON.stringify(items) !== JSON.stringify(published);
  const visible = useMemo(
    () =>
      items
        .filter(
          (item) =>
            (filter === "all" || item.published === (filter === "published")) &&
            `${item.title} ${item.description}`
              .toLocaleLowerCase("pl")
              .includes(query.toLocaleLowerCase("pl")),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items, filter, query],
  );
  const change = <K extends keyof GalleryPhoto>(key: K, value: GalleryPhoto[K]) =>
    setItems((list) => list.map((item) => (item.id === editing ? { ...item, [key]: value } : item)));
  const add = () => {
    const id = `galeria-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    setItems((current) => [
      {
        id,
        title: "Nowe zdjęcie",
        description: "",
        alt: "Nowe zdjęcie w galerii",
        imageUrl: "/galeria1-home.png",
        published: false,
        createdAt: now,
      },
      ...current,
    ]);
    setEditing(id);
  };
  const save = async (publish: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const content = parseGalleryLibrary(items);
      const response = await fetch("/api/admin/gallery", {
        method: publish ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
        credentials: "same-origin",
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error ?? "Nie udało się zapisać galerii.");
      setItems(content);
      setSaved(content);
      if (publish) setPublished(content);
      notify.success(
        publish ? "Galeria opublikowana" : "Szkic galerii zapisany",
        publish ? "Na stronie głównej widoczne jest 6 najnowszych zdjęć." : undefined,
      );
    } catch (error) {
      notify.error("Błąd zapisu", error instanceof Error ? error.message : "Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main id="main">
      <PageHeading eyebrow="Zarządzanie" title="Galeria">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/site/home/gallery" className={rowButton}>
            <TbExternalLink /> Wygląd sekcji
          </Link>
          <button type="button" onClick={add} className={`${primaryButton} cursor-pointer`}>
            <TbPlus /> Dodaj zdjęcie
          </button>
        </div>
      </PageHeading>
      {loading ? (
        <p className="py-12 text-[#617067]">Ładowanie zdjęć…</p>
      ) : loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {loadError}
          <button type="button" className={`${rowButton} ml-4`} onClick={retryLoad}>
            Spróbuj ponownie
          </button>
        </div>
      ) : (
        <>
          <div
            className={`${surfaceClass} mb-5 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5`}
          >
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtruj zdjęcia">
              {(["all", "published", "draft"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`min-h-10 cursor-pointer rounded-full px-4 text-xs font-semibold transition ${filter === value ? "bg-[#1c3328] text-white" : "bg-[#f4f1e9] text-[#526459] hover:bg-[#e9e3d8]"}`}
                >
                  {value === "all" ? "Wszystkie" : value === "published" ? "Opublikowane" : "Szkice"}
                </button>
              ))}
            </div>
            <label className="relative block w-full sm:w-72">
              <TbSearch
                aria-hidden="true"
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#788378]"
              />
              <span className="sr-only">Szukaj zdjęć</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj zdjęć"
                className={`${fieldClass} pl-10`}
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {visible.map((photo) => (
              <article key={photo.id} className={`${surfaceClass} overflow-hidden`}>
                <button
                  type="button"
                  aria-label={`Edytuj ${photo.title}`}
                  onClick={() => setEditing(photo.id)}
                  className="group relative block aspect-[5/3] w-full cursor-pointer overflow-hidden bg-[#e8e1d4]"
                >
                  <Image
                    src={photo.imageUrl}
                    alt={photo.alt}
                    fill
                    sizes="(min-width:1280px) 24vw, (min-width:640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#13251d]/40 to-transparent" />
                </button>
                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="font-display text-2xl leading-tight text-[#203428]">{photo.title}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${photo.published ? "bg-[#e7f0e6] text-[#42654b]" : "bg-[#f1eadd] text-[#907043]"}`}
                    >
                      {photo.published ? "Opublikowane" : "Szkic"}
                    </span>
                  </div>
                  <p className="line-clamp-2 min-h-[2.7em] text-xs leading-relaxed text-[#6c766c]">
                    {photo.description || "Bez opisu"}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-2">
                    <button type="button" className={rowButton} onClick={() => setEditing(photo.id)}>
                      Edytuj
                    </button>
                    <button
                      type="button"
                      aria-label={`Usuń ${photo.title}`}
                      className="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-[#e9ddd3] text-[#9e5142] hover:bg-[#fbede9]"
                      onClick={() => setPendingDelete(photo.id)}
                    >
                      <TbTrash size={19} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!visible.length && (
            <p className="py-14 text-center text-sm text-[#627267]">
              Brak zdjęć spełniających wybrane kryteria.
            </p>
          )}
          <div className={`${surfaceClass} mt-6 flex flex-wrap items-center justify-between gap-3 p-5`}>
            <span className="text-sm text-[#68796c]">
              {items.length} zdjęć w bibliotece · {items.filter((x) => x.published).length} opublikowanych
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || !dirty}
                className={rowButton}
                onClick={() => void save(false)}
              >
                <TbDeviceFloppy /> Zapisz szkic
              </button>
              <button
                type="button"
                disabled={busy || (!dirty && !unpublished)}
                className={`${primaryButton} cursor-pointer`}
                onClick={() => void save(true)}
              >
                {busy ? "Zapisywanie…" : "Opublikuj zmiany"}
              </button>
            </div>
          </div>
        </>
      )}
      {active && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex justify-end bg-[#07150d]/60 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Edytuj ${active.title}`}
            className="flex h-dvh w-full max-w-[570px] flex-col overflow-y-auto bg-[#fffdf8] p-6 shadow-2xl sm:p-9"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-3xl text-[#182a20]">Edytuj zdjęcie</h2>
              <button
                type="button"
                aria-label="Zamknij edycję"
                onClick={() => setEditing(null)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#d8d4c7] hover:bg-[#f2eee5]"
              >
                <TbX size={20} />
              </button>
            </div>
            <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-[#e8e1d4]">
              <Image src={active.imageUrl} alt={active.alt} fill sizes="550px" className="object-cover" />
            </div>
            <div className="space-y-5">
              <Field label="Tytuł">
                <input
                  className={fieldClass}
                  value={active.title}
                  onChange={(e) => change("title", e.target.value)}
                />
              </Field>
              <Field label="Opis (opcjonalny)">
                <textarea
                  className={`${fieldClass} resize-y`}
                  rows={3}
                  value={active.description}
                  onChange={(e) => change("description", e.target.value)}
                />
              </Field>
              <Field label="Tekst alternatywny (ALT)">
                <input
                  className={fieldClass}
                  value={active.alt}
                  onChange={(e) => change("alt", e.target.value)}
                />
              </Field>
              <Field
                label="Ścieżka zdjęcia"
                hint="Na razie plik /public, np. /galeria1-home.png. Później będzie można używać także Vercel Blob."
              >
                <input
                  className={fieldClass}
                  value={active.imageUrl}
                  onChange={(e) => change("imageUrl", e.target.value)}
                />
                {!safeGalleryImage(active.imageUrl) && (
                  <span className="text-xs text-red-700">Nieprawidłowa ścieżka zdjęcia.</span>
                )}
              </Field>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e6dfd2] bg-[#f7f4ed] p-4 text-sm font-semibold text-[#314539]">
                <input
                  type="checkbox"
                  checked={active.published}
                  onChange={(e) => change("published", e.target.checked)}
                  className="size-5 cursor-pointer accent-[#224432]"
                />
                Opublikuj zdjęcie
              </label>
              <p className="text-xs text-[#728173]">
                Data dodania: {new Date(active.createdAt).toLocaleString("pl-PL")}
              </p>
            </div>
            <div className="mt-auto flex justify-between gap-3 pt-8">
              <button type="button" className={rowButton} onClick={() => setEditing(null)}>
                <TbArrowLeft /> Wróć
              </button>
              <button
                type="button"
                className={`${primaryButton} cursor-pointer`}
                onClick={() => {
                  setEditing(null);
                  notify.info(
                    "Zmiany są w formularzu",
                    "Użyj „Opublikuj zmiany” pod zdjęciami, aby zapisać je w Firebase.",
                  );
                }}
              >
                Zakończ edycję
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Usunąć zdjęcie?"
        description="Zdjęcie zostanie usunięte z biblioteki po opublikowaniu zmian. Plik źródłowy nie zostanie skasowany."
        confirmLabel="Usuń zdjęcie"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          setItems((list) => list.filter((item) => item.id !== pendingDelete));
          setPendingDelete(null);
          notify.info("Zdjęcie usunięte z formularza", "Opublikuj zmiany, aby zapisać usunięcie.");
        }}
      />
    </main>
  );
}
