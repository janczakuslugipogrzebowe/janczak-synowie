import { TbCalendarEvent, TbMapPin } from "react-icons/tb";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import SubpageContainer from "@/components/subpages/subpage-container";

export default function ObituariesInformationSection() {
  return (
    <section aria-labelledby="obituaries-information-heading" className="bg-[#f0ebdf] py-[clamp(5rem,7.8vw,9rem)] text-[#193027]">
      <SubpageContainer className="grid items-center gap-[clamp(3rem,7vw,10rem)] lg:grid-cols-[minmax(0,1.03fr)_minmax(0,.97fr)]">
        <div>
          <SectionEyebrow className="mb-5">INFORMACJE DLA BLISKICH</SectionEyebrow>
          <h2 id="obituaries-information-heading" className="max-w-[810px] font-display text-[clamp(2.9rem,4.25vw,5.6rem)] leading-[1.07] tracking-[-.045em]">
            Szczegóły ostatniego pożegnania
          </h2>
          <p className="mt-7 max-w-[620px] text-[clamp(.98rem,1.08vw,1.15rem)] leading-[1.95] text-[#5a6c5f]">
            Każde pożegnanie jest wyjątkowym momentem. Przy opublikowanych nekrologach udostępniamy dostępne informacje dotyczące uroczystości, takie jak data i miejsce ceremonii oraz miejsce pochówku, jeśli zostały podane.
          </p>
        </div>
        <div className="lg:pl-8">
          <div className="flex gap-5 py-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[#bda579]/60 text-[#a78652]">
              <TbCalendarEvent aria-hidden="true" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-[clamp(1.7rem,2.1vw,2.45rem)] leading-tight">Termin uroczystości</h3>
              <p className="mt-2 max-w-md text-sm leading-[1.8] text-[#617064] sm:text-base">
                W szczegółach nekrologu może znajdować się data, godzina i miejsce ostatniego pożegnania.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-5 border-t border-[#cbbfa8]/70 py-8">
            <div className="grid size-12 shrink-0 place-items-center rounded-full border border-[#bda579]/60 text-[#a78652]">
              <TbMapPin aria-hidden="true" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-[clamp(1.7rem,2.1vw,2.45rem)] leading-tight">Miejsce pochówku</h3>
              <p className="mt-2 max-w-md text-sm leading-[1.8] text-[#617064] sm:text-base">
                Jeśli informacja została udostępniona, można ją sprawdzić po otwarciu wybranego nekrologu.
              </p>
            </div>
          </div>
        </div>
      </SubpageContainer>
    </section>
  );
}
