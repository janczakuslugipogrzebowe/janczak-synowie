import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_HOME_CONTACT,
  HomeContactValidationError,
  parseHomeContact,
} from "../../src/lib/home-contact/schema.ts";

const valid = () => structuredClone(DEFAULT_HOME_CONTACT);
test("published contact defaults are valid", () => {
  assert.deepEqual(parseHomeContact(valid()), DEFAULT_HOME_CONTACT);
});
test("contact settings are strictly validated without accepting company contact overrides", () => {
  for (const key of ["primaryPhone", "addressLine", "email", "mapsUrl"]) {
    assert.throws(() => parseHomeContact({ ...valid(), [key]: "injected" }), HomeContactValidationError);
  }
});
test("image path and internal CTA only", () => {
  for (const imageUrl of ["https://example.com/image.png", "/../secret.png", "//x.png", "/avatar.svg"]) {
    assert.throws(() => parseHomeContact({ ...valid(), imageUrl }), HomeContactValidationError);
  }
  for (const buttonHref of ["https://example.com", "//evil.test", "/../admin", "javascript:alert(1)"]) {
    assert.throws(() => parseHomeContact({ ...valid(), buttonHref }), HomeContactValidationError);
  }
});
test("photography and scale settings are bounded", () => {
  for (const key of [
    "imagePositionX",
    "imagePositionY",
    "overlayOpacity",
    "headingScale",
    "descriptionScale",
    "phoneScale",
    "iconScale",
    "spacingScale",
  ]) {
    assert.throws(() => parseHomeContact({ ...valid(), [key]: -1 }), HomeContactValidationError);
    assert.throws(() => parseHomeContact({ ...valid(), [key]: "120" }), HomeContactValidationError);
  }
});
test("visibility switches must be booleans and may be turned off", () => {
  for (const key of ["showSecondaryPhone", "showAddress", "showEmail"]) {
    assert.equal(parseHomeContact({ ...valid(), [key]: false })[key], false);
    assert.throws(() => parseHomeContact({ ...valid(), [key]: "false" }), HomeContactValidationError);
  }
});
