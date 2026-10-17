import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_OBITUARY,
  parseObituaryInput,
  obituarySearchName,
  toObituarySlug,
  hasCurrentObituarySlug,
  isSafeSlug,
  isSafeId,
} from "../../src/lib/obituaries/schema.ts";
const value = {
  ...DEFAULT_OBITUARY,
  firstName: "Łucja",
  lastName: "Żółkiewska",
  deathDate: "2026-10-01",
  farewell: "Spoczywaj w pokoju",
};
test("accepts sanitized complete obituary and Polish names", () => {
  const result = parseObituaryInput(value);
  assert.equal(result.firstName, "Łucja");
  assert.equal(toObituarySlug(result), "lucja-zolkiewska-2026-10-01");
  assert.equal(obituarySearchName("Łucja", "Żółkiewska"), "zolkiewska lucja");
});
test("rejects invalid dates, chronological contradictions and invalid time", () => {
  assert.throws(() => parseObituaryInput({ ...value, deathDate: "2026-02-31" }));
  assert.throws(() => parseObituaryInput({ ...value, birthDate: "2026-10-02" }));
  assert.throws(() => parseObituaryInput({ ...value, ceremonyDate: "2026-10-01T25:15" }));
});
test("rejects injected fields and malformed entries", () => {
  assert.throws(() => parseObituaryInput({ ...value, isAdmin: true }));
  assert.throws(() => parseObituaryInput({ ...value, firstName: "" }));
  assert.throws(() => parseObituaryInput({ ...value, firstName: "bad\u0000name" }));
  assert.throws(() => parseObituaryInput({ ...value, seoIndex: "yes" }));
  assert.throws(() => parseObituaryInput({ ...value, symbol: "javascript" }));
});
test("prevents unsafe IDs and slugs", () => {
  assert.ok(isSafeId("G8zRnh03ai15XaZ20jVu"));
  assert.equal(isSafeId("../secret"), false);
  assert.ok(isSafeSlug("jan-nowak-2026-2"));
  assert.equal(isSafeSlug("../jan"), false);
  assert.equal(isSafeSlug("Jan-Nowak"), false);
});
test("does not require dates, farewell or religious symbol", () => {
  const neutral = parseObituaryInput({
    ...DEFAULT_OBITUARY,
    firstName: "Jan",
    lastName: "Nowak",
    symbol: "none",
  });
  assert.equal(neutral.deathDate, "");
  assert.equal(neutral.symbol, "none");
});

test("ceremony date, rather than just death year, drives the canonical slug", () => {
  const input = { ...value, ceremonyDate: "2026-10-23T15:30" };
  assert.equal(toObituarySlug(input), "lucja-zolkiewska-2026-10-23");
  assert.ok(hasCurrentObituarySlug(input, "lucja-zolkiewska-2026-10-23"));
  assert.ok(hasCurrentObituarySlug(input, "lucja-zolkiewska-2026-10-23-2"));
  assert.ok(hasCurrentObituarySlug(input, "lucja-zolkiewska-2026-10-23-10"));
  assert.equal(hasCurrentObituarySlug(input, "lucja-zolkiewska-2026-10-01"), false);
  const changed = { ...input, firstName: "Elżbieta", lastName: "Mazur" };
  assert.equal(toObituarySlug(changed), "elzbieta-mazur-2026-10-23");
  assert.equal(hasCurrentObituarySlug(changed, "lucja-zolkiewska-2026-10-23"), false);
});
test("without ceremony falls back to the full death date or an explicit undated slug", () => {
  assert.equal(toObituarySlug({ ...value, ceremonyDate: "" }), "lucja-zolkiewska-2026-10-01");
  assert.equal(
    toObituarySlug({ ...DEFAULT_OBITUARY, firstName: "Jan", lastName: "Nowak" }),
    "jan-nowak-bez-daty",
  );
});

test("long names do not truncate the full date segment", () => {
  const v = {
    ...value,
    firstName: "Anna".repeat(30),
    lastName: "Kowalska".repeat(20),
    ceremonyDate: "2026-10-23T10:00",
  };
  assert.ok(toObituarySlug(v).endsWith("-2026-10-23"));
  assert.ok(toObituarySlug(v).length <= 130);
});
