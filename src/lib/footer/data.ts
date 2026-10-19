import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_FOOTER, parseFooter, type FooterContent } from "./schema";

const doc = (collection: "cmsPublished" | "cmsDrafts") => cmsDb().collection(collection).doc("siteFooter");

export async function getPublishedFooter(): Promise<FooterContent> {
  "use cache";
  cacheTag("janczak-site-footer");
  cacheLife("days");
  if (!hasAdminConfig()) return DEFAULT_FOOTER;
  const snapshot = await doc("cmsPublished").get();
  return snapshot.exists ? parseFooter(snapshot.data()?.content) : DEFAULT_FOOTER;
}

export async function getAdminFooterState() {
  const [live, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: live.exists ? parseFooter(live.data()?.content) : DEFAULT_FOOTER,
    draft: draft.exists ? parseFooter(draft.data()?.content) : null,
  };
}

export async function writeFooter(content: FooterContent, uid: string, publish: boolean) {
  const record = { content, updatedBy: uid, updatedAt: new Date().toISOString() };
  if (!publish) return doc("cmsDrafts").set(record);
  const batch = cmsDb().batch();
  batch.set(doc("cmsPublished"), record);
  batch.set(doc("cmsDrafts"), record);
  await batch.commit();
}
