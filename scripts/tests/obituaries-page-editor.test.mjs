import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_OBITUARIES_LISTING,
  DEFAULT_OBITUARIES_INFORMATION,
  parseObituariesListing,
  parseObituariesInformation,
  isObituariesPageSection,
} from "../../src/lib/obituaries-page/schema.ts";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("CMS schema validates independent Nekrologi sections and editable copy", () => {
  assert.equal(isObituariesPageSection("listing"), true);
  assert.equal(isObituariesPageSection("information"), true);
  assert.equal(isObituariesPageSection("obsolete"), false);
  assert.deepEqual(parseObituariesListing(DEFAULT_OBITUARIES_LISTING), DEFAULT_OBITUARIES_LISTING);
  assert.deepEqual(
    parseObituariesInformation(DEFAULT_OBITUARIES_INFORMATION),
    DEFAULT_OBITUARIES_INFORMATION,
  );
  assert.equal(
    parseObituariesInformation({ ...DEFAULT_OBITUARIES_INFORMATION, description: "" }).description,
    "",
  );
  assert.throws(() => parseObituariesListing({ ...DEFAULT_OBITUARIES_LISTING, title: "" }));
  assert.throws(() => parseObituariesListing({ ...DEFAULT_OBITUARIES_LISTING, headingScale: Number.NaN }));
  assert.throws(() => parseObituariesInformation({ ...DEFAULT_OBITUARIES_INFORMATION, unknown: "x" }));
  assert.throws(() => parseObituariesInformation({ ...DEFAULT_OBITUARIES_INFORMATION, ceremonyTitle: "" }));
});

test("published Nekrologi page reads four independent sections from the appropriate stores", () => {
  const page = read("src/app/(site)/nekrologi/page.tsx");
  const list = read("src/components/obituaries/obituaries-list-section.tsx");
  const information = read("src/components/obituaries/obituaries-information-section.tsx");
  const data = read("src/lib/obituaries-page/data.ts");
  for (const section of ["listing", "information"])
    assert.match(page, new RegExp(`getPublishedObituariesPageSection\\("${section}"\\)`));
  assert.match(page, /getPublishedSubpageBlock\("nekrologi", "hero"\)/);
  assert.match(page, /getPublishedSubpageBlock\("nekrologi", "bottom"\)/);
  assert.match(page, /<ObituariesListSection searchParams=\{searchParams\} data=\{listing\}/);
  assert.match(page, /<ObituariesInformationSection data=\{information\}/);
  assert.match(list, /<ObituariesListFrame data=\{data\}>/);
  for (const prop of [
    "ceremonyTitle",
    "ceremonyDescription",
    "burialTitle",
    "burialDescription",
    "description",
  ])
    assert.ok(information.includes(`data.${prop}`));
  assert.match(data, /"use cache"/);
  assert.match(data, /cmsPublished/);
  assert.match(data, /cmsDrafts/);
  assert.match(data, /if \(publish\) batch\.set/);
});

test("admin navigation uses four real section editors instead of legacy introduction", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  const landing = read("src/app/(admin)/admin/(protected)/site/page.tsx");
  const redirect = read("src/app/(admin)/admin/(protected)/site/nekrologi/page.tsx");
  const router = read("src/app/(admin)/admin/(protected)/site/nekrologi/[section]/page.tsx");
  for (const section of ["hero", "listing", "information", "bottom"]) {
    assert.match(shell, new RegExp(`\\["${section}",`));
    assert.match(router, new RegExp(`case "${section}":`));
  }
  assert.match(shell, /admin\/site\/nekrologi\/\$\{section\}/);
  assert.match(landing, /slug === "nekrologi"/);
  assert.match(redirect, /redirect\("\/admin\/site\/nekrologi\/hero"\)/);
  assert.match(router, /ObituariesInformationEditor/);
});

test("CMS is secured, uses same-origin writes and invalidates public cache only on publish", () => {
  const route = read("src/app/api/admin/obituaries-page/[section]/route.ts");
  assert.match(route, /isSameOrigin\(request\)/);
  assert.match(route, /getAdminUid\(\)/);
  assert.match(route, /parseObituariesListing\(value\)/);
  assert.match(route, /parseObituariesInformation\(value\)/);
  assert.match(route, /if \(publish\) \{/);
  assert.match(route, /revalidateTag\(`janczak-obituaries-page-\$\{section\}`/);
  assert.match(route, /revalidatePath\("\/nekrologi"\)/);
  assert.match(route, /Cache-Control.*private, no-store/);
});

test("live preview uses actual published obituaries; editor retains drafts and shared reusable components", () => {
  const preview = read("src/components/obituaries/obituaries-list-preview.tsx");
  const editor = read("src/components/admin/obituaries-page-editor.tsx");
  assert.match(preview, /api\/admin\/obituaries\?status=published/);
  assert.match(preview, /<ObituaryCard key=\{item.id\} data=\{item\} preview compact/);
  assert.doesNotMatch(preview, /Helena Szymańska|Jan Kowalski/);
  assert.match(editor, /useCmsEditor\s*\(\s*`\/api\/admin\/subpages\/nekrologi\/\$\{section\}`/);
  assert.match(editor, /SubpageHero data=\{ed.draft\} preview/);
  assert.match(editor, /SubpageBottomCta data=\{ed.draft\}/);
  assert.match(editor, /ObituariesInformationSection data=\{ed.draft\} preview/);
  assert.match(editor, /ed.save\(false\)|ed.save\(publish\)/);
  assert.match(editor, /\/admin\/obituaries/);
  assert.match(editor, /section === "bottom" && \(/);
});

test("admin sidebar waits until hydration before rendering pathname-dependent links", () => {
  const shell = read("src/components/admin/admin-shell.tsx");
  assert.match(shell, /useSyncExternalStore\(subscribeHydration, getClientHydration, getServerHydration\)/);
  assert.match(shell, /const getServerHydration = \(\) => false/);
  assert.match(shell, /const getClientHydration = \(\) => true/);
  assert.match(shell, /const stablePathname = hydrated \? pathname : ""/);
  assert.match(shell, /<SiteTree key=\{stablePathname\} pathname=\{stablePathname\}/);
  const adminShell = shell.slice(shell.indexOf("export default function AdminShell("));
  assert.doesNotMatch(adminShell, /aria-current=\{pathname|key=\{pathname\}|pathname=\{pathname\}/);
});
