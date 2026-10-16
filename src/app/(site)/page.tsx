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
  const [hero, settings, about, guidance, services] = await Promise.all([getPublishedHero(), getPublishedSiteSettings(), getPublishedHomeAbout(), getPublishedHomeGuidance(), getPublishedHomeServices()]);
  return (
    <main id="main" className="min-h-dvh bg-forest-deep">
      <HeroSection data={hero} settings={settings} showWave={false} />
      <div className="relative z-10 -mt-[clamp(3.25rem,5vw,5.75rem)]">
        <HomeAboutSection data={about} showBottomWave={false} />
      </div>
      <HomeGuidanceSection data={guidance} settings={settings} followedByServices />
      <HomeServicesSection data={services} joinsGuidance />
    </main>
  );
}
