"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TbExternalLink, TbPhoto } from "react-icons/tb";
import { useCmsEditor } from "@/components/admin/use-cms-editor";
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
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import GalleryAlbumsSection from "@/components/gallery/gallery-albums-section";
import GalleryAboutSection from "@/components/gallery/gallery-about-section";
import { DEFAULT_GALLERY, parseGalleryLibrary, type GalleryPhoto } from "@/lib/gallery/schema";
import { DEFAULT_ALBUMS, parseGalleryAlbums, type GalleryAlbum } from "@/lib/gallery/albums";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/settings/schema";
import {
  isSubpageSection,
  parseSubpageBlock,
  subpageDefault,
  type SubpageSection,
  type SubpageBlock,
} from "@/lib/subpages/schema";

const DEFAULTS: Record<SubpageSection, SubpageBlock> = {
  hero: subpageDefault("galeria", "hero"),
  albums: subpageDefault("galeria", "albums"),
  about: subpageDefault("galeria", "about"),
  bottom: subpageDefault("galeria", "bottom"),
};
const TITLES: Record<SubpageSection, string> = {
  hero: "Hero",
  albums: "Albumy",
  about: "O galerii",
  bottom: "Kontaktowe CTA",
};
function SectionEditor({ section }: { section: SubpageSection }) {
  const ed = useCmsEditor(`/api/admin/subpages/galeria/${section}`, DEFAULTS[section], parseSubpageBlock);
  const [albums, setAlbums] = useState<GalleryAlbum[]>(DEFAULT_ALBUMS);
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_GALLERY);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      fetch("/api/admin/gallery", {
        cache: "no-store",
        signal: controller.signal,
        credentials: "same-origin",
      }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/settings", {
        cache: "no-store",
        signal: controller.signal,
        credentials: "same-origin",
      }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([g, s]) => {
        if (controller.signal.aborted) return;
        if (g) {
          setAlbums(parseGalleryAlbums(g.draftAlbums ?? g.publishedAlbums ?? DEFAULT_ALBUMS));
          setPhotos(parseGalleryLibrary(g.draft ?? g.published ?? DEFAULT_GALLERY));
        }
        if (s?.draft || s?.published) setSettings(s.draft ?? s.published);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const update = <K extends keyof SubpageBlock>(key: K, value: SubpageBlock[K]) => ed.update(key, value);
  return (
    <main id="main">
      <PageHeading eyebrow="Edytor witryny / Galeria" title={TITLES[section]}>
        <Link href="/galeria" target="_blank" className={subtleButton}>
          <TbExternalLink /> Otwórz podstronę
        </Link>
      </PageHeading>
      <EditorState phase={ed.phase} error={ed.error} retry={ed.retry} />
      {ed.phase === "ready" && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,385px)_minmax(0,1fr)] 3xl:grid-cols-[minmax(400px,500px)_minmax(0,1fr)]">
          <section className={`${surfaceClass} space-y-5 p-6 3xl:p-8`} aria-label="Edycja sekcji">
            <h2 className="font-display text-3xl text-[#1c3026]">Treści</h2>
            <Field label="Etykieta">
              <input
                className={fieldClass}
                value={ed.draft.eyebrow}
                onChange={(e) => update("eyebrow", e.target.value)}
              />
            </Field>
            <Field label="Nagłówek">
              <input
                className={fieldClass}
                value={ed.draft.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>
            <Field label="Opis">
              <textarea
                rows={5}
                className={fieldClass}
                value={ed.draft.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
            {section === "about" && (
              <Field label="Wyróżniki (oddziel znakiem |)">
                <textarea
                  className={fieldClass}
                  rows={3}
                  value={ed.draft.ctaText}
                  onChange={(e) => update("ctaText", e.target.value)}
                />
              </Field>
            )}
            {section === "bottom" && (
              <Field label="Tekst przycisku">
                <input
                  className={fieldClass}
                  value={ed.draft.ctaText}
                  onChange={(e) => update("ctaText", e.target.value)}
                />
              </Field>
            )}
            {(section === "hero" || section === "bottom") && (
              <Field label="Zdjęcie w tle" hint="Wpisz adres zdjęcia, np. /hero-galeria.png.">
                <input
                  className={fieldClass}
                  value={ed.draft.imageUrl}
                  onChange={(e) => update("imageUrl", e.target.value)}
                />
              </Field>
            )}
            <div className="space-y-5 border-t border-[#e6e0d4] pt-6">
              <h2 className="font-display text-3xl text-[#1c3026]">Wygląd</h2>
              <AdminSlider
                label="Wielkość nagłówka"
                min={65}
                max={150}
                value={ed.draft.headingScale}
                onChange={(v) => update("headingScale", v)}
              />
              {(section === "hero" || section === "bottom") && (
                <AdminSlider
                  label="Przyciemnienie zdjęcia"
                  min={0}
                  max={95}
                  value={ed.draft.overlay}
                  onChange={(v) => update("overlay", v)}
                />
              )}
              <button
                type="button"
                className={subtleButton}
                onClick={() => {
                  update("headingScale", 100);
                  update("overlay", DEFAULTS[section].overlay);
                }}
              >
                Przywróć proporcje
              </button>
            </div>
            {section === "albums" && (
              <Link href="/admin/gallery" className={subtleButton}>
                <TbPhoto /> Zarządzaj albumami i zdjęciami
              </Link>
            )}
            <div className="flex flex-wrap gap-2 border-t border-[#e6e0d4] pt-6">
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
          <section aria-label="Podgląd na żywo" className="min-w-0">
            <div className="mb-3 text-xs font-semibold text-[#657166]">Podgląd sekcji</div>
            <div className="sticky top-5 overflow-hidden rounded-xl border border-[#dfdacd] shadow-[0_10px_40px_-29px_rgba(17,35,20,.45)]">
              {section === "hero" ? (
                <SubpageHero data={ed.draft} preview />
              ) : section === "albums" ? (
                <GalleryAlbumsSection data={ed.draft} albums={albums} photos={photos} />
              ) : section === "about" ? (
                <GalleryAboutSection data={ed.draft} />
              ) : (
                <SubpageBottomCta data={ed.draft} settings={settings} preview />
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
export default function GallerySectionEditor() {
  const params = useParams<{ section: string }>();
  if (!isSubpageSection(params.section))
    return (
      <main id="main">
        <p>Nie znaleziono sekcji.</p>
      </main>
    );
  return <SectionEditor section={params.section} />;
}
