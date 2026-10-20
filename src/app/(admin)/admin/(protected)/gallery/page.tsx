"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GalleryExplorer from "@/components/admin/gallery-explorer";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  DEFAULT_ALBUMS,
  galleryPhotoAlbum,
  parseGalleryAlbums,
  type GalleryAlbum,
} from "@/lib/gallery/albums";
import { TbArrowLeft, TbDeviceFloppy, TbExternalLink, TbX } from "react-icons/tb";
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
const rowButton = `${subtleButton} cursor-pointer`;
export default function GalleryManager() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(DEFAULT_ALBUMS);
  const [savedAlbums, setSavedAlbums] = useState<GalleryAlbum[]>(DEFAULT_ALBUMS);
  const [publishedAlbums, setPublishedAlbums] = useState<GalleryAlbum[]>(DEFAULT_ALBUMS);
  const [items, setItems] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [saved, setSaved] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [published, setPublished] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [autoSaveRevision, setAutoSaveRevision] = useState(0);
  const lastAutoSaveRevision = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    async function fetchGallery() {
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
        const liveAlbums = parseGalleryAlbums(result.publishedAlbums ?? DEFAULT_ALBUMS);
        const editAlbums = result.draftAlbums ? parseGalleryAlbums(result.draftAlbums) : liveAlbums;
        if (controller.signal.aborted) return;
        setItems(edit);
        setAlbums(editAlbums);
        setSavedAlbums(editAlbums);
        setPublishedAlbums(liveAlbums);
        setSaved(edit);
        setPublished(live);
        setLoadError("");
      } catch (error) {
        if (!controller.signal.aborted)
          setLoadError(error instanceof Error ? error.message : "Nie udało się pobrać galerii.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void fetchGallery();
    return () => controller.abort();
  }, [reloadKey]);
  const active = items.find((item) => item.id === editing);
  const dirty =
    JSON.stringify(items) !== JSON.stringify(saved) || JSON.stringify(albums) !== JSON.stringify(savedAlbums);
  const unpublished =
    JSON.stringify(items) !== JSON.stringify(published) ||
    JSON.stringify(albums) !== JSON.stringify(publishedAlbums);
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const retryLoad = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((n) => n + 1);
  };
  const change = <K extends keyof GalleryPhoto>(key: K, value: GalleryPhoto[K]) =>
    setItems((list) => list.map((item) => (item.id === editing ? { ...item, [key]: value } : item)));
  const add = () => {
    const id = `galeria-${crypto.randomUUID()}`;
    setItems((current) => [
      {
        id,
        title: "Nowe zdjęcie",
        description: "",
        alt: "Nowe zdjęcie w galerii",
        imageUrl: "/galeria1-home.png",
        published: false,
        albumId: "",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setEditing(id);
  };
  const reassign = (assignments: Record<string, string>) => {
    setItems((list) =>
      list.map((photo) =>
        Object.prototype.hasOwnProperty.call(assignments, photo.id)
          ? { ...photo, albumId: assignments[photo.id] }
          : photo,
      ),
    );
    setAutoSaveRevision((n) => n + 1);
  };
  const removeAlbum = (id: string) => {
    setAlbums((list) => list.filter((a) => a.id !== id));
    setItems((list) =>
      list.map((photo) => (galleryPhotoAlbum(photo) === id ? { ...photo, albumId: "" } : photo)),
    );
    setAutoSaveRevision((n) => n + 1);
    notify.info(
      "Folder usunięty z formularza",
      "Zdjęcia zostały przeniesione do nieprzypisanych. Szkic zapisze się automatycznie.",
    );
  };
  const save = async (publish: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const content = parseGalleryLibrary(items),
        albumContent = parseGalleryAlbums(albums);
      const response = await fetch("/api/admin/gallery", {
        method: publish ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: content, albums: albumContent }),
        credentials: "same-origin",
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error ?? "Nie udało się zapisać galerii.");
      // Do not overwrite the current editor state: the user may have made more edits while the request was in flight.
      setSaved(content);
      setSavedAlbums(albumContent);
      if (publish) {
        setPublished(content);
        setPublishedAlbums(albumContent);
      }
      notify.success(
        publish ? "Galeria opublikowana" : "Szkic galerii zapisany",
        publish ? "Zmiany są widoczne na stronie." : "Zmiany pozostają niepubliczne do publikacji.",
      );
    } catch (error) {
      notify.error("Błąd zapisu", error instanceof Error ? error.message : "Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  };
  // DnD and destructive operations are saved as a private draft after a short idle period.
  // A busy request never races a second request, and later edits are not discarded.
  useEffect(() => {
    if (!autoSaveRevision || autoSaveRevision <= lastAutoSaveRevision.current || busy || loading || !dirty)
      return;
    const timer = window.setTimeout(() => {
      lastAutoSaveRevision.current = autoSaveRevision;
      void save(false);
    }, 1700);
    return () => window.clearTimeout(timer);
    // save() captures the latest render state; items/albums/dirty are intentionally observed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveRevision, busy, loading, dirty, items, albums]);
  return (
    <main id="main">
      <PageHeading eyebrow="Zarządzanie" title="Galeria">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/site/galeria/hero" className={rowButton}>
            <TbExternalLink /> Edytuj podstronę Galeria
          </Link>
          <Link href="/admin/site/home/gallery" className={rowButton}>
            <TbExternalLink /> Sekcja strony głównej
          </Link>
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
          <GalleryExplorer
            photos={items}
            albums={albums}
            busy={busy}
            onReassign={reassign}
            onDeletePhotos={(ids) => {
              setItems((list) => list.filter((photo) => !ids.includes(photo.id)));
              setAutoSaveRevision((n) => n + 1);
              notify.info(
                "Zdjęcia usunięte z formularza",
                "Szkic zapisze się automatycznie. Opublikuj, gdy będzie gotowy.",
              );
            }}
            onEditPhoto={setEditing}
            onAddPhoto={add}
            onChangeAlbums={setAlbums}
            onRemoveAlbum={removeAlbum}
          />
          <div
            className={`${surfaceClass} sticky bottom-3 z-20 mt-6 flex flex-wrap items-center justify-between gap-4 border border-[#e5dfd2] bg-[#fffdf9]/95 p-5 shadow-[8px_10px_36px_-22px_rgba(12,36,20,.3)] backdrop-blur-xl`}
          >
            <div>
              <p className="text-sm font-semibold text-[#1e3627]">
                {dirty ? "Masz niezapisane zmiany" : "Zmiany zapisane"}
              </p>
              <p className="text-xs text-[#68796c]">
                {items.length} zdjęć · {albums.length} folderów · {items.filter((x) => x.published).length}{" "}
                opublikowanych
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !dirty}
                className={`${rowButton} disabled:cursor-not-allowed disabled:opacity-50`}
                onClick={() => void save(false)}
              >
                <TbDeviceFloppy /> Zapisz szkic
              </button>
              <button
                type="button"
                disabled={busy || (!dirty && !unpublished)}
                className={`${primaryButton} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
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
              <Field label="Album">
                <CustomSelect
                  label="Przypisz zdjęcie do albumu"
                  value={galleryPhotoAlbum(active)}
                  onChange={(value) => change("albumId", value)}
                  options={[
                    { value: "", label: "Bez albumu" },
                    ...albums.map((a) => ({ value: a.id, label: a.title })),
                  ]}
                />
              </Field>
              <Field label="Tekst alternatywny (ALT)">
                <input
                  className={fieldClass}
                  value={active.alt}
                  onChange={(e) => change("alt", e.target.value)}
                />
              </Field>
              <Field label="Adres zdjęcia" hint="Wpisz adres zdjęcia, np. /galeria1-home.png.">
                <input
                  className={fieldClass}
                  value={active.imageUrl}
                  onChange={(e) => change("imageUrl", e.target.value)}
                />
                {!safeGalleryImage(active.imageUrl) && (
                  <span className="text-xs text-red-700">Nieprawidłowy adres zdjęcia.</span>
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
    </main>
  );
}
