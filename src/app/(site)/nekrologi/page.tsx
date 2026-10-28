import type { Metadata } from "next";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import ObituariesListSection from "@/components/obituaries/obituaries-list-section";
import ObituariesInformationSection from "@/components/obituaries/obituaries-information-section";
import { getPublishedSubpageBlock } from "@/lib/subpages/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";

export const metadata: Metadata = {
  title: "Nekrologi | Janczak i Synowie",
  description: "Nekrologi i informacje o uroczystościach pożegnalnych – Janczak i Synowie, Żelazków.",
  robots: { index: false, follow: true },
};

type Query = { q?: string | string[]; cursor?: string | string[] };

export default async function ObituariesPage({ searchParams }: { searchParams: Promise<Query> }) {
  const [hero, bottom, settings] = await Promise.all([
    getPublishedSubpageBlock("nekrologi", "hero"),
    getPublishedSubpageBlock("nekrologi", "bottom"),
    getPublishedSiteSettings(),
  ]);
  return (
    <main id="main" className="bg-[#f8f4ec]">
      <SubpageHero data={hero} />
      <ObituariesListSection searchParams={searchParams} />
      <ObituariesInformationSection />
      <SubpageBottomCta data={bottom} settings={settings} />
    </main>
  );
}
