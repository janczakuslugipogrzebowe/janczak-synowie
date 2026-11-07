import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import {
  getAdminOfferServices,
  saveOfferServices,
  OfferCatalogConflictError,
} from "@/lib/offer/services-data";
import { parseServiceCatalog, ServiceCatalogValidationError } from "@/lib/offer/service-catalog";
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET() {
  if (!isAdminConfigured() || !(await getAdminUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminOfferServices());
  } catch {
    return json({ error: "Nie udało się pobrać katalogu." }, 500);
  }
}
async function update(request: Request, publish: boolean) {
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie." }, 403);
  if (!isAdminConfigured()) return json({ error: "Brak konfiguracji administratora." }, 503);
  const uid = await getAdminUid();
  if (!uid) return json({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Wymagany JSON." }, 415);
  try {
    const input = await request.text();
    if (input.length > 350_000) return json({ error: "Dane przekraczają dopuszczalny rozmiar." }, 413);
    const catalog = parseServiceCatalog(JSON.parse(input));
    const expected = request.headers.get("if-match");
    if (!expected) return json({ error: "Brak wersji katalogu. Odśwież edytor i spróbuj ponownie." }, 428);
    const revision = await saveOfferServices(catalog, uid, publish, expected);
    if (publish) {
      revalidateTag("janczak-offer-services", { expire: 0 });
      revalidatePath("/oferta");
      revalidatePath("/");
    }
    return json({ ok: true, revision });
  } catch (e) {
    if (e instanceof OfferCatalogConflictError) return json({ error: e.message }, 409);
    if (e instanceof ServiceCatalogValidationError || e instanceof SyntaxError)
      return json({ error: e.message }, 400);
    return json({ error: "Nie udało się zapisać katalogu." }, 500);
  }
}
export const PUT = (request: Request) => update(request, false);
export const POST = (request: Request) => update(request, true);
