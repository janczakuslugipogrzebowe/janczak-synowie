import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminObituariesPageSection, writeObituariesPageSection } from "@/lib/obituaries-page/data";
import {
  isObituariesPageSection,
  parseObituariesListing,
  parseObituariesInformation,
  ObituariesPageValidationError,
} from "@/lib/obituaries-page/schema";

type Ctx = { params: Promise<{ section: string }> };
const json = (content: unknown, status = 200) =>
  Response.json(content, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET(_: Request, { params }: Ctx) {
  const { section } = await params;
  if (!isObituariesPageSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isAdminConfigured() || !(await getAdminUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminObituariesPageSection(section));
  } catch {
    return json({ error: "Nie udało się odczytać sekcji." }, 500);
  }
}
async function save(request: Request, { params }: Ctx, publish: boolean) {
  const { section } = await params;
  if (!isObituariesPageSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie." }, 403);
  if (!isAdminConfigured()) return json({ error: "Brak konfiguracji." }, 503);
  const uid = await getAdminUid();
  if (!uid) return json({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 7000) return json({ error: "Za duży formularz." }, 413);
    const value = JSON.parse(raw) as unknown;
    if (section === "listing")
      await writeObituariesPageSection(section, parseObituariesListing(value), uid, publish);
    else await writeObituariesPageSection(section, parseObituariesInformation(value), uid, publish);
    if (publish) {
      revalidateTag(`janczak-obituaries-page-${section}`, { expire: 0 });
      revalidatePath("/nekrologi");
    }
    return json({ ok: true, published: publish });
  } catch (error) {
    if (error instanceof ObituariesPageValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać sekcji." }, 500);
  }
}
export const PUT = (request: Request, context: Ctx) => save(request, context, false);
export const POST = (request: Request, context: Ctx) => save(request, context, true);
