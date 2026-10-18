import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SITE_SETTINGS,
  parseSiteSettings,
  normalizePhone,
  directionsUrl,
  isAllowedMapsUrl,
} from "../../src/lib/settings/schema.ts";
test("default data is valid and does not invent a maps listing", () => {
  assert.deepEqual(parseSiteSettings(DEFAULT_SITE_SETTINGS), DEFAULT_SITE_SETTINGS);
  assert.equal(directionsUrl(DEFAULT_SITE_SETTINGS), null);
  assert.equal(normalizePhone(DEFAULT_SITE_SETTINGS.primaryPhone), "+48605043008");
});
test("trusted Google Maps links can be saved verbatim", () => {
  const url = "https://maps.app.goo.gl/AbCdEfGhIj";
  assert.equal(isAllowedMapsUrl(url), true);
  assert.equal(directionsUrl(parseSiteSettings({ ...DEFAULT_SITE_SETTINGS, mapsUrl: url })), url);
  assert.equal(isAllowedMapsUrl("https://google.com.evil.net/maps/x"), false);
});
test("legacy saved settings receive new defaults", () => {
  const legacy = { ...DEFAULT_SITE_SETTINGS };
  for (const field of ["companyName", "companyDescription", "email", "mapsUrl"]) delete legacy[field];
  const res = parseSiteSettings(legacy);
  assert.equal(res.mapsUrl, "");
  assert.equal(res.companyName, DEFAULT_SITE_SETTINGS.companyName);
});
test("unsafe values are rejected", () => {
  assert.throws(() => parseSiteSettings({ ...DEFAULT_SITE_SETTINGS, mapsUrl: "javascript:alert(1)" }));
  assert.throws(() => parseSiteSettings({ ...DEFAULT_SITE_SETTINGS, primaryPhone: "invalid" }));
  assert.throws(() => parseSiteSettings({ ...DEFAULT_SITE_SETTINGS, extra: "admin" }));
  assert.throws(() => parseSiteSettings({ ...DEFAULT_SITE_SETTINGS, addressLine: "A\nB" }));
});
