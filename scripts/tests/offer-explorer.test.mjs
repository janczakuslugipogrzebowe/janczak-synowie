import test from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tallestServiceCardHeight, expandedOfferGridHeight } from "../../src/lib/offer/stable-grid.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative) => readFileSync(resolve(root, relative), "utf8");

test("offer shows a single active category with sticky accessible tabs and navigable deep-links", () => {
  const source = read("src/components/offer/offer-explorer.tsx");
  const page = read("src/app/(site)/oferta/page.tsx");
  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tab"/);
  assert.match(source, /aria-selected=/);
  assert.match(source, /sticky top-\[78px\]/);
  assert.match(source, /md:top-\[88px\]/);
  assert.match(source, /popstate/);
  assert.match(source, /hashchange/);
  assert.match(source, /history\.pushState/);
  assert.match(source, /useReducedMotion/);
  assert.match(source, /active\s*&&\s*\(?\s*<motion\.div/);
  assert.match(source, /categoryCover\(active\s*,\s*catalog\.items\)/);
  assert.match(source, /onError=\{\(\) => setFailed\(true\)\}/);
  assert.doesNotMatch(source, /groups\.map\(/);
  assert.match(page, /<OfferExplorer\s+intro=\{intro\}\s+heading=\{catalog\}\s+catalog=\{services\}\s*\/>/);
});

test("service details reuse the public preview in admin; CMS copy is separated from service editing", () => {
  const admin = read("src/components/admin/offer-service-editor.tsx");
  const overview = read("src/components/admin/offer-page-editor.tsx");
  const shell = read("src/components/admin/admin-shell.tsx");
  assert.match(admin, /import \{ ServiceEntry \}/);
  assert.match(admin, /<ServiceEntry\s+item\s*=/);
  assert.match(admin, /beforeunload/);
  assert.match(admin, /Podstawowe/);
  assert.match(admin, /Zakres i opis/);
  assert.match(admin, /Pytania i odpowiedzi/);
  assert.match(overview, /<OfferExplorer\s+intro=\{intro\.draft\}/);
  assert.match(overview, /Otwórz menedżer usług/);
  assert.match(shell, /Przegląd oferty/);
});

test("category-scoped reordering does not disturb other category items", async () => {
  const tmp = mkdtempSync(join(tmpdir(), "janczak-offer-order-"));
  try {
    const contents = read("src/lib/offer/order.ts");
    const temporary = join(tmp, "order.ts");
    writeFileSync(temporary, contents);
    const { moveOfferService } = await import(pathToFileURL(temporary).href);
    const original = [
      { id: "a1", categoryId: "a" },
      { id: "b1", categoryId: "b" },
      { id: "a2", categoryId: "a" },
      { id: "b2", categoryId: "b" },
      { id: "a3", categoryId: "a" },
    ];
    assert.deepEqual(
      moveOfferService(original, "a2", -1).map((x) => x.id),
      ["a2", "b1", "a1", "b2", "a3"],
    );
    assert.deepEqual(moveOfferService(original, "a1", -1), original);
    assert.deepEqual(
      moveOfferService(original, "b1", 1).map((x) => x.id),
      ["a1", "b2", "a2", "b1", "a3"],
    );
    assert.deepEqual(
      original.map((x) => x.id),
      ["a1", "b1", "a2", "b2", "a3"],
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("catalog revision is guarded by Firestore transaction and HTTP conflict handling", () => {
  const data = read("src/lib/offer/services-data.ts");
  const api = read("src/app/api/admin/services/route.ts");
  const hook = read("src/components/admin/use-cms-editor.ts");
  assert.match(data, /runTransaction/);
  assert.match(data, /current\.data\(\)\?\.revision/);
  assert.match(data, /OfferCatalogConflictError/);
  assert.match(api, /status/); // route preserves structured JSON statuses
  assert.match(api, /,\s*409\s*\)/);
  assert.match(api, /,\s*428\s*\)/);
  assert.match(hook, /If-Match/);
});

test("odd-numbered categories do not stretch the last service across two columns", () => {
  const source = read("src/components/offer/offer-explorer.tsx");
  assert.match(source, /grid-cols-1 content-start items-start gap-6 xl:grid-cols-2/);
  assert.doesNotMatch(source, /col-span-2/);
  assert.doesNotMatch(source, /shouldSpanFull/);
});

test("expanded card height matches the tallest service, not the collapsed card", () => {
  const services = [
    { header: 120, detail: 400 },
    { header: 140, detail: 270 },
  ];
  assert.equal(tallestServiceCardHeight(services), 520);
  assert.equal(tallestServiceCardHeight([...services].reverse()), 520);
  assert.equal(
    tallestServiceCardHeight([
      { header: 120, detail: 400 },
      { header: 140, detail: 670 },
    ]),
    810,
  );
});

test("switching between expanded cards never changes the reserved grid height", () => {
  const services = [
    { header: 120, detail: 250 },
    { header: 100, detail: 150 },
    { header: 115, detail: 350 },
  ];
  // Two columns: the last service stays in its own LEFT card, not full width.
  // The tall expanded card may appear in either row without changing the
  // overall minimum reserved grid height while a service is open.
  assert.equal(tallestServiceCardHeight(services), 465);
  assert.equal(expandedOfferGridHeight(services, 2, 24), 609);
  assert.equal(expandedOfferGridHeight(services, 1, 24), 748);
  assert.equal(expandedOfferGridHeight([], 2, 24), 0);
  assert.equal(tallestServiceCardHeight([{ header: -4, detail: NaN }]), 0);
});

test("collapsed tiles keep their natural compact size; only open tile matches tallest height", () => {
  const source = read("src/components/offer/offer-explorer.tsx");
  assert.match(source, /inert=\{!open\}/);
  assert.match(source, /data-offer-detail-content/);
  assert.match(source, /new ResizeObserver\(schedule\)/);
  assert.match(source, /tallestServiceCardHeight\(dimensions\)/);
  assert.match(source, /expandedOfferGridHeight\(dimensions, columns, gap\)/);
  assert.match(source, /minHeight: open && expandedHeight/);
  assert.match(source, /minHeight:\s*hasOpenService\s*&&\s*measured\?\.gridHeight/);
  assert.match(source, /grid-cols-1 content-start items-start gap-6 xl:grid-cols-2/);
  assert.match(source, /data-offer-service[\s\S]*?h-fit self-start overflow-hidden/);
  assert.doesNotMatch(source, /gridAutoRows/);
  assert.doesNotMatch(source, /h-full overflow-hidden/);
  assert.doesNotMatch(source, /shouldSpanFull|col-span-2/);
});
