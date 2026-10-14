import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/session";
import { isSameOrigin } from "@/lib/admin/origin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Nieprawidłowe pochodzenie." }, { status: 403 });
  const result = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  result.cookies.set({ name: ADMIN_COOKIE, value: "", path: "/", maxAge: 0,
    secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: "strict" });
  return result;
}
