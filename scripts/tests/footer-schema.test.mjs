import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FOOTER,
  FOOTER_NAV_PATHS,
  SOCIAL_PLATFORMS,
  parseFooter,
  validateSocialUrl,
} from "../../src/lib/footer/schema.ts";

test("default footer has each required public route exactly once", () => {
  const parsed = parseFooter(DEFAULT_FOOTER);
  assert.deepEqual(parsed.navLinks.map(({ href }) => href).sort(), [...FOOTER_NAV_PATHS].sort());
  assert.equal(parsed.socialLinks.length, SOCIAL_PLATFORMS.length);
});

test("footer supports optional Facebook and Instagram without mandatory social links", () => {
  const content = structuredClone(DEFAULT_FOOTER);
  content.socialLinks[0].url = "https://www.facebook.com/janczakuslugi/";
  content.socialLinks[0].visible = true;
  content.socialLinks[1].url = "https://instagram.com/janczak/";
  content.socialLinks[1].visible = true;
  const parsed = parseFooter(content);
  assert.equal(parsed.socialLinks.filter((entry) => entry.visible && entry.url).length, 2);
  assert.ok(parsed.socialLinks.some((entry) => entry.platform === "youtube" && !entry.visible && !entry.url));
});

test("social links reject script schemes, wrong hosts, credentials and HTTP", () => {
  for (const bad of [
    "javascript:alert(1)",
    "http://facebook.com/example",
    "https://facebook.com.evil.test/",
    "https://evil.test/account",
    "https://user:pw@facebook.com/",
    "https://facebook.com:8443/a",
  ]) {
    assert.throws(() => validateSocialUrl("facebook", bad));
  }
  assert.equal(validateSocialUrl("instagram", ""), "");
});

test("navigation rejects duplicate and unsupported paths", () => {
  const dup = structuredClone(DEFAULT_FOOTER);
  dup.navLinks[1].href = "/";
  assert.throws(() => parseFooter(dup));
  const foreign = structuredClone(DEFAULT_FOOTER);
  foreign.navLinks[1].href = "https://phishing.example";
  assert.throws(() => parseFooter(foreign));
});

test("validates layout values and content bounds", () => {
  assert.throws(() => parseFooter({ ...DEFAULT_FOOTER, textScale: 500 }));
  assert.throws(() => parseFooter({ ...DEFAULT_FOOTER, unknown: "yes" }));
  assert.throws(() => parseFooter({ ...DEFAULT_FOOTER, socialLinks: [] }));
  assert.equal(parseFooter({ ...DEFAULT_FOOTER, endingText: "" }).endingText, "");
});
