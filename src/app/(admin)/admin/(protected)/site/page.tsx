import Link from "next/link";
import type { Metadata } from "next";
import { TbArrowUpRight, TbLayoutGrid, TbPhoto } from "react-icons/tb";
import { PageHeading, surfaceClass } from "@/components/ui/admin-fields";
import { PAGE_SLUGS, PAGE_LABELS } from "@/lib/pages/schema";
export const metadata: Metadata = { title: "Edytor witryny" };
export default function SiteEditorHome() {
  return (
    <main id="main">
      <PageHeading eyebrow="Zarządzanie treścią" title="Edytor witryny" />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <Link
          href="/admin/site/home/hero"
          className={`${surfaceClass} group p-7 transition hover:-translate-y-0.5 hover:shadow-md`}
        >
          <TbPhoto className="size-8 text-[#a1835e]" />
          <h2 className="mt-6 font-display text-4xl font-semibold">Strona główna</h2>
          <p className="mt-2 text-xs text-[#727d74]">
            Hero · O nas · Co zrobić · Usługi · Kwiaciarnia · Nekrologi · Dokumenty
          </p>
          <TbArrowUpRight size={20} className="ml-auto mt-6 text-[#a1835e]" />
        </Link>
        {PAGE_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={`/admin/site/${slug}`}
            className={`${surfaceClass} group p-7 transition hover:-translate-y-0.5 hover:shadow-md`}
          >
            <TbLayoutGrid className="size-8 text-[#a1835e]" />
            <h2 className="mt-6 font-display text-4xl font-semibold">{PAGE_LABELS[slug]}</h2>
            <p className="mt-2 text-xs text-[#727d74]">Sekcja wprowadzająca</p>
            <TbArrowUpRight size={20} className="ml-auto mt-6 text-[#a1835e]" />
          </Link>
        ))}
      </div>
    </main>
  );
}
