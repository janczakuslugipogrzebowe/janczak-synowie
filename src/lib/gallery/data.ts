import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_GALLERY, parseGalleryLibrary, recentGalleryPhotos, type GalleryPhoto } from "./schema";

const doc = (collection: "cmsPublished" | "cmsDrafts") =>
  cmsDb().collection(collection).doc("galleryLibrary");

export async function getPublishedGalleryPhotos(): Promise<GalleryPhoto[]> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-gallery-library");
  if (!hasAdminConfig()) return recentGalleryPhotos(DEFAULT_GALLERY, 12);
  const snapshot = await doc("cmsPublished").get();
  const items = snapshot.exists ? parseGalleryLibrary(snapshot.data()?.content) : DEFAULT_GALLERY;
  return recentGalleryPhotos(items, 12);
}

export async function getAdminGalleryState() {
  const [published, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: published.exists ? parseGalleryLibrary(published.data()?.content) : DEFAULT_GALLERY,
    draft: draft.exists ? parseGalleryLibrary(draft.data()?.content) : null,
  };
}

export async function writeGalleryLibrary(content: GalleryPhoto[], uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const batch = cmsDb().batch();
    batch.set(doc("cmsPublished"), record);
    batch.set(doc("cmsDrafts"), record);
    await batch.commit();
  } else await doc("cmsDrafts").set(record);
}
