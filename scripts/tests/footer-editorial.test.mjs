import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_FOOTER, parseFooter } from "../../src/lib/footer/schema.ts";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("footer preserves old Firestore publications and assigns navigation groups", () => {
  const oldFooter = structuredClone(DEFAULT_FOOTER);
  delete oldFooter.navSecondaryTitle;
  delete oldFooter.introHeading;
  delete oldFooter.footerEyebrow;
  delete oldFooter.showHighlightedContact;
  oldFooter.navLinks.forEach((link) => delete link.group);
  const upgraded = parseFooter(oldFooter);
  assert.equal(upgraded.navSecondaryTitle, "INFORMACJE");
  assert.equal(upgraded.showHighlightedContact, true);
  assert.equal(upgraded.navLinks.find((link) => link.href === "/galeria")?.group, "company");
  assert.equal(upgraded.navLinks.find((link) => link.href === "/dokumenty")?.group, "information");
});

test("editor rejects invalid navigation groups and permits changing groups", () => {
  assert.throws(() =>
    parseFooter({
      ...DEFAULT_FOOTER,
      navLinks: DEFAULT_FOOTER.navLinks.map((link) => ({ ...link, group: "bad" })),
    }),
  );
  const changed = structuredClone(DEFAULT_FOOTER);
  changed.navLinks[0].group = "information";
  assert.equal(parseFooter(changed).navLinks[0].group, "information");
});

test("editorial footer has two nav groups, strong hierarchy, prominent contact and social media", () => {
  const component = read("src/components/footer/site-footer.tsx");
  const editor = read("src/app/(admin)/admin/(protected)/site/footer/page.tsx");
  assert.match(component, /FooterLinkGroup\s+title=\{data\.navTitle\}\s+group="company"/);
  assert.match(component, /FooterLinkGroup\s+title=\{data\.navSecondaryTitle\}\s+group="information"/);
  assert.match(component, /showHighlightedContact/);
  assert.match(component, /settings\.primaryPhone/);
  assert.match(component, /data\.introHeading/);
  assert.match(component, /visibleSocials\.map/);
  assert.match(editor, /value=\{editor\.draft\.introHeading\}/);
  assert.match(editor, /value=\{item\.group\}/);
});

test("global footer remains connected to company settings and existing Contact wave", () => {
  const layout = read("src/app/(site)/layout.tsx");
  const contact = read("src/components/home-contact/home-contact-section.tsx");
  const footer = read("src/components/footer/site-footer.tsx");
  assert.match(layout, /getPublishedSiteSettings/);
  assert.match(footer, /bg-\[#0f1c16\]/);
  assert.match(contact, /fill-\[#0f1c16\]/);
});

test("footer doesn't duplicate city at the top, but retains full contact address", () => {
  const component = read("src/components/footer/site-footer.tsx");
  const top = component.match(
    /<div className="text-\[\.7em\] font-semibold uppercase tracking-\[\.22em\] text-\[#e3c997\]">[\s\S]*?<\/div>/,
  )?.[0];
  assert.ok(top, "footer label should be present");
  assert.match(top, /data\.footerEyebrow/);
  assert.doesNotMatch(top, /settings\.postalCity/);
  // Verify the actual address row, not a specific Prettier-generated JSX layout.
  // Prettier may wrap the postalCity condition in parentheses and line breaks.
  const addressRow = component.match(/<SmallContact\b[^>]*Icon=\{TbMapPin\}[\s\S]*?<\/SmallContact>/)?.[0];
  assert.ok(addressRow, "the contact column must contain an address row");
  assert.match(addressRow, /\{settings\.addressLine\}/);
  assert.match(addressRow, /\{settings\.postalCity\}/);
});
