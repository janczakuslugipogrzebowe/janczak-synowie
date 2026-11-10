import Image from "next/image";
import Link from "next/link";
import { TbArrowUpRight, TbCheck, TbFileText } from "react-icons/tb";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import SubpageContainer from "@/components/subpages/subpage-container";
import type { OfferFormalities, OfferProcess, OfferFlorist } from "@/lib/offer/schema";

const titleStyle = (scale: number) => ({
  fontSize: `clamp(2.75rem, ${(4.4 * scale) / 100}vw, ${(5.7 * scale) / 100}rem)`,
});

export function OfferFormalitiesSection({ data }: { data: OfferFormalities }) {
  return (
    <section
      id="formalnosci"
      aria-labelledby="offer-formalities-heading"
      className="relative isolate overflow-hidden bg-[#16291e] py-[clamp(5rem,8vw,9rem)] text-[#faf6ed]"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-32 size-[38rem] rounded-full border border-[#e3c997]/10"
        aria-hidden="true"
      />
      <SubpageContainer className="relative">
        <SectionEyebrow dark className="mb-6">
          {data.eyebrow}
        </SectionEyebrow>
        <h2
          id="offer-formalities-heading"
          className="max-w-[960px] font-display leading-[1.04] tracking-[-.04em]"
          style={titleStyle(data.headingScale)}
        >
          {data.title}
        </h2>
        <p className="mt-6 max-w-[800px] whitespace-pre-line text-[clamp(1rem,1.15vw,1.2rem)] leading-[1.9] text-[#d5dfd3]">
          {data.description}
        </p>
        <div className="mt-[clamp(3rem,5vw,5rem)] grid gap-5 lg:grid-cols-2">
          {data.benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#e3c997]/25 bg-white/5 p-[clamp(1.7rem,3vw,3rem)]"
            >
              <TbFileText className="text-[#e3c997]" size={28} strokeWidth={1.35} />
              <h3 className="mt-7 font-display text-[clamp(2.1rem,2.7vw,3rem)]">{benefit.title}</h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-[1.85] text-[#d3decf]">
                {benefit.description}
              </p>
              <ul className="mt-6 grid gap-3">
                {benefit.points.map((point) => (
                  <li className="flex items-start gap-3 text-sm text-[#f1f0e8]" key={point}>
                    <TbCheck className="mt-0.5 shrink-0 text-[#e3c997]" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {data.note && <p className="mt-7 max-w-3xl text-sm leading-relaxed text-[#c4d1c4]">{data.note}</p>}
        <Link
          href="/dokumenty"
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#e5ca96] px-7 py-4 text-sm font-bold text-[#1b3024] transition-colors hover:bg-[#f5dba9]"
        >
          <TbFileText size={19} /> Przejdź do dokumentów <TbArrowUpRight size={18} />
        </Link>
      </SubpageContainer>
    </section>
  );
}
export function OfferProcessSection({ data }: { data: OfferProcess }) {
  return (
    <section
      id="wspolpraca"
      aria-labelledby="offer-process-heading"
      className="bg-[#f8f4ec] py-[clamp(5rem,8vw,9rem)]"
    >
      <SubpageContainer>
        <SectionEyebrow className="mb-6">{data.eyebrow}</SectionEyebrow>
        <h2
          id="offer-process-heading"
          className="max-w-[900px] font-display leading-[1.05] tracking-[-.04em] text-[#172e22]"
          style={titleStyle(data.headingScale)}
        >
          {data.title}
        </h2>
        <p className="mt-6 max-w-[740px] whitespace-pre-line text-[clamp(1rem,1.1vw,1.16rem)] leading-[1.85] text-[#5d6a60]">
          {data.description}
        </p>
        <ol className="mt-[clamp(3.5rem,6vw,6rem)] grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {data.steps.map((step, i) => (
            <li className="border-t border-[#bca47e] pt-6" key={i}>
              <span className="font-display text-[clamp(2.5rem,4vw,4.5rem)] leading-none text-[#b69b75]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-display text-[clamp(1.75rem,2vw,2.45rem)] leading-[1.12] text-[#203b2b]">
                {step.title}
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-[1.85] text-[#596a5e]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </SubpageContainer>
    </section>
  );
}
export function OfferFloristSection({ data }: { data: OfferFlorist }) {
  return (
    <section
      id="kwiaciarnia"
      aria-labelledby="offer-florist-heading"
      className="scroll-mt-16 bg-[#e9ebe3] py-[clamp(5rem,8vw,9rem)]"
    >
      <SubpageContainer className="grid items-center gap-[clamp(2.5rem,5vw,7rem)] lg:grid-cols-[.92fr_1.08fr]">
        <div className="relative min-h-[320px] overflow-hidden rounded-[1.4rem] bg-[#d9e1d5] shadow-[0_20px_60px_-37px_rgba(27,42,29,.33)] lg:min-h-[560px]">
          {data.imageUrl && (
            <Image
              src={data.imageUrl}
              alt="Kompozycje kwiatowe z kwiaciarni"
              fill
              sizes="(min-width:1024px) 42vw, 92vw"
              className="object-cover"
              style={{ objectPosition: `${data.imagePositionX}% ${data.imagePositionY}%` }}
            />
          )}
        </div>
        <div>
          <SectionEyebrow className="mb-6">{data.eyebrow}</SectionEyebrow>
          <h2
            id="offer-florist-heading"
            className="font-display leading-[1.05] tracking-[-.04em] text-[#1b3125]"
            style={titleStyle(data.headingScale)}
          >
            {data.title}
          </h2>
          <p className="mt-6 whitespace-pre-line text-[clamp(1rem,1.15vw,1.2rem)] leading-[1.9] text-[#56695b]">
            {data.description}
          </p>
          {data.points.length > 0 && (
            <ul className="mt-7 space-y-3">
              {data.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-[#344c3b]">
                  <TbCheck className="shrink-0 text-[#967445]" />
                  {point}
                </li>
              ))}
            </ul>
          )}
          {data.hours && (
            <p className="mt-7 border-t border-[#ced4c7] pt-5 text-sm leading-relaxed text-[#526352]">
              <span className="font-semibold">Godziny kwiaciarni: </span>
              {data.hours}
            </p>
          )}
          <Link
            href="/kontakt"
            className="mt-8 inline-flex items-center gap-2 border-b border-[#93774f] pb-1 text-sm font-bold text-[#775a31]"
          >
            Zapytaj o kompozycje <TbArrowUpRight />
          </Link>
        </div>
      </SubpageContainer>
    </section>
  );
}
