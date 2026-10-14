import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cmsAuth, hasAdminConfig } from "@/lib/firebase/admin";

export const ADMIN_COOKIE = "janczak_admin_session";
export const SESSION_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export function isAdminConfigured(): boolean {
  return hasAdminConfig() && Boolean(process.env.FIREBASE_ADMIN_UID?.trim());
}

export async function getAdminUid(): Promise<string | null> {
  // Session verification checks expiry using the current time inside Firebase Admin.
  // With cacheComponents enabled, explicitly defer this work to request time.
  // The calling protected layout already wraps this function in Suspense.
  await connection();
  if (!isAdminConfigured()) return null;
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await cmsAuth().verifySessionCookie(cookie, true);
    return decoded.uid === process.env.FIREBASE_ADMIN_UID ? decoded.uid : null;
  } catch {
    return null;
  }
}
