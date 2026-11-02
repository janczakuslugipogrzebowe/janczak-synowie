import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { getPublishedOfferSection } from "./data";
import { fromLegacyOffer, parseServiceCatalog, DEFAULT_SERVICE_CATALOG, type ServiceCatalog } from "./service-catalog";
import { parseOfferSection } from "./schema";

const doc = (collection: "cmsDrafts" | "cmsPublished") => cmsDb().collection(collection).doc("offerServicesCatalog");
const legacyDoc = (collection: "cmsDrafts" | "cmsPublished") => cmsDb().collection(collection).doc("subpage-oferta-catalog");

export async function getPublishedOfferServices(): Promise<ServiceCatalog> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-offer-services");
  if (!hasAdminConfig()) return DEFAULT_SERVICE_CATALOG;
  const snap = await doc("cmsPublished").get();
  if (snap.exists) return parseServiceCatalog(snap.data()?.content);
  return fromLegacyOffer(await getPublishedOfferSection("catalog"));
}
export async function getAdminOfferServices(): Promise<{published: ServiceCatalog; draft: ServiceCatalog | null; revision: string}> {
  const [live, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  // Read-only migration from the existing catalog, preserving published/draft separation.
  if (live.exists || draft.exists) {
    const old = await Promise.all([!live.exists ? legacyDoc("cmsPublished").get() : null, !draft.exists ? legacyDoc("cmsDrafts").get() : null]);
    const published = live.exists ? parseServiceCatalog(live.data()?.content) : old[0]?.exists ? fromLegacyOffer(parseOfferSection("catalog", old[0].data()?.content)) : DEFAULT_SERVICE_CATALOG;
    const fallbackDraft = old[1]?.exists ? fromLegacyOffer(parseOfferSection("catalog", old[1].data()?.content)) : null;
    return { published, draft: draft.exists ? parseServiceCatalog(draft.data()?.content) : fallbackDraft, revision: draft.exists ? String(draft.data()?.revision ?? draft.data()?.updatedAt ?? "legacy") : "legacy" };
  }
  const [oldPublished, oldDraft] = await Promise.all([legacyDoc("cmsPublished").get(), legacyDoc("cmsDrafts").get()]);
  return {
    published: oldPublished.exists ? fromLegacyOffer(parseOfferSection("catalog", oldPublished.data()?.content)) : DEFAULT_SERVICE_CATALOG,
    draft: oldDraft.exists ? fromLegacyOffer(parseOfferSection("catalog", oldDraft.data()?.content)) : null,
    revision: "legacy",
  };
}
export class OfferCatalogConflictError extends Error {
  constructor() { super("Katalog został zmieniony w innej karcie lub przez innego administratora. Odśwież dane, aby nie nadpisać nowszych zmian."); this.name = "OfferCatalogConflictError"; }
}
/** Optimistic concurrency: a stale editor must never overwrite another administrator's draft. */
export async function saveOfferServices(content: ServiceCatalog, uid: string, publish: boolean, expectedRevision: string): Promise<string> {
  const db = cmsDb();
  const revision = crypto.randomUUID();
  await db.runTransaction(async tx => {
    const draftRef = doc("cmsDrafts");
    const liveRef = doc("cmsPublished");
    const current = await tx.get(draftRef);
    const actual = current.exists ? String(current.data()?.revision ?? current.data()?.updatedAt ?? "legacy") : "legacy";
    if (actual !== expectedRevision) throw new OfferCatalogConflictError();
    const entry = { content, updatedAt: new Date().toISOString(), updatedBy: uid, schemaVersion: 3, revision };
    tx.set(draftRef, entry);
    if (publish) tx.set(liveRef, entry);
  });
  return revision;
}
