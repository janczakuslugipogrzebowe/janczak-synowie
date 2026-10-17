import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminHomeGuidanceState, writeHomeGuidance } from "@/lib/home-guidance/data";
import { HomeGuidanceValidationError, parseHomeGuidance } from "@/lib/home-guidance/schema";

const reply = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
const authorize = async () => (isAdminConfigured() ? getAdminUid() : null);
export async function GET() {
  const uid = await authorize();
  if (!uid) return reply({ error: "Brak dostępu do panelu." }, 401);
  try {
    return reply(await getAdminHomeGuidanceState());
  } catch {
    return reply({ error: "Nie udało się pobrać danych." }, 500);
  }
}
async function save(request: Request, publish: boolean) {
  if (!isSameOrigin(request)) return reply({ error: "Niedozwolone pochodzenie żądania." }, 403);
  const uid = await authorize();
  if (!uid) return reply({ error: "Brak dostępu do panelu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 14000) return reply({ error: "Formularz przekracza dopuszczalny rozmiar." }, 413);
    const content = parseHomeGuidance(JSON.parse(raw));
    await writeHomeGuidance(content, uid, publish);
    if (publish) {
      revalidateTag("janczak-home-guidance", { expire: 0 });
      revalidatePath("/");
    }
    return reply({ ok: true, published: publish });
  } catch (error) {
    if (error instanceof HomeGuidanceValidationError || error instanceof SyntaxError)
      return reply({ error: error.message }, 400);
    return reply({ error: "Nie udało się zapisać zmian." }, 500);
  }
}
export async function PUT(request: Request) {
  return save(request, false);
}
export async function POST(request: Request) {
  return save(request, true);
}
