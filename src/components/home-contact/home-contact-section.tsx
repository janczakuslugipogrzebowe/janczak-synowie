"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TbArrowUpRight, TbMail, TbMapPin, TbPhoneCall, TbPhone } from "react-icons/tb";
import type { HomeContactContent } from "@/lib/home-contact/schema";
import { directionsUrl, normalizePhone, type SiteSettings } from "@/lib/settings/schema";

// This is the exact profile used in the approved FAQ bottom edge (v1.9.1).
// Contact owns the mask, so its background and its dark overlay share one wave.
const FAQ_BOTTOM_WAVE =
  'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201440%20160%22%20preserveAspectRatio%3D%22none%22%3E%3Cpath%20fill%3D%22white%22%20d%3D%22M0%2092%20C146%2078%20271%2066%20413%2072%20C559%2079%20668%20103%20806%20108%20C939%20112%201064%2094%201187%2084%20C1285%2077%201368%2078%201440%2086%20L1440%20160%20L0%20160Z%22%2F%3E%3C%2Fsvg%3E")';

export default function HomeContactSection({
  data,
  settings,
  preview = false,
  joinsFaq = false,
}: {
  data: HomeContactContent;
  settings: SiteSettings;
  preview?: boolean;
  joinsFaq?: boolean;
}) {
  const headingId = useId();
  const reduced = useReducedMotion();
  const mapUrl = directionsUrl(settings);
  const items = [
    {
      id: "phone",
      Icon: TbPhoneCall,
      label: settings.primaryPhone,
      description: settings.availability,
      href: `tel:${normalizePhone(settings.primaryPhone)}`,
    },
    ...(data.showSecondaryPhone
      ? [
          {
            id: "secondary",
            Icon: TbPhone,
            label: settings.secondaryPhone,
            description: "Drugi numer telefonu",
            href: `tel:${normalizePhone(settings.secondaryPhone)}`,
          },
        ]
      : []),
    ...(data.showAddress
      ? [
          {
            id: "address",
            Icon: TbMapPin,
            label: settings.addressLine,
            description: settings.postalCity,
            href: mapUrl,
          },
        ]
      : []),
    ...(data.showEmail && settings.email
      ? [
          {
            id: "email",
            Icon: TbMail,
            label: settings.email,
            description: "Adres e-mail",
            href: `mailto:${settings.email}`,
          },
        ]
      : []),
  ];
  const vars = {
    "--contact-heading-scale": data.headingScale / 100,
    "--contact-description-scale": data.descriptionScale / 100,
    "--contact-phone-scale": data.phoneScale / 100,
    "--contact-icon-scale": data.iconScale / 100,
    "--contact-spacing-scale": data.spacingScale / 100,
    ...(joinsFaq
      ? {
          "--contact-wave": "clamp(55px,7vw,160px)",
          maskImage: `linear-gradient(#000,#000),${FAQ_BOTTOM_WAVE}`,
          maskPosition: "bottom left,top left",
          maskSize: "100% calc(100% - var(--contact-wave) + 1px),100% var(--contact-wave)",
          maskRepeat: "no-repeat",
          WebkitMaskImage: `linear-gradient(#000,#000),${FAQ_BOTTOM_WAVE}`,
          WebkitMaskPosition: "bottom left,top left",
          WebkitMaskSize: "100% calc(100% - var(--contact-wave) + 1px),100% var(--contact-wave)",
          WebkitMaskRepeat: "no-repeat",
        }
      : {}),
  } as CSSProperties;

  const animation = (delay: number) => ({
    initial: preview || reduced ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay, ease: [0.2, 0.65, 0.2, 1] as [number, number, number, number] },
  });

  return (
    <section
      aria-labelledby={headingId}
      style={vars}
      className={`@container/contact relative isolate overflow-hidden bg-[#12251c] text-[#f8f2e8] ${joinsFaq ? "z-40 -mt-[clamp(55px,7vw,160px)]" : ""}`}
    >
      <Image
        src={data.imageUrl}
        alt=""
        fill
        loading={preview ? "eager" : "lazy"}
        quality={75}
        sizes="100vw"
        className="pointer-events-none -z-30 object-cover"
        style={{ objectPosition: `${data.imagePositionX}% ${data.imagePositionY}%` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[#07160f]"
        style={{ opacity: data.overlayOpacity / 100 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,19,13,.14),rgba(7,19,13,.26)_57%,rgba(7,19,13,.55))]"
      />

      <div
        className={`relative mx-auto w-[min(90%,1640px)] pb-[clamp(9rem,11vw,15rem)] 3xl:w-[min(88%,2200px)] 4xl:w-[min(85%,3000px)] ${
          joinsFaq
            ? "pt-[calc(clamp(55px,7vw,160px)+clamp(5.5rem,8vw,11rem))]"
            : "pt-[clamp(7rem,10vw,13rem)]"
        }`}
      >
        <motion.div {...animation(0)} className="mx-auto max-w-[1160px] text-center">
          <p className="flex items-center justify-center gap-4 text-[clamp(.68rem,.78cqw,.92rem)] font-bold uppercase tracking-[.32em] text-[#e5ca94]">
            <span aria-hidden="true" className="h-px w-9 bg-[#d7bc87]" />
            {data.eyebrow}
            <span aria-hidden="true" className="h-px w-9 bg-[#d7bc87]" />
          </p>
          <h2
            id={headingId}
            className="mx-auto mt-[clamp(1.4rem,2.5vw,3rem)] max-w-[19ch] text-balance font-display font-medium leading-[1.08] tracking-[-.04em] [font-size:clamp(calc(2.4rem*var(--contact-heading-scale)),calc(4.1cqw*var(--contact-heading-scale)),calc(6.2rem*var(--contact-heading-scale)))]"
          >
            {data.headline}
          </h2>
          <p className="mx-auto mt-[calc(clamp(1.2rem,2vw,2.5rem)*var(--contact-spacing-scale))] max-w-[62ch] leading-[1.85] text-white/85 [font-size:clamp(calc(.95rem*var(--contact-description-scale)),calc(1.05cqw*var(--contact-description-scale)),calc(1.4rem*var(--contact-description-scale)))]">
            {data.description}
          </p>
        </motion.div>

        <div
          className={`mx-auto mt-[calc(clamp(3rem,5vw,7rem)*var(--contact-spacing-scale))] grid max-w-[1470px] grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 ${
            items.length === 4
              ? "xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)]"
              : items.length === 2
                ? "lg:grid-cols-2"
                : "lg:grid-cols-3"
          }`}
        >
          {items.map(({ id, Icon, label, description, href }, index) => {
            // Keep each part of an address intact; a line may break after @,
            // but never in the middle of a domain such as gmail.com.
            const at = id === "email" ? label.indexOf("@") : -1;
            const displayLabel =
              at > 0 ? (
                <>
                  <span className="inline-block max-w-full break-all">{label.slice(0, at + 1)}</span>
                  <wbr />
                  <span className="inline-block max-w-full break-all">{label.slice(at + 1)}</span>
                </>
              ) : (
                label
              );

            const labelClass = `font-semibold leading-snug text-[#fff9ed] underline-offset-4 transition-colors hover:text-[#e8ce9a] ${
              id === "email"
                ? "[font-size:clamp(.85rem,.95cqw,1.25rem)]"
                : "[font-size:clamp(calc(.95rem*var(--contact-phone-scale)),calc(1.13cqw*var(--contact-phone-scale)),calc(1.55rem*var(--contact-phone-scale)))]"
            }`;

            return (
              <motion.div key={id} {...animation(0.08 + index * 0.075)} className="min-w-0">
                {/* One direct child prevents unkeyed child arrays in motion/react. */}
                <div className="flex min-w-0 items-center justify-center gap-4 text-left lg:gap-5">
                  <span
                    className="flex size-[calc(clamp(2.75rem,3.5vw,4.25rem)*var(--contact-icon-scale))] shrink-0 items-center justify-center rounded-full border border-[#e1c38a]/55 bg-[#0d1e16]/35 text-[#e8cf9d]"
                    aria-hidden="true"
                  >
                    <Icon className="size-[48%]" strokeWidth={1.55} />
                  </span>
                  <div className="min-w-0">
                    {href && !preview ? (
                      <a
                        href={href}
                        className={`cursor-pointer ${labelClass} ${id === "email" ? "inline-block max-w-full" : "break-words"} hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfc48b]`}
                      >
                        {displayLabel}
                      </a>
                    ) : (
                      <span
                        className={`block ${labelClass} ${id === "email" ? "max-w-full" : "break-words"}`}
                      >
                        {displayLabel}
                      </span>
                    )}
                    <p className="mt-1 text-[clamp(.76rem,.8cqw,1.05rem)] leading-snug text-white/75">
                      {description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          {...animation(0.24)}
          className="mt-[calc(clamp(3rem,4vw,6rem)*var(--contact-spacing-scale))] flex justify-center"
        >
          {preview ? (
            <span className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#e3c895] px-8 py-3 text-sm font-semibold text-[#13231a]">
              <TbMail size={19} />
              {data.buttonLabel}
              <TbArrowUpRight size={19} />
            </span>
          ) : (
            <Link
              href={data.buttonHref}
              className="group inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full bg-[#e3c895] px-8 py-3 text-sm font-semibold text-[#13231a] shadow-[8px_14px_28px_-20px_rgba(0,0,0,.8)] transition-colors hover:bg-[#f1ddba] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f1ddba]"
            >
              <TbMail size={19} />
              {data.buttonLabel}
              <TbArrowUpRight
                size={19}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          )}
        </motion.div>
      </div>

      {/* Dark, gently asymmetric finish; the footer will inherit its color. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-px inset-x-0 h-[clamp(55px,7vw,150px)] w-full fill-[#0f1c16]"
      >
        <path d="M0 105 C154 91 253 78 395 87 C564 98 681 113 832 106 C1004 98 1111 67 1247 78 C1326 85 1391 96 1440 90 L1440 150 L0 150Z" />
      </svg>
    </section>
  );
}
