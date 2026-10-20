import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import {
  migrateGalleryPresentation,
  parseSubpageBlock,
  subpageDefault,
  type SubpageBlock,
  type SubpageSection,
} from "./schema";
import type { PageSlug } from "@/lib/pages/schema";
const doc = (collection: "cmsPublished" | "cmsDrafts", slug: PageSlug, section: SubpageSection) =>
  cmsDb().collection(collection).doc(`subpage-${slug}-${section}`);
export async function getPublishedSubpageBlock(
  slug: PageSlug,
  section: SubpageSection,
): Promise<SubpageBlock> {
  "use cache";
  cacheLife("days");
  cacheTag(`janczak-subpage-${slug}-${section}`);
  if (!hasAdminConfig()) return subpageDefault(slug, section);
  const snap = await doc("cmsPublished", slug, section).get();
  return snap.exists
    ? migrateGalleryPresentation(slug, section, parseSubpageBlock(snap.data()?.content))
    : subpageDefault(slug, section);
}
export async function getAdminSubpageBlock(slug: PageSlug, section: SubpageSection) {
  const [live, draft] = await Promise.all([
    doc("cmsPublished", slug, section).get(),
    doc("cmsDrafts", slug, section).get(),
  ]);
  return {
    published: live.exists
      ? migrateGalleryPresentation(slug, section, parseSubpageBlock(live.data()?.content))
      : subpageDefault(slug, section),
    draft: draft.exists
      ? migrateGalleryPresentation(slug, section, parseSubpageBlock(draft.data()?.content))
      : null,
  };
}
export async function writeSubpageBlock(
  slug: PageSlug,
  section: SubpageSection,
  content: SubpageBlock,
  uid: string,
  publish: boolean,
) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  const batch = cmsDb().batch();
  batch.set(doc("cmsDrafts", slug, section), record);
  if (publish) batch.set(doc("cmsPublished", slug, section), record);
  await batch.commit();
}
