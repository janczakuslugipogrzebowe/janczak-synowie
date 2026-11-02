import type { Metadata } from "next";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import { getPublishedSubpageBlock } from "@/lib/subpages/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";
import { getPublishedOfferSection } from "@/lib/offer/data";
import { getPublishedOfferServices } from "@/lib/offer/services-data";
import { OfferFormalitiesSection, OfferProcessSection, OfferFloristSection } from "@/components/offer/offer-sections";
import OfferExplorer from "@/components/offer/offer-explorer";

export const metadata: Metadata = {
  title: "Oferta usług pogrzebowych",
  description: "Kompleksowa organizacja pogrzebów, transport zmarłych, kremacje, trumny i urny, pomoc w formalnościach ZUS i KRUS oraz florystyka – Janczak i Synowie, Żelazków.",
};
export default async function OfferPage() {
  const [hero, intro, catalog, services, formalities, process, florist, bottom, settings] = await Promise.all([
    getPublishedSubpageBlock("oferta", "hero"), getPublishedOfferSection("intro"),
    getPublishedOfferSection("catalog"), getPublishedOfferServices(), getPublishedOfferSection("formalities"),
    getPublishedOfferSection("process"), getPublishedOfferSection("florist"),
    getPublishedSubpageBlock("oferta", "bottom"), getPublishedSiteSettings(),
  ]);
  return <main id="main">
    <SubpageHero data={hero}/>
    <OfferExplorer intro={intro} heading={catalog} catalog={services}/>
    <OfferFormalitiesSection data={formalities}/>
    <OfferProcessSection data={process}/>
    <OfferFloristSection data={florist}/>
    <SubpageBottomCta data={bottom} settings={settings}/>
  </main>;
}
