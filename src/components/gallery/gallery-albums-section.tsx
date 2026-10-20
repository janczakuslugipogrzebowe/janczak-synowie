import GalleryAlbumCard from "./gallery-album-card";
import SubpageContainer from "@/components/subpages/subpage-container";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import type { GalleryAlbum } from "@/lib/gallery/albums";
import { galleryPhotoAlbum } from "@/lib/gallery/albums";
import type { GalleryPhoto } from "@/lib/gallery/schema";
import type { SubpageBlock } from "@/lib/subpages/schema";
export default function GalleryAlbumsSection({
  data,
  albums,
  photos,
}: {
  data: SubpageBlock;
  albums: GalleryAlbum[];
  photos: GalleryPhoto[];
}) {
  const active = albums.filter((a) => a.published).sort((a, b) => a.order - b.order);
  return (
    <section
      aria-labelledby="albums-heading"
      className="bg-[#f8f4ec] py-[clamp(4.5rem,7vw,8.5rem)] text-[#193027]"
    >
      <SubpageContainer>
        <header className="mb-[clamp(2.25rem,4vw,4.5rem)] max-w-4xl">
          <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>
          <h2
            id="albums-heading"
            className="font-display leading-[1.12] tracking-[-.04em]"
            style={{ fontSize: `clamp(2.6rem,${(4.0 * data.headingScale) / 100}vw,5rem)` }}
          >
            {data.title}
          </h2>
          <p className="mt-5 text-[clamp(.95rem,1.1vw,1.1rem)] leading-relaxed text-[#5b6c60]">
            {data.description}
          </p>
        </header>
        {active.length ? (
          <div className="grid gap-5 md:grid-cols-2 3xl:gap-9">
            {active.map((a) => (
              <GalleryAlbumCard
                key={a.id}
                album={a}
                count={photos.filter((p) => p.published && galleryPhotoAlbum(p) === a.id).length}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-[#e0d5bf] px-6 py-12 text-center text-[#66766b]">
            Galeria jest w przygotowaniu.
          </p>
        )}
      </SubpageContainer>
    </section>
  );
}
