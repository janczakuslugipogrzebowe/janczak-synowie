import { TbCalendarEvent, TbMapPin } from "react-icons/tb";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import SubpageContainer from "@/components/subpages/subpage-container";
import type { ObituariesInformationContent } from "@/lib/obituaries-page/schema";

export default function ObituariesInformationSection({
  data,
  preview = false,
}: {
  data: ObituariesInformationContent;
  preview?: boolean;
}) {
  return (
    <section
      aria-labelledby="obituaries-information-heading"
      className={`bg-[#f0ebdf] ${preview ? "py-12" : "py-[clamp(5rem,7.8vw,9rem)]"} text-[#193027]`}
    >
      <SubpageContainer className="grid items-center gap-[clamp(3rem,7vw,10rem)] lg:grid-cols-[minmax(0,1.03fr)_minmax(0,.97fr)]">
        <div>
          {data.eyebrow && <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>}
          <h2
            id="obituaries-information-heading"
            className="max-w-[810px] font-display leading-[1.07] tracking-[-.045em]"
            style={{
              fontSize: `clamp(2.9rem, ${(4.25 * data.headingScale) / 100}vw, ${(5.6 * data.headingScale) / 100}rem)`,
            }}
          >
            {data.title}
          </h2>
          {data.description && (
            <p className="mt-7 max-w-[620px] text-[clamp(.98rem,1.08vw,1.15rem)] leading-[1.95] text-[#5a6c5f]">
              {data.description}
            </p>
          )}
        </div>
        <div className="lg:pl-8">
          <div className="flex gap-5 py-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[#bda579]/60 text-[#a78652]">
              <TbCalendarEvent aria-hidden="true" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-[clamp(1.7rem,2.1vw,2.45rem)] leading-tight">
                {data.ceremonyTitle}
              </h3>
              {data.ceremonyDescription && (
                <p className="mt-2 max-w-md text-sm leading-[1.8] text-[#617064] sm:text-base">
                  {data.ceremonyDescription}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-5 border-t border-[#cbbfa8]/70 py-8">
            <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[#bda579]/60 text-[#a78652]">
              <TbMapPin aria-hidden="true" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-[clamp(1.7rem,2.1vw,2.45rem)] leading-tight">
                {data.burialTitle}
              </h3>
              {data.burialDescription && (
                <p className="mt-2 max-w-md text-sm leading-[1.8] text-[#617064] sm:text-base">
                  {data.burialDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </SubpageContainer>
    </section>
  );
}
