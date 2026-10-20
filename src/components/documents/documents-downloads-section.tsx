import { TbInfoCircle } from "react-icons/tb";
import type { PublicDocument } from "@/lib/documents/schema";
import type { DownloadsContent } from "@/lib/documents-page/schema";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import SubpageContainer from "@/components/subpages/subpage-container";
import DocumentDownloadRow from "./document-download-row";

export default function DocumentsDownloadsSection({
  data,
  documents,
}: {
  data: DownloadsContent;
  documents: PublicDocument[];
}) {
  return (
    <section
      aria-labelledby="documents-downloads-title"
      className="bg-[#f8f4ec] py-[clamp(5rem,7.8vw,10rem)] text-[#193027]"
    >
      <SubpageContainer>
        <div className="grid items-end gap-8 border-b border-[#d9d0be] pb-[clamp(2.5rem,4vw,4.5rem)] lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,.58fr)] lg:gap-20">
          <div>
            <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>
            <h2
              id="documents-downloads-title"
              className="max-w-5xl font-display leading-[1.06] tracking-[-.045em]"
              style={{ fontSize: `clamp(2.8rem,${(4.5 * data.headingScale) / 100}vw,6rem)` }}
            >
              {data.title}
            </h2>
            <div aria-hidden="true" className="mt-7 h-px w-20 bg-[#bd9862]" />
          </div>
          <p className="max-w-[480px] pb-1 text-[clamp(.98rem,1.05vw,1.14rem)] leading-[1.85] text-[#58695c]">
            {data.description}
          </p>
        </div>
        {documents.length ? (
          <ul className="divide-y divide-[#ded5c4] border-b border-[#d9d0be]">
            {documents.map((item, index) => (
              <DocumentDownloadRow key={item.id} document={item} index={index} />
            ))}
          </ul>
        ) : (
          <div className="border-b border-[#d9d0be] py-14 text-[#657468]" role="status">
            Obecnie nie ma dokumentów do pobrania. W razie pytań zapraszamy do kontaktu.
          </div>
        )}
        {data.note && (
          <div className="mt-7 flex max-w-4xl items-start gap-3 text-sm leading-[1.8] text-[#637062] lg:mt-10">
            <TbInfoCircle aria-hidden="true" size={22} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#ac8a56]" />
            <p>{data.note}</p>
          </div>
        )}
      </SubpageContainer>
    </section>
  );
}
