/** Global footer layout only; company identity and contact details live in SiteSettings. */
export const FOOTER_NAV_PATHS = [
  "/",
  "/o-nas",
  "/oferta",
  "/nekrologi",
  "/dokumenty",
  "/galeria",
  "/kontakt",
] as const;
export type FooterNavPath = (typeof FOOTER_NAV_PATHS)[number];

export const SOCIAL_PLATFORMS = ["facebook", "instagram", "youtube", "tiktok", "linkedin"] as const;
export type FooterSocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_LABELS: Record<FooterSocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export type FooterNavGroup = "company" | "information";
export type FooterLink = { href: FooterNavPath; label: string; visible: boolean; group: FooterNavGroup };

/** Previous CMS publications did not store groups; keep them readable without a migration. */
export function defaultFooterNavGroup(href: FooterNavPath): FooterNavGroup {
  return ["/", "/o-nas", "/oferta", "/galeria"].includes(href) ? "company" : "information";
}
export type FooterSocial = { platform: FooterSocialPlatform; url: string; visible: boolean };

export type FooterContent = {
  brandSubtitle: string;
  descriptionOverride: string;
  navTitle: string;
  navSecondaryTitle: string;
  introHeading: string;
  footerEyebrow: string;
  contactTitle: string;
  socialTitle: string;
  copyrightSuffix: string;
  endingText: string;
  showDescription: boolean;
  showPrimaryPhone: boolean;
  showHighlightedContact: boolean;
  showSecondaryPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showAvailability: boolean;
  showSocials: boolean;
  showBackToTop: boolean;
  headingScale: number;
  textScale: number;
  columnGapScale: number;
  paddingScale: number;
  iconScale: number;
  navLinks: FooterLink[];
  socialLinks: FooterSocial[];
};

export const DEFAULT_FOOTER: FooterContent = {
  brandSubtitle: "USŁUGI POGRZEBOWE",
  descriptionOverride: "",
  navTitle: "FIRMA",
  navSecondaryTitle: "INFORMACJE",
  introHeading: "Z szacunkiem i zrozumieniem.",
  footerEyebrow: "RODZINNA FIRMA POGRZEBOWA",
  contactTitle: "POMOC CAŁODOBOWA",
  socialTitle: "ZNAJDŹ NAS",
  copyrightSuffix: "Wszelkie prawa zastrzeżone.",
  endingText: "Z szacunkiem i troską.",
  showDescription: true,
  showPrimaryPhone: true,
  showHighlightedContact: true,
  showSecondaryPhone: true,
  showEmail: true,
  showAddress: true,
  showAvailability: true,
  showSocials: true,
  showBackToTop: false,
  headingScale: 100,
  textScale: 100,
  columnGapScale: 100,
  paddingScale: 100,
  iconScale: 100,
  navLinks: [
    { href: "/", label: "Strona główna", visible: true, group: "company" },
    { href: "/o-nas", label: "O nas", visible: true, group: "company" },
    { href: "/oferta", label: "Oferta", visible: true, group: "company" },
    { href: "/nekrologi", label: "Nekrologi", visible: true, group: "information" },
    { href: "/dokumenty", label: "Dokumenty", visible: true, group: "information" },
    { href: "/galeria", label: "Galeria", visible: true, group: "company" },
    { href: "/kontakt", label: "Kontakt", visible: true, group: "information" },
  ],
  socialLinks: SOCIAL_PLATFORMS.map((platform) => ({ platform, url: "", visible: false })),
};

export class FooterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FooterValidationError";
  }
}

function cleanText(value: unknown, label: string, max: number, allowEmpty = false): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    /[\u0000-\u0009\u000b-\u001f\u007f]/.test(value) ||
    (!allowEmpty && !value.trim())
  ) {
    throw new FooterValidationError(`Nieprawidłowe pole: ${label}.`);
  }
  return value.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const allowedHosts: Record<FooterSocialPlatform, readonly string[]> = {
  facebook: ["facebook.com", "fb.com"],
  instagram: ["instagram.com"],
  youtube: ["youtube.com", "youtu.be"],
  tiktok: ["tiktok.com"],
  linkedin: ["linkedin.com"],
};

export function validateSocialUrl(platform: FooterSocialPlatform, raw: string): string {
  const trimmed = cleanText(raw, `link ${SOCIAL_LABELS[platform]}`, 300, true);
  if (!trimmed) return "";
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new FooterValidationError(`Nieprawidłowy link: ${SOCIAL_LABELS[platform]}.`);
  }
  const domainAllowed = allowedHosts[platform].some(
    (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
  );
  if (url.protocol !== "https:" || !domainAllowed || url.username || url.password || url.port) {
    throw new FooterValidationError(`Podaj bezpieczny link HTTPS do ${SOCIAL_LABELS[platform]}.`);
  }
  return url.toString();
}

