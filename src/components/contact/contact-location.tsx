import { TbArrowUpRight, TbMapPin } from "react-icons/tb";

/** Google Maps is embedded as-is: its attribution stays visible and interactive. */
export default function ContactLocation({
  title,
  address,
  directions,
  embedUrl,
  preview = false,
}: {
  title: string;
  address: string;
  directions: string;
  embedUrl: string;
  preview?: boolean;
}) {
  return (
    <article
      aria-label="Siedziba i dojazd"
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#d8cfbf] bg-[#fffdfa] shadow-[0_24px_60px_-45px_rgba(20,38,27,.3)]"
    >
      <div
        className={`relative w-full shrink-0 overflow-hidden bg-[#e5e9e2] ${preview ? "h-[290px]" : "h-[310px] sm:h-[350px] 2xl:h-[380px]"}`}
      >
        <iframe
          title={`Mapa Google – ${address}`}
          src={embedUrl}
          loading={preview ? "lazy" : "eager"}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[#e7dfd2] bg-[#fffdfa] px-[clamp(1.25rem,2.5vw,2.5rem)] py-[clamp(1.2rem,2vw,1.75rem)]">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f3eddf] text-[#977b50]"
            aria-hidden="true"
          >
            <TbMapPin size={21} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-[clamp(1.65rem,1.85vw,2.05rem)] leading-none text-[#1b3024]">
              {title}
            </h3>
            <address className="mt-2 not-italic text-xs leading-relaxed text-[#5e6d61] sm:text-sm">
              {address}
            </address>
          </div>
        </div>
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#1b3024] px-5 text-xs font-bold text-[#fffaf1] transition-colors hover:bg-[#37513c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f8156] sm:text-sm"
        >
          Wyznacz trasę <TbArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
