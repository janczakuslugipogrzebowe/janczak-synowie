import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HOME_GALLERY, parseHomeGallery, type HomeGalleryContent } from "./schema";
const doc = (collection: "cmsPublished" | "cmsDrafts") => cmsDb().collection(collection).doc("homeGallery");
export async function getPublishedHomeGallery(): Promise<HomeGalleryContent> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-home-gallery");
  if (!hasAdminConfig()) return DEFAULT_HOME_GALLERY;
  const snapshot = await doc("cmsPublished").get();
  return snapshot.exists ? parseHomeGallery(snapshot.data()?.content) : DEFAULT_HOME_GALLERY;
}
export async function getAdminHomeGalleryState() {
  const [live, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: live.exists ? parseHomeGallery(live.data()?.content) : DEFAULT_HOME_GALLERY,
    draft: draft.exists ? parseHomeGallery(draft.data()?.content) : null,
  };
}
export async function writeHomeGallery(content: HomeGalleryContent, uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const batch = cmsDb().batch();
    batch.set(doc("cmsPublished"), record);
    batch.set(doc("cmsDrafts"), record);
    await batch.commit();
  } else await doc("cmsDrafts").set(record);
}
