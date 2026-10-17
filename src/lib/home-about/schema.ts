/** Separately editable introduction on the homepage; distinct from /o-nas page copy. */
export type HomeAboutContent = {
  eyebrow: string;
  headline: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  headingScale: number;
  descriptionScale: number;
  buttonScale: number;
  imageWidthScale: number;
  spacingScale: number;
};
export const DEFAULT_HOME_ABOUT: HomeAboutContent = {
  eyebrow: "NASZA MAŁA OJCZYZNA",
  headline: "Jesteśmy częścią społeczności Żelazkowa.",
  description:
    "Jesteśmy rodzinną firmą pogrzebową, która od wielu lat wspiera rodziny w najtrudniejszych chwilach. Naszą działalność opieramy na szacunku, empatii i indywidualnym podejściu do każdej rodziny.",
  buttonLabel: "Poznaj naszą firmę",
  buttonHref: "/o-nas",
  imageUrl: "/o-nas-home.png",
  imagePositionX: 50,
  imagePositionY: 50,
  headingScale: 100,
  descriptionScale: 100,
  buttonScale: 100,
  imageWidthScale: 100,
  spacingScale: 100,
};
export class HomeAboutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeAboutValidationError";
  }
}
export function safeAboutImage(url: string): boolean {
  if (url === "/o-nas-home.png") return true;
  if (/["'\\()<>\u0000-\u0020]/.test(url)) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      (parsed.hostname === "public.blob.vercel-storage.com" ||
        parsed.hostname.endsWith(".public.blob.vercel-storage.com")) &&
      /\.(png|jpe?g|webp|avif)$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}
export function safeAboutLink(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//") && !/[\\\u0000-\u0020]/.test(url);
}
export function parseHomeAbout(value: unknown): HomeAboutContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HomeAboutValidationError("Nieprawidłowe dane sekcji O nas.");
  const obj = value as Record<string, unknown>;
  const allowed = new Set(Object.keys(DEFAULT_HOME_ABOUT));
  if (Object.keys(obj).some((k) => !allowed.has(k)))
    throw new HomeAboutValidationError("Nieznane pole w sekcji O nas.");
  const text = (key: keyof HomeAboutContent, max: number) => {
    const raw = obj[key];
    if (
      typeof raw !== "string" ||
      !raw.trim() ||
      raw.trim().length > max ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(raw) ||
      (key !== "description" && /[\r\n]/.test(raw))
    )
      throw new HomeAboutValidationError(`Niepoprawne pole: ${key}.`);
    return raw.trim();
  };
  const number = (key: keyof HomeAboutContent, min: number, max: number) => {
    const raw = obj[key] ?? DEFAULT_HOME_ABOUT[key];
    if (typeof raw !== "number" || !Number.isInteger(raw) || raw < min || raw > max)
      throw new HomeAboutValidationError(`Pole ${key}: zakres ${min}–${max}.`);
    return raw;
  };
  const result: HomeAboutContent = {
    eyebrow: text("eyebrow", 90),
    headline: text("headline", 125),
    description: text("description", 700),
    buttonLabel: text("buttonLabel", 55),
    buttonHref: text("buttonHref", 200),
    imageUrl: text("imageUrl", 500),
    imagePositionX: number("imagePositionX", 0, 100),
    imagePositionY: number("imagePositionY", 0, 100),
    headingScale: number("headingScale", 75, 130),
    descriptionScale: number("descriptionScale", 80, 135),
    buttonScale: number("buttonScale", 80, 130),
    imageWidthScale: number("imageWidthScale", 80, 120),
    spacingScale: number("spacingScale", 75, 125),
  };
  if (!safeAboutImage(result.imageUrl))
    throw new HomeAboutValidationError("Zdjęcie musi pochodzić z projektu lub Vercel Blob.");
  if (!safeAboutLink(result.buttonHref))
    throw new HomeAboutValidationError("Nieprawidłowa ścieżka przycisku.");
  return result;
}
