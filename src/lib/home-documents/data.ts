import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_DOCUMENTS, parseHomeDocuments, type HomeDocumentsContent } from "./schema";

const doc = (collection: "cmsPublished" | "cmsDrafts") => cmsDb().collection(collection).doc("homeDocuments");

export async function getPublishedHomeDocuments(): Promise<HomeDocumentsContent> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-home-documents");
  if (!hasAdminConfig()) return DEFAULT_HOME_DOCUMENTS;
  const snap = await doc("cmsPublished").get();
  return snap.data()?.content ? parseHomeDocuments(snap.data()?.content) : DEFAULT_HOME_DOCUMENTS;
}

export async function getAdminHomeDocumentsState() {
  const [live, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: live.data()?.content ? parseHomeDocuments(live.data()?.content) : DEFAULT_HOME_DOCUMENTS,
    draft: draft.data()?.content ? parseHomeDocuments(draft.data()?.content) : null,
  };
}

export async function writeHomeDocuments(content: HomeDocumentsContent, uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const batch = cmsDb().batch();
    batch.set(doc("cmsPublished"), record);
    batch.set(doc("cmsDrafts"), record);
    await batch.commit();
  } else {
    await doc("cmsDrafts").set(record);
  }
}
