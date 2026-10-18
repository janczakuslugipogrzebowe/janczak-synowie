import type { Metadata } from "next";
import { PAGE_LABELS } from "@/lib/pages/schema";
import { getPublishedDocumentsLibrary } from "@/lib/documents/data";
import { publishedDocuments } from "@/lib/documents/schema";
import { TbDownload, TbFileText, TbArrowUpRight } from "react-icons/tb";

export const metadata: Metadata = { title: PAGE_LABELS.dokumenty };

export default async function DocumentsPage() {
  const library = await getPublishedDocumentsLibrary();
  const documents = publishedDocuments(library);
  return (
    <>
      <section
        aria-labelledby="documents-downloads-title"
        className="bg-[#f6f1e8] pb-[clamp(5rem,10vw,11rem)] text-[#1b3027]"
      >
        <div className="mx-auto w-[min(90%,1680px)] border-t border-[#d9cfbc] pt-[clamp(3rem,5vw,6rem)] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)]">
          <p className="text-[.72rem] font-bold uppercase tracking-[.25em] text-[#a18152]">FORMULARZE PDF</p>
          <h2
            id="documents-downloads-title"
            className="mt-4 max-w-4xl font-display text-[clamp(2.8rem,5vw,6.6rem)] font-medium leading-[.99] tracking-[-.035em]"
          >
            Dokumenty do pobrania
          </h2>
          <div className="mt-[clamp(2rem,3vw,4rem)] divide-y divide-[#d9d0be] border-y border-[#d9d0be]">
            {documents.map((item, index) => {
              const external = item.href.startsWith("https://");
              return (
                <a
                  key={item.id}
                  href={item.href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : { download: item.href.slice(1) })}
                  className="group flex min-h-[110px] items-center gap-4 py-5 transition-colors hover:bg-[#efe8da]/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#97784f] sm:gap-7 sm:px-4"
                >
                  <span className="hidden font-display text-2xl tabular-nums text-[#aa9069] sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#d9c9ac] bg-[#fdfaf4] text-[#a28052] sm:size-15">
                    <TbFileText size={25} strokeWidth={1.45} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[clamp(1.5rem,2vw,2.15rem)] leading-[1.08]">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5a695f]">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#c8b18c] text-[#8d704a] transition-all duration-300 group-hover:bg-[#1a2b22] group-hover:text-[#f2dfb9] sm:size-13">
                    {external ? (
                      <TbArrowUpRight size={22} aria-hidden="true" />
                    ) : (
                      <TbDownload size={22} aria-hidden="true" />
                    )}
                  </span>
                  <span className="sr-only">{external ? "Otwórz dokument PDF" : "Pobierz dokument PDF"}</span>
                </a>
              );
            })}
            {documents.length === 0 && (
              <p className="py-12 text-[#536359]">Obecnie nie ma dostępnych dokumentów.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
