import { TbArrowUpRight, TbDownload, TbFileText } from "react-icons/tb";
import type { PublicDocument } from "@/lib/documents/schema";

export default function DocumentDownloadRow({ document, index }: { document: PublicDocument; index: number }) {
  const external = document.href.startsWith("https://");
  return (
    <li>
      <a
        href={document.href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : { download: document.href.slice(1) })}
        aria-label={`${external ? "Otwórz" : "Pobierz"} PDF: ${document.title}${external ? " (nowa karta)" : ""}`}
        className="group flex min-h-[114px] cursor-pointer items-center gap-[clamp(.75rem,1.8vw,2rem)] px-1 py-6 transition-colors duration-300 hover:bg-[#f0ebe0]/65 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A27F48] sm:px-5 lg:min-h-[134px] lg:py-7"
      >
        <span className="hidden w-10 shrink-0 font-display text-[clamp(1.45rem,1.8vw,2rem)] tabular-nums text-[#b5a17d] sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="grid size-[clamp(3rem,4vw,4.25rem)] shrink-0 place-items-center rounded-full border border-[#d7c9ad] bg-[#fdfbf6] text-[#a6895d] transition-colors duration-300 group-hover:border-[#a98b5f] group-hover:bg-white">
          <TbFileText aria-hidden="true" className="size-[clamp(1.5rem,2vw,2rem)]" strokeWidth={1.4} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[clamp(1.4rem,2.2vw,2.55rem)] leading-[1.15] tracking-[-.025em] text-[#1b3127] transition-colors group-hover:text-[#8a6a3b]">
            {document.title}
          </span>
          {document.description && (
            <span className="mt-2 block max-w-3xl text-[clamp(.83rem,.95vw,1rem)] leading-[1.7] text-[#667267]">
              {document.description}
            </span>
          )}
        </span>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#c7b28a] text-[#8e724b] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#1c3328] group-hover:bg-[#1c3328] group-hover:text-[#E6C991] sm:size-13">
          {external ? <TbArrowUpRight aria-hidden="true" size={22} /> : <TbDownload aria-hidden="true" size={22} />}
        </span>
      </a>
    </li>
  );
}
