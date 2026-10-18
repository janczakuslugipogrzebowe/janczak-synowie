import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminDocumentsLibraryState, writeDocumentsLibrary } from "@/lib/documents/data";
import { DocumentsValidationError, parseDocumentLibrary } from "@/lib/documents/schema";

const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
const authorize = async () => (isAdminConfigured() ? getAdminUid() : null);

export async function GET() {
  const uid = await authorize();
  if (!uid) return json({ error: "Brak dostępu do panelu." }, 401);
  try {
    return json(await getAdminDocumentsLibraryState());
  } catch {
    return json({ error: "Nie udało się pobrać dokumentów." }, 500);
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
    if (raw.length > 22000) return json({ error: "Przekroczono rozmiar biblioteki." }, 413);
    const content = parseDocumentLibrary(JSON.parse(raw));
    await writeDocumentsLibrary(content, uid, publish);
    if (publish) {
      revalidateTag("janczak-documents-library", { expire: 0 });
      revalidatePath("/");
      revalidatePath("/dokumenty");
    }
    return json({ ok: true, published: publish });
  } catch (error) {
    if (error instanceof DocumentsValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać dokumentów." }, 500);
  }
}

export async function PUT(request: Request) {
  return save(request, false);
}
export async function POST(request: Request) {
  return save(request, true);
}
