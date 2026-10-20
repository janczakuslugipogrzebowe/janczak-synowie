import type { Metadata } from "next";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import GalleryAlbumsSection from "@/components/gallery/gallery-albums-section";
import GalleryAboutSection from "@/components/gallery/gallery-about-section";
import { getPublishedGalleryData } from "@/lib/gallery/data";
import { getPublishedSubpageBlock } from "@/lib/subpages/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";
export const metadata: Metadata = {
  title: "Galeria | Janczak i Synowie",
  description: "Poznaj naszą siedzibę, pojazdy, wyposażenie i oprawę florystyczną uroczystości.",
};
export default async function GalleryPage() {
  const [hero, albumsData, about, bottom, library, settings] = await Promise.all([
    getPublishedSubpageBlock("galeria", "hero"),
    getPublishedSubpageBlock("galeria", "albums"),
    getPublishedSubpageBlock("galeria", "about"),
    getPublishedSubpageBlock("galeria", "bottom"),
    getPublishedGalleryData(),
    getPublishedSiteSettings(),
  ]);
  return (
    <main id="main" className="bg-[#f8f4ec]">
      <SubpageHero data={hero} />
      <GalleryAlbumsSection data={albumsData} albums={library.albums} photos={library.photos} />
      <GalleryAboutSection data={about} />
      <SubpageBottomCta data={bottom} settings={settings} />
    </main>
  );
}
