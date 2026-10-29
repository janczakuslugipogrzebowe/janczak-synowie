import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminContactPageSection, writeContactPageSection } from "@/lib/contact-page/data";
import {
  isContactPageSection,
  parseContactDetails,
  parseContactFormSection,
  ContactPageValidationError,
} from "@/lib/contact-page/schema";
type Context = { params: Promise<{ section: string }> };
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET(_: Request, { params }: Context) {
  const { section } = await params;
  if (!isContactPageSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isAdminConfigured() || !(await getAdminUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminContactPageSection(section));
  } catch {
    return json({ error: "Nie udało się pobrać sekcji." }, 500);
  }
}
async function save(request: Request, { params }: Context, publish: boolean) {
  const { section } = await params;
  if (!isContactPageSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie." }, 403);
  if (!isAdminConfigured() || !(await getAdminUid())) return json({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 5000) return json({ error: "Za duży formularz." }, 413);
    if (section === "details")
      await writeContactPageSection(
        "details",
        parseContactDetails(JSON.parse(raw)),
        (await getAdminUid())!,
        publish,
      );
    else
      await writeContactPageSection(
        "form",
        parseContactFormSection(JSON.parse(raw)),
        (await getAdminUid())!,
        publish,
      );
    if (publish) {
      revalidateTag(`janczak-contact-page-${section}`, { expire: 0 });
      revalidatePath("/kontakt");
    }
    return json({ ok: true });
  } catch (error) {
    if (error instanceof ContactPageValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać sekcji." }, 500);
  }
}
export const PUT = (request: Request, context: Context) => save(request, context, false);
export const POST = (request: Request, context: Context) => save(request, context, true);
