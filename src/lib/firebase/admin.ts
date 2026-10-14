import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/** Service account keys are only ever read on the server. Never NEXT_PUBLIC. */
export function hasAdminConfig() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

function adminApp(): App {
  if (!hasAdminConfig()) throw new Error("Konfiguracja Firebase Admin SDK jest niekompletna.");
  const existing = getApps().find((app) => app.name === "janczak-cms");
  if (existing) return existing;
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  }, "janczak-cms");
}

export function cmsDb() { return getFirestore(adminApp()); }
export function cmsAuth() { return getAuth(adminApp()); }
