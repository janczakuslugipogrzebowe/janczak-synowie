import Link from "next/link";
import {
  TbArrowUpRight,
  TbArrowUp,
  TbPhoneCall,
  TbPhone,
  TbMapPin,
  TbMail,
  TbBrandFacebook,
  TbBrandInstagram,
  TbBrandYoutube,
  TbBrandTiktok,
  TbBrandLinkedin,
} from "react-icons/tb";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  SOCIAL_LABELS,
  type FooterContent,
  type FooterSocialPlatform,
  type FooterNavGroup,
} from "@/lib/footer/schema";
import type { SiteSettings } from "@/lib/settings/schema";

const SOCIAL_ICONS: Record<FooterSocialPlatform, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  facebook: TbBrandFacebook,
  instagram: TbBrandInstagram,
  youtube: TbBrandYoutube,
  tiktok: TbBrandTiktok,
  linkedin: TbBrandLinkedin,
};

function phoneUrl(phone: string) {
  const digits = phone.replace(/[^+\d]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+48${digits}`}`;
}

function Email({ address }: { address: string }) {
  const at = address.indexOf("@");
  if (at < 1) return <>{address}</>;
  return (
    <>
      <span className="inline-block max-w-full break-all">{address.slice(0, at + 1)}</span>
      <wbr />
      <span className="inline-block max-w-full break-all">{address.slice(at + 1)}</span>
    </>
  );
}

function FooterLinkGroup({
  title,
  group,
  links,
  preview,
}: {
  title: string;
  group: FooterNavGroup;
  links: FooterContent["navLinks"];
  preview: boolean;
}) {
  const visible = links.filter((link) => link.visible && link.group === group);
  if (!visible.length) return null;
  return (
    <div className="min-w-0">
      <h3 className="mb-5 text-[.71em] font-semibold uppercase tracking-[.23em] text-[#e3c997]">{title}</h3>
      <ul className="space-y-3">
        {visible.map(({ href, label }) => (
          <li key={href}>
            {preview ? (
              <span className="text-[.99em] leading-7 text-[#d9e0d7]">{label}</span>
            ) : (
              <Link
                href={href}
                className="group inline-flex min-h-7 cursor-pointer items-center gap-1.5 text-[.99em] leading-7 text-[#d9e0d7] transition-colors duration-200 hover:text-[#e3c997] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c997]"
              >
                <span>{label}</span>
                <TbArrowUpRight
                  aria-hidden="true"
                  size={13}
                  className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SmallContact({
  Icon,
  children,
  href,
  preview = false,
}: {
  Icon: typeof TbPhone;
  children: ReactNode;
  href?: string;
  preview?: boolean;
}) {
  const content = (
    <>
      <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#e3c997]" />
      <span className="min-w-0 break-words">{children}</span>
    </>
  );
  return (
    <li className="min-w-0">
      {href && !preview ? (
        <a
          href={href}
          {...(href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="inline-flex min-h-8 max-w-full cursor-pointer items-start gap-2.5 text-[#cbd4c9] transition-colors hover:text-[#e3c997] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c997]"
        >
          {content}
        </a>
      ) : (
        <span className="inline-flex max-w-full items-start gap-2.5 text-[#cbd4c9]">{content}</span>
      )}
    </li>
  );
}

export default function SiteFooter({
  data,
  settings,
  copyrightYear,
  preview = false,
}: {
  data: FooterContent;
  settings: SiteSettings;
  copyrightYear: number;
  preview?: boolean;
}) {
  const visibleSocials = data.showSocials ? data.socialLinks.filter((link) => link.visible && link.url) : [];
  const company = settings.companyName.split(/\s+[–—-]\s+/)[0] || settings.companyName;
  const description = data.descriptionOverride || settings.companyDescription;
  const showMainPhone = Boolean(data.showPrimaryPhone && settings.primaryPhone);
  const showSpotlight = showMainPhone && data.showHighlightedContact;
  const otherContacts = Boolean(
    (showMainPhone && !showSpotlight) ||
    (data.showSecondaryPhone && settings.secondaryPhone) ||
    (data.showEmail && settings.email) ||
    (data.showAddress && (settings.addressLine || settings.postalCity)),
  );
  const cssVars = {
    "--footer-title-scale": data.headingScale / 100,
    "--footer-text-scale": data.textScale / 100,
    "--footer-column-scale": data.columnGapScale / 100,
    "--footer-padding-scale": data.paddingScale / 100,
    "--footer-icon-scale": data.iconScale / 100,
  } as CSSProperties;

  return (
    <footer
      className="relative isolate w-full overflow-hidden bg-[#0f1c16] text-[#f2efe8] [font-size:calc(clamp(.91rem,1.02vw,1.06rem)*var(--footer-text-scale))]"
      style={cssVars}
      aria-label="Stopka witryny"
    >
      {/* Decoration stays behind the content and never affects the Contact wave. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-18%] top-[-65%] -z-10 h-[650px] w-[900px] rounded-full bg-[radial-gradient(ellipse,rgba(200,166,102,.09),transparent_67%)]"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d7b980]/25 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-[1740px] px-6 pb-[calc(clamp(1.5rem,2.3vw,2.5rem)*var(--footer-padding-scale))] pt-[calc(clamp(2.5rem,4.4vw,4.75rem)*var(--footer-padding-scale))] sm:px-10 lg:px-[clamp(3rem,6vw,7rem)]">
        <div className="text-[.7em] font-semibold uppercase tracking-[.22em] text-[#e3c997]">
          <span>{data.footerEyebrow}</span>
        </div>

        <div className="mt-5 flex flex-col gap-6 border-b border-[#d9c08a]/30 pb-[clamp(1.5rem,2.7vw,2.8rem)] md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="font-display text-[calc(clamp(2.9rem,5.7vw,6rem)*var(--footer-title-scale))] leading-[.97] tracking-[-.045em] text-[#f2efe8]">
              {company}
            </div>
            <p className="mt-3 text-[.65em] font-semibold uppercase tracking-[.3em] text-[#dfc28e]">
              {data.brandSubtitle}
            </p>
          </div>
          {showSpotlight && (
            <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
              <span className="text-[.68em] font-bold uppercase tracking-[.24em] text-[#e3c997]">
                {data.contactTitle}
              </span>
              <a
                href={preview ? undefined : phoneUrl(settings.primaryPhone)}
                className={`group font-display text-[calc(clamp(1.75rem,2.8vw,3.1rem)*var(--footer-title-scale))] leading-none tracking-[-.015em] text-[#f2efe8] transition-colors hover:text-[#e3c997] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c997] ${preview ? "pointer-events-none" : "cursor-pointer"}`}
              >
                {settings.primaryPhone}
              </a>
              {data.showAvailability && settings.availability && (
                <span className="text-[.82em] text-[#b5c0b3]">{settings.availability}</span>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-x-[calc(clamp(2.2rem,5vw,6rem)*var(--footer-column-scale))] gap-y-11 py-[calc(clamp(2rem,3.6vw,4rem)*var(--footer-padding-scale))] lg:grid-cols-[minmax(0,1.14fr)_minmax(0,1.08fr)_minmax(0,.92fr)]">
          <div className="min-w-0">
            <h2 className="max-w-[460px] font-display text-[calc(clamp(1.85rem,2.7vw,3rem)*var(--footer-title-scale))] leading-[1.14] tracking-[-.035em] text-[#f2efe8]">
              {data.introHeading}
            </h2>
            {data.showDescription && description && (
              <p className="mt-4 max-w-[440px] text-[.94em] leading-[1.73] text-[#bec9be] [display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical] overflow-hidden">
                {description}
              </p>
            )}
          </div>

          <nav aria-label="Nawigacja w stopce" className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-7">
            <FooterLinkGroup title={data.navTitle} group="company" links={data.navLinks} preview={preview} />
            <FooterLinkGroup
              title={data.navSecondaryTitle}
              group="information"
              links={data.navLinks}
              preview={preview}
            />
          </nav>

          <div className="min-w-0 lg:border-l lg:border-[#d7b980]/15 lg:pl-[clamp(1.5rem,2.5vw,3.1rem)]">
            <Link
              href="/kontakt"
              tabIndex={preview ? -1 : undefined}
              className={`group inline-flex min-h-12 max-w-full items-center gap-6 rounded-full border border-[#e3c997]/70 px-5 py-2.5 text-[.88em] font-semibold text-[#e3c997] transition-[background-color,color,border-color] duration-300 hover:border-[#e3c997] hover:bg-[#e3c997] hover:text-[#102019] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c997] ${preview ? "pointer-events-none" : "cursor-pointer"}`}
            >
              Skontaktuj się{" "}
              <TbArrowUpRight
                size={19}
                aria-hidden="true"
                className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
            {otherContacts && (
              <ul className="mt-6 space-y-3 text-[.89em] leading-6">
                {showMainPhone && !showSpotlight && (
                  <SmallContact Icon={TbPhoneCall} href={phoneUrl(settings.primaryPhone)} preview={preview}>
                    {settings.primaryPhone}
                    {data.showAvailability && settings.availability && (
                      <span className="block text-[.85em] text-[#a8b7aa]">{settings.availability}</span>
                    )}
                  </SmallContact>
                )}
                {data.showSecondaryPhone && settings.secondaryPhone && (
                  <SmallContact Icon={TbPhone} href={phoneUrl(settings.secondaryPhone)} preview={preview}>
                    {settings.secondaryPhone}
                  </SmallContact>
                )}
                {data.showAddress && (settings.addressLine || settings.postalCity) && (
                  <SmallContact
                    Icon={TbMapPin}
                    href={settings.mapsUrl.startsWith("https://") ? settings.mapsUrl : undefined}
                    preview={preview}
                  >
                    {settings.addressLine}
                    {settings.postalCity && (
                      <span className="block text-[#a8b7aa]">{settings.postalCity}</span>
                    )}
                  </SmallContact>
                )}
                {data.showEmail && settings.email && (
                  <SmallContact Icon={TbMail} href={`mailto:${settings.email}`} preview={preview}>
                    <Email address={settings.email} />
                  </SmallContact>
                )}
              </ul>
            )}
            {visibleSocials.length > 0 && (
              <div className="mt-7">
                <h3 className="mb-3 text-[.7em] font-semibold uppercase tracking-[.22em] text-[#e3c997]">
                  {data.socialTitle}
                </h3>
                <ul className="flex flex-wrap gap-2.5" aria-label="Media społecznościowe">
                  {visibleSocials.map(({ platform, url }) => {
                    const Icon = SOCIAL_ICONS[platform];
                    return (
                      <li key={platform}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Otwórz ${SOCIAL_LABELS[platform]} firmy (nowa karta)`}
                          title={SOCIAL_LABELS[platform]}
                          tabIndex={preview ? -1 : undefined}
                          className={`flex size-[calc(3.15rem*var(--footer-icon-scale))] items-center justify-center rounded-full border border-[#e3c997]/45 text-[#e3c997] transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-1 hover:border-[#e3c997] hover:bg-[#e3c997] hover:text-[#102019] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e3c997] ${preview ? "pointer-events-none" : "cursor-pointer"}`}
                        >
                          <Icon size={22} strokeWidth={1.65} aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-[#d9c08a]/25 pt-5 text-[.76em] leading-relaxed text-[#aebbb0]">
          <span>
            © {copyrightYear} {company}
            {data.copyrightSuffix && `. ${data.copyrightSuffix}`}
          </span>
          <div className="flex flex-wrap items-center gap-5">
            {data.endingText && <span>{data.endingText}</span>}
            {data.showBackToTop && !preview && (
              <a
                href="#main"
                className="inline-flex cursor-pointer items-center gap-1.5 text-[#e3c997] hover:text-[#f4ddaf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c997]"
              >
                Do góry <TbArrowUp size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
