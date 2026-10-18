import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminGalleryState, writeGalleryLibrary } from "@/lib/gallery/data";
import { GalleryValidationError, parseGalleryLibrary } from "@/lib/gallery/schema";

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
    if (raw.length > 130000) return json({ error: "Za duża biblioteka." }, 413);
    const items = parseGalleryLibrary(JSON.parse(raw));
    await writeGalleryLibrary(items, uid, publish);
    if (publish) {
      revalidateTag("janczak-gallery-library", { expire: 0 });
      revalidatePath("/");
      revalidatePath("/galeria");
    }
    return json({ ok: true });
  } catch (error) {
    if (error instanceof GalleryValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać zdjęć." }, 500);
  }
}
export const PUT = (request: Request) => save(request, false);
export const POST = (request: Request) => save(request, true);
