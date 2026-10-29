import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminSiteSettings, publishSiteSettings, saveSiteSettingsDraft } from "@/lib/settings/data";
import { parseSiteSettings, SettingsValidationError } from "@/lib/settings/schema";

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

async function authorize() {
  if (!isAdminConfigured()) return { error: "Nie skonfigurowano Firebase Admin.", status: 503 } as const;
  const uid = await getAdminUid();
  if (!uid) return { error: "Sesja administratora wygasła.", status: 401 } as const;
  return { uid } as const;
}

export async function GET() {
  const access = await authorize();
  if ("error" in access) return reply({ error: access.error }, access.status);
  try {
    return reply(await getAdminSiteSettings());
  } catch {
    return reply({ error: "Nie udało się pobrać ustawień." }, 500);
  }
}

async function save(request: Request, publish: boolean) {
  if (!isSameOrigin(request)) return reply({ error: "Nieprawidłowe pochodzenie żądania." }, 403);
  const access = await authorize();
  if ("error" in access) return reply({ error: access.error }, access.status);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Wymagany format JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 12000) return reply({ error: "Formularz jest za duży." }, 413);
    const settings = parseSiteSettings(JSON.parse(raw));
    if (publish) {
      await publishSiteSettings(settings, access.uid);
      revalidateTag("janczak-site-settings", { expire: 0 });
      revalidatePath("/");
    } else {
      await saveSiteSettingsDraft(settings, access.uid);
    }
    return reply({ ok: true });
  } catch (error) {
    if (error instanceof SettingsValidationError || error instanceof SyntaxError)
      return reply({ error: error.message }, 400);
    return reply({ error: "Nie udało się zapisać ustawień." }, 500);
  }
}
export async function PUT(request: Request) {
  return save(request, false);
}
export async function POST(request: Request) {
  return save(request, true);
}
