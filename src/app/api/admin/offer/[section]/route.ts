import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminOfferSection, writeOfferSection } from "@/lib/offer/data";
import { isOfferSection, parseOfferSection, OfferValidationError } from "@/lib/offer/schema";

type Ctx = { params: Promise<{ section: string }> };
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET(_: Request, { params }: Ctx) {
  const { section } = await params;
  if (!isOfferSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isAdminConfigured() || !(await getAdminUid())) return json({ error: "Brak dostępu." }, 401);
  try { return json(await getAdminOfferSection(section)); }
  catch { return json({ error: "Nie udało się pobrać sekcji." }, 500); }
}
async function save(request: Request, { params }: Ctx, publish: boolean) {
  const { section } = await params;
  if (!isOfferSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie." }, 403);
  if (!isAdminConfigured()) return json({ error: "Brak konfiguracji administratora." }, 503);
  const uid = await getAdminUid();
  if (!uid) return json({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 160_000) return json({ error: "Za duży formularz." }, 413);
    const content = parseOfferSection(section, JSON.parse(raw));
    await writeOfferSection(section, content, uid, publish);
    if (publish) {
      revalidateTag(`janczak-offer-${section}`, { expire: 0 });
      revalidatePath("/oferta");
    }
    return json({ ok: true });
  } catch (error) {
    if (error instanceof OfferValidationError || error instanceof SyntaxError) return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać sekcji." }, 500);
  }
}
export const PUT = (request: Request, ctx: Ctx) => save(request, ctx, false);
export const POST = (request: Request, ctx: Ctx) => save(request, ctx, true);
