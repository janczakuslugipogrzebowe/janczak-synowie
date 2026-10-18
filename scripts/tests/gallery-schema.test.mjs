import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_GALLERY,
  parseGalleryLibrary,
  recentGalleryPhotos,
  safeGalleryImage,
} from "../../src/lib/gallery/schema.ts";

test("six development photos are defined", () => {
  assert.equal(DEFAULT_GALLERY.length, 6);
  assert.deepEqual(parseGalleryLibrary(DEFAULT_GALLERY), DEFAULT_GALLERY);
  assert.equal(DEFAULT_GALLERY[0].imageUrl, "/galeria1-home.png");
});
test("only published most recent photos reach slider", () => {
  const newer = { ...DEFAULT_GALLERY[0], id: "recent-example", createdAt: "2026-10-18T11:00:00.000Z" };
  const unpublished = { ...DEFAULT_GALLERY[1], published: false };
  const entries = [newer, unpublished, ...DEFAULT_GALLERY.filter((item) => item.id !== unpublished.id)];
  assert.equal(recentGalleryPhotos(entries, 6).length, 6);
  assert.equal(recentGalleryPhotos(entries, 6)[0].id, "recent-example");
  assert.ok(!recentGalleryPhotos(entries, 6).some((item) => item.id === unpublished.id));
});
test("reject duplicate IDs and bad dates", () => {
  assert.throws(() => parseGalleryLibrary([...DEFAULT_GALLERY, DEFAULT_GALLERY[0]]));
  assert.throws(() =>
    parseGalleryLibrary([{ ...DEFAULT_GALLERY[0], createdAt: "2026-02-30T12:00:00.000Z" }]),
  );
  assert.throws(() => parseGalleryLibrary([{ ...DEFAULT_GALLERY[0], unexpected: "x" }]));
});
test("validate safe local and Blob image URLs", () => {
  assert.ok(safeGalleryImage("/galeria1-home.png"));
  assert.ok(safeGalleryImage("https://files.public.blob.vercel-storage.com/gallery.webp"));
  for (const url of [
    "//example.com/a.png",
    "/../a.png",
    "https://evil.test/a.png",
    "javascript:alert(1)",
    "/file.svg",
    "https://files.public.blob.vercel-storage.com.evil.com/a.png",
  ])
    assert.equal(safeGalleryImage(url), false);
});
