import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("new catalogue preserves legacy published data until explicit publication", () => {
  const data = read("src/lib/offer/services-data.ts");
  assert.match(data, /cmsPublished/);
  assert.match(data, /cmsDrafts/);
  assert.match(data, /subpage-oferta-catalog/);
  assert.match(data, /offerServicesCatalog/);
  assert.match(data, /fromLegacyOffer/);
  assert.match(data, /if \(publish\) tx\.set/);
});
test("separate protected manager with individual service editing", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  const manager = read("src/components/admin/offer-services-manager.tsx");
  const form = read("src/components/admin/offer-service-editor.tsx");
  assert.match(shell, /href: "\/admin\/services"/);
  assert.match(manager, /\/admin\/services\/new/);
  assert.match(manager, /\/admin\/services\/\$\{s.id\}\/edit/);
  assert.match(manager, /Duplikuj usługę/);
  assert.match(manager, /Usunąć usługę/);
  assert.match(form, /parseServiceCatalog\(payload\(\)\)/);
});
test("editor copy separate from services CRUD and source content is unchanged in sections 4–7", () => {
  const ed = read("src/components/admin/offer-page-editor.tsx");
  const pub = read("src/app/(site)/oferta/page.tsx");
  const ui = read("src/components/offer/offer-sections.tsx");
  assert.match(ed, /Otwórz menedżer usług/);
  const catalogEditor =
    ed
      .split("export function OfferCatalogEditor()")[1]
      ?.split("export function OfferFormalitiesEditor()")[0] ?? "";
  assert.ok(catalogEditor);
  assert.doesNotMatch(catalogEditor, /\.items\.map/);
  assert.match(pub, /getPublishedOfferServices\(\)/);
  const explorer = read("src/components/offer/offer-explorer.tsx");
  assert.match(explorer, /data-offer-service/);
  assert.match(explorer, /role="tablist"/);
  assert.match(explorer, /kategoria-\$\{active.id\}/);
  assert.match(ui, /export function OfferFormalitiesSection/);
  assert.match(ui, /export function OfferProcessSection/);
  assert.match(ui, /export function OfferFloristSection/);
});
test("admin-only API enforces same-origin, session, validation and cache refresh", () => {
  const api = read("src/app/api/admin/services/route.ts");
  assert.match(api, /isSameOrigin\(request\)/);
  assert.match(api, /getAdminUid\(\)/);
  assert.match(api, /parseServiceCatalog\(JSON.parse/);
  assert.match(api, /revalidateTag\("janczak-offer-services"/);
  assert.match(api, /revalidatePath\("\/oferta"\)/);
  assert.match(api, /if-match/);
  assert.match(api, /OfferCatalogConflictError/);
});

test("live migration parser preserves IDs, order, copy and data security", async () => {
  // Node's experimental TS stripping does not resolve extensionless .ts imports;
  // evaluate the source in a temporary TS module with a fully qualified local import.
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { pathToFileURL } = await import("node:url");
  const tmp = mkdtempSync(join(tmpdir(), "janczak-offer-schema-"));
  try {
    const source = read("src/lib/offer/service-catalog.ts");
    const schemaUrl = pathToFileURL(resolve(root, "src/lib/offer/schema.ts")).href;
    const temp = join(tmp, "service-catalog.ts");
    writeFileSync(temp, source.replace('from "./schema"', `from "${schemaUrl}"`));
    const {
      fromLegacyOffer,
      DEFAULT_SERVICE_CATALOG,
      parseServiceCatalog,
      uniqueOfferId,
      visibleOfferCategories,
      ServiceCatalogValidationError,
    } = await import(pathToFileURL(temp).href);
    const legacy = fromLegacyOffer();
    assert.deepEqual(legacy, DEFAULT_SERVICE_CATALOG);
    assert.equal(legacy.categories.length, 4);
    assert.equal(legacy.items.length, 10);
    assert.equal(legacy.items[0].id, "organizacja-pogrzebow");
    assert.deepEqual(parseServiceCatalog(legacy), legacy);
    assert.equal(uniqueOfferId("Organizacja pogrzebów", legacy.items), "organizacja-pogrzebow-2");
    const renamed = structuredClone(legacy);
    renamed.categories[0].title = "Ceremonie pogrzebowe";
    assert.equal(parseServiceCatalog(renamed).items[0].categoryId, legacy.categories[0].id);
    const invalidCategory = structuredClone(legacy);
    invalidCategory.items[0].categoryId = "brak-kategorii";
    assert.throws(() => parseServiceCatalog(invalidCategory), ServiceCatalogValidationError);
    const duplicate = structuredClone(legacy);
    duplicate.items[1].id = duplicate.items[0].id;
    assert.throws(() => parseServiceCatalog(duplicate), ServiceCatalogValidationError);
    const invalidImage = structuredClone(legacy);
    invalidImage.items[0].imageUrl = "javascript:alert(1)";
    assert.throws(() => parseServiceCatalog(invalidImage), ServiceCatalogValidationError);
    const hidden = structuredClone(legacy);
    hidden.categories[0].visible = false;
    assert.equal(visibleOfferCategories(hidden).length, 3);
    const emptyCategory = structuredClone(legacy);
    emptyCategory.categories.push({
      id: "nowa-kategoria",
      title: "Nowa kategoria",
      description: "",
      visible: true,
      imageUrl: "",
    });
    assert.equal(parseServiceCatalog(emptyCategory).categories.length, 5);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
