import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(new URL("../../" + p, import.meta.url), "utf8");
test("homepage connects latest company data to final contact section", () => {
  const home = read("src/app/(site)/page.tsx");
  assert.match(home, /getPublishedSiteSettings/);
  assert.match(home, /getPublishedHomeContact/);
  assert.match(home, /HomeFaqSection data=\{faq\} joinsGallery followedByContact/);
  assert.match(home, /HomeContactSection data=\{contact\} settings=\{settings\} joinsFaq/);
});
test("FAQ hands the exact approved wave to contact as sole boundary owner", () => {
  const faq = read("src/components/home-faq/home-faq-section.tsx");
  const contact = read("src/components/home-contact/home-contact-section.tsx");
  assert.match(faq, /!followedByContact/);
  assert.match(contact, /M0%2092%20C146%2078%20271%2066/);
  assert.match(contact, /maskImage:/);
  assert.match(contact, /-mt-\[clamp\(55px,7vw,160px\)\]/);
});
test("contact details come from global company settings; no duplicated contact fields in section CMS", () => {
  const component = read("src/components/home-contact/home-contact-section.tsx");
  const schema = read("src/lib/home-contact/schema.ts");
  assert.match(component, /settings\.primaryPhone/);
  assert.match(component, /settings\.secondaryPhone/);
  assert.match(component, /settings\.addressLine/);
  assert.match(component, /settings\.email/);
  assert.match(component, /settings\.availability/);
  assert.doesNotMatch(schema, /primaryPhone: string/);
});
test("admin API enforces auth, origin check, JSON validation, and cache revalidation", () => {
  const api = read("src/app/api/admin/home/contact/route.ts");
  for (const token of ["getAdminUid", "isSameOrigin", "parseHomeContact", "revalidateTag", "revalidatePath"])
    assert.ok(api.includes(token));
  const sidebar = read("src/components/admin/admin-shell.tsx");
  assert.match(sidebar, /id: "contact", label: "Kontakt"/);
});
test("contact has a dedicated live preview with published global settings", () => {
  const preview = read("src/app/(admin)/admin/preview/contact/page.tsx");
  assert.match(preview, /getAdminUid/);
  assert.match(preview, /getPublishedSiteSettings/);
  assert.match(preview, /ContactPreviewReceiver settings=\{settings\}/);
});
test("animated contact cards keep stable list keys and only one direct motion child", () => {
  const contact = read("src/components/home-contact/home-contact-section.tsx");
  assert.match(contact, /items\.map\(\(\{ id, Icon, label, description, href \}, index\) => \{/);
  assert.match(contact, /<motion\.div\s+key=\{id\}/);
  assert.match(contact, /className="min-w-0"\s*>\s*\{\/\* One direct child/);
  assert.match(
    contact,
    /<div className="flex min-w-0 items-center justify-center gap-4 text-left lg:gap-5">/,
  );
});
test("email remains linked, readable and uses a stable break only after @", () => {
  const contact = read("src/components/home-contact/home-contact-section.tsx");
  assert.match(contact, /settings\.email/);
  assert.match(contact, /`mailto:\$\{settings\.email\}`/);
  assert.match(contact, /label\.indexOf\("@"\)/);
  assert.match(contact, /label\.slice\(0, at \+ 1\)/);
  assert.match(contact, /<wbr \/>/);
  assert.match(contact, /label\.slice\(at \+ 1\)/);
  assert.match(contact, /xl:grid-cols-\[repeat\(3,minmax\(0,1fr\)\)_minmax\(0,1\.4fr\)\]/);
});
