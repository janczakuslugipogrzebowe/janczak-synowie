import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("footer is global in public layout and not inserted as a homepage section", () => {
  const layout = read("src/app/(site)/layout.tsx");
  assert.match(layout, /<GlobalFooter\s*\/>/);
  assert.match(layout, /getPublishedFooter/);
  assert.match(layout, /getPublishedSiteSettings/);
  assert.doesNotMatch(read("src/app/(site)/page.tsx"), /<SiteFooter/);
});

test("company contact details are inherited instead of stored twice", () => {
  const schema = read("src/lib/footer/schema.ts");
  const component = read("src/components/footer/site-footer.tsx");
  for (const prop of ["primaryPhone", "secondaryPhone", "email", "postalCity", "mapsUrl", "availability"]) {
    assert.doesNotMatch(schema, new RegExp(`\\b${prop}\\s*:`));
    assert.match(component, new RegExp(`settings\\.${prop}`));
  }
});

test("publishing invalidates footer cache tag and public layout", () => {
  const api = read("src/app/api/admin/site/footer/route.ts");
  const data = read("src/lib/footer/data.ts");
  assert.match(api, /revalidateTag\("janczak-site-footer"/);
  assert.match(api, /revalidatePath\("\/", "layout"\)/);
  assert.match(data, /doc\("siteFooter"\)/);
  assert.match(data, /cmsDrafts/);
  assert.match(data, /cmsPublished/);
});

test("footer editor has separate CMS route and admin navigation", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  const home = read("src/app/(admin)/admin/(protected)/site/page.tsx");
  assert.match(shell, /href="\/admin\/site\/footer"/);
  assert.match(home, /href="\/admin\/site\/footer"/);
  assert.match(read("src/app/(admin)/admin/(protected)/site/footer/page.tsx"), /useCmsEditor<FooterContent>/);
});

test("footer inherits contact wave color", () => {
  const contact = read("src/components/home-contact/home-contact-section.tsx");
  const footer = read("src/components/footer/site-footer.tsx");
  assert.match(contact, /fill-\[#0f1c16\]/);
  assert.match(footer, /bg-\[#0f1c16\]/);
});

test("year is cached outside footer render so prerendering is safe", () => {
  const year = read("src/lib/footer/year.ts");
  const component = read("src/components/footer/site-footer.tsx");
  const layout = read("src/app/(site)/layout.tsx");
  const preview = read("src/app/(admin)/admin/preview/footer/page.tsx");
  const receiver = read("src/components/admin/footer-preview-receiver.tsx");

  assert.match(year, /"use cache";/);
  assert.match(year, /cacheLife\(\{/);
  assert.match(year, /new Date\(\)\.getUTCFullYear\(\)/);
  assert.doesNotMatch(component, /new Date\(|Date\.now\(/);
  assert.match(component, /© \{copyrightYear\}/);
  assert.match(layout, /getFooterCopyrightYear\(\)/);
  assert.match(layout, /copyrightYear=\{copyrightYear\}/);
  assert.match(preview, /getFooterCopyrightYear\(\)/);
  assert.match(receiver, /copyrightYear=\{copyrightYear\}/);
});