export function parseFooter(value: unknown): FooterContent {
  if (!isRecord(value)) throw new FooterValidationError("Nieprawidłowa konfiguracja stopki.");
  const raw = value;
  if (Object.keys(raw).some((key) => !(key in DEFAULT_FOOTER)))
    throw new FooterValidationError("Nieznane pole stopki.");
  const text = (key: keyof FooterContent, max: number, allowEmpty = false) =>
    cleanText(raw[key] ?? DEFAULT_FOOTER[key], String(key), max, allowEmpty);
  const flag = (key: keyof FooterContent): boolean => {
    const v = raw[key] ?? DEFAULT_FOOTER[key];
    if (typeof v !== "boolean") throw new FooterValidationError(`Nieprawidłowe ustawienie: ${key}.`);
    return v;
  };
  const scale = (key: keyof FooterContent): number => {
    const v = raw[key] ?? DEFAULT_FOOTER[key];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 65 || v > 145)
      throw new FooterValidationError(`Nieprawidłowy parametr: ${key}.`);
    return v;
  };
  const nav = raw.navLinks ?? DEFAULT_FOOTER.navLinks;
  if (!Array.isArray(nav) || nav.length !== FOOTER_NAV_PATHS.length)
    throw new FooterValidationError("Nieprawidłowa lista nawigacji.");
  const navSeen = new Set<string>();
  const navLinks = nav.map((link: unknown): FooterLink => {
    if (
      !isRecord(link) ||
      typeof link.href !== "string" ||
      !FOOTER_NAV_PATHS.includes(link.href as FooterNavPath) ||
      navSeen.has(link.href) ||
      typeof link.visible !== "boolean"
    ) {
      throw new FooterValidationError("Nieprawidłowy link nawigacji.");
    }
    if (Object.keys(link).some((k) => !["href", "label", "visible", "group"].includes(k)))
      throw new FooterValidationError("Nieprawidłowe pola linku.");
    if (link.group !== undefined && link.group !== "company" && link.group !== "information") {
      throw new FooterValidationError("Nieprawidłowa grupa nawigacji.");
    }
    navSeen.add(link.href);
    return {
      href: link.href as FooterNavPath,
      label: cleanText(link.label, "etykieta linku", 48),
      visible: link.visible,
      group: (link.group as FooterNavGroup | undefined) ?? defaultFooterNavGroup(link.href as FooterNavPath),
    };
  });
  const social = raw.socialLinks ?? DEFAULT_FOOTER.socialLinks;
  if (!Array.isArray(social) || social.length !== SOCIAL_PLATFORMS.length)
    throw new FooterValidationError("Nieprawidłowa lista social media.");
  const socialSeen = new Set<string>();
  const socialLinks = social.map((entry: unknown): FooterSocial => {
    if (
      !isRecord(entry) ||
      typeof entry.platform !== "string" ||
      !SOCIAL_PLATFORMS.includes(entry.platform as FooterSocialPlatform) ||
      socialSeen.has(entry.platform) ||
      typeof entry.visible !== "boolean"
    ) {
      throw new FooterValidationError("Nieprawidłowa pozycja social media.");
    }
    if (Object.keys(entry).some((k) => !["platform", "url", "visible"].includes(k)))
      throw new FooterValidationError("Nieprawidłowe pola social media.");
    socialSeen.add(entry.platform);
    return {
      platform: entry.platform as FooterSocialPlatform,
      url: validateSocialUrl(entry.platform as FooterSocialPlatform, entry.url as string),
      visible: entry.visible,
    };
  });
  return {
    brandSubtitle: text("brandSubtitle", 75),
    descriptionOverride: text("descriptionOverride", 350, true),
    navTitle: text("navTitle", 60),
    navSecondaryTitle: text("navSecondaryTitle", 60),
    introHeading: text("introHeading", 135),
    footerEyebrow: text("footerEyebrow", 85),
    contactTitle: text("contactTitle", 60),
    socialTitle: text("socialTitle", 60),
    copyrightSuffix: text("copyrightSuffix", 120, true),
    endingText: text("endingText", 120, true),
    showDescription: flag("showDescription"),
    showPrimaryPhone: flag("showPrimaryPhone"),
    showHighlightedContact: flag("showHighlightedContact"),
    showSecondaryPhone: flag("showSecondaryPhone"),
    showEmail: flag("showEmail"),
    showAddress: flag("showAddress"),
    showAvailability: flag("showAvailability"),
    showSocials: flag("showSocials"),
    showBackToTop: flag("showBackToTop"),
    headingScale: scale("headingScale"),
    textScale: scale("textScale"),
    columnGapScale: scale("columnGapScale"),
    paddingScale: scale("paddingScale"),
    iconScale: scale("iconScale"),
    navLinks,
    socialLinks,
  };
}
