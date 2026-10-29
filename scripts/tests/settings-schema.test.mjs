import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SITE_SETTINGS,
  parseSiteSettings,
  normalizePhone,
  directionsUrl,
  isAllowedMapsUrl,
  normalizeMapsEmbed,
  googleMapsEmbedUrl,
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

test("Google Maps embeds accept only a trusted URL and strip iframe HTML", () => {
  const url = "https://www.google.com/maps/embed?pb=!1m18!1m12%2Ffoo";
  const full = `<iframe src="${url.replace("&", "&amp;")}" width="600" height="450" loading="lazy"></iframe>`;
  assert.equal(normalizeMapsEmbed(url), url);
  assert.equal(normalizeMapsEmbed(full), url);
  assert.equal(parseSiteSettings({ ...DEFAULT_SITE_SETTINGS, mapsEmbedUrl: full }).mapsEmbedUrl, url);
  assert.equal(googleMapsEmbedUrl({ ...DEFAULT_SITE_SETTINGS, mapsEmbedUrl: url }), url);
  assert.match(googleMapsEmbedUrl(DEFAULT_SITE_SETTINGS), /^https:\/\/www.google.com\/maps\?q=/);
  for (const unsafe of [
    "javascript:alert(1)",
    "https://evil.com/maps/embed?pb=a",
    "https://www.google.com.evil.com/maps/embed?pb=a",
    '<iframe src="https://www.google.com/maps/embed?pb=x" onload="alert(1)"></iframe><script>alert(1)</script>',
    "https://www.google.com/maps/search/?api=1",
  ]) {
    assert.equal(normalizeMapsEmbed(unsafe), null);
    assert.throws(() => parseSiteSettings({ ...DEFAULT_SITE_SETTINGS, mapsEmbedUrl: unsafe }));
  }
});
