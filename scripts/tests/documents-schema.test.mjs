import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_DOCUMENTS,
  DocumentsValidationError,
  parseDocumentLibrary,
  publishedDocuments,
  safeDocumentHref,
} from "../../src/lib/documents/schema.ts";

test("four uploaded PDF files have local downloadable paths", () => {
  const list = parseDocumentLibrary(DEFAULT_DOCUMENTS);
  assert.equal(list.length, 4);
  assert.equal(publishedDocuments(list).length, 4);
  for (const item of list) {
    assert.equal(item.published, true);
    assert.match(item.href, /^\/wniosek-o-wyplate-zasilku-pogrzebowego-z-(zus|krus|wbe|mswia)\.pdf$/);
    assert.equal(safeDocumentHref(item.href), true);
  }
});

test("rejects unsafe protocols, script paths, and non-official remote hosts", () => {
  for (const href of [
    "javascript:alert(1)",
    "//example.com/x.pdf",
    "/../../secret.pdf",
    "/a.pdf?x=1",
    "https://evil.example.com/form.pdf",
    "https://gov.pl.evil.example.com/file.pdf",
    "http://zus.pl/z12.pdf",
    "https://zus.pl/private.doc",
    "https://user:pass@zus.pl/a.pdf",
  ]) {
    assert.equal(safeDocumentHref(href), false, href);
  }
  assert.equal(safeDocumentHref("https://www.gov.pl/example.pdf"), true);
});

test("disallows duplicate identifiers, unknown fields and invalid statuses", () => {
  assert.throws(
    () => parseDocumentLibrary([...DEFAULT_DOCUMENTS, DEFAULT_DOCUMENTS[0]]),
    DocumentsValidationError,
  );
  assert.throws(
    () => parseDocumentLibrary([{ ...DEFAULT_DOCUMENTS[0], unknown: true }]),
    DocumentsValidationError,
  );
  assert.throws(
    () => parseDocumentLibrary([{ ...DEFAULT_DOCUMENTS[0], published: "yes" }]),
    DocumentsValidationError,
  );
  assert.throws(
    () => parseDocumentLibrary([{ ...DEFAULT_DOCUMENTS[0], title: "" }]),
    DocumentsValidationError,
  );
});

test("allows an empty library and unpublished document records", () => {
  assert.deepEqual(parseDocumentLibrary([]), []);
  assert.equal(
    publishedDocuments(parseDocumentLibrary([{ ...DEFAULT_DOCUMENTS[0], published: false }])).length,
    0,
  );
});
