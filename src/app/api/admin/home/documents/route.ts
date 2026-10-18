import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminHomeDocumentsState, writeHomeDocuments } from "@/lib/home-documents/data";
import { HomeDocumentsValidationError, parseHomeDocuments } from "@/lib/home-documents/schema";

const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
const authorize = async () => (isAdminConfigured() ? getAdminUid() : null);

export async function GET() {
  const uid = await authorize();
  if (!uid) return json({ error: "Brak dostępu do panelu." }, 401);
  try {
    return json(await getAdminHomeDocumentsState());
  } catch {
    return json({ error: "Nie udało się pobrać ustawień sekcji." }, 500);
  }
}

async function save(request: Request, publish: boolean) {
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie żądania." }, 403);
  const uid = await authorize();
  if (!uid) return json({ error: "Brak dostępu do panelu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 10000) return json({ error: "Formularz jest zbyt duży." }, 413);
    const content = parseHomeDocuments(JSON.parse(raw));
    await writeHomeDocuments(content, uid, publish);
    if (publish) {
      revalidateTag("janczak-home-documents", { expire: 0 });
      revalidatePath("/");
    }
    return json({ ok: true, published: publish });
  } catch (error) {
    if (error instanceof HomeDocumentsValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać sekcji." }, 500);
  }
}

export async function PUT(request: Request) {
  return save(request, false);
}
export async function POST(request: Request) {
  return save(request, true);
}
