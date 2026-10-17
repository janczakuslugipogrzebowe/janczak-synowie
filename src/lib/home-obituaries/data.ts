import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_OBITUARIES, parseHomeObituaries, type HomeObituariesContent } from "./schema";
const doc = (c: string) => cmsDb().collection(c).doc("homeObituaries");
export async function getPublishedHomeObituaries(): Promise<HomeObituariesContent> {
  "use cache";
  cacheTag("janczak-home-obituaries");
  cacheLife("days");
  if (!hasAdminConfig()) return DEFAULT_HOME_OBITUARIES;
  const snap = await doc("cmsPublished").get();
  return snap.data()?.content ? parseHomeObituaries(snap.data()?.content) : DEFAULT_HOME_OBITUARIES;
}
export async function getHomeObituariesAdminState() {
  const [live, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: live.data()?.content ? parseHomeObituaries(live.data()?.content) : DEFAULT_HOME_OBITUARIES,
    draft: draft.data()?.content ? parseHomeObituaries(draft.data()?.content) : null,
  };
}
export async function saveHomeObituaries(content: HomeObituariesContent, uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const batch = cmsDb().batch();
    batch.set(doc("cmsPublished"), record);
    batch.set(doc("cmsDrafts"), record);
    await batch.commit();
  } else await doc("cmsDrafts").set(record);
}
