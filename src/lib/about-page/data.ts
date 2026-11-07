import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { getAdminPageState, getPublishedPage } from "@/lib/pages/data";
import { PAGE_DEFAULTS, type PageContent } from "@/lib/pages/schema";
import { ABOUT_DEFAULTS, parseAboutSection, type AboutContent, type AboutSection } from "./schema";

const ref = (collection: "cmsDrafts" | "cmsPublished", section: AboutSection) =>
  cmsDb().collection(collection).doc(`subpage-o-nas-${section}`);

function legacyHistory(content: PageContent | null): AboutContent["history"] {
  const fallback = ABOUT_DEFAULTS.history;
  // Existing manually authored page copy remains available when moving to the
  // section-based editor; the old Firestore document is never deleted.
  if (!content || content.description === PAGE_DEFAULTS["o-nas"].description) return fallback;
  return { ...fallback, description: content.description };
}

export async function getPublishedAboutSection<S extends AboutSection>(section: S): Promise<AboutContent[S]> {
  "use cache";
  cacheLife("days");
  cacheTag(`janczak-about-page-${section}`);
  if (!hasAdminConfig()) return ABOUT_DEFAULTS[section];
  const snapshot = await ref("cmsPublished", section).get();
  if (snapshot.exists) return parseAboutSection(section, snapshot.data()?.content);
  if (section === "history") return legacyHistory(await getPublishedPage("o-nas")) as AboutContent[S];
  return ABOUT_DEFAULTS[section];
}

export async function getAdminAboutSection<S extends AboutSection>(
  section: S,
): Promise<{
  published: AboutContent[S];
  draft: AboutContent[S] | null;
}> {
  const [published, draft] = await Promise.all([
    ref("cmsPublished", section).get(),
    ref("cmsDrafts", section).get(),
  ]);
  if (section === "history" && !published.exists) {
    const old = await getAdminPageState("o-nas");
    return {
      published: legacyHistory(old.published) as AboutContent[S],
      draft: draft.exists
        ? parseAboutSection(section, draft.data()?.content)
        : old.draft
          ? (legacyHistory(old.draft) as AboutContent[S])
          : null,
    };
  }
  return {
    published: published.exists
      ? parseAboutSection(section, published.data()?.content)
      : ABOUT_DEFAULTS[section],
    draft: draft.exists ? parseAboutSection(section, draft.data()?.content) : null,
  };
}

export async function writeAboutSection<S extends AboutSection>(
  section: S,
  content: AboutContent[S],
  uid: string,
  publish: boolean,
) {
  const batch = cmsDb().batch();
  const record = { content, updatedBy: uid, updatedAt: new Date().toISOString() };
  batch.set(ref("cmsDrafts", section), record);
  if (publish) batch.set(ref("cmsPublished", section), record);
  await batch.commit();
}
