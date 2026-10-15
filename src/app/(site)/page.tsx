import HomeAboutSection from "@/components/home-about/home-about-section";
import { getPublishedHomeAbout } from "@/lib/home-about/data";
import HeroSection from "@/components/hero/hero-section";
import { getPublishedHero } from "@/lib/hero/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";

export default async function Home() {
  const [hero, settings, about] = await Promise.all([getPublishedHero(), getPublishedSiteSettings(), getPublishedHomeAbout()]);
  return (
    <main id="main" className="min-h-dvh bg-forest-deep">
      <HeroSection data={hero} settings={settings} showWave={false} />
      <div className="relative z-10 -mt-[clamp(3.25rem,5vw,5.75rem)]">
        <HomeAboutSection data={about} />
      </div>
    </main>
  );
}
