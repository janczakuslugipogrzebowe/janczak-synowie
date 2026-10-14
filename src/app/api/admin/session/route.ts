import { NextResponse } from "next/server";
import { cmsAuth } from "@/lib/firebase/admin";
import { ADMIN_COOKIE, isAdminConfigured, SESSION_DURATION_MS } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";

const response = (data: unknown, status: number) => NextResponse.json(data, {
  status,
  headers: { "Cache-Control": "private, no-store" },
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return response({ error: "Nieprawidłowe pochodzenie żądania." }, 403);
  }
  if (!isAdminConfigured()) {
    console.error("[admin/session] Missing Firebase Admin environment variables or admin UID.");
    return response({ error: "Brakuje konfiguracji Firebase Admin na serwerze." }, 503);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return response({ error: "Wymagany format JSON." }, 415);
  }

  let idToken: string;
  try {
    const input = await request.text();
    if (input.length > 6_000) return response({ error: "Zbyt duże żądanie." }, 413);
    const body: unknown = JSON.parse(input);
    if (!body || typeof body !== "object" || Array.isArray(body) || !("idToken" in body)) {
      return response({ error: "Brak tokenu logowania." }, 400);
    }
    const value = (body as { idToken: unknown }).idToken;
    if (typeof value !== "string" || value.length < 100 || value.length > 5_000) {
      return response({ error: "Nieprawidłowy token." }, 400);
    }
    idToken = value;
  } catch {
    return response({ error: "Niepoprawne dane logowania." }, 400);
  }

  try {
    const decoded = await cmsAuth().verifyIdToken(idToken, true);
    if (decoded.uid !== process.env.FIREBASE_ADMIN_UID) {
      return response({ error: "Brak uprawnień administratora." }, 403);
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof decoded.auth_time !== "number" || now - decoded.auth_time > 5 * 60 || decoded.auth_time > now + 60) {
      return response({ error: "Zaloguj się ponownie, aby potwierdzić tożsamość." }, 401);
    }

    const cookie = await cmsAuth().createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
    const result = response({ ok: true }, 200);
    result.cookies.set({
      name: ADMIN_COOKIE,
      value: cookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    });
    return result;
  } catch (error) {
    // Never log credentials, ID tokens or session cookies.
    const code = typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "unknown";
    console.error("[admin/session] Firebase session creation failed. Code:", code);
    const misconfigured = /credential|private.key|invalid.pem|invalid-credential|app\/invalid-credential/i.test(code);
    return response({
      error: misconfigured
        ? "Konfiguracja Firebase Admin jest niepoprawna. Sprawdź klucz serwerowy na Vercelu."
        : "Nie udało się utworzyć sesji. Sprawdź logi serwera Vercel.",
    }, misconfigured ? 503 : 500);
  }
}
