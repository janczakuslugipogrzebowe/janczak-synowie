import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_CONTACT, parseHomeContact, type HomeContactContent } from "./schema";

const doc = (collection: "cmsPublished" | "cmsDrafts") => cmsDb().collection(collection).doc("homeContact");

export async function getPublishedHomeContact(): Promise<HomeContactContent> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-home-contact");
  if (!hasAdminConfig()) return DEFAULT_HOME_CONTACT;
  const snapshot = await doc("cmsPublished").get();
  return snapshot.exists ? parseHomeContact(snapshot.data()?.content) : DEFAULT_HOME_CONTACT;
}

export async function getAdminHomeContactState() {
  const [published, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: published.exists ? parseHomeContact(published.data()?.content) : DEFAULT_HOME_CONTACT,
    draft: draft.exists ? parseHomeContact(draft.data()?.content) : null,
  };
}

export async function writeHomeContact(content: HomeContactContent, uid: string, publish: boolean) {
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
