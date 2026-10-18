import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_DOCUMENTS, parseDocumentLibrary, publishedDocuments, type PublicDocument } from "./schema";

const doc = (collection: "cmsPublished" | "cmsDrafts") =>
  cmsDb().collection(collection).doc("documentsLibrary");

export async function getPublishedDocumentsLibrary(): Promise<PublicDocument[]> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-documents-library");
  if (!hasAdminConfig()) return publishedDocuments(DEFAULT_DOCUMENTS);
  const snap = await doc("cmsPublished").get();
  return publishedDocuments(
    snap.data()?.content ? parseDocumentLibrary(snap.data()?.content) : DEFAULT_DOCUMENTS,
  );
}

export async function getAdminDocumentsLibraryState() {
  const [live, draft] = await Promise.all([doc("cmsPublished").get(), doc("cmsDrafts").get()]);
  return {
    published: live.data()?.content ? parseDocumentLibrary(live.data()?.content) : DEFAULT_DOCUMENTS,
    draft: draft.data()?.content ? parseDocumentLibrary(draft.data()?.content) : null,
  };
}

export async function writeDocumentsLibrary(content: PublicDocument[], uid: string, publish: boolean) {
  const record = { content, updatedAt: new Date().toISOString(), updatedBy: uid };
  if (publish) {
    const batch = cmsDb().batch();
    batch.set(doc("cmsPublished"), record);
    batch.set(doc("cmsDrafts"), record);
    await batch.commit();
  } else {
    await doc("cmsDrafts").set(record);
  }
}
