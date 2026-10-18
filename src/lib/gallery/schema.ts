export type GalleryPhoto = {
  id: string;
  title: string;
  description: string;
  alt: string;
  imageUrl: string;
  published: boolean;
  createdAt: string;
};

export class GalleryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GalleryValidationError";
  }
}

export const DEFAULT_GALLERY: GalleryPhoto[] = Array.from({ length: 6 }, (_, i) => ({
  id: `galeria-domyslna-${i + 1}`,
  title: [
    "Ceremonie i oprawa",
    "Transport",
    "Kwiaty i dekoracje",
    "Nasza firma",
    "Pożegnania",
    "Detale i wspomnienia",
  ][i],
  description: "",
  alt: [
    "Oprawa ceremonii pogrzebowej",
    "Samochód pogrzebowy",
    "Kompozycje kwiatowe",
    "Otoczenie zakładu pogrzebowego",
    "Przygotowanie ceremonii",
    "Kwiaty i pamiątki",
  ][i],
  imageUrl: `/galeria${i + 1}-home.png`,
  published: true,
  createdAt: new Date(Date.UTC(2026, 9, 12 + i, 10, 0, 0)).toISOString(),
}));

/** Local /public image or a Vercel Blob public HTTPS URL. No arbitrary remote hosts. */
export function safeGalleryImage(value: string): boolean {
  if (typeof value !== "string" || value.length > 800 || /[\s"'\\<>()\u0000-\u001f]/.test(value))
    return false;
  if (
    /^\/[a-z0-9][a-z0-9/_-]*\.(?:png|jpg|jpeg|webp|avif)$/i.test(value) &&
    !value.includes("..") &&
    !value.includes("//")
  )
    return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.hash &&
      !url.search &&
      (url.hostname === "public.blob.vercel-storage.com" ||
        url.hostname.endsWith(".public.blob.vercel-storage.com")) &&
      /\.(?:png|jpg|jpeg|webp|avif)$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

const cleanString = (value: unknown, key: string, max: number, required = true): string => {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim()) ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    throw new GalleryValidationError(`Nieprawidłowe pole ${key}.`);
  return value.trim();
};

export function parseGalleryLibrary(value: unknown): GalleryPhoto[] {
  if (!Array.isArray(value) || value.length > 120 || JSON.stringify(value).length > 130000)
    throw new GalleryValidationError("Nieprawidłowa biblioteka galerii.");
  const ids = new Set<string>();
  return value.map((row, index) => {
    if (!row || typeof row !== "object" || Array.isArray(row))
      throw new GalleryValidationError(`Zdjęcie ${index + 1}: błędne dane.`);
    const entry = row as Record<string, unknown>;
    if (
      Object.keys(entry).some(
        (k) => !["id", "title", "description", "alt", "imageUrl", "published", "createdAt"].includes(k),
      )
    )
      throw new GalleryValidationError("Nieznane pole zdjęcia.");
    const id = cleanString(entry.id, "id", 90);
    const title = cleanString(entry.title, "title", 120);
    const description = cleanString(entry.description, "description", 500, false);
    const alt = cleanString(entry.alt, "alt", 240);
    const imageUrl = cleanString(entry.imageUrl, "imageUrl", 800);
    const createdAt = cleanString(entry.createdAt, "createdAt", 30);
    if (!/^[a-z0-9][a-z0-9-]{2,89}$/.test(id) || ids.has(id))
      throw new GalleryValidationError("Identyfikatory zdjęć muszą być unikalne.");
    if (!safeGalleryImage(imageUrl))
      throw new GalleryValidationError(
        "Dozwolona jest tylko lokalna ścieżka obrazu lub publiczny adres Vercel Blob.",
      );
    if (typeof entry.published !== "boolean")
      throw new GalleryValidationError("Nieprawidłowy status zdjęcia.");
    if (
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(createdAt) ||
      !Number.isFinite(Date.parse(createdAt)) ||
      new Date(createdAt).toISOString() !== createdAt
    )
      throw new GalleryValidationError("Nieprawidłowa data dodania zdjęcia.");
    ids.add(id);
    return { id, title, description, alt, imageUrl, published: entry.published, createdAt };
  });
}

export function recentGalleryPhotos(photos: GalleryPhoto[], limit = 12): GalleryPhoto[] {
  return [...photos]
    .filter((p) => p.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
    .slice(0, limit);
}
