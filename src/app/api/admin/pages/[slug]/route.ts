import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminPageState, writePage } from "@/lib/pages/data";
import { isPageSlug, parsePageContent, PageValidationError } from "@/lib/pages/schema";
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
type Ctx = { params: Promise<{ slug: string }> };
async function access() {
  if (!isAdminConfigured()) return null;
  return getAdminUid();
}
export async function GET(_: Request, { params }: Ctx) {
  const { slug } = await params;
  if (!isPageSlug(slug)) return reply({ error: "Nie znaleziono podstrony." }, 404);
  const uid = await access();
  if (!uid) return reply({ error: "Brak dostępu." }, 401);
  try {
    return reply(await getAdminPageState(slug));
  } catch {
    return reply({ error: "Nie udało się pobrać treści." }, 500);
  }
}
async function save(request: Request, { params }: Ctx, publish: boolean) {
  const { slug } = await params;
  if (!isPageSlug(slug)) return reply({ error: "Nie znaleziono podstrony." }, 404);
  if (!isSameOrigin(request)) return reply({ error: "Niedozwolone pochodzenie." }, 403);
  const uid = await access();
  if (!uid) return reply({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 6000) return reply({ error: "Zbyt duży formularz." }, 413);
    const content = parsePageContent(JSON.parse(raw));
    await writePage(slug, content, uid, publish);
    if (publish) {
      revalidateTag(`janczak-page-${slug}`, { expire: 0 });
      revalidatePath(`/${slug}`);
    }
    return reply({ ok: true });
  } catch (e) {
    if (e instanceof PageValidationError || e instanceof SyntaxError) return reply({ error: e.message }, 400);
    return reply({ error: "Nie udało się zapisać." }, 500);
  }
}
export async function PUT(r: Request, c: Ctx) {
  return save(r, c, false);
}
export async function POST(r: Request, c: Ctx) {
  return save(r, c, true);
}
