import HeroSection from "@/components/hero/hero-section";
import { getPublishedHero } from "@/lib/hero/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";

export default async function Home() {
  const [hero, settings] = await Promise.all([getPublishedHero(), getPublishedSiteSettings()]);
  return (
    <main id="main" className="min-h-dvh bg-ivory">
      <HeroSection data={hero} settings={settings} />
    </main>
  );
}
