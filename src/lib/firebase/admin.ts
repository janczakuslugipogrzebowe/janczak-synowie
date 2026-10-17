import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/** Server-side credentials only. Do not prefix these environment variables with NEXT_PUBLIC_. */
export function hasAdminConfig(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    (process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY),
  );
}

function getPrivateKey(): string {
  const encoded = process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim();

  // Prefer Base64 to avoid differences in how hosting platforms handle PEM newlines.
  const pem = encoded
    ? Buffer.from(encoded, "base64").toString("utf8")
    : (process.env.FIREBASE_PRIVATE_KEY ?? "")
        .trim()
        .replace(
          /^(?:"([\s\S]*)"|'([\s\S]*)')$/,
          (_full, double: string | undefined, single: string | undefined) => double ?? single ?? "",
        )
        .replace(/\\n/g, "\n");

  const normalized = pem.replace(/\r\n/g, "\n").trim();
  if (!/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----$/.test(normalized)) {
    // Never include any part of the secret in logs/errors.
    throw new Error("Niepoprawny format klucza Firebase Admin. Sprawdź FIREBASE_PRIVATE_KEY_BASE64.");
  }
  return normalized + "\n";
}

function adminApp(): App {
  if (!hasAdminConfig()) {
    throw new Error("Konfiguracja Firebase Admin SDK jest niekompletna.");
  }
  const existing = getApps().find((app) => app.name === "janczak-cms");
  if (existing) return existing;

  return initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: getPrivateKey(),
      }),
    },
    "janczak-cms",
  );
}

export function cmsDb() {
  return getFirestore(adminApp());
}
export function cmsAuth() {
  return getAuth(adminApp());
}
