import { TbArrowUpRight, TbClockHour4, TbMail, TbPhoneCall } from "react-icons/tb";
import SubpageContainer from "@/components/subpages/subpage-container";
import SectionEyebrow from "@/components/subpages/section-eyebrow";
import { normalizePhone, directionsUrl, googleMapsEmbedUrl, type SiteSettings } from "@/lib/settings/schema";
import type { ContactDetailsContent } from "@/lib/contact-page/schema";
import ContactLocation from "./contact-location";

export default function ContactDetailsSection({
  data,
  settings,
  preview = false,
}: {
  data: ContactDetailsContent;
  settings: SiteSettings;
  preview?: boolean;
}) {
  const address = `${settings.addressLine}, ${settings.postalCity}`;
  const directions =
    directionsUrl(settings) ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <section
      aria-labelledby="contact-details-title"
      className={`relative isolate overflow-hidden bg-[#f8f4ec] text-[#193027] ${preview ? "py-10" : "py-[clamp(5rem,8vw,9rem)]"}`}
    >
      <SubpageContainer>
        {data.eyebrow && <SectionEyebrow className="mb-5">{data.eyebrow}</SectionEyebrow>}
        <h2
          id="contact-details-title"
          className="max-w-5xl font-display leading-[1.08] tracking-[-.045em]"
          style={{ fontSize: `clamp(2.9rem,${(4.4 * data.headingScale) / 100}vw,5.75rem)` }}
        >
          {data.title}
        </h2>
        <div
          className={`mt-[clamp(2.5rem,4.3vw,4.5rem)] grid items-stretch gap-5 ${preview ? "2xl:grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)]" : "lg:grid-cols-[minmax(0,.83fr)_minmax(0,1.17fr)]"} xl:gap-7`}
        >
          <div className="relative isolate flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#2c4334] bg-[#14271d] text-[#fffaf0] shadow-[0_25px_55px_-40px_rgba(17,36,24,.68)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-36 -top-40 -z-10 size-[420px] rounded-full border border-[#e6c991]/10 bg-[radial-gradient(circle,rgba(226,192,132,.12),transparent_72%)]"
            />
            <div className={`flex flex-1 flex-col ${preview ? "p-6" : "p-[clamp(1.6rem,3vw,3.25rem)]"}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-13 shrink-0 place-items-center rounded-2xl border border-[#e6c991]/25 bg-white/[.045] text-[#e6c991]">
                  <TbPhoneCall size={26} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#e6c991]/30 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#e6c991]">
                  <span className="size-1.5 rounded-full bg-[#e6c991]" aria-hidden="true" />
                  24 / 7
                </span>
              </div>
              <div className="mt-8">
                <p className="text-[11px] font-bold uppercase tracking-[.24em] text-[#d8b982]">
                  Kontakt telefoniczny
                </p>
                <h3 className="mt-3 font-display text-[clamp(2.2rem,2.8vw,3.35rem)] leading-[1.05] tracking-[-.025em]">
                  Jesteśmy pod telefonem
                </h3>
                <a
                  href={`tel:${normalizePhone(settings.primaryPhone)}`}
                  className="group mt-7 inline-flex max-w-full items-center gap-3 border-b border-[#e6c991]/35 pb-2 font-display text-[clamp(2.15rem,3.1vw,3.75rem)] leading-none tracking-tight text-[#fffaf0] transition-colors hover:text-[#e6c991] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6c991]"
                >
                  <span>{settings.primaryPhone}</span>
                  <TbArrowUpRight
                    className="shrink-0 text-[#e6c991] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    size={23}
                    aria-hidden="true"
                  />
                </a>
                {settings.secondaryPhone && (
                  <a
                    href={`tel:${normalizePhone(settings.secondaryPhone)}`}
                    className="mt-4 block w-fit text-sm text-[#d8e1d5] transition hover:text-[#e6c991]"
                  >
                    Drugi numer: {settings.secondaryPhone}
                  </a>
                )}
              </div>
              {settings.email && (
                <div className="mt-10 border-t border-[#d9e0d3]/15 pt-7">
                  <div className="flex items-center gap-3 text-[#e6c991]">
                    <TbMail size={22} strokeWidth={1.4} aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-[.23em]">Kontakt mailowy</span>
                  </div>
                  <a
                    href={`mailto:${settings.email}`}
                    className="group mt-3 inline-flex max-w-full items-center gap-2 break-all text-[clamp(.95rem,1.2vw,1.1rem)] text-[#fffaf0] underline decoration-[#e6c991]/35 underline-offset-[7px] transition hover:text-[#e6c991] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6c991]"
                  >
                    {settings.email}
                    <TbArrowUpRight
                      size={18}
                      className="shrink-0 text-[#d8b982] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              )}
              <div className="mt-auto flex items-center gap-2.5 pt-9 text-xs text-[#dce4d8] sm:text-sm">
                <TbClockHour4 size={20} className="shrink-0 text-[#e6c991]" aria-hidden="true" />
                {settings.availability}
              </div>
            </div>
          </div>
          <ContactLocation
            title={data.mapTitle}
            address={address}
            directions={directions}
            embedUrl={googleMapsEmbedUrl(settings)}
            preview={preview}
          />
        </div>
      </SubpageContainer>
    </section>
  );
}
