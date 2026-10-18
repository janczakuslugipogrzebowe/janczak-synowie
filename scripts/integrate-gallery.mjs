import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Idempotent integration with the existing site. Refuse to write anything
// unless EVERY required anchor matches, keeping previously fixed waves intact.
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const modified = new Map();
function edit(relative, transform) {
  const file = join(root, relative);
  if (!existsSync(file)) throw new Error(`Brak pliku projektu: ${relative}`);
  const before = readFileSync(file, "utf8");
  const after = transform(before);
  if (typeof after !== "string") throw new Error(`Nie udało się zintegrować: ${relative}`);
  if (after !== before) modified.set(file, after);
}
function change(before, after, label) {
  if (before === after)
    throw new Error(`Brak oczekiwanego fragmentu: ${label}. Sprawdź zgodność aktualnej wersji.`);
  return after;
}

edit("src/app/(site)/page.tsx", (source) => {
  if (source.includes("HomeGallerySection") && source.includes("galleryPhotos")) return source;
  let next = [
    'import HomeGallerySection from "@/components/home-gallery/home-gallery-section";',
    'import { getPublishedHomeGallery } from "@/lib/home-gallery/data";',
    'import { getPublishedGalleryPhotos } from "@/lib/gallery/data";',
    source,
  ].join("\n");
  const current = next;
  next = next.replace(
    /(export\s+default\s+async\s+function\s+Home\s*\(\s*\)\s*\{)/,
    "$1\n  const galleryPromise = Promise.all([getPublishedHomeGallery(), getPublishedGalleryPhotos()]);",
  );
  change(current, next, "funkcja Home");
  const withPromise = next;
  next = next.replace(
    /(\n[ \t]*)return\s*\(/,
    "$1const [gallerySettings, galleryPhotos] = await galleryPromise;\n$1return (",
  );
  change(withPromise, next, "return Home");
  const last = next;
  next = next.replace(
    /(<HomeDocumentsSection\b[^>]*\/>)/m,
    "$1\n      <HomeGallerySection data={gallerySettings} photos={galleryPhotos} joinsDocuments />",
  );
  change(last, next, "sekcja Dokumenty");
  return next;
});

edit("src/components/admin/admin-shell.tsx", (source) => {
  let next = source;
  if (!next.includes('href:"/admin/gallery"') && !next.includes('href: "/admin/gallery"')) {
    const anchor = /\{\s*href\s*:\s*["']\/admin\/(?:documents|obituaries)["'][^{}]*\}/m;
    const updated = next.replace(
      anchor,
      (match) => `${match},\n  {href:"/admin/gallery",label:"Galeria",Icon:TbPhoto}`,
    );
    next = change(next, updated, "narzędzie galeria sidebar");
  }
  if (!next.includes("/admin/site/home/gallery")) {
    const anchor = /\{\s*id\s*:\s*["'](?:documents|obituaries)["'][^{}]*\}/m;
    const updated = next.replace(
      anchor,
      (match) => `${match},\n    {id:"gallery",label:"Galeria",href:"/admin/site/home/gallery",Icon:TbPhoto}`,
    );
    next = change(next, updated, "edycja Galerii w sidebarze");
  }
  return next;
});

edit("src/app/(admin)/admin/(protected)/site/page.tsx", (source) => {
  if (source.includes("Kwiaciarnia · Nekrologi · Dokumenty · Galeria")) return source;
  return source.replace(/(Kwiaciarnia\s*·\s*Nekrologi\s*·\s*Dokumenty)(?!\s*·\s*Galeria)/, "$1 · Galeria");
});

edit("package.json", (source) => {
  const json = JSON.parse(source);
  if (!json.scripts) throw new Error("Brak sekcji scripts w package.json");
  json.scripts["test:gallery"] =
    "node --experimental-strip-types --test scripts/tests/gallery-schema.test.mjs";
  json.scripts["test:home-gallery"] =
    "node --experimental-strip-types --test scripts/tests/home-gallery-schema.test.mjs";
  return `${JSON.stringify(json, null, 2)}\n`;
});

for (const [file, data] of modified) writeFileSync(file, data, "utf8");
console.log(`✓ Galeria zintegrowana; zmieniono ${modified.size} plików. Uruchom npm run test.`);
