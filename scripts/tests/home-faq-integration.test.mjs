import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

test("real homepage attaches FAQ immediately after Gallery with single wave owner", () => {
  const page = read("src/app/(site)/page.tsx");
  const gallery = read("src/components/home-gallery/home-gallery-section.tsx");
  const faq = read("src/components/home-faq/home-faq-section.tsx");
  assert.match(page, /<HomeGallerySection\b[\s\S]*?followedByFaq\s*\/>\s*<HomeFaqSection\b[\s\S]*?joinsGallery\s*\/>/);
  assert.match(gallery, /!followedByFaq\s*&&/);
  assert.match(faq, /TOP_MASK/);
  assert.match(faq, /C310%20102%20420%20129%20720%20134/);
});
test("CMS editor, preview, protected API and navigation are wired", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  const editor = read("src/app/(admin)/admin/(protected)/site/home/faq/page.tsx");
  const route = read("src/app/api/admin/home/faq/route.ts");
  assert.match(shell, /\/admin\/site\/home\/faq/);
  assert.match(editor, /ConfirmDialog/);
  assert.match(editor, /FaqLivePreview/);
  assert.match(editor, /crypto\.randomUUID\(\)/);
  assert.match(route, /getAdminUid/);
  assert.match(route, /isSameOrigin/);
  assert.match(route, /revalidateTag\("janczak-home-faq"/);
});
