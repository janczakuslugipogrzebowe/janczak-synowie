import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { PAGE_DEFAULTS, parsePageContent, type PageSlug, type PageContent } from "./schema";
const published = (slug: PageSlug) => cmsDb().collection("cmsPublished").doc(`page-${slug}`);
const draft = (slug: PageSlug) => cmsDb().collection("cmsDrafts").doc(`page-${slug}`);
export async function getPublishedPage(slug: PageSlug): Promise<PageContent> {
  "use cache";
  cacheTag(`janczak-page-${slug}`);
  cacheLife("days");
  if (!hasAdminConfig()) return PAGE_DEFAULTS[slug];
  const snap = await published(slug).get();
  return snap.data()?.content ? parsePageContent(snap.data()?.content) : PAGE_DEFAULTS[slug];
}
export async function getAdminPageState(slug: PageSlug) {
  const [live, edit] = await Promise.all([published(slug).get(), draft(slug).get()]);
  return {
    published: live.data()?.content ? parsePageContent(live.data()?.content) : PAGE_DEFAULTS[slug],
    draft: edit.data()?.content ? parsePageContent(edit.data()?.content) : null,
  };
}
export async function writePage(slug: PageSlug, content: PageContent, uid: string, publish: boolean) {
  const record = { content, updatedBy: uid, updatedAt: new Date().toISOString() };
  if (publish) {
    const batch = cmsDb().batch();
    batch.set(published(slug), record);
    batch.set(draft(slug), record);
    await batch.commit();
  } else await draft(slug).set(record);
}
