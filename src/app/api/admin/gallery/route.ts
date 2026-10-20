import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminGalleryState, writeGalleryLibrary } from "@/lib/gallery/data";
import { GalleryValidationError, parseGalleryLibrary } from "@/lib/gallery/schema";
import { parseGalleryAlbums, galleryPhotoAlbum } from "@/lib/gallery/albums";

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
const getUid = () => (isAdminConfigured() ? getAdminUid() : Promise.resolve(null));

export async function GET() {
  if (!(await getUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminGalleryState());
  } catch {
    return json({ error: "Nie udało się pobrać galerii." }, 500);
  }
}
async function save(request: Request, publish: boolean) {
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie." }, 403);
  const uid = await getUid();
  if (!uid) return json({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Oczekiwano JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 190000) return json({ error: "Za duża biblioteka." }, 413);
    const payload: unknown = JSON.parse(raw);
    const legacy = Array.isArray(payload);
    const obj =
      !legacy && typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : null;
    if (!legacy && (!obj || Object.keys(obj).some((k) => !["photos", "albums"].includes(k))))
      throw new GalleryValidationError("Niepoprawny format galerii.");
    const photos = parseGalleryLibrary(legacy ? payload : obj?.photos);
    const albums = legacy ? undefined : parseGalleryAlbums(obj?.albums);
    if (albums) {
      const known = new Set(albums.map((a) => a.id));
      if (photos.some((p) => galleryPhotoAlbum(p) && !known.has(galleryPhotoAlbum(p))))
        throw new GalleryValidationError("Zdjęcie przypisano do nieistniejącego albumu.");
    }
    await writeGalleryLibrary(photos, uid, publish, albums);
    if (publish) {
      revalidateTag("janczak-gallery-library", { expire: 0 });
      revalidatePath("/");
      revalidatePath("/galeria", "layout");
    }
    return json({ ok: true });
  } catch (error) {
    if (error instanceof GalleryValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać galerii." }, 500);
  }
}
export const PUT = (request: Request) => save(request, false);
export const POST = (request: Request) => save(request, true);
