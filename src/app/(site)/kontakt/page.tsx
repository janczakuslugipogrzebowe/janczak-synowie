import type { Metadata } from "next";
import SubpageHero from "@/components/subpages/subpage-hero";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import ContactDetailsSection from "@/components/contact/contact-details-section";
import ContactFormSection from "@/components/contact/contact-form-section";
import { getPublishedContactPageSection } from "@/lib/contact-page/data";
import { getPublishedSubpageBlock } from "@/lib/subpages/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";
export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Janczak i Synowie, Żelazków – telefon, adres, dojazd i formularz kontaktowy. Pomoc całodobowa.",
};
export default async function ContactPage() {
  const [hero, details, form, bottom, settings] = await Promise.all([
    getPublishedSubpageBlock("kontakt", "hero"),
    getPublishedContactPageSection("details"),
    getPublishedContactPageSection("form"),
    getPublishedSubpageBlock("kontakt", "bottom"),
    getPublishedSiteSettings(),
  ]);
  return (
    <main id="main" className="bg-[#f8f4ec]">
      <SubpageHero data={hero} />
      <ContactDetailsSection data={details} settings={settings} />
      <ContactFormSection data={form} settings={settings} />
      <SubpageBottomCta data={bottom} settings={settings} phoneOnly />
    </main>
  );
}
