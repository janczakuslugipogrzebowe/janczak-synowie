import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_HOME_GALLERY, parseHomeGallery } from "../../src/lib/home-gallery/schema.ts";

test("default section valid", () => {
  assert.deepEqual(parseHomeGallery(DEFAULT_HOME_GALLERY), DEFAULT_HOME_GALLERY);
});
test("typography, timing and opacity bounded", () => {
  assert.throws(() => parseHomeGallery({ ...DEFAULT_HOME_GALLERY, autoplaySeconds: 1 }));
  assert.throws(() => parseHomeGallery({ ...DEFAULT_HOME_GALLERY, autoplaySeconds: 50 }));
  assert.throws(() => parseHomeGallery({ ...DEFAULT_HOME_GALLERY, headingScale: 200 }));
  assert.throws(() => parseHomeGallery({ ...DEFAULT_HOME_GALLERY, backgroundOpacity: -1 }));
});
test("reject invalid backgrounds and arbitrary keys", () => {
  assert.throws(() => parseHomeGallery({ ...DEFAULT_HOME_GALLERY, backgroundImageUrl: "javascript:evil" }));
  assert.throws(() => parseHomeGallery({ ...DEFAULT_HOME_GALLERY, tracking: "secret" }));
});
