import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_HOME_SERVICES,
  parseHomeServices,
  safeServiceImage,
  safeServicesHref,
} from "../../src/lib/home-services/schema.ts";

test("four grounded services have valid defaults", () => {
  assert.deepEqual(parseHomeServices(DEFAULT_HOME_SERVICES), DEFAULT_HOME_SERVICES);
  assert.equal(DEFAULT_HOME_SERVICES.services.length, 4);
  assert.ok(DEFAULT_HOME_SERVICES.services.every((item) => item.imageUrl.startsWith("/uslugi")));
});
test("older records receive responsive controls", () => {
  const old = { ...DEFAULT_HOME_SERVICES };
  delete old.cardGapScale;
  delete old.cardTitleScale;
  delete old.cardImageHeightScale;
  const parsed = parseHomeServices(old);
  assert.equal(parsed.cardGapScale, 100);
  assert.equal(parsed.cardImageHeightScale, 100);
  assert.equal(parsed.cardTitleScale, 100);
});
test("reject unknown and malformed fields", () => {
  assert.throws(() => parseHomeServices({ ...DEFAULT_HOME_SERVICES, isAdmin: true }));
  assert.throws(() => parseHomeServices({ ...DEFAULT_HOME_SERVICES, services: [] }));
  assert.throws(() => parseHomeServices({ ...DEFAULT_HOME_SERVICES, headline: "" }));
  assert.throws(() => parseHomeServices({ ...DEFAULT_HOME_SERVICES, cardGapScale: 400 }));
  assert.throws(() =>
    parseHomeServices({
      ...DEFAULT_HOME_SERVICES,
      services: DEFAULT_HOME_SERVICES.services.map((c, i) => (i === 0 ? { ...c, admin: true } : c)),
    }),
  );
});
test("safe image and offer links only", () => {
  assert.equal(safeServiceImage("/uslugi-home.png"), true);
  assert.equal(safeServiceImage("/uslugi1-home.png"), true);
  assert.equal(safeServiceImage("/../.env"), false);
  assert.equal(safeServiceImage("//external.example/photo.png"), false);
  assert.equal(safeServiceImage("https://attacker.test/photo.png"), false);
  assert.equal(safeServiceImage("https://cdn.public.blob.vercel-storage.com/img.webp"), true);
  assert.equal(safeServiceImage("https://cdn.public.blob.vercel-storage.com.attacker.test/img.png"), false);
  assert.equal(safeServicesHref("/oferta"), true);
  assert.equal(safeServicesHref("/oferta#transport"), true);
  assert.equal(safeServicesHref("javascript:alert(1)"), false);
  assert.equal(safeServicesHref("//attacker.test"), false);
  assert.throws(() => parseHomeServices({ ...DEFAULT_HOME_SERVICES, buttonHref: "https://attacker.test" }));
});
test("individual card photos and positions validated", () => {
  const cards = DEFAULT_HOME_SERVICES.services.map((card, index) =>
    index === 0 ? { ...card, imagePositionY: 101 } : card,
  );
  assert.throws(() => parseHomeServices({ ...DEFAULT_HOME_SERVICES, services: cards }));
  const unsafe = DEFAULT_HOME_SERVICES.services.map((card, index) =>
    index === 0 ? { ...card, imageUrl: "javascript:alert(1)" } : card,
  );
  assert.throws(() => parseHomeServices({ ...DEFAULT_HOME_SERVICES, services: unsafe }));
});
