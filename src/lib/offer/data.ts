import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { OFFER_DEFAULTS, parseOfferSection, type OfferSection, type OfferContentMap } from "./schema";

const ref = (collection: "cmsDrafts" | "cmsPublished", section: OfferSection) =>
  cmsDb().collection(collection).doc(`subpage-oferta-${section}`);
export async function getPublishedOfferSection<S extends OfferSection>(section: S): Promise<OfferContentMap[S]> {
  "use cache";
  cacheLife("days");
  cacheTag(`janczak-offer-${section}`);
  if (!hasAdminConfig()) return OFFER_DEFAULTS[section];
  const snap = await ref("cmsPublished", section).get();
  return snap.exists ? parseOfferSection(section, snap.data()?.content) : OFFER_DEFAULTS[section];
}
export async function getAdminOfferSection<S extends OfferSection>(section: S) {
  const [published, draft] = await Promise.all([ref("cmsPublished", section).get(), ref("cmsDrafts", section).get()]);
  return {
    published: published.exists ? parseOfferSection(section, published.data()?.content) : OFFER_DEFAULTS[section],
    draft: draft.exists ? parseOfferSection(section, draft.data()?.content) : null,
  };
}
export async function writeOfferSection<S extends OfferSection>(section: S, content: OfferContentMap[S], uid: string, publish: boolean) {
  const batch = cmsDb().batch();
  const record = { content, updatedBy: uid, updatedAt: new Date().toISOString() };
  batch.set(ref("cmsDrafts", section), record);
  if (publish) batch.set(ref("cmsPublished", section), record);
  await batch.commit();
}
