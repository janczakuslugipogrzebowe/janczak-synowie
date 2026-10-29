import type { ReactNode } from "react";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import SubpageContainer from "@/components/subpages/subpage-container";
import type { ObituariesListingContent } from "@/lib/obituaries-page/schema";

/** Shared presentation for the public list and its live CMS preview. */
export default function ObituariesListFrame({
  data,
  children,
  preview = false,
}: {
  data: ObituariesListingContent;
  children: ReactNode;
  preview?: boolean;
}) {
  return (
    <section
      id={preview ? undefined : "lista-nekrologow"}
      aria-labelledby="obituaries-list-heading"
      className={`${preview ? "py-12" : "scroll-mt-24 py-[clamp(5rem,7.8vw,10rem)]"} bg-[#f8f4ec] text-[#193027]`}
    >
      <SubpageContainer>
        <div>
          {data.eyebrow && <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>}
          <h2
            id="obituaries-list-heading"
            className="max-w-5xl font-display leading-[1.04] tracking-[-.045em]"
            style={{
              fontSize: `clamp(2.9rem, ${(4.6 * data.headingScale) / 100}vw, ${(6 * data.headingScale) / 100}rem)`,
            }}
          >
            {data.title}
          </h2>
        </div>
        {children}
      </SubpageContainer>
    </section>
  );
}
