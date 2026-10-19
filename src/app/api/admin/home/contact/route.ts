import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminHomeContactState, writeHomeContact } from "@/lib/home-contact/data";
import { HomeContactValidationError, parseHomeContact } from "@/lib/home-contact/schema";

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
const getUid = () => (isAdminConfigured() ? getAdminUid() : Promise.resolve(null));

export async function GET() {
  if (!(await getUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminHomeContactState());
  } catch {
    return json({ error: "Nie udało się pobrać sekcji Kontakt." }, 500);
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
    if (raw.length > 12000) return json({ error: "Za duży formularz." }, 413);
    const content = parseHomeContact(JSON.parse(raw));
    await writeHomeContact(content, uid, publish);
    if (publish) {
      revalidateTag("janczak-home-contact", { expire: 0 });
      revalidatePath("/");
    }
    return json({ ok: true });
  } catch (error) {
    if (error instanceof HomeContactValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać sekcji Kontakt." }, 500);
  }
}

export const PUT = (request: Request) => save(request, false);
export const POST = (request: Request) => save(request, true);
