import { NextResponse } from "next/server";
import { cmsAuth } from "@/lib/firebase/admin";
import { ADMIN_COOKIE, isAdminConfigured, SESSION_DURATION_MS } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";

const response = (data: unknown, status: number) => NextResponse.json(data, {
  status,
  headers: { "Cache-Control": "private, no-store" },
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return response({ error: "Nieprawidłowe pochodzenie żądania." }, 403);
  if (!isAdminConfigured()) return response({ error: "Serwer nie został skonfigurowany." }, 503);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return response({ error: "Wymagany JSON." }, 415);
  try {
    const input = await request.text();
    if (input.length > 6_000) return response({ error: "Zbyt duże żądanie." }, 413);
    const body: unknown = JSON.parse(input);
    if (!body || typeof body !== "object" || Array.isArray(body) || !("idToken" in body))
      return response({ error: "Brak tokenu logowania." }, 400);
    const idToken = (body as { idToken: unknown }).idToken;
    if (typeof idToken !== "string" || idToken.length < 100 || idToken.length > 5_000)
      return response({ error: "Nieprawidłowy token." }, 400);

    const decoded = await cmsAuth().verifyIdToken(idToken, true);
    if (decoded.uid !== process.env.FIREBASE_ADMIN_UID)
      return response({ error: "Brak uprawnień administratora." }, 403);

    // Firebase zaleca niedawne logowanie przy wystawianiu długotrwałej sesji.
    const now = Math.floor(Date.now() / 1000);
    if (typeof decoded.auth_time !== "number" || now - decoded.auth_time > 5 * 60 || decoded.auth_time > now + 60)
      return response({ error: "Zaloguj się ponownie, aby potwierdzić tożsamość administratora." }, 401);

    const cookie = await cmsAuth().createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
    const result = response({ ok: true }, 200);
    result.cookies.set({
      name: ADMIN_COOKIE, value: cookie, httpOnly: true,
      secure: process.env.NODE_ENV === "production", sameSite: "strict",
      path: "/", maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    });
    return result;
  } catch {
    return response({ error: "Nie udało się rozpocząć sesji. Zaloguj się ponownie." }, 401);
  }
}
