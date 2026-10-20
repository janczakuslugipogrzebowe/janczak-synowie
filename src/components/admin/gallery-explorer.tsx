"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  TbArrowBackUp,
  TbArrowLeft,
  TbCheck,
  TbChevronRight,
  TbDots,
  TbEdit,
  TbFolder,
  TbFolderOpen,
  TbFolderPlus,
  TbPhotoPlus,
  TbSearch,
  TbTrash,
  TbX,
} from "react-icons/tb";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, fieldClass, primaryButton, subtleButton } from "@/components/ui/admin-fields";
import { notify } from "@/components/ui/toast-provider";
import { galleryPhotoAlbum, gallerySlug, type GalleryAlbum } from "@/lib/gallery/albums";
import { safeGalleryImage, type GalleryPhoto } from "@/lib/gallery/schema";
import { galleryTransfer, selectGalleryRange } from "@/lib/gallery/explorer-actions";
/** The UI is intentionally independent from persistence. The parent owns the CMS draft and publish transaction. */
type Props = {
  photos: GalleryPhoto[];
  albums: GalleryAlbum[];
  busy: boolean;
  onReassign: (assignments: Record<string, string>) => void;
  onDeletePhotos: (ids: string[]) => void;
  onEditPhoto: (id: string) => void;
  onAddPhoto: () => void;
  onChangeAlbums: (albums: GalleryAlbum[]) => void;
  onRemoveAlbum: (id: string) => void;
};
type Position = {
  x: number;
  y: number;
};
type DragState = {
  ids: string[];
  point: Position;
  target: string | null;
  source: string;
};
type PointerGesture = {
  id?: string;
  panel: string;
  start: Position;
  selected: string[];
  additive: boolean;
  moved: boolean;
};
type MenuState = {
  kind: "photo" | "folder";
  id: string;
  x: number;
  y: number;
};
function intersects(
  a: DOMRect,
  b: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  },
) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
function DropZone({
  id,
  active,
  children,
  className = "",
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-gallery-drop={id}
      className={`${className} transition-[background-color,box-shadow,border-color] duration-200 ${active ? "!border-[#C8A46E] !bg-[#FFF8E9] ring-2 ring-[#E6C991]/80 ring-offset-2" : ""}`}
    >
      {children}
    </div>
  );
}
export default function GalleryExplorer({
  photos,
  albums,
  busy,
  onReassign,
  onDeletePhotos,
  onEditPhoto,
  onAddPhoto,
  onChangeAlbums,
  onRemoveAlbum,
}: Props) {
  const [folder, setFolder] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [drag, setDrag] = useState<DragState | null>(null);
  const [marquee, setMarquee] = useState<{
    start: Position;
    end: Position;
    panel: string;
  } | null>(null);
  const [context, setContext] = useState<MenuState | null>(null);
  const [albumEditor, setAlbumEditor] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    kind: "photos" | "album";
    ids: string[];
  } | null>(null);
  const [undo, setUndo] = useState<Record<string, string> | null>(null);
  const gesture = useRef<PointerGesture | null>(null);
  const dragging = useRef(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const activeAlbum = albums.find((a) => a.id === albumEditor);
  const ordered = useMemo(() => [...albums].sort((a, b) => a.order - b.order), [albums]);
  const filtered = useMemo(
    () =>
      photos
        .filter(
          (photo) =>
            (status === "all" || photo.published === (status === "published")) &&
            `${photo.title} ${photo.description} ${photo.alt}`
              .toLocaleLowerCase("pl")
              .includes(query.toLocaleLowerCase("pl")),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [photos, status, query],
  );
  const getPanelPhotos = useCallback(
    (panel: string) => filtered.filter((p) => galleryPhotoAlbum(p) === panel),
    [filtered],
  );
  const loose = useMemo(() => filtered.filter((p) => galleryPhotoAlbum(p) === ""), [filtered]);
  const inside = useMemo(
    () => (folder === null ? [] : filtered.filter((p) => galleryPhotoAlbum(p) === folder)),
    [filtered, folder],
  );
  const currentFolder = ordered.find((a) => a.id === folder);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const index = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);
  useEffect(() => {
    function close() {
      setContext(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setContext(null);
        setSelected([]);
        setAnchor(null);
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest("input,textarea,[contenteditable='true'],[role='dialog']")) return;
      if (!hostRef.current?.contains(document.activeElement)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelected([...new Set([...loose, ...inside].map((p) => p.id))]);
      }
      if (e.key === "Delete" && selected.length) {
        e.preventDefault();
        setPendingDelete({ kind: "photos", ids: selected });
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [loose, inside, selected]);
  const movePhotos = useCallback(
    (ids: string[], destination: string) => {
      const { moves, previous } = galleryTransfer(ids, destination, photos, galleryPhotoAlbum);
      if (!Object.keys(moves).length) return;
      onReassign(moves);
      setUndo(previous);
      setSelected([]);
      setAnchor(null);
      notify.info(
        `${Object.keys(moves).length} zdjęć przeniesiono`,
        "Zmiana zostanie automatycznie zapisana jako szkic. Opublikuj, gdy będzie gotowa.",
      );
    },
    [photos, onReassign],
  );
  const undoMove = () => {
    if (!undo) return;
    onReassign(undo);
    setUndo(null);
    notify.info("Cofnięto przeniesienie", "Zmiana zostanie zapisana jako szkic.");
  };
  const clickPhoto = (event: React.MouseEvent, photo: GalleryPhoto, panel: string) => {
    if (dragging.current) {
      dragging.current = false;
      return;
    }
    const items = getPanelPhotos(panel).map((p) => p.id);
    if (event.shiftKey) {
      setSelected((prev) => [
        ...new Set([
          ...(event.ctrlKey || event.metaKey ? prev : []),
          ...selectGalleryRange(items, anchor, photo.id),
        ]),
      ]);
    } else if (event.ctrlKey || event.metaKey) {
      setSelected((prev) =>
        prev.includes(photo.id) ? prev.filter((id) => id !== photo.id) : [...prev, photo.id],
      );
      setAnchor(photo.id);
    } else {
      setSelected([photo.id]);
      setAnchor(photo.id);
    }
  };
  const tilePointerDown = (event: React.PointerEvent, photo: GalleryPhoto, panel: string) => {
    if (event.button !== 0 || busy || (event.pointerType === "touch" && !event.isPrimary)) return;
    gesture.current = {
      id: photo.id,
      panel,
      start: { x: event.clientX, y: event.clientY },
      selected: selectedSet.has(photo.id) ? selected : [photo.id],
      additive: event.ctrlKey || event.metaKey,
      moved: false,
    };
  };
  const pointerMove = (event: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || busy) return;
    const point = { x: event.clientX, y: event.clientY };
    if (g.id) {
      if (!g.moved && Math.hypot(point.x - g.start.x, point.y - g.start.y) < 7) return;
      g.moved = true;
      dragging.current = true;
      const hovered = document
        .elementFromPoint(point.x, point.y)
        ?.closest<HTMLElement>("[data-gallery-drop]");
      const target = hovered?.dataset.galleryDrop ?? null;
      setDrag({ ids: g.selected, point, target, source: g.panel });
      const scrollTarget = hovered?.closest<HTMLElement>("[data-gallery-scroll]");
      if (scrollTarget) {
        const rect = scrollTarget.getBoundingClientRect();
        if (point.y > rect.bottom - 32) scrollTarget.scrollTop += 15;
        else if (point.y < rect.top + 32) scrollTarget.scrollTop -= 15;
      }
      return;
    }
    if (Math.hypot(point.x - g.start.x, point.y - g.start.y) < 5) return;
    g.moved = true;
    const box = {
      left: Math.min(g.start.x, point.x),
      right: Math.max(g.start.x, point.x),
      top: Math.min(g.start.y, point.y),
      bottom: Math.max(g.start.y, point.y),
    };
    const nodes = Array.from(hostRef.current?.querySelectorAll<HTMLElement>("[data-gallery-tile]") ?? []);
    const ids = nodes
      .filter((el) => el.dataset.galleryPanel === g.panel && intersects(el.getBoundingClientRect(), box))
      .map((el) => el.dataset.galleryTile!)
      .filter(Boolean);
    setSelected([...new Set([...g.selected, ...ids])]);
    setMarquee({ start: g.start, end: point, panel: g.panel });
  };
  const pointerUp = (event: React.PointerEvent) => {
    if (!gesture.current) return;
    const g = gesture.current;
    if (g.id && g.moved) {
      const hovered = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-gallery-drop]");
      const target = hovered?.dataset.galleryDrop;
      if (target !== undefined && target !== g.panel) {
        movePhotos(g.selected, target);
      }
    }
    gesture.current = null;
    setDrag(null);
    setMarquee(null);
    if (dragging.current) {
      setTimeout(() => {
        dragging.current = false;
      }, 0);
    }
  };
  const panelPointerDown = (event: React.PointerEvent<HTMLDivElement>, panel: string) => {
    if (
      event.button !== 0 ||
      (event.target as HTMLElement).closest("button,input,[data-gallery-tile],[data-gallery-folder]")
    )
      return;
    gesture.current = {
      panel,
      start: { x: event.clientX, y: event.clientY },
      selected: event.ctrlKey || event.metaKey ? selected : [],
      additive: event.ctrlKey || event.metaKey,
      moved: false,
    };
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) setSelected([]);
  };
  const openMenu = (event: React.MouseEvent, kind: MenuState["kind"], id: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (kind === "photo" && !selectedSet.has(id)) {
      setSelected([id]);
      setAnchor(id);
    }
    setContext({
      kind,
      id,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - 240)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - 260)),
    });
  };
  const newFolder = () => {
    const id = `album-${crypto.randomUUID()}`;
    onChangeAlbums([
      ...albums,
      {
        id,
        slug: `album-${crypto.randomUUID().slice(0, 10)}`,
        title: "Nowy album",
        description: "",
        coverUrl: "/galeria1-home.png",
        order: albums.length,
        published: false,
      },
    ]);
    setAlbumEditor(id);
  };
  const updateAlbum = (patch: Partial<GalleryAlbum>) =>
    onChangeAlbums(albums.map((a) => (a.id === albumEditor ? { ...a, ...patch } : a)));
  const thumb = (photo: GalleryPhoto, panel: string) => (
    <div
      key={photo.id}
      data-gallery-tile={photo.id}
      data-gallery-panel={panel}
      onPointerDown={(e) => tilePointerDown(e, photo, panel)}
      onContextMenu={(e) => openMenu(e, "photo", photo.id)}
      onClick={(e) => clickPhoto(e, photo, panel)}
      onDoubleClick={() => onEditPhoto(photo.id)}
      role="button"
      tabIndex={0}
      aria-pressed={selectedSet.has(photo.id)}
      aria-label={`Zaznacz ${photo.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEditPhoto(photo.id);
        } else if (e.key === " ") {
          e.preventDefault();
          setSelected((s) => (s.includes(photo.id) ? s.filter((id) => id !== photo.id) : [...s, photo.id]));
        }
      }}
      className={`group relative min-w-0 cursor-grab select-none overflow-hidden rounded-xl border bg-white shadow-[3px_5px_14px_-10px_rgba(14,34,25,.45)] transition-[border-color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[#C5A16D] ${selectedSet.has(photo.id) ? "border-[#B8955C] ring-2 ring-[#E6C991] shadow-[5px_6px_14px_-8px_rgba(14,34,25,.5)]" : "border-[#e5dfd4] hover:border-[#C5A16D] hover:-translate-y-0.5"}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#ebe6da]">
        {safeGalleryImage(photo.imageUrl) && (
          <Image
            src={photo.imageUrl}
            alt={photo.alt}
            fill
            sizes="(min-width:1200px) 240px, (min-width:600px) 30vw, 44vw"
            className="pointer-events-none object-cover"
            draggable={false}
          />
        )}
        <div
          aria-hidden="true"
          className={`absolute right-2 top-2 grid size-6 place-items-center rounded-md border transition ${selectedSet.has(photo.id) ? "border-[#E6C991] bg-[#1D382A] text-[#E6C991]" : "border-white/80 bg-[#faf9f5]/75 text-transparent group-hover:text-[#2D5139]"}`}
        >
          <TbCheck size={15} />
        </div>
        {!photo.published && (
          <span className="absolute bottom-2 left-2 rounded-full bg-[#fbf0da] px-2 py-1 text-[10px] font-bold text-[#715729]">
            Szkic
          </span>
        )}
      </div>
      <p className="truncate px-3 py-2.5 text-xs font-semibold text-[#263D2E]" title={photo.title}>
        {photo.title}
      </p>
    </div>
  );
  const renderPhotoGrid = (items: GalleryPhoto[], panel: string) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
      {items.map((p) => thumb(p, panel))}
    </div>
  );
  return (
    <div
      ref={hostRef}
      tabIndex={-1}
      className="relative space-y-4 outline-none"
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={() => {
        gesture.current = null;
        setDrag(null);
        setMarquee(null);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5dfd2] bg-white px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onAddPhoto} className={`${primaryButton} cursor-pointer`}>
            <TbPhotoPlus /> Dodaj zdjęcie
          </button>
          <button type="button" onClick={newFolder} className={`${subtleButton} cursor-pointer`}>
            <TbFolderPlus /> Nowy folder
          </button>
        </div>
        <label className="relative flex w-full max-w-xs items-center sm:w-72">
          <TbSearch aria-hidden="true" className="absolute left-3 text-[#617669]" />
          <span className="sr-only">Szukaj zdjęć</span>
          <input
            className={`${fieldClass} pl-10`}
            placeholder="Szukaj zdjęć…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div
        className="flex min-h-14 flex-wrap items-center gap-3 rounded-xl border border-[#e5dfd2] bg-white px-5 py-2"
        aria-live="polite"
      >
        <span className="min-w-32 text-xs font-semibold text-[#253e2f]">
          {selected.length ? `Zaznaczono: ${selected.length}` : "Zarządzanie zdjęciami"}
        </span>
        <div className="flex items-center gap-2">
          {(["all", "published", "draft"] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setStatus(value)}
              aria-pressed={status === value}
              className={`cursor-pointer rounded-full px-3 py-2 text-xs transition ${status === value ? "bg-[#1c3328] text-white" : "bg-[#f4f1e9] text-[#516456] hover:bg-[#ece6d8]"}`}
            >
              {value === "all" ? "Wszystkie" : value === "published" ? "Opublikowane" : "Szkice"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {undo && (
            <button type="button" className={`${subtleButton} cursor-pointer`} onClick={undoMove}>
              <TbArrowBackUp /> Cofnij
            </button>
          )}
          {selected.length > 0 && (
            <>
              <button
                type="button"
                className={`${subtleButton} cursor-pointer`}
                onClick={() => setSelected([])}
              >
                Odznacz
              </button>
              <button
                type="button"
                className={`${subtleButton} cursor-pointer text-red-700`}
                onClick={() => setPendingDelete({ kind: "photos", ids: selected })}
              >
                <TbTrash /> Usuń
              </button>
            </>
          )}
        </div>
      </div>
      <div className="grid min-h-[460px] gap-4 xl:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
        <DropZone
          id=""
          active={drag?.target === ""}
          className="flex min-w-0 flex-col rounded-2xl border border-[#e2dbcd] bg-[#fffdf9]"
        >
          <div className="flex items-center justify-between border-b border-[#e9e3d8] px-5 py-4">
            <div className="flex items-center gap-2">
              <TbPhotoPlus size={21} className="text-[#B79660]" />
              <h2 className="font-display text-2xl text-[#182d23]">Nieprzypisane</h2>
            </div>
            <span className="rounded-full bg-[#f2ecdf] px-3 py-1 text-xs text-[#706347]">{loose.length}</span>
          </div>
          <div
            data-gallery-scroll
            data-gallery-marquee=""
            className="min-h-64 max-h-[min(70vh,800px)] flex-1 overflow-y-auto overscroll-contain p-4"
            onPointerDown={(e) => panelPointerDown(e, "")}
          >
            {loose.length ? (
              renderPhotoGrid(loose, "")
            ) : (
              <div className="grid min-h-52 place-items-center gap-3 rounded-xl border border-dashed border-[#ded2b9] bg-[#fcfaf5] p-7 text-center text-sm text-[#657567]">
                <span>
                  <TbPhotoPlus className="mx-auto mb-3" size={33} />
                  Wszystkie zdjęcia są przypisane.
                  <br />
                  Upuść tutaj zdjęcia z folderu.
                </span>
              </div>
            )}
          </div>
        </DropZone>
        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2dbcd] bg-[#fffdf9]">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#e9e3d8] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => setFolder(null)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 font-display text-xl text-[#182d23] hover:bg-[#f0eadf]"
              aria-label="Wszystkie albumy"
            >
              <TbFolderOpen className="text-[#B79660]" size={22} /> Albumy
            </button>
            {currentFolder && (
              <>
                <TbChevronRight aria-hidden="true" size={15} className="text-[#A88D61]" />
                <span className="font-semibold text-sm text-[#1c3829]">{currentFolder.title}</span>
              </>
            )}
            <span className="ml-auto rounded-full bg-[#f2ecdf] px-3 py-1 text-xs text-[#706347]">
              {currentFolder ? inside.length : ordered.length}
            </span>
          </div>
          {currentFolder && (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#e9e3d8] px-5 py-3">
              <button
                type="button"
                onClick={() => setFolder(null)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-[#455e4b] hover:bg-[#eee7d9]"
              >
                <TbArrowLeft /> Wszystkie foldery
              </button>
              <button
                type="button"
                onClick={() => setAlbumEditor(currentFolder.id)}
                className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs text-[#705a36] hover:underline"
              >
                <TbEdit /> Edytuj album
              </button>
            </div>
          )}
          <div
            data-gallery-scroll
            className="min-h-64 max-h-[min(70vh,800px)] flex-1 overflow-y-auto overscroll-contain p-4"
            onPointerDown={(e) => panelPointerDown(e, currentFolder?.id ?? "#folders")}
          >
            {currentFolder ? (
              <DropZone
                id={currentFolder.id}
                active={drag?.target === currentFolder.id}
                className="min-h-56 rounded-xl border border-transparent p-1"
              >
                {inside.length ? (
                  renderPhotoGrid(inside, currentFolder.id)
                ) : (
                  <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-[#ddcfaf] p-6 text-center text-[#617366]">
                    <span>
                      <TbFolderOpen className="mx-auto mb-3" size={37} />
                      Album jest pusty.
                      <br />
                      Przeciągnij zdjęcia z lewej strony.
                    </span>
                  </div>
                )}
              </DropZone>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
                {ordered.map((a) => (
                  <DropZone
                    key={a.id}
                    id={a.id}
                    active={drag?.target === a.id}
                    className="min-w-0 rounded-xl border border-[#e5ddce] bg-white"
                  >
                    <div
                      data-gallery-folder={a.id}
                      onContextMenu={(e) => openMenu(e, "folder", a.id)}
                      className="group relative overflow-hidden rounded-xl"
                    >
                      <button
                        type="button"
                        onClick={() => setFolder(a.id)}
                        onDoubleClick={() => setFolder(a.id)}
                        className="block w-full cursor-pointer text-left"
                        aria-label={`Otwórz folder ${a.title}`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e4d8]">
                          {safeGalleryImage(a.coverUrl) && (
                            <Image
                              src={a.coverUrl}
                              alt=""
                              fill
                              sizes="(min-width:1200px) 250px, (min-width:600px) 30vw, 44vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#102019]/65 via-transparent to-transparent" />
                          <TbFolderOpen size={26} className="absolute bottom-3 left-3 text-[#E6C991]" />
                        </div>
                        <div className="px-3 py-3">
                          <h3 className="truncate text-sm font-semibold text-[#1d3528]">{a.title}</h3>
                          <p className="mt-1 text-xs text-[#758073]">
                            {photos.filter((p) => galleryPhotoAlbum(p) === a.id).length} zdjęć
                            {!a.published ? " · szkic" : ""}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        aria-label={`Opcje albumu ${a.title}`}
                        className="absolute right-2 top-2 grid size-9 cursor-pointer place-items-center rounded-full bg-[#14261c]/80 text-white hover:bg-[#14261c]"
                        onClick={(e) => openMenu(e, "folder", a.id)}
                      >
                        <TbDots />
                      </button>
                    </div>
                  </DropZone>
                ))}
              </div>
            )}
          </div>
          {currentFolder && (
            <div className="flex flex-wrap gap-2 border-t border-[#eee5d7] px-4 py-3">
              {ordered
                .filter((a) => a.id !== folder)
                .map((a) => (
                  <DropZone
                    key={a.id}
                    id={a.id}
                    active={drag?.target === a.id}
                    className="rounded-full border border-[#e3d8c4]"
                  >
                    <button
                      type="button"
                      onClick={() => setFolder(a.id)}
                      className="inline-flex min-h-10 cursor-pointer items-center gap-2 px-3 text-xs text-[#34493a]"
                    >
                      <TbFolder size={16} className="text-[#ad8b54]" />
                      {a.title}
                    </button>
                  </DropZone>
                ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-[#718073]">
        Kliknij zdjęcie, aby je zaznaczyć. Ctrl / ⌘ + kliknięcie dodaje do zaznaczenia, Shift wybiera zakres.
        Z pustego miejsca możesz przeciągnąć prostokąt. Przeciągnij miniatury na folder, aby je przenieść;
        prawym przyciskiem otworzysz dodatkowe opcje. Zapisz szkic lub opublikuj zmiany przyciskami poniżej.
      </p>
      <AnimatePresence>
        {drag && (
          <motion.div
            key="drag-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            aria-hidden="true"
            className="pointer-events-none fixed z-[500] w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-[#E6C991] bg-[#182b20] p-2 shadow-2xl"
            style={{ left: drag.point.x + 20, top: drag.point.y - 45 }}
          >
            <div className="relative aspect-video overflow-hidden rounded-md bg-[#425443]">
              {index.get(drag.ids[0]) && safeGalleryImage(index.get(drag.ids[0])!.imageUrl) && (
                <Image
                  src={index.get(drag.ids[0])!.imageUrl}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              )}
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-[#E6C991]">{drag.ids.length} zdjęć</p>
          </motion.div>
        )}
      </AnimatePresence>
      {marquee && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[400] border border-[#B39359] bg-[#E6C991]/25"
          style={{
            left: Math.min(marquee.start.x, marquee.end.x),
            top: Math.min(marquee.start.y, marquee.end.y),
            width: Math.abs(marquee.end.x - marquee.start.x),
            height: Math.abs(marquee.end.y - marquee.start.y),
          }}
        />
      )}
      {context && (
        <>
          <div
            className="fixed inset-0 z-[590]"
            onClick={() => setContext(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContext(null);
            }}
          />
          <div
            role="menu"
            className="fixed z-[600] w-56 rounded-xl border border-[#d9ceb9] bg-[#fffdf8] p-1.5 shadow-[12px_16px_32px_-14px_rgba(20,35,24,.35)]"
            style={{ left: context.x, top: context.y }}
          >
            {(context.kind === "photo"
              ? [
                  { label: "Edytuj zdjęcie", icon: TbEdit, action: () => onEditPhoto(context.id) },
                  {
                    label: "Przenieś do nieprzypisanych",
                    icon: TbArrowBackUp,
                    action: () => movePhotos(selectedSet.has(context.id) ? selected : [context.id], ""),
                  },
                  {
                    label: "Usuń zaznaczone",
                    icon: TbTrash,
                    action: () =>
                      setPendingDelete({
                        kind: "photos",
                        ids: selectedSet.has(context.id) ? selected : [context.id],
                      }),
                  },
                ]
              : [
                  { label: "Otwórz folder", icon: TbFolderOpen, action: () => setFolder(context.id) },
                  { label: "Edytuj folder", icon: TbEdit, action: () => setAlbumEditor(context.id) },
                  {
                    label: "Usuń folder",
                    icon: TbTrash,
                    action: () => setPendingDelete({ kind: "album", ids: [context.id] }),
                  },
                ]
            ).map((item) => (
              <button
                type="button"
                role="menuitem"
                key={item.label}
                onClick={() => {
                  item.action();
                  setContext(null);
                }}
                className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-xs text-[#263d2c] hover:bg-[#f0e8d9] focus:bg-[#f0e8d9]"
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
            {context.kind === "photo" && (
              <div className="mt-1 border-t border-[#e9e1d1] pt-1">
                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-[#948670]">
                  Przenieś do albumu
                </p>
                {ordered.map((a) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={a.id}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#263d2c] hover:bg-[#f0e8d9]"
                    onClick={() => {
                      movePhotos(selectedSet.has(context.id) ? selected : [context.id], a.id);
                      setContext(null);
                    }}
                  >
                    <TbFolder size={15} />
                    {a.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {activeAlbum && (
        <div
          className="fixed inset-0 z-[700] flex justify-end bg-[#07150d]/65 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAlbumEditor(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Edytuj folder"
            className="flex h-dvh w-full max-w-xl flex-col gap-5 overflow-y-auto bg-[#fffdf8] p-7 sm:p-10"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-[#182b22]">Edytuj folder</h2>
              <button
                type="button"
                aria-label="Zamknij"
                onClick={() => setAlbumEditor(null)}
                className="cursor-pointer rounded-full border p-2"
              >
                <TbX />
              </button>
            </div>
            {safeGalleryImage(activeAlbum.coverUrl) && (
              <div className="relative aspect-[1.8/1] overflow-hidden rounded-xl">
                <Image src={activeAlbum.coverUrl} alt="" fill sizes="550px" className="object-cover" />
              </div>
            )}
            <Field label="Nazwa albumu">
              <input
                className={fieldClass}
                value={activeAlbum.title}
                onChange={(e) => updateAlbum({ title: e.target.value })}
              />
            </Field>
            <Field label="Opis albumu">
              <textarea
                className={fieldClass}
                rows={3}
                value={activeAlbum.description}
                onChange={(e) => updateAlbum({ description: e.target.value })}
              />
            </Field>
            <Field label="Zdjęcie okładki" hint="Wpisz adres zdjęcia, np. /galeria1-home.png.">
              <input
                className={fieldClass}
                value={activeAlbum.coverUrl}
                onChange={(e) => updateAlbum({ coverUrl: e.target.value })}
              />
            </Field>
            <Field label="Slug (zmień tylko świadomie)">
              <input
                className={fieldClass}
                value={activeAlbum.slug}
                onChange={(e) => updateAlbum({ slug: gallerySlug(e.target.value) })}
              />
            </Field>
            <p className="text-xs text-[#6a766e]">
              Zmiana sluga może unieważnić istniejące linki. Zmiana nazwy nie zmienia sluga.
            </p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e7ddc9] p-4 text-sm">
              <input
                type="checkbox"
                className="size-5 cursor-pointer accent-[#274633]"
                checked={activeAlbum.published}
                onChange={(e) => updateAlbum({ published: e.target.checked })}
              />{" "}
              Album opublikowany
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const i = ordered.findIndex((a) => a.id === activeAlbum.id);
                  if (i < 1) return;
                  const next = [...ordered];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChangeAlbums(next.map((a, j) => ({ ...a, order: j })));
                }}
                className={`${subtleButton} cursor-pointer`}
              >
                W górę
              </button>
              <button
                type="button"
                onClick={() => {
                  const i = ordered.findIndex((a) => a.id === activeAlbum.id);
                  if (i < 0 || i === ordered.length - 1) return;
                  const next = [...ordered];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  onChangeAlbums(next.map((a, j) => ({ ...a, order: j })));
                }}
                className={`${subtleButton} cursor-pointer`}
              >
                W dół
              </button>
            </div>
            <button
              type="button"
              className={`${primaryButton} mt-auto cursor-pointer`}
              onClick={() => setAlbumEditor(null)}
            >
              Zakończ edycję
            </button>
          </section>
        </div>
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        title={pendingDelete?.kind === "album" ? "Usunąć album?" : "Usunąć zdjęcia?"}
        description={
          pendingDelete?.kind === "album"
            ? "Zdjęcia z usuniętego folderu pozostaną w bibliotece jako nieprzypisane. Zmianę zatwierdza publikacja."
            : "Zdjęcia znikną z biblioteki po publikacji, ale pliki źródłowe pozostaną nienaruszone."
        }
        confirmLabel="Usuń"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.kind === "album") {
            onRemoveAlbum(pendingDelete.ids[0]);
            if (folder === pendingDelete.ids[0]) setFolder(null);
          } else if (pendingDelete) {
            onDeletePhotos(pendingDelete.ids);
            setSelected([]);
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
