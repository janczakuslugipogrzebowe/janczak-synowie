export type HomeDocumentsContent = {
  eyebrow: string;
  headline: string;
  description: string;
  buttonLabel: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  overlayOpacity: number;
  headingScale: number;
  descriptionScale: number;
  listScale: number;
  spacingScale: number;
};

export const DEFAULT_HOME_DOCUMENTS: HomeDocumentsContent = {
  eyebrow: "DOKUMENTY I FORMALNOŚCI",
  headline: "Pomoc również w formalnościach.",
  description:
    "Wiemy, że w trudnych chwilach formalności mogą być dodatkowym obciążeniem. Zebraliśmy w jednym miejscu dokumenty pomocne w organizacji pożegnania i ubieganiu się o zasiłek pogrzebowy.",
  buttonLabel: "Przejdź do dokumentów",
  imageUrl: "/dokumenty-home.png",
  imagePositionX: 50,
  imagePositionY: 50,
  overlayOpacity: 33,
  headingScale: 100,
  descriptionScale: 100,
  listScale: 100,
  spacingScale: 100,
};

export class HomeDocumentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeDocumentsValidationError";
  }
}

export function parseHomeDocuments(raw: unknown): HomeDocumentsContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new HomeDocumentsValidationError("Nieprawidłowa zawartość sekcji Dokumenty.");
  const obj = raw as Record<string, unknown>;
  if (Object.keys(obj).some((key) => !(key in DEFAULT_HOME_DOCUMENTS)))
    throw new HomeDocumentsValidationError("Nieznane pole sekcji Dokumenty.");
  const string = (key: keyof HomeDocumentsContent, max: number) => {
    const v = obj[key];
    if (typeof v !== "string" || !v.trim() || v.length > max || /[\u0000-\u001F\u007F]/.test(v))
      throw new HomeDocumentsValidationError(`Nieprawidłowe pole: ${key}.`);
    return v.trim();
  };
  const number = (key: keyof HomeDocumentsContent, min: number, max: number) => {
    const v = obj[key] ?? DEFAULT_HOME_DOCUMENTS[key];
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max)
      throw new HomeDocumentsValidationError(`Nieprawidłowa wartość: ${key}.`);
    return v;
  };
  const imageUrl = string("imageUrl", 500);
  if (
    !/^\/[a-z0-9/_-]+\.(png|jpe?g|webp|avif)$/i.test(imageUrl) ||
    imageUrl.includes("..") ||
    imageUrl.includes("//")
  ) {
    throw new HomeDocumentsValidationError("Fotografia musi pochodzić z katalogu public.");
  }
  return {
    eyebrow: string("eyebrow", 80),
    headline: string("headline", 125),
    description: string("description", 750),
    buttonLabel: string("buttonLabel", 65),
    imageUrl,
    imagePositionX: number("imagePositionX", 0, 100),
    imagePositionY: number("imagePositionY", 0, 100),
    overlayOpacity: number("overlayOpacity", 0, 70),
    headingScale: number("headingScale", 75, 140),
    descriptionScale: number("descriptionScale", 75, 140),
    listScale: number("listScale", 75, 140),
    spacingScale: number("spacingScale", 75, 140),
  };
}
