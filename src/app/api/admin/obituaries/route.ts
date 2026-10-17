import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUid, isAdminConfigured } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";
import { createObituary, getAdminObituariesList } from "@/lib/obituaries/data";
import { parseObituaryInput, ObituaryValidationError, STATUSES } from "@/lib/obituaries/schema";
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const auth = async () => (isAdminConfigured() ? getAdminUid() : null);
export async function GET(request: Request) {
  if (!(await auth())) return reply({ error: "Brak dostępu." }, 401);
  try {
    const p = new URL(request.url).searchParams;
    const status = p.get("status") ?? "all";
    if (status !== "all" && !STATUSES.includes(status as (typeof STATUSES)[number]))
      return reply({ error: "Nieprawidłowy status." }, 400);
    const sort = p.get("sort") ?? "recent";
    if (!["recent", "oldest", "death"].includes(sort))
      return reply({ error: "Nieprawidłowe sortowanie." }, 400);
    const search = (p.get("q") ?? "").slice(0, 100),
      cursor = p.get("cursor") ?? "",
      dateFrom = p.get("dateFrom") ?? "",
      dateTo = p.get("dateTo") ?? "";
    if (
      [dateFrom, dateTo].some((v) => v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) ||
      (dateFrom && dateTo && dateFrom > dateTo)
    )
      return reply({ error: "Nieprawidłowy zakres dat." }, 400);
    if (cursor && !/^[a-zA-Z0-9_-]{8,90}$/.test(cursor))
      return reply({ error: "Nieprawidłowy kursor." }, 400);
    return reply(
      await getAdminObituariesList(
        status as "all" | (typeof STATUSES)[number],
        search,
        25,
        cursor,
        dateFrom,
        dateTo,
        sort as "recent" | "oldest" | "death",
      ),
    );
  } catch {
    return reply({ error: "Nie udało się pobrać nekrologów." }, 500);
  }
}
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return reply({ error: "Niedozwolone pochodzenie." }, 403);
  const uid = await auth();
  if (!uid) return reply({ error: "Brak dostępu." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Wymagany JSON." }, 415);
  try {
    const text = await request.text();
    if (text.length > 14000) return reply({ error: "Zbyt duży formularz." }, 413);
    const body = JSON.parse(text) as { data: unknown; publish: unknown };
    if (typeof body.publish !== "boolean") return reply({ error: "Błędny tryb zapisu." }, 400);
    const data = parseObituaryInput(body.data),
      result = await createObituary(data, uid, body.publish);
    if (body.publish) {
      revalidateTag("janczak-obituaries", { expire: 0 });
      revalidatePath("/");
      revalidatePath("/nekrologi");
      revalidatePath(`/nekrologi/${result.slug}`);
    }
    return reply({ ok: true, ...result }, 201);
  } catch (e) {
    if (e instanceof ObituaryValidationError || e instanceof SyntaxError)
      return reply({ error: e.message }, 400);
    return reply({ error: "Nie udało się utworzyć nekrologu." }, 500);
  }
}
