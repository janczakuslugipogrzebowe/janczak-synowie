import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("document/gallery border has one shape owner in the actual homepage", () => {
  const home = read("src/app/(site)/page.tsx");
  const docs = read("src/components/home-documents/home-documents-section.tsx");
  const gallery = read("src/components/home-gallery/home-gallery-section.tsx");
  // Prettier may put JSX props on separate lines. Both flags must belong
  // to the same HomeDocumentsSection rather than depend on source formatting.
  const documentsSection = home.match(/<HomeDocumentsSection\b[\s\S]*?\/>/)?.[0];
  assert.ok(documentsSection, "Homepage must render HomeDocumentsSection");
  assert.match(documentsSection, /\bjoinsObituaries\b/);
  assert.match(documentsSection, /\bfollowedByGallery\b/);
  assert.match(home, /joinsDocuments/);
  // Verify that the SVG is conditional, regardless of Prettier line breaks.
  assert.match(docs, /\{\s*!followedByGallery\s*&&\s*\(\s*<svg\b/);
  assert.match(gallery, /maskImage: `linear-gradient\(#000,#000\),\$\{TOP_MASK\}`/);
});

test("gallery thumbnails have diagonal shadows and pagination uses only dots", () => {
  const carousel = read("src/components/home-gallery/gallery-carousel.tsx");
  assert.match(carousel, /shadow-\[10px_12px_/);
  assert.doesNotMatch(carousel, /\{String\(requestedPage \+ 1\)\.padStart/);
  assert.match(carousel, /Wybierz stronę galerii/);
});

test("lightbox uses photograph's real aspect ratio with no letterbox background", () => {
  const carousel = read("src/components/home-gallery/gallery-carousel.tsx");
  assert.match(carousel, /naturalWidth, naturalHeight/);
  assert.match(carousel, /aspectRatio: lightboxRatio/);
  assert.doesNotMatch(carousel, /aspect-\[16\/10\]/);
  assert.match(carousel, /body\.style\.overflow = "hidden"/);
});

test("admin menu and site editor follow Documents then Gallery", () => {
  const admin = read("src/components/admin/admin-shell.tsx");
  const pages = read("src/lib/pages/schema.ts");
  assert.ok(admin.indexOf('href: "/admin/documents"') < admin.indexOf('href: "/admin/gallery"'));
  assert.ok(admin.indexOf('id: "documents"') < admin.indexOf('id: "gallery"'));
  assert.ok(pages.indexOf('"dokumenty"') < pages.indexOf('"galeria"'));
});

test("preview background is eager and fallback asset matches public filename", () => {
  const gallery = read("src/components/home-gallery/home-gallery-section.tsx");
  const schema = read("src/lib/home-gallery/schema.ts");
  assert.match(gallery, /loading=\{preview \? "eager" : "lazy"\}/);
  assert.match(schema, /backgroundImageUrl: "\/galeria-home-tlo\.png"/);
});
