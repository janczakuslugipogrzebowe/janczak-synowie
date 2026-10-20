import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminDocumentsPageSection, writeDocumentsPageSection } from "@/lib/documents-page/data";
import {
  DocumentsPageValidationError,
  isDocumentsPageSection,
  parseDownloadsContent,
  parseGuidanceContent,
} from "@/lib/documents-page/schema";

type Context = { params: Promise<{ section: string }> };
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET(_: Request, { params }: Context) {
  const { section } = await params;
  if (!isDocumentsPageSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isAdminConfigured() || !(await getAdminUid())) return json({ error: "Brak dostępu." }, 401);
  try {
    return json(await getAdminDocumentsPageSection(section));
  } catch {
    return json({ error: "Nie udało się odczytać sekcji." }, 500);
  }
}

async function save(request: Request, { params }: Context, publish: boolean) {
  const { section } = await params;
  if (!isDocumentsPageSection(section)) return json({ error: "Nie znaleziono sekcji." }, 404);
  if (!isSameOrigin(request)) return json({ error: "Niedozwolone pochodzenie żądania." }, 403);
  if (!isAdminConfigured()) return json({ error: "Brak konfiguracji." }, 503);
  const uid = await getAdminUid();
  if (!uid) return json({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Wymagany JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 6500) return json({ error: "Przekroczono rozmiar formularza." }, 413);
    const value = JSON.parse(raw) as unknown;
    if (section === "downloads") {
      await writeDocumentsPageSection(section, parseDownloadsContent(value), uid, publish);
    } else {
      await writeDocumentsPageSection(section, parseGuidanceContent(value), uid, publish);
    }
    if (publish) {
      revalidateTag(`janczak-documents-page-${section}`, { expire: 0 });
      revalidatePath("/dokumenty");
    }
    return json({ ok: true, published: publish });
  } catch (error) {
    if (error instanceof DocumentsPageValidationError || error instanceof SyntaxError)
      return json({ error: error.message }, 400);
    return json({ error: "Nie udało się zapisać sekcji." }, 500);
  }
}

export const PUT = (request: Request, context: Context) => save(request, context, false);
export const POST = (request: Request, context: Context) => save(request, context, true);
