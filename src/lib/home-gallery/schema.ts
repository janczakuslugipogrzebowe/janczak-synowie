function safeGalleryImage(value: string): boolean {
  if (typeof value !== "string" || value.length > 800 || /[\s"'\\<>()\u0000-\u001f]/.test(value))
    return false;
  if (
    /^\/[a-z0-9][a-z0-9/_-]*\.(?:png|jpg|jpeg|webp|avif)$/i.test(value) &&
    !value.includes("..") &&
    !value.includes("//")
  )
    return true;
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      !u.search &&
      !u.hash &&
      (u.hostname === "public.blob.vercel-storage.com" ||
        u.hostname.endsWith(".public.blob.vercel-storage.com")) &&
      /\.(?:png|jpg|jpeg|webp|avif)$/i.test(u.pathname)
    );
  } catch {
    return false;
  }
}

export type HomeGalleryContent = {
  eyebrow: string;
  headline: string;
  description: string;
  buttonLabel: string;
  backgroundImageUrl: string;
  backgroundOpacity: number;
  headingScale: number;
  descriptionScale: number;
  cardScale: number;
  gapScale: number;
  autoplaySeconds: number;
};

export const DEFAULT_HOME_GALLERY: HomeGalleryContent = {
  eyebrow: "NASZA GALERIA",
  headline: "Miejsca, detale i chwile",
  description: "Poznaj naszą firmę i miejsca, w których z troską przygotowujemy ostatnie pożegnania.",
  buttonLabel: "Zobacz całą galerię",
  backgroundImageUrl: "/galeria-home-tlo.png",
  backgroundOpacity: 35,
  headingScale: 100,
  descriptionScale: 100,
  cardScale: 100,
  gapScale: 100,
  autoplaySeconds: 5,
};
export class HomeGalleryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HomeGalleryValidationError";
  }
}
export function parseHomeGallery(value: unknown): HomeGalleryContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HomeGalleryValidationError("Nieprawidłowa sekcja Galeria.");
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((k) => !(k in DEFAULT_HOME_GALLERY)))
    throw new HomeGalleryValidationError("Nieznane pole sekcji.");
  function str(key: keyof HomeGalleryContent, max: number) {
    const val = v[key];
    if (
      typeof val !== "string" ||
      !val.trim() ||
      val.trim().length > max ||
      /[\u0000-\u001f\u007f]/.test(val)
    )
      throw new HomeGalleryValidationError(`Nieprawidłowe pole: ${key}`);
    return val.trim();
  }
  function num(key: keyof HomeGalleryContent, min: number, max: number) {
    const val = v[key] ?? DEFAULT_HOME_GALLERY[key];
    if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max)
      throw new HomeGalleryValidationError(`Pole ${key} musi mieścić się w zakresie ${min}–${max}.`);
    return val;
  }
  const result = {
    eyebrow: str("eyebrow", 65),
    headline: str("headline", 130),
    description: str("description", 650),
    buttonLabel: str("buttonLabel", 80),
    backgroundImageUrl: str("backgroundImageUrl", 800),
    backgroundOpacity: num("backgroundOpacity", 0, 85),
    headingScale: num("headingScale", 75, 135),
    descriptionScale: num("descriptionScale", 75, 135),
    cardScale: num("cardScale", 75, 130),
    gapScale: num("gapScale", 65, 150),
    autoplaySeconds: num("autoplaySeconds", 3, 12),
  };
  if (!safeGalleryImage(result.backgroundImageUrl))
    throw new HomeGalleryValidationError("Nieprawidłowa ścieżka zdjęcia tła.");
  return result;
}
