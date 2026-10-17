export type FloristFeature = { title: string; description: string };
export type HomeFloristContent = {
  eyebrow: string;
  headline: string;
  tagline: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imagePositionX: number;
  imagePositionY: number;
  overlayOpacity: number;
  leftShade: number;
  rightShade: number;
  headingScale: number;
  taglineScale: number;
  descriptionScale: number;
  featureScale: number;
  iconScale: number;
  spacingScale: number;
  features: FloristFeature[];
};

export const DEFAULT_HOME_FLORIST: HomeFloristContent = {
  eyebrow: "NASZA KWIACIARNIA",
  headline: "Zielona Przystań",
  tagline: "Kwiaty, które dopełniają najważniejsze chwile.",
  description: "Prowadzimy również własną kwiaciarnię Zielona Przystań. Tworzymy kompozycje kwiatowe na różne okazje, a także wieńce, wiązanki i dekoracje pogrzebowe. Dzięki temu możemy zadbać o organizację pożegnania i jego oprawę florystyczną w jednym miejscu.",
  buttonLabel: "Poznaj ofertę kwiaciarni",
  buttonHref: "/oferta",
  imageUrl: "/kwiaciarnia-home.png",
  imagePositionX: 50,
  imagePositionY: 50,
  overlayOpacity: 32,
  leftShade: 75,
  rightShade: 64,
  headingScale: 100,
  taglineScale: 100,
  descriptionScale: 100,
  featureScale: 100,
  iconScale: 100,
  spacingScale: 100,
  features: [
    { title: "Florystyka pogrzebowa", description: "Wieńce, wiązanki i dekoracje na ostatnie pożegnanie" },
    { title: "Kompozycje na różne okazje", description: "Kwiaty cięte, bukiety i indywidualne zamówienia" },
    { title: "Wszystko w jednym miejscu", description: "Usługi pogrzebowe i oprawa florystyczna" },
  ],
};

export class HomeFloristValidationError extends Error {
  constructor(message: string) { super(message); this.name = "HomeFloristValidationError"; }
}

export function safeFloristImage(value: string): boolean {
  if (typeof value !== "string" || value.length > 500 || /["'\\()< >\u0000-\u0020]/.test(value)) return false;
  if (/^\/[A-Za-z0-9][A-Za-z0-9/_-]*\.(?:png|jpe?g|webp|avif)$/i.test(value) && !value.includes("//") && !value.includes("..")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password && !u.port &&
      (u.hostname === "public.blob.vercel-storage.com" || u.hostname.endsWith(".public.blob.vercel-storage.com")) &&
      /\.(?:png|jpe?g|webp|avif)$/i.test(u.pathname);
  } catch { return false; }
}

export function safeFloristHref(value: string): boolean {
  return value === "/oferta" || /^\/oferta#[a-z0-9-]{1,70}$/i.test(value);
}

export function parseHomeFlorist(value: unknown): HomeFloristContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HomeFloristValidationError("Nieprawidłowa zawartość sekcji kwiaciarni.");
  const obj = value as Record<string, unknown>;
  if (Object.keys(obj).some(key => !(key in DEFAULT_HOME_FLORIST))) throw new HomeFloristValidationError("Nieznane pole w danych kwiaciarni.");
  function str(key: keyof HomeFloristContent, max: number, multiline = false) {
    const v = obj[key];
    if (typeof v !== "string" || !v.trim() || v.trim().length > max || (multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/ : /[\u0000-\u001F\u007F]/).test(v)) throw new HomeFloristValidationError(`Nieprawidłowe pole: ${key}.`);
    return v.trim();
  }
  function num(key: keyof HomeFloristContent, min: number, max: number) {
    const v = obj[key] ?? DEFAULT_HOME_FLORIST[key];
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw new HomeFloristValidationError(`Pole ${key}: zakres ${min}–${max}.`);
    return v;
  }
  if (!Array.isArray(obj.features) || obj.features.length !== 3) throw new HomeFloristValidationError("Wymagane są dokładnie trzy wyróżniki.");
  const features: FloristFeature[] = obj.features.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new HomeFloristValidationError(`Wyróżnik ${index + 1}: błędny format.`);
    const item = raw as Record<string, unknown>;
    if (Object.keys(item).some(key => key !== "title" && key !== "description")) throw new HomeFloristValidationError(`Wyróżnik ${index + 1}: nieznane pole.`);
    const get = (key: "title" | "description", max: number) => {
      const v = item[key];
      if (typeof v !== "string" || !v.trim() || v.trim().length > max || /[\u0000-\u001F\u007F]/.test(v)) throw new HomeFloristValidationError(`Wyróżnik ${index + 1}: nieprawidłowe pole ${key}.`);
      return v.trim();
    };
    return {title:get("title",90),description:get("description",165)};
  });
  const result: HomeFloristContent = {
    eyebrow:str("eyebrow",70), headline:str("headline",110), tagline:str("tagline",180),
    description:str("description",1000,true), buttonLabel:str("buttonLabel",60), buttonHref:str("buttonHref",90),
    imageUrl:str("imageUrl",500), imagePositionX:num("imagePositionX",0,100),imagePositionY:num("imagePositionY",0,100),
    overlayOpacity:num("overlayOpacity",0,80),leftShade:num("leftShade",0,95),rightShade:num("rightShade",0,95),
    headingScale:num("headingScale",75,140),taglineScale:num("taglineScale",80,140),descriptionScale:num("descriptionScale",80,140),
    featureScale:num("featureScale",80,135),iconScale:num("iconScale",75,140),spacingScale:num("spacingScale",75,140),features,
  };
  if (!safeFloristImage(result.imageUrl)) throw new HomeFloristValidationError("Nieprawidłowy adres zdjęcia.");
  if (!safeFloristHref(result.buttonHref)) throw new HomeFloristValidationError("Przycisk może prowadzić tylko do oferty.");
  return result;
}
