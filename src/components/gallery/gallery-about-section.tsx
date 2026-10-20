import { TbHeartHandshake, TbRosette, TbFlower } from "react-icons/tb";
import SubpageContainer from "@/components/subpages/subpage-container";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import type { SubpageBlock } from "@/lib/subpages/schema";
export default function GalleryAboutSection({ data }: { data: SubpageBlock }) {
  const icons = [TbHeartHandshake, TbRosette, TbFlower];
  const points = data.ctaText
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 3);
  return (
    <section
      aria-labelledby="gallery-about-title"
      className="border-y border-[#e1dacb] bg-[#f0ebdf] py-[clamp(4rem,6vw,7rem)] text-[#182b21]"
    >
      <SubpageContainer className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
        <div>
          <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>
          <h2
            id="gallery-about-title"
            className="max-w-3xl font-display leading-[1.08] tracking-[-.04em]"
            style={{ fontSize: `clamp(2.7rem,${(4.1 * data.headingScale) / 100}vw,5.3rem)` }}
          >
            {data.title}
          </h2>
          <div className="mt-6 h-px w-18 bg-[#C4A16A]" />
          <p className="mt-6 max-w-2xl text-[clamp(.95rem,1.05vw,1.1rem)] leading-[1.9] text-[#56675b]">
            {data.description}
          </p>
        </div>
        <ul className="grid gap-6 border-l border-[#d6c9b2] pl-[clamp(1.4rem,4vw,4.5rem)]">
          {points.map((title, i) => {
            const Icon = icons[i];
            return (
              <li key={`${title}-${i}`} className="flex items-center gap-5">
                <span className="grid size-13 shrink-0 place-items-center rounded-full border border-[#C4A16A] text-[#B89860]">
                  <Icon size={26} strokeWidth={1.3} />
                </span>
                <span className="font-display text-[clamp(1.35rem,1.8vw,2rem)]">{title}</span>
              </li>
            );
          })}
        </ul>
      </SubpageContainer>
    </section>
  );
}
