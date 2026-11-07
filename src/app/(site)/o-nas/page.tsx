import type { Metadata } from "next";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import {
  AboutHistorySection,
  AboutPeopleSection,
  AboutValuesSection,
  AboutVillageSection,
} from "@/components/about/about-sections";
import { getPublishedSubpageBlock } from "@/lib/subpages/data";
import { getPublishedAboutSection } from "@/lib/about-page/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";

export const metadata: Metadata = {
  title: "O nas",
  description:
    "Poznaj rodzinną firmę pogrzebową Janczak i Synowie z Żelazkowa: historię działalności, ludzi, podejście do rodzin i lokalne korzenie.",
};
export default async function AboutPage() {
  const [hero, history, people, values, village, bottom, settings] = await Promise.all([
    getPublishedSubpageBlock("o-nas", "hero"),
    getPublishedAboutSection("history"),
    getPublishedAboutSection("people"),
    getPublishedAboutSection("values"),
    getPublishedAboutSection("village"),
    getPublishedSubpageBlock("o-nas", "bottom"),
    getPublishedSiteSettings(),
  ]);
  return (
    <main id="main" className="bg-[#f8f4ec]">
      <SubpageHero data={hero} />
      <AboutHistorySection data={history} />
      <AboutPeopleSection data={people} />
      <AboutValuesSection data={values} />
      <AboutVillageSection data={village} />
      <SubpageBottomCta data={bottom} settings={settings} />
    </main>
  );
}
