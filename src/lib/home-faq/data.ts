import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_FAQ, parseHomeFaq, type HomeFaqContent } from "./schema";

const doc = (collection: "cmsPublished" | "cmsDrafts") => cmsDb().collection(collection).doc("homeFaq");

export async function getPublishedHomeFaq(): Promise<HomeFaqContent> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-home-faq");
  if (!hasAdminConfig()) return DEFAULT_HOME_FAQ;
  const snapshot = await doc("cmsPublished").get();
  return snapshot.exists ? parseHomeFaq(snapshot.data()?.content) : DEFAULT_HOME_FAQ;
}

export async function getAdminHomeFaqState() {
  const [published, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: published.exists ? parseHomeFaq(published.data()?.content) : DEFAULT_HOME_FAQ,
    draft: draft.exists ? parseHomeFaq(draft.data()?.content) : null,
  };
}

export async function writeHomeFaq(content: HomeFaqContent, uid: string, publish: boolean) {
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
