import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { OFFER_DEFAULTS, OFFER_SECTIONS, isOfferSection, parseOfferSection, safeOfferImage } from "../../src/lib/offer/schema.ts";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(resolve(root,path),"utf8");

test("offer keeps seven public sections while combining intro and catalog editing into one screen", () => {
  const page=read("src/app/(site)/oferta/page.tsx");
  const shell=read("src/components/admin/admin-shell.tsx");
  const editor=read("src/components/admin/offer-page-editor.tsx");
  const home=read("src/app/(admin)/admin/(protected)/site/page.tsx");
  for(const s of OFFER_SECTIONS) {
    assert.ok(isOfferSection(s));
    assert.deepEqual(parseOfferSection(s, OFFER_DEFAULTS[s]), OFFER_DEFAULTS[s]);
    assert.match(page,new RegExp(`getPublishedOfferSection\\("${s}"\\)`));
    if (s !== "intro") assert.match(shell, new RegExp(`\\["${s}",`));
    assert.match(editor,new RegExp(`/api/admin/offer/${s}`));
  }
  assert.match(page,/getPublishedSubpageBlock\("oferta", "hero"\)/);
  assert.match(page,/getPublishedSubpageBlock\("oferta", "bottom"\)/);
  assert.match(editor,/export function OfferOverviewEditor/);
  assert.match(shell,/\["catalog", "Przegląd oferty"\]/);
  assert.match(home,/slug === "oferta"/);
});
test("catalog has grounded services and a single florist section", () => {
  const catalog=OFFER_DEFAULTS.catalog;
  assert.ok(catalog.items.length>=9);
  assert.ok(catalog.items.every(x=>x.visible));
  const ids=new Set(catalog.items.map(x=>x.id));
  assert.equal(ids.size,catalog.items.length);
  assert.ok(!ids.has("kwiaciarnia"));
  assert.match(read("src/components/offer/offer-sections.tsx"),/id="kwiaciarnia"/);
});
test("strict cms prevents unsafe images, duplicate IDs, unknown properties, oversize catalog and HTML snippets", () => {
  assert.ok(safeOfferImage("/uslugi1-home.png"));
  assert.equal(safeOfferImage("//evil.test/x.png"),false);
  assert.equal(safeOfferImage("https://evil.test/x.png"),false);
  assert.throws(()=>parseOfferSection("intro",{...OFFER_DEFAULTS.intro, injected:true}));
  assert.throws(()=>parseOfferSection("catalog",{...OFFER_DEFAULTS.catalog,items:[...OFFER_DEFAULTS.catalog.items,OFFER_DEFAULTS.catalog.items[0]]}));
  assert.throws(()=>parseOfferSection("catalog",{...OFFER_DEFAULTS.catalog,items: Array.from({length:25},(_,i)=>({...OFFER_DEFAULTS.catalog.items[0],id:`some-${i}`}))}));
  assert.throws(()=>parseOfferSection("catalog",{...OFFER_DEFAULTS.catalog,items:[{...OFFER_DEFAULTS.catalog.items[0],imageUrl:"javascript:alert(1)"}]}));
  assert.throws(()=>parseOfferSection("catalog",{...OFFER_DEFAULTS.catalog,items:[{...OFFER_DEFAULTS.catalog.items[0],lead:"one\u0000two"}]}));
});
test("published data is distinct from drafts; admin writes are guarded",()=>{
  const data=read("src/lib/offer/data.ts");
  const api=read("src/app/api/admin/offer/[section]/route.ts");
  assert.match(data,/cmsPublished/);
  assert.match(data,/cmsDrafts/);
  assert.match(data,/"use cache"/);
  assert.match(api,/isSameOrigin\(request\)/);
  assert.match(api,/getAdminUid\(/);
  assert.match(api,/revalidateTag/);
  assert.match(api,/if \(publish\)/);
});
test("homepage links to individual published services and florist",()=>{
  const home=read("src/components/home-services/home-services-section.tsx");
  const schema=read("src/lib/home-services/schema.ts");
  assert.match(home,/service\.offerTarget \?\? data\.buttonHref/);
  assert.match(schema,/\/oferta#kwiaciarnia/);
});
