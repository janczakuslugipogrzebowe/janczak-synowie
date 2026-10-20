import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminSubpageBlock, writeSubpageBlock } from "@/lib/subpages/data";
import {
  validSubpage,
  isSubpageSection,
  parseSubpageBlock,
  SubpageValidationError,
} from "@/lib/subpages/schema";
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
type Ctx = { params: Promise<{ slug: string; section: string }> };
export async function GET(_: Request, { params }: Ctx) {
  const { slug, section } = await params;
  if (!validSubpage(slug, section) || !isSubpageSection(section))
    return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isAdminConfigured() || !(await getAdminUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminSubpageBlock(slug, section));
  } catch {
    return json({ error: "Błąd odczytu sekcji." }, 500);
  }
}
async function save(request: Request, { params }: Ctx, publish: boolean) {
  const { slug, section } = await params;
  if (!validSubpage(slug, section) || !isSubpageSection(section))
    return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie." }, 403);
  if (!isAdminConfigured()) return json({ error: "Brak konfiguracji." }, 503);
  const uid = await getAdminUid();
  if (!uid) return json({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 5500) return json({ error: "Za duży formularz." }, 413);
    const content = parseSubpageBlock(JSON.parse(raw));
    await writeSubpageBlock(slug, section, content, uid, publish);
    if (publish) {
      revalidateTag(`janczak-subpage-${slug}-${section}`, { expire: 0 });
      revalidatePath(`/${slug}`);
    }
    return json({ ok: true });
  } catch (error) {
    if (error instanceof SubpageValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać sekcji." }, 500);
  }
}
export const PUT = (request: Request, context: Ctx) => save(request, context, false);
export const POST = (request: Request, context: Ctx) => save(request, context, true);
