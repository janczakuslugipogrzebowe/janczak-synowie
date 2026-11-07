import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "../..");
const read = (file) => readFile(join(root, file), "utf8");

// The schema is dependency-free except for the shared image URL validator.
// Load the real TypeScript source with a compatible local validator so these
// tests exercise parser behavior without requiring a Next.js build.
const source = await read("src/lib/about-page/schema.ts");
const temporary = await mkdtemp(join(tmpdir(), "janczak-about-schema-"));
const fixture = join(temporary, "schema.ts");
const validationSource = source.replace(
  /^import \{ safeGalleryImage \} from "@\/lib\/gallery\/schema";$/m,
  `function safeGalleryImage(value: string): boolean {
    if (/[^\\x21-\\x7e]|["'\\\\<>]/.test(value)) return false;
    return /^\\/[a-z0-9/_-]+\\.(?:png|jpe?g|webp|avif)$/i.test(value) && !value.includes("..");
  }`,
);
if (validationSource === source) throw new Error("Nie znaleziono importu walidatora zdjęć.");
await writeFile(fixture, validationSource);
const schema = await import(pathToFileURL(fixture).href);
await rm(temporary, { recursive: true, force: true });

test("O nas has four independently editable body sections with dedicated imagery", () => {
  assert.deepEqual(schema.ABOUT_SECTIONS, ["history", "people", "values", "village"]);
  assert.equal(schema.ABOUT_DEFAULTS.history.imageUrl, "/onas1.jpg");
  assert.equal(schema.ABOUT_DEFAULTS.people.imageUrl, "/onas2.jpg");
  assert.equal(schema.ABOUT_DEFAULTS.village.imageUrl, "/onas3.jpg");
  assert.deepEqual(schema.ABOUT_DEFAULTS.people.people, []);
  assert.deepEqual(schema.ABOUT_DEFAULTS.history.milestones, []);
});

test("all default O nas sections validate and preserve content", () => {
  for (const section of schema.ABOUT_SECTIONS) {
    assert.deepEqual(schema.parseAboutSection(section, schema.ABOUT_DEFAULTS[section]), schema.ABOUT_DEFAULTS[section]);
  }
});

test("reject unknown keys, malformed photos and unsupported scales", () => {
  assert.throws(() => schema.parseAboutSection("history", { ...schema.ABOUT_DEFAULTS.history, dangerousHtml: "<script>" }), /Nieznane pole/);
  assert.throws(() => schema.parseAboutSection("village", { ...schema.ABOUT_DEFAULTS.village, imageUrl: "https://example.com/unknown.jpg" }), /Zdjęcie/);
  assert.throws(() => schema.parseAboutSection("people", { ...schema.ABOUT_DEFAULTS.people, headingScale: 1000 }), /zakresie/);
});

test("unverified people and events are optional, but confirmed entries are validated", () => {
  const person = { name: "Anna Nowak", role: "Współwłaścicielka", description: "Pomaga rodzinom." };
  const result = schema.parseAboutSection("people", { ...schema.ABOUT_DEFAULTS.people, people: [person] });
  assert.deepEqual(result.people, [person]);
  assert.throws(() => schema.parseAboutSection("people", { ...schema.ABOUT_DEFAULTS.people, people: [{ name: "", role: "", description: "" }] }), /imię i nazwisko/);
  assert.throws(() => schema.parseAboutSection("values", { ...schema.ABOUT_DEFAULTS.values, principles: [] }), /przynajmniej/);
});

test("new frontend uses shared hero and CTA plus all four editable sections", async () => {
  const page = await read("src/app/(site)/o-nas/page.tsx");
  for (const fragment of ["SubpageHero", "AboutHistorySection", "AboutPeopleSection", "AboutValuesSection", "AboutVillageSection", "SubpageBottomCta"]) assert.ok(page.includes(fragment), fragment);
  const shared = await read("src/lib/subpages/schema.ts");
  assert.ok(shared.includes('slug === "o-nas"'));
  assert.ok(shared.includes('/hero-onas.png'));
  assert.ok(shared.includes('/bottom-onas.png'));
});

test("admin offers six sections, preview, drafts and publishes to protected routes", async () => {
  const nav = await read("src/components/admin/admin-shell.tsx");
  const editor = await read("src/components/admin/about-page-editor.tsx");
  const api = await read("src/app/api/admin/about-page/[section]/route.ts");
  assert.ok(nav.includes('slug === "o-nas"'));
  for (const name of ["history", "people", "values", "village"]) assert.ok(nav.includes(`["${name}",`));
  assert.ok(editor.includes("AboutPagePreview"));
  assert.ok(editor.includes("Zapisz szkic") && editor.includes("Opublikuj"));
  assert.ok(api.includes("isSameOrigin") && api.includes("getAdminUid"));
  assert.ok(api.includes("revalidateTag") && api.includes("revalidatePath"));
});

test("legacy O nas copy stays available and the existing Firestore document isn't removed", async () => {
  const data = await read("src/lib/about-page/data.ts");
  assert.ok(data.includes('getPublishedPage("o-nas")'));
  assert.ok(data.includes('getAdminPageState("o-nas")'));
  assert.ok(data.includes('subpage-o-nas-${section}'));
  assert.equal(data.includes("batch.delete"), false);
});

test("history photo occupies wider editorial column rather than a constrained narrow square", async () => {
  const components = await read("src/components/about/about-sections.tsx");
  const history = components.split("export function AboutHistorySection")[1].split("export function AboutPeopleSection")[0];
  assert.match(history, /lg:grid-cols-\[minmax\(0,\.86fr\)_minmax\(0,1\.14fr\)\]/);
  assert.match(history, /lg:aspect-\[6\/5\]/);
  assert.doesNotMatch(history, /max-w-\[850px\]/);
});

test("village image fills its positioned column without conflicting positioning classes", async () => {
  const components = await read("src/components/about/about-sections.tsx");
  assert.match(components, /fillParent\s*\?\s*"absolute inset-0"\s*:\s*"relative"/);
  const village = components.split("export function AboutVillageSection")[1];
  assert.match(village, /<AboutPhotoView\s+data=\{data\}[^>]*\bfillParent\s*\/>/);
  assert.match(village, /className="relative min-h-\[320px\] lg:min-h-\[650px\]"/);
  assert.doesNotMatch(village, /className="absolute inset-0"/);
});
