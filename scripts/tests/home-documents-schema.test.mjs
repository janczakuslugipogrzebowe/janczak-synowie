import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_HOME_DOCUMENTS,
  HomeDocumentsValidationError,
  parseHomeDocuments,
} from "../../src/lib/home-documents/schema.ts";

test("default section includes the uploaded photograph and the document CTA", () => {
  const data = parseHomeDocuments(DEFAULT_HOME_DOCUMENTS);
  assert.equal(data.imageUrl, "/dokumenty-home.png");
  assert.equal(data.headline, "Pomoc również w formalnościach.");
  assert.equal(data.headingScale, 100);
});

test("rejects unsafe image URLs and invalid presentation settings", () => {
  assert.throws(() => parseHomeDocuments({ ...DEFAULT_HOME_DOCUMENTS, imageUrl: "https://evil.example/a.png" }), HomeDocumentsValidationError);
  assert.throws(() => parseHomeDocuments({ ...DEFAULT_HOME_DOCUMENTS, imageUrl: "/../secrets.png" }), HomeDocumentsValidationError);
  assert.throws(() => parseHomeDocuments({ ...DEFAULT_HOME_DOCUMENTS, overlayOpacity: 90 }), HomeDocumentsValidationError);
  assert.throws(() => parseHomeDocuments({ ...DEFAULT_HOME_DOCUMENTS, headingScale: 0 }), HomeDocumentsValidationError);
  assert.throws(() => parseHomeDocuments({ ...DEFAULT_HOME_DOCUMENTS, unknown: true }), HomeDocumentsValidationError);
});

// The homepage must not become a second document download library.
test("homepage Documents section is informational and links to the documents page", () => {
  const source = readFileSync(new URL("../../src/components/home-documents/home-documents-section.tsx", import.meta.url), "utf8");
  assert.match(source, /href="\/dokumenty"/);
  assert.doesNotMatch(source, /publishedDocuments\(|<ul\b|<li\b/);
  assert.doesNotMatch(source, /Ważne dokumenty|DO POBRANIA/);
  assert.match(source, /aria-labelledby="home-documents-title"/);
});
