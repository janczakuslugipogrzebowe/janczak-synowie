/** Public hero model and shared, strict validation. No sensitive data. */
export type HeroContent = {
  eyebrow: string;
  headline: string;
  headlineSecond: string;
  description: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  overlayOpacity: number;
  /** Relative design scales (100 = recommended fluid responsive typography). */
  eyebrowScale: number;
  headingScale: number;
  descriptionScale: number;
  buttonScale: number;
  highlightIconScale: number;
  highlightTitleScale: number;
  highlightDescriptionScale: number;
  highlightGapScale: number;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  detailOne: string;
  detailTwo: string;
  detailThree: string;
};

export const DEFAULT_HERO: HeroContent = {
  eyebrow: "ŻELAZKÓW · RODZINNA FIRMA POGRZEBOWA",
  headline: "Blisko ludzi.",
  headlineSecond: "W najważniejszych chwilach.",
  description:
    "Janczak i Synowie – Usługi Pogrzebowe. Rodzinna firma z Żelazkowa. Godność, wsparcie i doświadczenie, gdy jest to najbardziej potrzebne.",
  imageUrl: "/hero.png",
  imagePositionX: 50,
  imagePositionY: 50,
  overlayOpacity: 65,
  eyebrowScale: 100,
  headingScale: 100,
  descriptionScale: 100,
  buttonScale: 100,
  highlightIconScale: 100,
  highlightTitleScale: 100,
  highlightDescriptionScale: 100,
  highlightGapScale: 100,
  primaryLabel: "Skontaktuj się z nami",
  primaryHref: "/kontakt",
  secondaryLabel: "Jak dojechać",
  secondaryHref: "/kontakt",
  detailOne: "Rodzinna firma",
  detailTwo: "Indywidualne podejście",
  detailThree: "Szacunek i doświadczenie",
};

export class HeroValidationError extends Error {
  constructor(message: string) { super(message); this.name = "HeroValidationError"; }
}

function boundedString(data: Record<string, unknown>, key: keyof HeroContent, max: number) {
  const value = data[key];
  if (typeof value !== "string") throw new HeroValidationError(`Pole ${key}: wymagany tekst.`);
  const result = value.trim();
  if (result.length === 0 || result.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(result))
    throw new HeroValidationError(`Pole ${key}: niepoprawna długość lub znaki.`);
  return result;
}

function num(data: Record<string, unknown>, key: keyof HeroContent, min: number, max: number) {
  const value = data[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max)
    throw new HeroValidationError(`Pole ${key}: zakres ${min}–${max}.`);
  return Math.round(value);
}

/** Optional fields are backward-compatible with Hero documents published before v1.0.2. */
function designScale(data: Record<string, unknown>, key: keyof HeroContent, min: number, max: number) {
  const value = data[key] === undefined ? DEFAULT_HERO[key] : data[key];
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < min || value > max)
    throw new HeroValidationError(`Pole ${key}: zakres ${min}–${max}%.`);
  return value;
}

export function safeHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\") && !/[\u0000-\u0020]/.test(href)) return true;
  if (/^tel:\+?[0-9 ()-]{5,22}$/.test(href)) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

export function safeImageUrl(href: string): boolean {
  // This value is placed inside a CSS url() string; disallow CSS-breaking characters.
  if (/["'\\()<>\u0000-\u0020]/.test(href)) return false;
  if (href === "/hero.png") return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && !url.username && !url.password &&
      (url.hostname.endsWith(".public.blob.vercel-storage.com") || url.hostname === "public.blob.vercel-storage.com") &&
      /\.(png|jpe?g|webp|avif)$/i.test(url.pathname);
  } catch { return false; }
}

/** Whitelist known fields, reject dangerous paths and oversized values. */
export function parseHero(value: unknown): HeroContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HeroValidationError("Niepoprawny format danych sekcji Hero.");
  const data = value as Record<string, unknown>;
  const allowed = new Set(Object.keys(DEFAULT_HERO));
  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) throw new HeroValidationError(`Nieznane pole: ${key}.`);
  }
  const hero: HeroContent = {
    eyebrow: boundedString(data, "eyebrow", 100),
    headline: boundedString(data, "headline", 90),
    headlineSecond: boundedString(data, "headlineSecond", 100),
    description: boundedString(data, "description", 600),
    imageUrl: boundedString(data, "imageUrl", 500),
    imagePositionX: num(data, "imagePositionX", 0, 100),
    imagePositionY: num(data, "imagePositionY", 0, 100),
    overlayOpacity: num(data, "overlayOpacity", 35, 85),
    eyebrowScale: designScale(data, "eyebrowScale", 75, 140),
    headingScale: designScale(data, "headingScale", 75, 135),
    descriptionScale: designScale(data, "descriptionScale", 80, 140),
    buttonScale: designScale(data, "buttonScale", 80, 135),
    highlightIconScale: designScale(data, "highlightIconScale", 70, 155),
    highlightTitleScale: designScale(data, "highlightTitleScale", 80, 145),
    highlightDescriptionScale: designScale(data, "highlightDescriptionScale", 80, 145),
    highlightGapScale: designScale(data, "highlightGapScale", 65, 145),
    primaryLabel: boundedString(data, "primaryLabel", 50),
    primaryHref: boundedString(data, "primaryHref", 400),
    secondaryLabel: boundedString(data, "secondaryLabel", 50),
    secondaryHref: boundedString(data, "secondaryHref", 400),
    detailOne: boundedString(data, "detailOne", 50),
    detailTwo: boundedString(data, "detailTwo", 50),
    detailThree: boundedString(data, "detailThree", 50),
  };
  if (!safeImageUrl(hero.imageUrl)) throw new HeroValidationError("Zdjęcie: /hero.png lub publiczny obraz z Vercel Blob.");
  if (!safeHref(hero.primaryHref) || !safeHref(hero.secondaryHref))
    throw new HeroValidationError("Link: dozwolone /ścieżka, tel: lub https://.");
  return hero;
}
