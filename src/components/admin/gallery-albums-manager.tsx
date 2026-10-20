"use client";
import { useState } from "react";
import Image from "next/image";
import { TbArrowDown, TbArrowUp, TbFolderPlus, TbTrash, TbX } from "react-icons/tb";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { notify } from "@/components/ui/toast-provider";
import { Field, fieldClass, primaryButton, subtleButton } from "@/components/ui/admin-fields";
import { gallerySlug, type GalleryAlbum } from "@/lib/gallery/albums";
import { safeGalleryImage } from "@/lib/gallery/schema";
export default function GalleryAlbumsManager({
  albums,
  onChange,
  onRemove,
}: {
  albums: GalleryAlbum[];
  onChange: (albums: GalleryAlbum[]) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const current = albums.find((a) => a.id === editing);
  const update = (patch: Partial<GalleryAlbum>) =>
    onChange(albums.map((a) => (a.id === editing ? { ...a, ...patch } : a)));
  const add = () => {
    const id = `album-${crypto.randomUUID()}`;
    const entry: GalleryAlbum = {
      id,
      slug: `album-${crypto.randomUUID().slice(0, 8)}`,
      title: "Nowy album",
      description: "",
      coverUrl: "/galeria1-home.png",
      order: albums.length,
      published: false,
    };
    onChange([...albums, entry]);
    setEditing(id);
  };
  const move = (id: string, step: number) => {
    const sorted = [...albums].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((a) => a.id === id),
      j = i + step;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    onChange(sorted.map((a, idx) => ({ ...a, order: idx })));
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl text-[#1b3025]">Albumy zdjęć</h2>
          <p className="text-xs text-[#6c766c]">Zarządzaj folderami, okładkami i kolejnością.</p>
        </div>
        <button type="button" onClick={add} className={primaryButton}>
          <TbFolderPlus /> Nowy album
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...albums]
          .sort((a, b) => a.order - b.order)
          .map((a) => (
            <article key={a.id} className="overflow-hidden rounded-2xl border border-[#e5dfd2] bg-white">
              <button
                type="button"
                onClick={() => setEditing(a.id)}
                className="relative block aspect-[1.9/1] w-full cursor-pointer overflow-hidden bg-[#ebe5d9]"
              >
                {safeGalleryImage(a.coverUrl) && (
                  <Image
                    src={a.coverUrl}
                    alt=""
                    fill
                    sizes="(min-width:1280px) 28vw, 45vw"
                    className="object-cover"
                  />
                )}
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl text-[#1c3126]">{a.title}</h3>
                    <p className="mt-1 text-xs text-[#687569]">/{a.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] ${a.published ? "bg-[#e5efe4] text-[#456a4f]" : "bg-[#f2ebdd] text-[#947044]"}`}
                  >
                    {a.published ? "Opublikowany" : "Szkic"}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-1">
                  <button type="button" onClick={() => setEditing(a.id)} className={subtleButton}>
                    Edytuj
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={subtleButton}
                      onClick={() => move(a.id, -1)}
                      aria-label={`Przesuń ${a.title} w górę`}
                    >
                      <TbArrowUp />
                    </button>
                    <button
                      type="button"
                      className={subtleButton}
                      onClick={() => move(a.id, 1)}
                      aria-label={`Przesuń ${a.title} w dół`}
                    >
                      <TbArrowDown />
                    </button>
                    <button
                      type="button"
                      className={`${subtleButton} text-red-700`}
                      onClick={() => setPending(a.id)}
                      aria-label={`Usuń ${a.title}`}
                    >
                      <TbTrash />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
      </div>
      {current && (
        <div
          className="fixed inset-0 z-[200] flex justify-end bg-[#07150d]/70 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Edytuj album"
            className="flex h-dvh w-full max-w-xl flex-col gap-5 overflow-y-auto bg-[#fffdf8] p-7 shadow-xl sm:p-10"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl">Edytuj album</h2>
              <button
                type="button"
                aria-label="Zamknij"
                onClick={() => setEditing(null)}
                className="cursor-pointer rounded-full border p-2"
              >
                <TbX />
              </button>
            </div>
            {safeGalleryImage(current.coverUrl) && (
              <div className="relative aspect-[1.8/1] overflow-hidden rounded-xl">
                <Image src={current.coverUrl} fill alt="" sizes="500px" className="object-cover" />
              </div>
            )}
            <Field label="Nazwa albumu">
              <input
                className={fieldClass}
                value={current.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </Field>
            <Field label="Opis albumu">
              <textarea
                className={fieldClass}
                rows={4}
                value={current.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </Field>
            <Field label="Zdjęcie okładki" hint="Wpisz adres zdjęcia, np. /galeria1-home.png.">
              <input
                className={fieldClass}
                value={current.coverUrl}
                onChange={(e) => update({ coverUrl: e.target.value })}
              />
            </Field>
            <Field label="Slug (nie zmienia się automatycznie wraz z nazwą)">
              <input
                className={fieldClass}
                value={current.slug}
                onChange={(e) => update({ slug: gallerySlug(e.target.value) })}
              />
            </Field>
            <p className="text-xs text-[#7a766d]">
              Zmiana sluga może spowodować niedziałanie wcześniej udostępnionych linków.
            </p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e7ddc9] p-4 text-sm">
              <input
                type="checkbox"
                className="size-5 cursor-pointer accent-[#274633]"
                checked={current.published}
                onChange={(e) => update({ published: e.target.checked })}
              />{" "}
              Album opublikowany
            </label>
            <button
              type="button"
              className={`${primaryButton} mt-auto`}
              onClick={() => {
                setEditing(null);
                notify.info("Zmiany w formularzu", "Zapisz szkic lub opublikuj całą galerię.");
              }}
            >
              Zakończ edycję
            </button>
          </section>
        </div>
      )}
      <ConfirmDialog
        open={!!pending}
        title="Usunąć album?"
        description="Zdjęcia zostaną zachowane w bibliotece jako nieprzypisane. Zmiany będą widoczne po publikacji."
        confirmLabel="Usuń album"
        destructive
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onRemove(pending);
          setPending(null);
          notify.info("Album usunięty z formularza", "Opublikuj zmiany, aby je zapisać.");
        }}
      />
    </div>
  );
}
