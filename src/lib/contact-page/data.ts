import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import {
  DEFAULT_CONTACT_DETAILS,
  DEFAULT_CONTACT_FORM,
  parseContactDetails,
  parseContactFormSection,
  type ContactPageSection,
  type ContactDetailsContent,
  type ContactFormContent,
} from "./schema";
type ContentOf<S extends ContactPageSection> = S extends "details"
  ? ContactDetailsContent
  : ContactFormContent;
const ref = (col: "cmsDrafts" | "cmsPublished", section: ContactPageSection) =>
  cmsDb().collection(col).doc(`subpage-kontakt-${section}`);
const defaults = <S extends ContactPageSection>(section: S): ContentOf<S> =>
  (section === "details" ? DEFAULT_CONTACT_DETAILS : DEFAULT_CONTACT_FORM) as ContentOf<S>;
const parse = <S extends ContactPageSection>(section: S, raw: unknown): ContentOf<S> =>
  (section === "details" ? parseContactDetails(raw) : parseContactFormSection(raw)) as ContentOf<S>;
export async function getPublishedContactPageSection<S extends ContactPageSection>(
  section: S,
): Promise<ContentOf<S>> {
  "use cache";
  cacheLife("days");
  cacheTag(`janczak-contact-page-${section}`);
  if (!hasAdminConfig()) return defaults(section);
  const snap = await ref("cmsPublished", section).get();
  return snap.exists ? parse(section, snap.data()?.content) : defaults(section);
}
export async function getAdminContactPageSection<S extends ContactPageSection>(section: S) {
  const [published, draft] = await Promise.all([
    ref("cmsPublished", section).get(),
    ref("cmsDrafts", section).get(),
  ]);
  return {
    published: published.exists ? parse(section, published.data()?.content) : defaults(section),
    draft: draft.exists ? parse(section, draft.data()?.content) : null,
  };
}
export async function writeContactPageSection<S extends ContactPageSection>(
  section: S,
  content: ContentOf<S>,
  uid: string,
  publish: boolean,
) {
  const batch = cmsDb().batch();
  const record = { content, updatedBy: uid, updatedAt: new Date().toISOString() };
  batch.set(ref("cmsDrafts", section), record);
  if (publish) batch.set(ref("cmsPublished", section), record);
  await batch.commit();
}
