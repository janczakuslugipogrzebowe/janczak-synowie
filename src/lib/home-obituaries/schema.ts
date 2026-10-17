export type HomeObituariesContent = {
  eyebrow: string;
  headline: string;
  description: string;
  buttonLabel: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  imageOpacity: number;
  leftShade: number;
  headingScale: number;
  descriptionScale: number;
  cardScale: number;
  spacingScale: number;
  visibleCount: number;
};
export const DEFAULT_HOME_OBITUARIES: HomeObituariesContent = {
  eyebrow: "NEKROLOGI",
  headline: "Pamiętamy razem",
  description:
    "Z szacunkiem wspominamy tych, którzy odeszli. Tutaj znajdą Państwo aktualne nekrologi oraz informacje o uroczystościach pożegnalnych.",
  buttonLabel: "Zobacz nekrologi",
  imageUrl: "/nekrolog-home.png",
  imagePositionX: 50,
  imagePositionY: 50,
  imageOpacity: 35,
  leftShade: 90,
  headingScale: 100,
  descriptionScale: 100,
  cardScale: 100,
  spacingScale: 100,
  visibleCount: 3,
};
export class HomeObituariesValidationError extends Error {
  constructor(s: string) {
    super(s);
    this.name = "HomeObituariesValidationError";
  }
}
export function parseHomeObituaries(v: unknown): HomeObituariesContent {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new HomeObituariesValidationError("Błędne dane sekcji nekrologów.");
  const o = v as Record<string, unknown>;
  if (Object.keys(o).some((k) => !(k in DEFAULT_HOME_OBITUARIES)))
    throw new HomeObituariesValidationError("Nieznane pole sekcji.");
  const string = (k: keyof HomeObituariesContent, max: number) => {
    const n = o[k];
    if (typeof n !== "string" || !n.trim() || n.length > max || /[\u0000-\u001F\u007F]/.test(n))
      throw new HomeObituariesValidationError(`Błędne pole: ${k}.`);
    return n.trim();
  };
  const number = (k: keyof HomeObituariesContent, min: number, max: number) => {
    const n = o[k];
    if (typeof n !== "number" || !Number.isInteger(n) || n < min || n > max)
      throw new HomeObituariesValidationError(`Błędna wartość: ${k}.`);
    return n;
  };
  const imageUrl = string("imageUrl", 500);
  if (
    !/^\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp|avif)$/i.test(imageUrl) ||
    imageUrl.includes("..") ||
    imageUrl.includes("//")
  )
    throw new HomeObituariesValidationError("Zdjęcie musi wskazywać na plik z katalogu public.");
  return {
    eyebrow: string("eyebrow", 65),
    headline: string("headline", 115),
    description: string("description", 700),
    buttonLabel: string("buttonLabel", 70),
    imageUrl,
    imagePositionX: number("imagePositionX", 0, 100),
    imagePositionY: number("imagePositionY", 0, 100),
    imageOpacity: number("imageOpacity", 0, 95),
    leftShade: number("leftShade", 0, 100),
    headingScale: number("headingScale", 75, 145),
    descriptionScale: number("descriptionScale", 75, 135),
    cardScale: number("cardScale", 75, 145),
    spacingScale: number("spacingScale", 75, 145),
    visibleCount: number("visibleCount", 1, 3),
  };
}
