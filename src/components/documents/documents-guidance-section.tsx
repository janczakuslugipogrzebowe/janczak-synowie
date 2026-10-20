import SectionEyebrow from "@/components/subpages/section-eyebrow";
import SubpageContainer from "@/components/subpages/subpage-container";
import type { GuidanceContent } from "@/lib/documents-page/schema";

export default function DocumentsGuidanceSection({ data }: { data: GuidanceContent }) {
  return (
    <section
      aria-labelledby="documents-guidance-title"
      className="border-y border-[#dfd6c5] bg-[#f0ebdf] py-[clamp(5rem,7.8vw,9rem)] text-[#193027]"
    >
      <SubpageContainer className="grid items-start gap-[clamp(3rem,7vw,10rem)] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <header className="lg:sticky lg:top-28">
          <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>
          <h2
            id="documents-guidance-title"
            className="max-w-[820px] font-display leading-[1.08] tracking-[-.04em]"
            style={{ fontSize: `clamp(2.8rem,${(4.1 * data.headingScale) / 100}vw,5.5rem)` }}
          >
            {data.title}
          </h2>
          <div className="mt-7 h-px w-20 bg-[#bd9862]" aria-hidden="true" />
          <p className="mt-7 max-w-xl text-[clamp(.98rem,1.08vw,1.15rem)] leading-[1.9] text-[#5a6c5f]">
            {data.description}
          </p>
        </header>
        <ol className="border-t border-[#cbbfa8]">
          {data.steps.map((step, index) => (
            <li
              key={index}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 border-b border-[#cbbfa8] py-[clamp(1.7rem,3vw,3.1rem)] sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-6"
            >
              <span aria-hidden="true" className="font-display text-[clamp(2rem,3vw,3.5rem)] leading-none text-[#ad9167]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-[clamp(1.75rem,2.2vw,2.85rem)] leading-[1.1] tracking-[-.025em]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-[clamp(.93rem,1vw,1.07rem)] leading-[1.85] text-[#5e6f62]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </SubpageContainer>
    </section>
  );
}
