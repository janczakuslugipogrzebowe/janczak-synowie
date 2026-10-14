import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_HERO, parseHero, type HeroContent } from "./schema";

const published = () => cmsDb().collection("cmsPublished").doc("home");
const drafts = () => cmsDb().collection("cmsDrafts").doc("home");

/** Stable and shared: public traffic never causes one Firestore read per visit. */
export async function getPublishedHero(): Promise<HeroContent> {
  "use cache";
  cacheTag("janczak-home-hero");
  cacheLife("days");
  if (!hasAdminConfig()) return DEFAULT_HERO; // initial deployment works without private credentials
  const snapshot = await published().get();
  const data = snapshot.data();
  return data?.hero ? parseHero(data.hero) : DEFAULT_HERO;
}

export async function getAdminHeroState(): Promise<{ published: HeroContent; draft: HeroContent | null }> {
  const [live, pending] = await Promise.all([published().get(), drafts().get()]);
  const liveHero = live.data()?.hero;
  const draftHero = pending.data()?.hero;
  return {
    published: liveHero ? parseHero(liveHero) : DEFAULT_HERO,
    draft: draftHero ? parseHero(draftHero) : null,
  };
}

export async function saveHeroDraft(hero: HeroContent, uid: string) {
  await drafts().set({ hero, updatedAt: new Date().toISOString(), updatedBy: uid });
}

export async function publishHero(hero: HeroContent, uid: string) {
  // Single atomically-written document; draft is kept as an editable starting point.
  const db = cmsDb();
  const batch = db.batch();
  const record = { hero, updatedAt: new Date().toISOString(), updatedBy: uid };
  batch.set(published(), record);
  batch.set(drafts(), record);
  await batch.commit();
}
