import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_FLORIST, parseHomeFlorist, type HomeFloristContent } from "./schema";

const publishedDoc = () => cmsDb().collection("cmsPublished").doc("homeFlorist");
const draftDoc = () => cmsDb().collection("cmsDrafts").doc("homeFlorist");

export async function getPublishedHomeFlorist(): Promise<HomeFloristContent> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-home-florist");
  if (!hasAdminConfig()) return DEFAULT_HOME_FLORIST;
  const snap = await publishedDoc().get();
  return snap.data()?.content ? parseHomeFlorist(snap.data()?.content) : DEFAULT_HOME_FLORIST;
}
export async function getAdminHomeFloristState() {
  const [published, draft] = await Promise.all([publishedDoc().get(), draftDoc().get()]);
  return {
    published: published.data()?.content ? parseHomeFlorist(published.data()?.content) : DEFAULT_HOME_FLORIST,
    draft: draft.data()?.content ? parseHomeFlorist(draft.data()?.content) : null,
  };
}
export async function writeHomeFlorist(content: HomeFloristContent, uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const db = cmsDb();
    const batch = db.batch();
    batch.set(publishedDoc(), record);
    batch.set(draftDoc(), record);
    await batch.commit();
  } else await draftDoc().set(record);
}
