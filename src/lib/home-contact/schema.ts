export type HomeContactContent = {
  eyebrow: string;
  headline: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  overlayOpacity: number;
  headingScale: number;
  descriptionScale: number;
  phoneScale: number;
  iconScale: number;
  spacingScale: number;
  showSecondaryPhone: boolean;
  showAddress: boolean;
  showEmail: boolean;
};

export const DEFAULT_HOME_CONTACT: HomeContactContent = {
  eyebrow: "KONTAKT",
  headline: "Jesteśmy do Państwa dyspozycji",
  description: "Z szacunkiem i zrozumieniem służymy pomocą w najtrudniejszych chwilach.",
  buttonLabel: "Przejdź do kontaktu",
  buttonHref: "/kontakt",
  imageUrl: "/kontakt-home.png",
  imagePositionX: 50,
  imagePositionY: 50,
  overlayOpacity: 42,
  headingScale: 100,
  descriptionScale: 100,
  phoneScale: 100,
  iconScale: 100,
  spacingScale: 100,
  showSecondaryPhone: true,
  showAddress: true,
  showEmail: false,
};

export class HomeContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeContactValidationError";
  }
}

function requiredText(value: unknown, field: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.length > max || /[\u0000-\u0009\u000b-\u001f\u007f]/.test(value)) {
    throw new HomeContactValidationError(`Nieprawidłowe pole: ${field}.`);
  }
  return value.trim();
}

export function parseHomeContact(value: unknown): HomeContactContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HomeContactValidationError("Nieprawidłowa zawartość sekcji kontaktu.");
  const r = value as Record<string, unknown>;
  if (Object.keys(r).some((key) => !(key in DEFAULT_HOME_CONTACT))) throw new HomeContactValidationError("Nieznane pole sekcji kontaktu.");
  const num = (key: keyof HomeContactContent, min: number, max: number) => {
    const v = r[key] ?? DEFAULT_HOME_CONTACT[key];
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw new HomeContactValidationError(`Nieprawidłowy parametr: ${key}.`);
    return v;
  };
  const flag = (key: "showSecondaryPhone" | "showAddress" | "showEmail") => {
    const v = r[key] ?? DEFAULT_HOME_CONTACT[key];
    if (typeof v !== "boolean") throw new HomeContactValidationError(`Nieprawidłowy parametr: ${key}.`);
    return v;
  };
  const imageUrl = requiredText(r.imageUrl, "imageUrl", 500);
  if (!/^\/[a-z0-9/_-]+\.(png|jpe?g|webp|avif)$/i.test(imageUrl) || imageUrl.includes("..") || imageUrl.includes("//")) throw new HomeContactValidationError("Zdjęcie musi pochodzić z katalogu public.");
  const buttonHref = requiredText(r.buttonHref, "buttonHref", 200);
  if (!/^\/(?!\/)[a-z0-9/_#-]*$/i.test(buttonHref) || buttonHref.includes("..")) throw new HomeContactValidationError("Przycisk musi prowadzić do podstrony serwisu.");
  return {
    eyebrow: requiredText(r.eyebrow, "eyebrow", 90),
    headline: requiredText(r.headline, "headline", 150),
    description: requiredText(r.description, "description", 650),
    buttonLabel: requiredText(r.buttonLabel, "buttonLabel", 90),
    buttonHref,
    imageUrl,
    imagePositionX: num("imagePositionX", 0, 100),
    imagePositionY: num("imagePositionY", 0, 100),
    overlayOpacity: num("overlayOpacity", 0, 85),
    headingScale: num("headingScale", 70, 145),
    descriptionScale: num("descriptionScale", 70, 145),
    phoneScale: num("phoneScale", 70, 145),
    iconScale: num("iconScale", 70, 145),
    spacingScale: num("spacingScale", 65, 155),
    showSecondaryPhone: flag("showSecondaryPhone"),
    showAddress: flag("showAddress"),
    showEmail: flag("showEmail"),
  };
}
