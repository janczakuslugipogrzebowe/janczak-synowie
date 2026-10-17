import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_ABOUT, parseHomeAbout, type HomeAboutContent } from "./schema";

const live = () => cmsDb().collection("cmsPublished").doc("homeAbout");
const draft = () => cmsDb().collection("cmsDrafts").doc("homeAbout");
export async function getPublishedHomeAbout(): Promise<HomeAboutContent> {
  "use cache";
  cacheTag("janczak-home-about");
  cacheLife("days");
  if (!hasAdminConfig()) return DEFAULT_HOME_ABOUT;
  const result = await live().get();
  return result.data()?.content ? parseHomeAbout(result.data()?.content) : DEFAULT_HOME_ABOUT;
}
export async function getAdminHomeAboutState() {
  const [published, pending] = await Promise.all([live().get(), draft().get()]);
  return {
    published: published.data()?.content ? parseHomeAbout(published.data()?.content) : DEFAULT_HOME_ABOUT,
    draft: pending.data()?.content ? parseHomeAbout(pending.data()?.content) : null,
  };
}
export async function writeHomeAbout(content: HomeAboutContent, uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const db = cmsDb();
    const batch = db.batch();
    batch.set(live(), record);
    batch.set(draft(), record);
    await batch.commit();
  } else await draft().set(record);
}
