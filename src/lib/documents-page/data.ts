import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import {
  DEFAULT_DOWNLOADS,
  DEFAULT_GUIDANCE,
  parseDownloadsContent,
  parseGuidanceContent,
  type DownloadsContent,
  type GuidanceContent,
  type DocumentsPageSection,
} from "./schema";

type ContentOf<T extends DocumentsPageSection> = T extends "downloads" ? DownloadsContent : GuidanceContent;
const ref = (collection: "cmsDrafts" | "cmsPublished", section: DocumentsPageSection) =>
  cmsDb().collection(collection).doc(`subpage-dokumenty-${section}`);
const parse = <T extends DocumentsPageSection>(section: T, raw: unknown): ContentOf<T> =>
  (section === "downloads" ? parseDownloadsContent(raw) : parseGuidanceContent(raw)) as ContentOf<T>;
const defaults = <T extends DocumentsPageSection>(section: T): ContentOf<T> =>
  (section === "downloads" ? DEFAULT_DOWNLOADS : DEFAULT_GUIDANCE) as ContentOf<T>;

export async function getPublishedDocumentsPageSection<T extends DocumentsPageSection>(
  section: T,
): Promise<ContentOf<T>> {
  "use cache";
  cacheLife("days");
  cacheTag(`janczak-documents-page-${section}`);
  if (!hasAdminConfig()) return defaults(section);
  const snapshot = await ref("cmsPublished", section).get();
  return snapshot.exists ? parse(section, snapshot.data()?.content) : defaults(section);
}

export async function getAdminDocumentsPageSection<T extends DocumentsPageSection>(section: T) {
  const [published, draft] = await Promise.all([
    ref("cmsPublished", section).get(),
    ref("cmsDrafts", section).get(),
  ]);
  return {
    published: published.exists ? parse(section, published.data()?.content) : defaults(section),
    draft: draft.exists ? parse(section, draft.data()?.content) : null,
  };
}

export async function writeDocumentsPageSection<T extends DocumentsPageSection>(
  section: T,
  content: ContentOf<T>,
  uid: string,
  publish: boolean,
) {
  const batch = cmsDb().batch();
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  batch.set(ref("cmsDrafts", section), record);
  if (publish) batch.set(ref("cmsPublished", section), record);
  await batch.commit();
}
