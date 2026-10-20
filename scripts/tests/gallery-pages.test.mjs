import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const code = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

function exportedFunctionSource(source, name) {
  const marker = `export async function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing ${name} export`);
  const end = source.indexOf("\nexport ", start + marker.length);
  return source.slice(start, end === -1 ? undefined : end);
}

test("Galeria has four independent page sections, not a legacy intro", () => {
  const page = code("src/app/(site)/galeria/page.tsx");
  for (const marker of [
    "<SubpageHero",
    "<GalleryAlbumsSection",
    "<GalleryAboutSection",
    "<SubpageBottomCta",
    'getPublishedSubpageBlock("galeria"',
  ]) {
    assert.ok(page.includes(marker), marker);
  }
  assert.ok(!page.includes("SubpageIntro"));
});

test("Homepage still consumes latest published gallery photos", () => {
  const homepage = code("src/app/(site)/page.tsx");
  assert.ok(homepage.includes("getPublishedGalleryPhotos"));

  const getter = exportedFunctionSource(code("src/lib/gallery/data.ts"), "getPublishedGalleryPhotos");
  // Prettier may put the last argument and trailing comma on separate lines.
  assert.match(
    getter,
    /recentGalleryPhotos\(\s*photos\.filter\([\s\S]*?\),\s*12\s*,?\s*\)/,
    "Homepage gallery must keep its limit of 12 recent eligible photos",
  );
});

test("Album and photo data publish together and validate category references", () => {
  const db = code("src/lib/gallery/data.ts");
  const api = code("src/app/api/admin/gallery/route.ts");
  assert.ok(db.includes('batch.set(doc("cmsPublished"), record)'));
  assert.ok(db.includes('batch.set(albumDoc("cmsPublished"), albumRecord)'));
  assert.ok(api.includes("Nieistniejącego albumu") || api.includes("nieistniejącego albumu"));
});

test("Separate gallery sections are visible in admin and folder routes work", () => {
  const shell = code("src/components/admin/admin-shell.tsx");
  for (const marker of [
    '["hero", "Hero"]',
    '["albums", "Albumy"]',
    '["about", "O galerii"]',
    '["bottom", "Kontaktowe CTA"]',
  ]) {
    assert.ok(shell.includes(marker), marker);
  }
  assert.ok(code("src/app/(site)/galeria/[slug]/page.tsx").includes("GalleryPhotoGrid"));

  const photoGrid = code("src/components/gallery/gallery-photo-grid.tsx");
  assert.match(
    photoGrid,
    /document\.body\.style\.overflow\s*=\s*(["'])hidden\1/,
    "Lightbox must disable background scroll, regardless of formatting",
  );
  assert.match(
    photoGrid,
    /document\.body\.style\.overflow\s*=\s*previous/,
    "Lightbox must restore the previous scroll setting on close",
  );
});
