import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_DOWNLOADS,
  DEFAULT_GUIDANCE,
  parseDownloadsContent,
  parseGuidanceContent,
  DocumentsPageValidationError,
  isDocumentsPageSection,
} from "../../src/lib/documents-page/schema.ts";

const code = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

test("Dokumenty: defaults and strict validation of editable sections", () => {
  assert.deepEqual(parseDownloadsContent(DEFAULT_DOWNLOADS), DEFAULT_DOWNLOADS);
  assert.deepEqual(parseGuidanceContent(DEFAULT_GUIDANCE), DEFAULT_GUIDANCE);
  assert.ok(isDocumentsPageSection("downloads"));
  assert.ok(isDocumentsPageSection("guidance"));
  assert.equal(isDocumentsPageSection("bottom"), false);
  assert.throws(() => parseDownloadsContent({ ...DEFAULT_DOWNLOADS, unexpected: true }), DocumentsPageValidationError);
  assert.throws(() => parseGuidanceContent({ ...DEFAULT_GUIDANCE, steps: [] }), DocumentsPageValidationError);
  assert.throws(
    () => parseGuidanceContent({ ...DEFAULT_GUIDANCE, steps: [{ title: "x", description: "x" }, ...DEFAULT_GUIDANCE.steps] }),
    DocumentsPageValidationError,
  );
  assert.throws(() => parseDownloadsContent({ ...DEFAULT_DOWNLOADS, headingScale: Infinity }), DocumentsPageValidationError);
});

test("Dokumenty use the same hero and bottom CTA as Galeria, with dedicated middle content", () => {
  const page = code("src/app/(site)/dokumenty/page.tsx");
  for (const name of ["SubpageHero", "DocumentsDownloadsSection", "DocumentsGuidanceSection", "SubpageBottomCta"])
    assert.match(page, new RegExp(`<${name}\\b`));
  for (const getter of ["getPublishedSubpageBlock", "getPublishedDocumentsPageSection", "getPublishedDocumentsLibrary", "getPublishedSiteSettings"])
    assert.ok(page.includes(getter), getter);
  assert.ok(page.includes('<main id="main"'));
  assert.ok(!page.includes("SubpageIntro"));
  assert.ok(!page.includes("publishedDocuments("), "Library getter is already filtered");
});

test("Dokumenty keep Gallery defaults unchanged and use dedicated image names", () => {
  const schema = code("src/lib/subpages/schema.ts");
  assert.ok(schema.includes('imageUrl: "/hero-dokumenty.png"'));
  assert.ok(schema.includes('imageUrl: "/bottom-dokumenty.png"'));
  assert.ok(schema.includes('if (slug === "galeria") return galleryDefaults[section]'));
});

test("Dokumenty CMS has section navigation, authenticated draft/publish and cache revalidation", () => {
  const shell = code("src/components/admin/admin-shell.tsx");
  for (const label of [
    '["hero", "Hero"]',
    '["downloads", "Dokumenty do pobrania"]',
    '["guidance", "Pomoc w formalnościach"]',
    '["bottom", "Kontaktowe CTA"]',
  ]) assert.ok(shell.includes(label));
  const api = code("src/app/api/admin/documents-page/[section]/route.ts");
  assert.ok(api.includes("getAdminUid"));
  assert.ok(api.includes("isSameOrigin"));
  assert.ok(api.includes("revalidateTag"));
  const editor = code("src/components/admin/documents-page-editor.tsx");
  assert.ok(editor.includes('href="/admin/documents"'), "Reuse the existing PDF library");
  const source = code("src/lib/documents-page/data.ts");
  assert.ok(source.includes('batch.set(ref("cmsDrafts", section), record)'));
  assert.ok(source.includes('if (publish) batch.set(ref("cmsPublished", section), record)'));
});

test("PDF downloads preserve original CMS address/visibility order, without a second library", () => {
  const section = code("src/components/documents/documents-downloads-section.tsx");
  const row = code("src/components/documents/document-download-row.tsx");
  assert.ok(section.includes("documents.map("));
  assert.ok(row.includes("document.href"));
  assert.ok(row.includes("noopener noreferrer"));
  assert.ok(row.includes("download: document.href.slice(1)"));
});
