import HomeObituariesSection from "@/components/home-obituaries/home-obituaries-section";
import { getPublishedHomeObituaries } from "@/lib/home-obituaries/data";
import { getLatestObituaries } from "@/lib/obituaries/data";
import HomeFloristSection from "@/components/home-florist/home-florist-section";
import { getPublishedHomeFlorist } from "@/lib/home-florist/data";
import HomeServicesSection from "@/components/home-services/home-services-section";
import { getPublishedHomeServices } from "@/lib/home-services/data";
import HomeGuidanceSection from "@/components/home-guidance/home-guidance-section";
import { getPublishedHomeGuidance } from "@/lib/home-guidance/data";
import HomeAboutSection from "@/components/home-about/home-about-section";
import { getPublishedHomeAbout } from "@/lib/home-about/data";
import HeroSection from "@/components/hero/hero-section";
import { getPublishedHero } from "@/lib/hero/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";

export default async function Home() {
  const [hero, settings, about, guidance, services, florist, obituaries, entries] = await Promise.all([
    getPublishedHero(),
    getPublishedSiteSettings(),
    getPublishedHomeAbout(),
    getPublishedHomeGuidance(),
    getPublishedHomeServices(),
    getPublishedHomeFlorist(),
    getPublishedHomeObituaries(),
    getLatestObituaries(),
  ]);
  return (
    <main id="main" className="min-h-dvh bg-forest-deep">
      <HeroSection data={hero} settings={settings} showWave={false} />
      <div className="relative z-10 -mt-[clamp(3.25rem,5vw,5.75rem)]">
        <HomeAboutSection data={about} showBottomWave={false} />
      </div>
      <HomeGuidanceSection data={guidance} settings={settings} followedByServices />
      <HomeServicesSection data={services} joinsGuidance followedByFlorist />
      <HomeFloristSection data={florist} joinsServices followedByObituaries />
      <HomeObituariesSection data={obituaries} entries={entries} joinsFlorist />
    </main>
  );
}
