import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = new URL("../../", import.meta.url);
const component = readFileSync(new URL("src/components/admin/gallery-explorer.tsx", root), "utf8");
const page = readFileSync(new URL("src/app/(admin)/admin/(protected)/gallery/page.tsx", root), "utf8");
const hero = readFileSync(new URL("src/components/subpages/subpage-hero.tsx", root), "utf8");
const albums = readFileSync(new URL("src/components/gallery/gallery-albums-section.tsx", root), "utf8");
const cta = readFileSync(new URL("src/components/subpages/subpage-bottom-cta.tsx", root), "utf8");
const { selectGalleryRange, galleryTransfer } = await import("../../src/lib/gallery/explorer-actions.ts");
test("Ctrl/Shift selection: contiguous range in either direction", () => {
  assert.deepEqual(selectGalleryRange(["a", "b", "c", "d"], "b", "d"), ["b", "c", "d"]);
  assert.deepEqual(selectGalleryRange(["a", "b", "c", "d"], "d", "b"), ["b", "c", "d"]);
  assert.deepEqual(selectGalleryRange(["a", "b"], null, "a"), ["a"]);
  assert.deepEqual(selectGalleryRange(["a", "b"], "missing", "b"), ["b"]);
});
test("multiple photo transfer tracks original folders for undo; no-ops skipped", () => {
  const entries = [
    { id: "a", albumId: "" },
    { id: "b", albumId: "karawan" },
    { id: "c", albumId: "siedziba" },
  ];
  const { moves, previous } = galleryTransfer(["a", "b", "b", "unknown"], "siedziba", entries);
  assert.deepEqual(moves, { a: "siedziba", b: "siedziba" });
  assert.deepEqual(previous, { a: "", b: "karawan" });
  assert.deepEqual(galleryTransfer(["c"], "siedziba", entries).moves, {});
});
test("explorer UI includes two drop zones, marquee, drag overlay, shortcuts and context menu", () => {
  for (const part of [
    "data-gallery-drop",
    "data-gallery-tile",
    "data-gallery-scroll",
    "onPointerMove",
    "onPointerUp",
    "onContextMenu",
    "Ctrl / ⌘",
    "setMarquee",
    "motion.div",
    'role="menu"',
    "ConfirmDialog",
    "onReassign",
  ])
    assert.ok(component.includes(part), part);
});
test("admin selection toolbar is always mounted, with drafts persisted via existing API", () => {
  assert.match(component, /flex min-h-14 flex-wrap/);
  assert.match(page, /method:\s*publish\s*\?\s*"POST"\s*:\s*"PUT"/);
  assert.match(page, /JSON\.stringify\(\s*\{\s*photos:\s*content,\s*albums:\s*albumContent\s*,?\s*\}\s*\)/);
  assert.match(page, /beforeunload/);
});
test("hero never renders duplicate legacy breadcrumb; internal sections share visual gold and new CTA", () => {
  assert.match(hero, /isDuplicate/);
  assert.match(hero, /!isDuplicate && label/);
  assert.match(hero, /E6C991/);
  assert.match(albums, /SectionEyebrow/);
  assert.match(cta, /SectionEyebrow/);
  assert.match(cta, /Pomoc całodobowa/);
});

test("legacy CMS copy is upgraded only when equal to old defaults", () => {
  const schema = readFileSync(new URL("src/lib/subpages/schema.ts", root), "utf8");
  const data = readFileSync(new URL("src/lib/subpages/data.ts", root), "utf8");
  assert.match(schema, /function migrateGalleryPresentation/);
  assert.match(schema, /block\.description\s*===\s*legacy\.description/);
  assert.match(schema, /block\.eyebrow\s*===\s*legacy\.eyebrow/);
  assert.match(data, /migrateGalleryPresentation\(slug,\s*section,\s*parseSubpageBlock/);
});
