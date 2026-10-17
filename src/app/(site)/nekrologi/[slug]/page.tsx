import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ObituaryDetails from "@/components/obituaries/obituary-details";
import { getPublicObituary } from "@/lib/obituaries/data";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ob = await getPublicObituary(slug);
  if (!ob) return { title: "Nie znaleziono nekrologu", robots: { index: false, follow: false } };
  const title = `${ob.firstName} ${ob.lastName} – nekrolog`;
  return {
    title,
    description: `Nekrolog: ${ob.firstName} ${ob.lastName}. Informacje o uroczystości pożegnalnej – Janczak i Synowie.`,
    robots: { index: ob.seoIndex, follow: ob.seoIndex },
    alternates: { canonical: `/nekrologi/${ob.slug}` },
    openGraph: { title, description: `Wspomnienie ${ob.firstName} ${ob.lastName}`, type: "article" },
  };
}
async function Content({ params }: Props) {
  const { slug } = await params;
  const ob = await getPublicObituary(slug);
  if (!ob) notFound();
  if (slug !== ob.slug) permanentRedirect(`/nekrologi/${ob.slug}`);
  return <ObituaryDetails entry={ob} />;
}
export default function ObituaryPage({ params }: Props) {
  return (
    <main id="main" className="min-h-dvh bg-ivory px-4 pb-24 pt-[clamp(8rem,13vw,13rem)] sm:px-8">
      <Suspense fallback={<p className="text-center text-sm text-[#586b5d]">Wczytywanie nekrologu…</p>}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}
