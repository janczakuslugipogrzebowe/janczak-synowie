import "server-only";
import {cacheLife, cacheTag} from "next/cache";
import {cmsDb,hasAdminConfig} from "@/lib/firebase/admin";
import {DEFAULT_HOME_SERVICES,parseHomeServices,type HomeServicesContent} from "./schema";

const publishedDoc = () => cmsDb().collection("cmsPublished").doc("homeServices");
const draftDoc = () => cmsDb().collection("cmsDrafts").doc("homeServices");

export async function getPublishedHomeServices():Promise<HomeServicesContent> {
  "use cache";
  cacheTag("janczak-home-services"); cacheLife("days");
  if (!hasAdminConfig()) return DEFAULT_HOME_SERVICES;
  const snapshot=await publishedDoc().get();
  return snapshot.data()?.content ? parseHomeServices(snapshot.data()?.content) : DEFAULT_HOME_SERVICES;
}
export async function getAdminHomeServicesState() {
  const [published,draft]=await Promise.all([publishedDoc().get(),draftDoc().get()]);
  return {
    published:published.data()?.content ? parseHomeServices(published.data()?.content) : DEFAULT_HOME_SERVICES,
    draft:draft.data()?.content ? parseHomeServices(draft.data()?.content) : null,
  };
}
export async function writeHomeServices(content:HomeServicesContent,uid:string,publish:boolean) {
  const record={content,updatedAt:new Date().toISOString(),updatedBy:uid};
  if (publish) {
    const db=cmsDb();const batch=db.batch();batch.set(publishedDoc(),record);batch.set(draftDoc(),record);await batch.commit();
  } else await draftDoc().set(record);
}
