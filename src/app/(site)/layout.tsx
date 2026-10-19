import { Suspense } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/footer/site-footer";
import { getPublishedFooter } from "@/lib/footer/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";
import { getFooterCopyrightYear } from "@/lib/footer/year";

async function GlobalFooter() {
  const [data, settings, copyrightYear] = await Promise.all([
    getPublishedFooter(),
    getPublishedSiteSettings(),
    getFooterCopyrightYear(),
  ]);
  return <SiteFooter data={data} settings={settings} copyrightYear={copyrightYear} />;
}

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main"
        className="sr-only fixed left-5 top-3 z-[100] rounded bg-white px-4 py-3 text-forest focus:not-sr-only"
      >
        Przejdź do treści
      </a>
      <SiteHeader />
      {children}
      <Suspense fallback={<div aria-hidden="true" className="min-h-[260px] bg-[#0f1c16]" />}>
        <GlobalFooter />
      </Suspense>
    </>
  );
}
