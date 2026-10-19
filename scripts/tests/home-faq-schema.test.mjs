import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_HOME_FAQ, parseHomeFaq } from "../../src/lib/home-faq/schema.ts";

test("defaults and all six initial FAQs are valid", () => {
  assert.deepEqual(parseHomeFaq(DEFAULT_HOME_FAQ), DEFAULT_HOME_FAQ);
  assert.equal(DEFAULT_HOME_FAQ.items.length, 6);
});
test("dynamic FAQ supports insertion, reordering and hiding without losing ids", () => {
  const items = [...DEFAULT_HOME_FAQ.items];
  items.unshift({ id: "faq-extra-001", question: "Nowe pytanie?", answer: "Nowa odpowiedź.", visible: false });
  assert.equal(parseHomeFaq({ ...DEFAULT_HOME_FAQ, items }).items.length, 7);
  assert.deepEqual(parseHomeFaq({ ...DEFAULT_HOME_FAQ, items: items.reverse() }).items.map(x=>x.id), items.map(x=>x.id));
});
test("no duplicate ids, script URLs, extra keys or unsafe paths", () => {
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, buttonHref: "javascript:alert(1)" }));
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, imageUrl: "//evil.example/x.png" }));
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, imageUrl: "/../private.png" }));
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, arbitrary: true }));
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, items: [DEFAULT_HOME_FAQ.items[0], DEFAULT_HOME_FAQ.items[0]] }));
});
test("sizes and payload length have bounded values", () => {
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, headingScale: 300 }));
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, overlayOpacity: -1 }));
  assert.throws(() => parseHomeFaq({ ...DEFAULT_HOME_FAQ, items: Array.from({ length: 41 }, (_,i) => ({ ...DEFAULT_HOME_FAQ.items[0], id: `faq-item-${i}` })) }));
});
