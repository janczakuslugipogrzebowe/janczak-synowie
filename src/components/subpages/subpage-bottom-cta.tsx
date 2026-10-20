import Image from "next/image";
import Link from "next/link";
import { TbArrowUpRight, TbPhoneCall } from "react-icons/tb";
import type { SubpageBlock } from "@/lib/subpages/schema";
import type { SiteSettings } from "@/lib/settings/schema";
import { normalizePhone } from "@/lib/settings/schema";
import SectionEyebrow from "./section-eyebrow";
import SubpageContainer from "./subpage-container";
export default function SubpageBottomCta({
  data,
  settings,
  preview = false,
}: {
  data: SubpageBlock;
  settings: SiteSettings;
  preview?: boolean;
}) {
  return (
    <section aria-label="Kontakt" className="relative isolate overflow-hidden bg-[#14251c] text-[#faf5ed]">
      {data.imageUrl && (
        <Image src={data.imageUrl} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      )}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#09150f]/95 via-[#09150f]/83 to-[#09150f]/40"
        style={{ opacity: data.overlay / 100 + 0.1 }}
      />
      <SubpageContainer
        className={`${preview ? "py-12" : "py-[clamp(5rem,8vw,9rem)]"} grid items-center gap-10 lg:grid-cols-[1.15fr_.75fr] lg:gap-[clamp(3rem,7vw,8rem)]`}
      >
        <div>
          <SectionEyebrow dark className="mb-6">
            {data.eyebrow}
          </SectionEyebrow>
          <h2
            className="max-w-[790px] font-display leading-[1.09] tracking-[-.04em]"
            style={{
              fontSize: `clamp(2.7rem, ${(4.3 * data.headingScale) / 100}vw, ${(5.6 * data.headingScale) / 100}rem)`,
            }}
          >
            {data.title}
          </h2>
          <p className="mt-7 max-w-2xl text-[clamp(1.02rem,1.2vw,1.22rem)] leading-[1.85] text-[#e4e6dc]/95">
            {data.description}
          </p>
        </div>
        <div className="w-full max-w-[500px] justify-self-start border-t border-[#E6C991]/45 pt-7 lg:justify-self-end">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#E6C991]">Pomoc całodobowa</p>
          <a
            href={`tel:${normalizePhone(settings.primaryPhone)}`}
            className="group mt-4 inline-flex cursor-pointer items-center gap-4 text-[#faf5ed] transition hover:text-[#E6C991]"
          >
            <span className="grid size-13 shrink-0 place-items-center rounded-full border border-[#E6C991]/60 text-[#E6C991] transition group-hover:bg-[#E6C991]/10">
              <TbPhoneCall size={25} />
            </span>
            <span className="font-display text-[clamp(2rem,2.7vw,3rem)] tracking-tight">
              {settings.primaryPhone}
            </span>
          </a>
          <Link
            href="/kontakt"
            className="mt-8 inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#E6C991] px-7 text-sm font-bold text-[#15251c] transition-all hover:-translate-y-0.5 hover:bg-[#f4dda9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E6C991] sm:w-auto sm:min-w-64"
          >
            {data.ctaText || "Przejdź do kontaktu"} <TbArrowUpRight size={20} />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-[#e4e6dc]/75">
            Chętnie udzielimy informacji i pomożemy wybrać odpowiednie rozwiązanie.
          </p>
        </div>
      </SubpageContainer>
    </section>
  );
}
