import { safeGalleryImage, type GalleryPhoto, GalleryValidationError } from "./schema";

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  order: number;
  published: boolean;
};

export const DEFAULT_ALBUMS: GalleryAlbum[] = [
  ["siedziba", "Siedziba", "Poznaj naszą firmę i jej otoczenie.", 4],
  ["sala-pozegnan", "Sala pożegnań", "Miejsca przygotowane na godne pożegnanie.", 6],
  ["karawan", "Karawan", "Pojazdy i profesjonalny transport.", 2],
  ["trumny-i-urny", "Trumny i urny", "Wyposażenie i elementy naszej oferty.", 1],
  ["kompozycje-kwiatowe", "Kompozycje kwiatowe", "Wieńce, wiązanki i dekoracje.", 3],
  ["detale-ceremonii", "Detale ceremonii", "Dbałość o szczegóły uroczystości.", 5],
].map(([id, title, description, image], order) => ({
  id: String(id),
  slug: String(id),
  title: String(title),
  description: String(description),
  coverUrl: `/galeria${image}-home.png`,
  order,
  published: true,
}));

export function gallerySlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 76);
}

export function parseGalleryAlbums(value: unknown): GalleryAlbum[] {
  if (!Array.isArray(value) || value.length > 60 || JSON.stringify(value).length > 45000)
    throw new GalleryValidationError("Nieprawidłowa lista albumów.");
  const ids = new Set<string>(),
    slugs = new Set<string>();
  return value.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row))
      throw new GalleryValidationError("Niepoprawny album.");
    const a = row as Record<string, unknown>;
    if (
      Object.keys(a).some(
        (k) => !["id", "slug", "title", "description", "coverUrl", "order", "published"].includes(k),
      )
    )
      throw new GalleryValidationError("Nieznane pole albumu.");
    for (const k of ["id", "slug", "title", "description", "coverUrl"])
      if (
        typeof a[k] !== "string" ||
        (a[k] as string).length > (k === "description" ? 500 : k === "coverUrl" ? 800 : 130)
      )
        throw new GalleryValidationError(`Nieprawidłowe pole albumu: ${k}.`);
    const id = (a.id as string).trim(),
      slug = (a.slug as string).trim();
    if (
      !/^[a-z0-9][a-z0-9-]{2,90}$/.test(id) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      slug.length > 90 ||
      ids.has(id) ||
      slugs.has(slug)
    )
      throw new GalleryValidationError("ID i slug albumów muszą być unikalne.");
    if (!(a.title as string).trim() || /[\u0000-\u001f\u007f]/.test((a.title as string) + a.description))
      throw new GalleryValidationError("Nieprawidłowy tytuł lub opis albumu.");
    if (!safeGalleryImage(a.coverUrl as string))
      throw new GalleryValidationError("Niepoprawna okładka albumu.");
    if (
      !Number.isInteger(a.order) ||
      Number(a.order) < 0 ||
      Number(a.order) > 9999 ||
      typeof a.published !== "boolean"
    )
      throw new GalleryValidationError("Nieprawidłowa kolejność lub status albumu.");
    ids.add(id);
    slugs.add(slug);
    return {
      id,
      slug,
      title: (a.title as string).trim(),
      description: (a.description as string).trim(),
      coverUrl: a.coverUrl as string,
      order: a.order as number,
      published: a.published as boolean,
    };
  });
}

/** For legacy photos without albumId, pair only the known original example image paths. */
export function galleryPhotoAlbum(photo: GalleryPhoto): string {
  if (photo.albumId !== undefined) return photo.albumId;
  const n = /^\/galeria([1-6])-home\.png$/.exec(photo.imageUrl)?.[1];
  return n
    ? ["trumny-i-urny", "karawan", "kompozycje-kwiatowe", "siedziba", "detale-ceremonii", "sala-pozegnan"][
        Number(n) - 1
      ]
    : "";
}
