import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("dynamic gallery album reads params inside a Suspense boundary", () => {
  const page = source("src/app/(site)/galeria/[slug]/page.tsx");
  assert.match(page, /import\s*\{\s*Suspense\s*\}\s*from\s*["']react["']/);
  assert.match(page, /async function AlbumContents\(\{ params \}: Props\)/);
  assert.match(page, /async function AlbumContents[\s\S]*?await params/);
  assert.match(
    page,
    /<Suspense fallback=\{<AlbumFallback \/>\}>[\s\S]*?<AlbumContents params=\{params\} \/>/,
  );
  const wrapper = page.slice(page.indexOf("export default function AlbumPage"));
  assert.doesNotMatch(wrapper, /await params/);
  assert.match(page, /export async function generateMetadata/);
  assert.match(page, /<GalleryPhotoGrid photos=\{visible\}/);
  assert.match(page, /notFound\(\)/);
});

test("gallery admin uses nontechnical photo field labels", () => {
  for (const path of [
    "src/app/(admin)/admin/(protected)/site/galeria/[section]/page.tsx",
    "src/app/(admin)/admin/(protected)/gallery/page.tsx",
    "src/components/admin/gallery-explorer.tsx",
    "src/components/admin/gallery-albums-manager.tsx",
  ]) {
    const code = source(path);
    assert.doesNotMatch(code, /(?:label|hint)=["'][^"']*(?:Vercel Blob|\/public)[^"']*["']/);
    assert.match(code, /label="(?:Zdjęcie w tle|Adres zdjęcia|Zdjęcie okładki)"/);
  }
});
