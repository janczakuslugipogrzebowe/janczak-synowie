import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { TbArrowLeft } from "react-icons/tb";
import SubpageContainer from "@/components/subpages/subpage-container";
import GalleryPhotoGrid from "@/components/gallery/gallery-photo-grid";
import { getPublishedGalleryData } from "@/lib/gallery/data";
import { galleryPhotoAlbum } from "@/lib/gallery/albums";

type Props = { params: Promise<{ slug: string }> };

// Metadata remains individual for every published album.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { albums } = await getPublishedGalleryData();
  const album = albums.find((entry) => entry.slug === slug && entry.published);
  return album
    ? {
        title: `${album.title} | Galeria Janczak i Synowie`,
        description: album.description,
      }
    : {
        title: "Album niedostępny",
        robots: { index: false, follow: false },
      };
}

function AlbumFallback() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[.27em] text-[#aa8857]">GALERIA</p>
      <h1 className="font-display text-[clamp(3.5rem,6vw,7rem)] leading-[1.03] tracking-[-.045em]">
        Ładowanie albumu…
      </h1>
      <div className="mt-[clamp(3rem,5vw,5.5rem)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="aspect-[1.4/1] rounded-xl bg-[#e8dfcf]" />
        <div className="hidden aspect-[1.4/1] rounded-xl bg-[#e8dfcf] sm:block" />
        <div className="hidden aspect-[1.4/1] rounded-xl bg-[#e8dfcf] lg:block" />
      </div>
    </div>
  );
}

// `params` are request-bound in Next.js 16. Read them only below Suspense.
async function AlbumContents({ params }: Props) {
  const { slug } = await params;
  const { albums, photos } = await getPublishedGalleryData();
  const album = albums.find((entry) => entry.slug === slug && entry.published);

  if (!album) notFound();

  const visible = photos
    .filter((photo) => photo.published && galleryPhotoAlbum(photo) === album.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[.27em] text-[#aa8857]">
        GALERIA / {album.title}
      </p>
      <h1 className="font-display text-[clamp(3.5rem,6vw,7rem)] leading-[1.03] tracking-[-.045em]">
        {album.title}
      </h1>
      {album.description && (
        <p className="mt-5 max-w-2xl text-[clamp(1rem,1.2vw,1.2rem)] leading-relaxed text-[#67766a]">
          {album.description}
        </p>
      )}
      <div className="mt-[clamp(3rem,5vw,5.5rem)]">
        {visible.length ? (
          <GalleryPhotoGrid photos={visible} />
        ) : (
          <div className="rounded-xl border border-[#dfd3c0] px-5 py-16 text-center text-[#6f776d]">
            W tym albumie nie ma jeszcze opublikowanych zdjęć.
          </div>
        )}
      </div>
    </>
  );
}

export default function AlbumPage({ params }: Props) {
  return (
    <main id="main" className="min-h-[65dvh] bg-[#f8f4ec] pb-28 pt-[clamp(7.5rem,12vw,11rem)] text-[#193027]">
      <SubpageContainer>
        <Link
          href="/galeria"
          className="mb-12 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#8b7049] hover:text-[#253d2d]"
        >
          <TbArrowLeft size={20} /> Wróć do galerii
        </Link>
        <Suspense fallback={<AlbumFallback />}>
          <AlbumContents params={params} />
        </Suspense>
      </SubpageContainer>
    </main>
  );
}
