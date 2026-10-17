import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { getAdminHeroState, publishHero, saveHeroDraft } from "@/lib/hero/data";
import { HeroValidationError, parseHero } from "@/lib/hero/schema";
import { getAdminSiteSettings } from "@/lib/settings/data";

const noStore = { "Cache-Control": "private, no-store" };
const response = (body: unknown, status = 200) => Response.json(body, { status, headers: noStore });

type Authorization = { ok: true; uid: string } | { ok: false; status: number; error: string };
async function authorize(): Promise<Authorization> {
  if (!isAdminConfigured())
    return {
      ok: false,
      status: 503,
      error: "Brakuje konfiguracji Firebase Admin SDK lub FIREBASE_ADMIN_UID.",
    };
  const uid = await getAdminUid();
  if (!uid) return { ok: false, status: 401, error: "Sesja wygasła. Zaloguj się ponownie." };
  return { ok: true, uid };
}

export async function GET() {
  const checked = await authorize();
  if (!checked.ok) return response({ error: checked.error }, checked.status);
  try {
    const [hero, settings] = await Promise.all([getAdminHeroState(), getAdminSiteSettings()]);
    return response({ ...hero, settings: settings.published });
  } catch {
    return response(
      { error: "Nie udało się pobrać treści z Firestore. Sprawdź konfigurację i spróbuj ponownie." },
      500,
    );
  }
}

async function write(request: Request, publish: boolean) {
  if (!isSameOrigin(request)) return response({ error: "Nieprawidłowe pochodzenie żądania." }, 403);
  const checked = await authorize();
  if (!checked.ok) return response({ error: checked.error }, checked.status);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return response({ error: "Wymagany format JSON." }, 415);
  try {
    const raw = await request.text();
    if (raw.length > 12_000) return response({ error: "Za duży formularz." }, 413);
    const hero = parseHero(JSON.parse(raw));
    if (publish) {
      await publishHero(hero, checked.uid);
      revalidateTag("janczak-home-hero", { expire: 0 });
      revalidatePath("/");
    } else {
      await saveHeroDraft(hero, checked.uid);
    }
    return response({ ok: true, published: publish });
  } catch (error) {
    if (error instanceof HeroValidationError || error instanceof SyntaxError)
      return response({ error: error.message }, 400);
    return response({ error: "Błąd zapisu do Firestore. Spróbuj ponownie." }, 500);
  }
}

export async function PUT(request: Request) {
  return write(request, false);
}
export async function POST(request: Request) {
  return write(request, true);
}
