import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import {
  DEFAULT_OBITUARIES_LISTING,
  DEFAULT_OBITUARIES_INFORMATION,
  parseObituariesListing,
  parseObituariesInformation,
  type ObituariesPageSection,
  type ObituariesListingContent,
  type ObituariesInformationContent,
} from "./schema";

type ContentFor<S extends ObituariesPageSection> = S extends "listing"
  ? ObituariesListingContent
  : ObituariesInformationContent;
const ref = (collection: "cmsPublished" | "cmsDrafts", section: ObituariesPageSection) =>
  cmsDb().collection(collection).doc(`subpage-nekrologi-${section}`);
const defaults = <S extends ObituariesPageSection>(section: S): ContentFor<S> =>
  (section === "listing" ? DEFAULT_OBITUARIES_LISTING : DEFAULT_OBITUARIES_INFORMATION) as ContentFor<S>;
const parse = <S extends ObituariesPageSection>(section: S, raw: unknown): ContentFor<S> =>
  (section === "listing" ? parseObituariesListing(raw) : parseObituariesInformation(raw)) as ContentFor<S>;

export async function getPublishedObituariesPageSection<S extends ObituariesPageSection>(
  section: S,
): Promise<ContentFor<S>> {
  "use cache";
  cacheTag(`janczak-obituaries-page-${section}`);
  cacheLife("days");
  if (!hasAdminConfig()) return defaults(section);
  const snapshot = await ref("cmsPublished", section).get();
  return snapshot.exists ? parse(section, snapshot.data()?.content) : defaults(section);
}
export async function getAdminObituariesPageSection<S extends ObituariesPageSection>(section: S) {
  const [published, draft] = await Promise.all([
    ref("cmsPublished", section).get(),
    ref("cmsDrafts", section).get(),
  ]);
  return {
    published: published.exists ? parse(section, published.data()?.content) : defaults(section),
    draft: draft.exists ? parse(section, draft.data()?.content) : null,
  };
}
export async function writeObituariesPageSection<S extends ObituariesPageSection>(
  section: S,
  content: ContentFor<S>,
  uid: string,
  publish: boolean,
) {
  const batch = cmsDb().batch();
  const record = { content, updatedBy: uid, updatedAt: new Date().toISOString() };
  batch.set(ref("cmsDrafts", section), record);
  if (publish) batch.set(ref("cmsPublished", section), record);
  await batch.commit();
}
