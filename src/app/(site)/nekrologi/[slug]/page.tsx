import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ObituaryDetails from "@/components/obituaries/obituary-details";
import SubpageContainer from "@/components/subpages/subpage-container";
import SubpageBottomCta from "@/components/subpages/subpage-bottom-cta";
import { getPublicObituary } from "@/lib/obituaries/data";
import { getPublishedSubpageBlock } from "@/lib/subpages/data";
import { getPublishedSiteSettings } from "@/lib/settings/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ob = await getPublicObituary(slug);
  if (!ob) return { title: "Nie znaleziono nekrologu", robots: { index: false, follow: false } };
  const title = `${ob.firstName} ${ob.lastName} – nekrolog`;
  const description = `Nekrolog: ${ob.firstName} ${ob.lastName}. Informacje o uroczystości pożegnalnej – Janczak i Synowie.`;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://janczak-synowie.vercel.app");
  const canonicalPath = `/nekrologi/${ob.slug}`;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    robots: { index: ob.seoIndex, follow: ob.seoIndex },
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "pl_PL",
      siteName: "Janczak i Synowie – Usługi Pogrzebowe",
      url: canonicalPath,
      // The sibling opengraph-image.tsx creates a unique image for this record.
    },
  };
}

async function Content({ params }: Props) {
  const { slug } = await params;
  const ob = await getPublicObituary(slug);
  if (!ob) notFound();
  if (slug !== ob.slug) permanentRedirect(`/nekrologi/${ob.slug}`);
  return (
    <>
      <nav
        aria-label="Okruszki"
        className="mb-12 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-[#a38254]"
      >
        <span aria-hidden="true" className="mr-1 h-px w-8 bg-[#b89860]" />
        <Link href="/" className="cursor-pointer hover:text-[#193027]">
          Strona główna
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/nekrologi" className="cursor-pointer hover:text-[#193027]">
          Nekrologi
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="normal-case text-[#5a6b5d]">
          {ob.firstName} {ob.lastName}
        </span>
      </nav>
      <ObituaryDetails entry={ob} />
    </>
  );
}

export default async function ObituaryPage({ params }: Props) {
  const [bottom, settings] = await Promise.all([
    getPublishedSubpageBlock("nekrologi", "bottom"),
    getPublishedSiteSettings(),
  ]);
  return (
    <main id="main" className="bg-[#f8f4ec]">
      <section
        aria-label="Szczegóły nekrologu"
        className="min-h-[65dvh] pb-[clamp(5rem,8vw,9rem)] pt-[clamp(8rem,12vw,12rem)]"
      >
        <SubpageContainer>
          <Suspense
            fallback={
              <div role="status" className="py-24 text-center text-sm text-[#586b5d]">
                Wczytywanie nekrologu…
              </div>
            }
          >
            <Content params={params} />
          </Suspense>
        </SubpageContainer>
      </section>
      <SubpageBottomCta data={bottom} settings={settings} />
    </main>
  );
}
