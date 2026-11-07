import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
import test from "node:test";
import assert from "node:assert/strict";
import { openedServices, toggleOfferService, expandOfferService } from "../../src/lib/offer/open-state.ts";

test("first service opens by default and multiple drawers remain open independently", () => {
  const original = {};
  assert.deepEqual(openedServices(original, "ceremonie", "pogrzeb"), ["pogrzeb"]);
  const state = toggleOfferService(original, "ceremonie", "muzyka", "pogrzeb");
  assert.deepEqual(openedServices(state, "ceremonie", "pogrzeb"), ["pogrzeb", "muzyka"]);
  assert.deepEqual(original, {});

  const afterClosingFirst = toggleOfferService(state, "ceremonie", "pogrzeb", "pogrzeb");
  assert.deepEqual(openedServices(afterClosingFirst, "ceremonie", "pogrzeb"), ["muzyka"]);
  const afterClosingSecond = toggleOfferService(afterClosingFirst, "ceremonie", "muzyka", "pogrzeb");
  assert.deepEqual(openedServices(afterClosingSecond, "ceremonie", "pogrzeb"), []);
  // Explicit empty state must not re-open the default drawer.
  assert.deepEqual(openedServices(afterClosingSecond, "ceremonie", "pogrzeb"), []);
});

test("category switch preserves drawer state in both categories", () => {
  const a = toggleOfferService({}, "ceremonie", "muzyka", "pogrzeb");
  const b = toggleOfferService(a, "transport", "autokar", "transport-zmarlych");
  assert.deepEqual(openedServices(b, "ceremonie", "pogrzeb"), ["pogrzeb", "muzyka"]);
  assert.deepEqual(openedServices(b, "transport", "transport-zmarlych"), ["transport-zmarlych", "autokar"]);
});

test("deep link opens its target without closing other drawers or creating duplicates", () => {
  const a = toggleOfferService({}, "transport", "autokar", "transport-zmarlych");
  const b = expandOfferService(a, "transport", "transport-miedzynarodowy", "transport-zmarlych");
  assert.deepEqual(openedServices(b, "transport", "transport-zmarlych"), [
    "transport-zmarlych",
    "autokar",
    "transport-miedzynarodowy",
  ]);
  assert.equal(expandOfferService(b, "transport", "autokar", "transport-zmarlych"), b);
});

test("public explorer uses independent toggles rather than closing a previous selection", () => {
  const source = readFileSync(resolve(projectRoot, "src/components/offer/offer-explorer.tsx"), "utf8");
  assert.match(source, /setExpandedByCategory\(previous\s*=>\s*toggleOfferService\(/);
  assert.match(source, /const isOpen\s*=\s*openIds\.includes\(item\.id\)/);
  assert.match(source, /setExpandedByCategory\(previous\s*=>\s*expandOfferService\(/);
  assert.doesNotMatch(source, /setExpanded\(isOpen\s*\?\s*""\s*:\s*item\.id\)/);
});
