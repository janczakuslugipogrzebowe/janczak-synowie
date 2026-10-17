import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_SITE_SETTINGS, parseSiteSettings, type SiteSettings } from "./schema";

const liveRef = () => cmsDb().collection("cmsPublished").doc("siteSettings");
const draftRef = () => cmsDb().collection("cmsDrafts").doc("siteSettings");

export async function getPublishedSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("janczak-site-settings");
  cacheLife("days");
  if (!hasAdminConfig()) return DEFAULT_SITE_SETTINGS;
  const snapshot = await liveRef().get();
  const settings = snapshot.data()?.settings;
  return settings ? parseSiteSettings(settings) : DEFAULT_SITE_SETTINGS;
}

export async function getAdminSiteSettings(): Promise<{
  published: SiteSettings;
  draft: SiteSettings | null;
}> {
  const [live, draft] = await Promise.all([liveRef().get(), draftRef().get()]);
  return {
    published: live.data()?.settings ? parseSiteSettings(live.data()?.settings) : DEFAULT_SITE_SETTINGS,
    draft: draft.data()?.settings ? parseSiteSettings(draft.data()?.settings) : null,
  };
}

export async function saveSiteSettingsDraft(settings: SiteSettings, uid: string) {
  await draftRef().set({ settings, updatedBy: uid, updatedAt: new Date().toISOString() });
}

export async function publishSiteSettings(settings: SiteSettings, uid: string) {
  const db = cmsDb();
  const batch = db.batch();
  const content = { settings, updatedBy: uid, updatedAt: new Date().toISOString() };
  batch.set(liveRef(), content);
  batch.set(draftRef(), content);
  await batch.commit();
}
