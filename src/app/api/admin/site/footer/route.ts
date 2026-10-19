import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminFooterState, writeFooter } from "@/lib/footer/data";
import { FooterValidationError, parseFooter } from "@/lib/footer/schema";

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
const getUid = () => (isAdminConfigured() ? getAdminUid() : Promise.resolve(null));

export async function GET() {
  if (!(await getUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminFooterState());
  } catch {
    return json({ error: "Nie udało się pobrać stopki." }, 500);
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
    if (raw.length > 20000) return json({ error: "Za duży formularz." }, 413);
    const content = parseFooter(JSON.parse(raw));
    await writeFooter(content, uid, publish);
    if (publish) {
      revalidateTag("janczak-site-footer", { expire: 0 });
      // Layout is shared across all public routes; the cache-tag invalidates all usages.
      revalidatePath("/", "layout");
    }
    return json({ ok: true });
  } catch (error) {
    if (error instanceof FooterValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać stopki." }, 500);
  }
}

export const PUT = (request: Request) => save(request, false);
export const POST = (request: Request) => save(request, true);
