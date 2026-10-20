import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsDb, hasAdminConfig } from "@/lib/firebase/admin";
import { DEFAULT_GALLERY, parseGalleryLibrary, recentGalleryPhotos, type GalleryPhoto } from "./schema";
import { DEFAULT_ALBUMS, parseGalleryAlbums, galleryPhotoAlbum, type GalleryAlbum } from "./albums";

const doc = (collection: "cmsPublished" | "cmsDrafts") =>
  cmsDb().collection(collection).doc("galleryLibrary");
const albumDoc = (collection: "cmsPublished" | "cmsDrafts") =>
  cmsDb().collection(collection).doc("galleryAlbums");

export async function getPublishedGalleryPhotos(): Promise<GalleryPhoto[]> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-gallery-library");
  const { photos, albums } = await getPublishedGalleryData();
  const active = new Set(albums.filter((a) => a.published).map((a) => a.id));
  return recentGalleryPhotos(
    photos.filter((p) => !galleryPhotoAlbum(p) || active.has(galleryPhotoAlbum(p))),
    12,
  );
}

export async function getPublishedGalleryData(): Promise<{ photos: GalleryPhoto[]; albums: GalleryAlbum[] }> {
  "use cache";
  cacheLife("days");
  cacheTag("janczak-gallery-library");
  if (!hasAdminConfig()) return { photos: DEFAULT_GALLERY, albums: DEFAULT_ALBUMS };
  const [photos, albums] = await Promise.all([doc("cmsPublished").get(), albumDoc("cmsPublished").get()]);
  return {
    photos: photos.exists ? parseGalleryLibrary(photos.data()?.content) : DEFAULT_GALLERY,
    albums: albums.exists ? parseGalleryAlbums(albums.data()?.content) : DEFAULT_ALBUMS,
  };
}

export async function getAdminGalleryState() {
  const [published, draft, publishedAlbums, draftAlbums] = await Promise.all([
    doc("cmsPublished").get(),
    doc("cmsDrafts").get(),
    albumDoc("cmsPublished").get(),
    albumDoc("cmsDrafts").get(),
  ]);
  return {
    published: published.exists ? parseGalleryLibrary(published.data()?.content) : DEFAULT_GALLERY,
    draft: draft.exists ? parseGalleryLibrary(draft.data()?.content) : null,
    publishedAlbums: publishedAlbums.exists
      ? parseGalleryAlbums(publishedAlbums.data()?.content)
      : DEFAULT_ALBUMS,
    draftAlbums: draftAlbums.exists ? parseGalleryAlbums(draftAlbums.data()?.content) : null,
  };
}

export async function writeGalleryLibrary(
  photos: GalleryPhoto[],
  uid: string,
  publish: boolean,
  albums?: GalleryAlbum[],
) {
  const record = { content: photos, updatedAt: new Date().toISOString(), updatedBy: uid };
  const albumRecord = albums ? { content: albums, updatedAt: record.updatedAt, updatedBy: uid } : null;
  const batch = cmsDb().batch();
  batch.set(doc("cmsDrafts"), record);
  if (albumRecord) batch.set(albumDoc("cmsDrafts"), albumRecord);
  if (publish) {
    batch.set(doc("cmsPublished"), record);
    if (albumRecord) batch.set(albumDoc("cmsPublished"), albumRecord);
  }
  await batch.commit();
}
