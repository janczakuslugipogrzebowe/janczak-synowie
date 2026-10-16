export type GuidanceStep = { title: string; description: string };
export type HomeGuidanceContent = {
  eyebrow: string; headline: string; description: string;
  phoneButtonLabel: string; offerButtonLabel: string; offerButtonHref: string;
  imageUrl: string; imagePositionX: number; imagePositionY: number; overlayOpacity: number;
  headingScale: number; descriptionScale: number; buttonScale: number; stepsScale: number;
  panelOpacity: number; spacingScale: number; steps: GuidanceStep[];
};
export const DEFAULT_HOME_GUIDANCE: HomeGuidanceContent = {
  eyebrow: "GDY POTRZEBNA JEST POMOC", headline: "Co zrobić w razie śmierci bliskiej osoby?",
  description: "W trudnych chwilach łatwo się pogubić. Pomożemy Państwu spokojnie przejść przez pierwsze kroki, dopełnić formalności i godnie zorganizować pożegnanie.",
  phoneButtonLabel: "Kontakt całodobowy", offerButtonLabel: "Zobacz krok po kroku", offerButtonHref: "/oferta",
  imageUrl: "/co-zrobic-home.png", imagePositionX: 50, imagePositionY: 50, overlayOpacity: 72,
  headingScale: 100, descriptionScale: 100, buttonScale: 100, stepsScale: 100, panelOpacity: 78, spacingScale: 100,
  steps: [
    { title: "Skontaktuj się z nami", description: "Jesteśmy do dyspozycji przez całą dobę." },
    { title: "Pomożemy dopełnić formalności", description: "Wyjaśnimy, jakie dokumenty będą potrzebne." },
    { title: "Ustalimy przebieg ceremonii", description: "Uwzględnimy wolę rodziny i charakter pożegnania." },
    { title: "Zajmiemy się organizacją", description: "Otoczymy Państwa wsparciem na każdym etapie." },
  ],
};
export class HomeGuidanceValidationError extends Error {
  constructor(message: string) { super(message); this.name = "HomeGuidanceValidationError"; }
}
export function safeGuidanceImage(url: string): boolean {
  if (url === "/co-zrobic-home.png") return true;
  if (/["'\\()<>\u0000-\u0020]/.test(url)) return false;
  try { const parsed = new URL(url); return parsed.protocol === "https:" && !parsed.username && !parsed.password &&
    (parsed.hostname === "public.blob.vercel-storage.com" || parsed.hostname.endsWith(".public.blob.vercel-storage.com")) &&
    /\.(png|jpe?g|webp|avif)$/i.test(parsed.pathname); } catch { return false; }
}
function safeHref(url: string): boolean { return url.startsWith("/") && !url.startsWith("//") && !/[\\\u0000-\u0020]/.test(url); }
export function parseHomeGuidance(value: unknown): HomeGuidanceContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HomeGuidanceValidationError("Nieprawidłowe dane sekcji pomocy.");
  const obj = value as Record<string, unknown>;
  const allowed = new Set(Object.keys(DEFAULT_HOME_GUIDANCE));
  if (Object.keys(obj).some(key => !allowed.has(key))) throw new HomeGuidanceValidationError("Nieznane pole formularza.");
  const text = (key: keyof HomeGuidanceContent, max: number): string => {
    const raw = obj[key];
    if (typeof raw !== "string" || !raw.trim() || raw.trim().length > max || /[\u0000-\u001F\u007F]/.test(raw)) throw new HomeGuidanceValidationError(`Nieprawidłowe pole: ${key}.`);
    return raw.trim();
  };
  const number = (key: keyof HomeGuidanceContent, min: number, max: number): number => {
    const raw = obj[key] ?? DEFAULT_HOME_GUIDANCE[key];
    if (typeof raw !== "number" || !Number.isInteger(raw) || raw < min || raw > max) throw new HomeGuidanceValidationError(`Pole ${key}: zakres ${min}–${max}.`);
    return raw;
  };
  const rawSteps = obj.steps;
  if (!Array.isArray(rawSteps) || rawSteps.length !== 4) throw new HomeGuidanceValidationError("Wymagane są dokładnie cztery kroki.");
  const steps: GuidanceStep[] = rawSteps.map((step, index) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) throw new HomeGuidanceValidationError(`Nieprawidłowy krok ${index + 1}.`);
    const data = step as Record<string, unknown>;
    if (Object.keys(data).some(key => key !== "title" && key !== "description")) throw new HomeGuidanceValidationError(`Nieznane pole w kroku ${index + 1}.`);
    for (const name of ["title", "description"]) {
      const raw = data[name];
      if (typeof raw !== "string" || !raw.trim() || raw.trim().length > (name === "title" ? 85 : 155) || /[\u0000-\u001F\u007F]/.test(raw)) throw new HomeGuidanceValidationError(`Nieprawidłowa treść kroku ${index + 1}.`);
    }
    return { title: (data.title as string).trim(), description: (data.description as string).trim() };
  });
  const result: HomeGuidanceContent = {
    eyebrow: text("eyebrow", 90), headline: text("headline", 130), description: text("description", 650),
    phoneButtonLabel: text("phoneButtonLabel", 55), offerButtonLabel: text("offerButtonLabel", 55), offerButtonHref: text("offerButtonHref", 160),
    imageUrl: text("imageUrl", 500), imagePositionX: number("imagePositionX", 0, 100), imagePositionY: number("imagePositionY", 0, 100),
    overlayOpacity: number("overlayOpacity", 35, 95), headingScale: number("headingScale", 75, 130),
    descriptionScale: number("descriptionScale", 80, 135), buttonScale: number("buttonScale", 80, 130),
    stepsScale: number("stepsScale", 80, 135), panelOpacity: number("panelOpacity", 35, 95), spacingScale: number("spacingScale", 75, 125), steps,
  };
  if (!safeGuidanceImage(result.imageUrl)) throw new HomeGuidanceValidationError("Nieprawidłowa ścieżka fotografii.");
  if (!safeHref(result.offerButtonHref)) throw new HomeGuidanceValidationError("Przycisk może prowadzić wyłącznie do podstrony serwisu.");
  return result;
}
