import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("Nekrologi reuse the same hero and closing CTA as Galeria and Dokumenty", () => {
  const page = source("src/app/(site)/nekrologi/page.tsx");
  assert.match(page, /<main id="main"/);
  for (const component of ["SubpageHero", "ObituariesListSection", "ObituariesInformationSection", "SubpageBottomCta"])
    assert.match(page, new RegExp(`<${component}\\b`));
  assert.match(page, /getPublishedSubpageBlock\("nekrologi", "hero"\)/);
  assert.match(page, /getPublishedSubpageBlock\("nekrologi", "bottom"\)/);
  assert.match(page, /getPublishedSiteSettings/);
});

test("Nekrologi have independent default imagery, without modifying Galeria/Dokumenty", () => {
  const schema = source("src/lib/subpages/schema.ts");
  assert.match(schema, /imageUrl: "\/hero-nekrologi.png"/);
  assert.match(schema, /imageUrl: "\/bottom-nekrologi.png"/);
  assert.match(schema, /if \(slug === "galeria"\) return galleryDefaults\[section\]/);
  assert.match(schema, /if \(slug === "dokumenty"/);
});

test("Nekrologi use current public CMS records, filtering and safe feed pagination", () => {
  const list = source("src/components/obituaries/obituaries-list-section.tsx");
  assert.match(list, /getPublicObituaries\(search, cursor, 12\)/);
  assert.match(list, /type="search"/);
  assert.match(list, /name="q"/);
  assert.match(list, /role="search"/);
  assert.match(list, /<ObituaryCard data=\{item\}/);
  assert.match(list, /nextCursor/);
  assert.match(list, /Następne nekrologi/);
  assert.match(list, /Nie znaleziono pasujących nekrologów/);
  assert.match(list, /Obecnie nie ma opublikowanych nekrologów/);
  assert.ok(!list.includes('data-gallery-'), "Do not couple obituary listing to gallery module");
});

test("Single obituary retains canonical redirect, SEO privacy settings, breadcrumb and shared CTA", () => {
  const page = source("src/app/(site)/nekrologi/[slug]/page.tsx");
  assert.match(page, /getPublicObituary\(slug\)/);
  assert.match(page, /permanentRedirect/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /ob\.seoIndex/);
  assert.match(page, /aria-label="Okruszki"/);
  assert.match(page, /<ObituaryDetails entry=\{ob\}/);
  assert.match(page, /<SubpageBottomCta data=\{bottom\} settings=\{settings\}/);
  const details = source("src/components/obituaries/obituary-details.tsx");
  assert.match(details, /entry\.ceremonyDate/);
  assert.match(details, /entry\.burialPlace/);
});

test("Shared hero has only breadcrumb without redundant golden eyebrow", () => {
  const hero = source("src/components/subpages/subpage-hero.tsx");
  assert.match(hero, /aria-label="Okruszki"/);
  assert.equal((hero.match(/aria-current="page"/g) ?? []).length, 1);
  assert.ok(!hero.includes("data.eyebrow"));
});

test("Nekrologi use concise copy without redundant instructional text and overlapping rules", () => {
  const listing = source("src/components/obituaries/obituaries-list-section.tsx");
  const info = source("src/components/obituaries/obituaries-information-section.tsx");
  assert.doesNotMatch(listing, /W tym miejscu publikujemy nekrologi|prosimy skorzystać z wyszukiwarki/);
  assert.doesNotMatch(info, /Aby zapoznać się ze szczegółami|z powyższej listy/);
  assert.doesNotMatch(info, /absolute -top-px|relative border-y|border-y border-\[#dfd6c5\]/);
  assert.equal((info.match(/border-t/g) ?? []).length, 1, "Keep just one separator between information items");
});

test("Published obituaries offer accessible, opt-in Facebook and native sharing without touching CMS previews", () => {
  const details = source("src/components/obituaries/obituary-details.tsx");
  const share = source("src/components/obituaries/obituary-share.tsx");
  assert.match(details, /!preview && "slug" in entry/);
  assert.match(details, /<ObituaryShare slug=\{entry\.slug\}/);
  assert.match(share, /^"use client";/);
  assert.match(share, /facebook\.com\/sharer\/sharer\.php\?u=/);
  assert.match(share, /encodeURIComponent\(url\)/);
  assert.match(share, /navigator\.clipboard\.writeText/);
  assert.match(share, /navigator\.share/);
  assert.match(share, /aria-expanded=\{open\}/);
  assert.match(share, /aria-live="polite"/);
  assert.match(share, /Escape/);
});

test("Per-obituary Open Graph images are server-rendered for published CMS records only", () => {
  const page = source("src/app/(site)/nekrologi/[slug]/page.tsx");
  const image = source("src/app/(site)/nekrologi/[slug]/opengraph-image.tsx");
  assert.match(page, /metadataBase: new URL\(siteUrl\)/);
  assert.match(page, /alternates: \{ canonical: canonicalPath \}/);
  assert.match(page, /robots: \{ index: ob\.seoIndex, follow: ob\.seoIndex \}/);
  assert.match(page, /openGraph:/);
  assert.match(page, /siteName: "Janczak i Synowie/);
  assert.match(image, /new ImageResponse\(/);
  assert.match(image, /width: 1200, height: 630/);
  assert.match(image, /getPublicObituary\(slug\)/);
  assert.match(image, /if \(!obituary\) notFound\(\)/);
  assert.match(image, /obituary\.symbol/);
  assert.match(image, /obituary\.firstName/);
  assert.match(image, /obituary\.lastName/);
});

test("Meta's preview crawlers may fetch obituary URLs while Google and others remain disallowed", () => {
  const robots = source("src/app/robots.ts");
  assert.match(robots, /facebookexternalhit/);
  assert.match(robots, /meta-externalagent/);
  assert.match(robots, /allow: "\/nekrologi\/"/);
  assert.match(robots, /userAgent: "\*", disallow: "\/"/);
});


test("Facebook share URL rejects local/private origins and prefers configured public HTTPS host", () => {
  const helper = source("src/lib/obituaries/share-url.ts");
  assert.match(helper, /url\.protocol !== "https:"/);
  assert.match(helper, /host === "localhost"/);
  assert.match(helper, /192\\\.168/);
  assert.match(helper, /publicOrigin\(configuredSiteUrl\) \?\? publicOrigin\(origin\)/);
  assert.match(helper, /encodeURIComponent\(slug\)/);
  const share = source("src/components/obituaries/obituary-share.tsx");
  assert.match(share, /resolveObituaryShareUrl\(slug, window\.location\.origin, process\.env\.NEXT_PUBLIC_SITE_URL\)/);
  assert.match(share, /Facebook wymaga publicznego adresu HTTPS/);
});

test("Share button and back link have the same ghost action style in a single row", () => {
  const details = source("src/components/obituaries/obituary-details.tsx");
  const share = source("src/components/obituaries/obituary-share.tsx");
  assert.match(details, /sm:justify-between/);
  assert.match(details, /className=\{obituaryActionClass\}/);
  assert.match(share, /className=\{obituaryActionClass\}/);
  assert.doesNotMatch(share, /rounded-full border border-\[#bba278\]/);
  assert.match(share, /process\.env\.NEXT_PUBLIC_SITE_URL/);
  assert.match(share, /if \(!url\) return;/);
});
