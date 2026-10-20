import type { Metadata } from "next";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import DocumentsDownloadsSection from "@/components/documents/documents-downloads-section";
import DocumentsGuidanceSection from "@/components/documents/documents-guidance-section";
import { getPublishedSubpageBlock } from "@/lib/subpages/data";
import { getPublishedDocumentsPageSection } from "@/lib/documents-page/data";
import { getPublishedDocumentsLibrary } from "@/lib/documents/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";

export const metadata: Metadata = {
  title: "Dokumenty | Janczak i Synowie",
  description:
    "Przydatne dokumenty i formularze do pobrania, w tym wnioski o zasiłek pogrzebowy ZUS, KRUS, WBE i MSWiA. Janczak i Synowie – Żelazków.",
};

export default async function DocumentsPage() {
  const [hero, downloads, guidance, bottom, library, settings] = await Promise.all([
    getPublishedSubpageBlock("dokumenty", "hero"),
    getPublishedDocumentsPageSection("downloads"),
    getPublishedDocumentsPageSection("guidance"),
    getPublishedSubpageBlock("dokumenty", "bottom"),
    getPublishedDocumentsLibrary(),
    getPublishedSiteSettings(),
  ]);
  return (
    <main id="main" className="bg-[#f8f4ec]">
      <SubpageHero data={hero} />
      <DocumentsDownloadsSection data={downloads} documents={library} />
      <DocumentsGuidanceSection data={guidance} />
      <SubpageBottomCta data={bottom} settings={settings} />
    </main>
  );
}
