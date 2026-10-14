import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_HERO, parseHero, safeHref, safeImageUrl } from "../../src/lib/hero/schema.ts";

test("default Hero is valid", () => {
  assert.deepEqual(parseHero(DEFAULT_HERO), DEFAULT_HERO);
});
test("reject dangerous links and external images", () => {
  assert.equal(safeHref("javascript:alert(1)"), false);
  assert.equal(safeHref("//evil.example"), false);
  assert.equal(safeHref("/kontakt"), true);
  assert.equal(safeHref("tel:+48605043008"), true);
  assert.equal(safeImageUrl("https://evil.example/bad.png"), false);
  assert.equal(safeImageUrl("/hero.png"), true);
  assert.equal(safeImageUrl(`https://file.public.blob.vercel-storage.com/hero.png?foo=";background`), false);
  assert.throws(() => parseHero({ ...DEFAULT_HERO, primaryHref: "javascript:alert(1)" }));
});
test("only known fields are accepted", () => {
  assert.throws(() => parseHero({ ...DEFAULT_HERO, isAdmin: true }));
  assert.throws(() => parseHero({ ...DEFAULT_HERO, headline: "" }));
  assert.throws(() => parseHero({ ...DEFAULT_HERO, overlayOpacity: -1 }));
  assert.throws(() => parseHero({ ...DEFAULT_HERO, headline: "a".repeat(200) }));
});

test("previously published Hero documents get responsive defaults", () => {
  const legacy = { ...DEFAULT_HERO };
  for (const key of ["eyebrowScale","headingScale","descriptionScale","buttonScale","highlightIconScale","highlightTitleScale","highlightDescriptionScale","highlightGapScale"]) delete legacy[key];
  const result = parseHero(legacy);
  assert.equal(result.headingScale, 100);
  assert.equal(result.highlightGapScale, 100);
  assert.deepEqual(result, DEFAULT_HERO);
});

test("responsive scales are validated before Firestore writes", () => {
  assert.throws(() => parseHero({ ...DEFAULT_HERO, headingScale: 250 }));
  assert.throws(() => parseHero({ ...DEFAULT_HERO, highlightIconScale: "huge" }));
  assert.throws(() => parseHero({ ...DEFAULT_HERO, highlightGapScale: 82.5 }));
  assert.equal(parseHero({ ...DEFAULT_HERO, headingScale: 115 }).headingScale, 115);
});
