import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_GUIDANCE, parseHomeGuidance, type HomeGuidanceContent } from "./schema";

const live = () => cmsDb().collection("cmsPublished").doc("homeGuidance");
const draft = () => cmsDb().collection("cmsDrafts").doc("homeGuidance");
export async function getPublishedHomeGuidance(): Promise<HomeGuidanceContent> {
  "use cache";
  cacheTag("janczak-home-guidance");
  cacheLife("days");
  if (!hasAdminConfig()) return DEFAULT_HOME_GUIDANCE;
  const snapshot = await live().get();
  return snapshot.data()?.content ? parseHomeGuidance(snapshot.data()?.content) : DEFAULT_HOME_GUIDANCE;
}
export async function getAdminHomeGuidanceState() {
  const [published, pending] = await Promise.all([live().get(), draft().get()]);
  return {
    published: published.data()?.content
      ? parseHomeGuidance(published.data()?.content)
      : DEFAULT_HOME_GUIDANCE,
    draft: pending.data()?.content ? parseHomeGuidance(pending.data()?.content) : null,
  };
}
export async function writeHomeGuidance(content: HomeGuidanceContent, uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const db = cmsDb();
    const batch = db.batch();
    batch.set(live(), record);
    batch.set(draft(), record);
    await batch.commit();
  } else await draft().set(record);
}
