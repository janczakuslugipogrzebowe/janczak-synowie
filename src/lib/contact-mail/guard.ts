import "server-only";
import { createHmac } from "node:crypto";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";

/** Anonymous quota shared across all serverless instances, not an in-memory counter. */
export async function checkContactQuota(request: Request): Promise<boolean> {
  if (!hasAdminConfig()) throw new Error("FIREBASE_NOT_CONFIGURED");
  const salt = process.env.CONTACT_RATE_LIMIT_SALT;
  if (!salt || salt.length < 24) throw new Error("RATE_LIMIT_NOT_CONFIGURED");
  // On Vercel this header is supplied by the platform; fallback for local dev.
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const slot = Math.floor(Date.now() / (15 * 60 * 1000));
  const hash = createHmac("sha256", salt).update(`${slot}:${ip}`).digest("hex");
  const ref = cmsDb().collection("contactRateLimits").doc(hash);
  return cmsDb().runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const count = typeof doc.data()?.count === "number" ? doc.data()!.count : 0;
    if (count >= 5) return false;
    tx.set(ref, { count: count + 1, expiresAt: new Date(Date.now() + 24 * 3600 * 1000) });
    return true;
  });
}
export async function verifyTurnstile(token: string, request: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!secret && !publicKey) return true; // optional, quotas + honeypot remain active
  if (!secret || !publicKey || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (ip) body.set("remoteip", ip);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result: { success?: boolean; hostname?: string } = await response.json();
    if (!result.success) return false;
    // Siteverify verifies that the token was signed for the configured widget;
    // configured hostname restriction must also be set in the Cloudflare panel.
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
