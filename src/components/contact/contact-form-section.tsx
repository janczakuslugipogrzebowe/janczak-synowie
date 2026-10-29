import { TbArrowUpRight, TbMessageCircle, TbPhoneCall } from "react-icons/tb";
import type { SiteSettings } from "@/lib/settings/schema";
import { normalizePhone } from "@/lib/settings/schema";
import type { ContactFormContent } from "@/lib/contact-page/schema";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import SubpageContainer from "@/components/subpages/subpage-container";
import ContactForm from "./contact-form";

export default function ContactFormSection({
  data,
  settings,
  preview = false,
}: {
  data: ContactFormContent;
  settings: SiteSettings;
  preview?: boolean;
}) {
  return (
    <section
      aria-labelledby="contact-form-title"
      className={`relative overflow-hidden bg-[#f0ebdf] text-[#193027] ${preview ? "py-12" : "py-[clamp(5rem,8vw,9rem)]"}`}
    >
      <SubpageContainer>
        {data.eyebrow && <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>}
        <h2
          id="contact-form-title"
          className="font-display leading-[1.08] tracking-[-.045em]"
          style={{ fontSize: `clamp(2.9rem,${(4.4 * data.headingScale) / 100}vw,5.75rem)` }}
        >
          {data.title}
        </h2>
        {data.description && (
          <p className="mt-5 max-w-[760px] text-[clamp(.98rem,1.1vw,1.14rem)] leading-[1.85] text-[#5a6c5f]">
            {data.description}
          </p>
        )}
        <div
          className={`mt-[clamp(2.75rem,5vw,5rem)] grid items-stretch gap-5 ${preview ? "2xl:grid-cols-[minmax(0,1.12fr)_minmax(0,.88fr)]" : "lg:grid-cols-[minmax(0,1.13fr)_minmax(0,.87fr)]"} xl:gap-7`}
        >
          <div
            className={`min-w-0 rounded-[24px] border border-[#e0d7c7] bg-[#fffdfa] shadow-[0_26px_65px_-58px_rgba(23,41,27,.4)] ${preview ? "p-5" : "p-[clamp(1.25rem,3vw,3rem)]"}`}
          >
            <ContactForm submitLabel={data.submitLabel} preview={preview} />
          </div>
          <aside className="relative isolate flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#d7d3c4] bg-[#e4e5da] p-[clamp(1.7rem,3.2vw,3.5rem)] text-[#1e3529]">
            <div className="w-full flex-1">
              {data.helpEyebrow && (
                <p className="text-[11px] font-bold uppercase tracking-[.24em] text-[#977950]">
                  {data.helpEyebrow}
                </p>
              )}
              <h3 className="mt-6 w-full font-display text-[clamp(2.6rem,3.05vw,4.25rem)] leading-[1.06] tracking-[-.04em] text-pretty">
                {data.helpTitle}
              </h3>
              <p className="mt-8 w-full whitespace-pre-line text-[clamp(1.05rem,1.22vw,1.22rem)] leading-[1.85] text-[#526657] text-pretty">
                {data.helpDescription}
              </p>
            </div>
            <div className="mt-auto pt-12">
              <div className="h-px w-full bg-[#bec7b8]" aria-hidden="true" />
              <p className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#6b7a6a]">
                <TbMessageCircle size={19} strokeWidth={1.5} aria-hidden="true" /> Bezpośredni kontakt
              </p>
              <p className="mt-3 text-sm leading-[1.8] text-[#526657]">
                Jeśli sprawa wymaga pilnej pomocy, prosimy o telefon.
              </p>
              <a
                href={`tel:${normalizePhone(settings.primaryPhone)}`}
                className="group mt-5 inline-flex min-h-12 items-center gap-3 rounded-full border border-[#9f8258]/50 bg-[#f8f7ee]/65 px-5 text-sm font-bold text-[#1c3526] transition-colors hover:border-[#937445] hover:bg-[#fffdfa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#92744f]"
              >
                <TbPhoneCall size={18} className="text-[#947750]" aria-hidden="true" />
                {settings.primaryPhone}
                <TbArrowUpRight
                  size={17}
                  className="text-[#947750] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </aside>
        </div>
      </SubpageContainer>
    </section>
  );
}
