import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Merge the new CMS section into the CURRENT project without overwriting
// other modules (toasts, formatter, waves, navbar or previously edited sections).
const root = resolve(import.meta.dirname, "..");
const entries = new Map();

function edit(relative, modify) {
  const file = join(root, relative);
  let source = readFileSync(file, "utf8");
  const result = modify(source);
  if (result === source) return;
  if (!result) throw new Error(`Nie udało się zintegrować: ${relative}`);
  entries.set(file, result);
}

function requireChange(updated, before, label) {
  if (updated === before)
    throw new Error(`Nie znaleziono miejsca na zmianę: ${label}. Aktualizuj na bazie najnowszego kodu.`);
  return updated;
}

edit("src/app/(site)/page.tsx", (source) => {
  if (source.includes("HomeDocumentsSection")) return source;
  let next = [
    'import HomeDocumentsSection from "@/components/home-documents/home-documents-section";',
    'import ObituariesDocumentsBoundary from "@/components/home-documents/obituaries-documents-boundary";',
    'import { getPublishedHomeDocuments } from "@/lib/home-documents/data";',
    'import { getPublishedDocumentsLibrary } from "@/lib/documents/data";',
    source,
  ].join("\n");

  // Use a separate Promise.all so existing homepage queries remain untouched.
  next = requireChange(
    next.replace(
      /(export\s+default\s+async\s+function\s+Home\s*\(\s*\)\s*\{)/,
      "$1\n  const documentsPromise = Promise.all([getPublishedHomeDocuments(), getPublishedDocumentsLibrary()]);",
    ),
    next,
    "Home() data",
  );
  next = requireChange(
    next.replace(
      /(\n[ \t]*)return\s*\(/,
      "$1const [homeDocuments, documentsLibrary] = await documentsPromise;\n$1return (",
    ),
    next,
    "Home() render",
  );
  const node = /<HomeObituariesSection\b[^>]*\/>/m;
  next = requireChange(
    next.replace(
      node,
      (match) =>
        `<ObituariesDocumentsBoundary>\n        ${match}\n      </ObituariesDocumentsBoundary>\n      <HomeDocumentsSection data={homeDocuments} documents={documentsLibrary} joinsObituaries />`,
    ),
    next,
    "HomeObituariesSection",
  );
  return next;
});

edit("src/components/admin/admin-shell.tsx", (source) => {
  let next = source;
  if (!next.includes("/admin/documents")) {
    const target = /\{[^{}]*href\s*:\s*["']\/admin\/obituaries["'][^{}]*\}/m;
    next = requireChange(
      next.replace(
        target,
        (match) => `${match},\n  {href:"/admin/documents",label:"Dokumenty",Icon:TbFileText}`,
      ),
      next,
      "admin sidebar biblioteka",
    );
  }
  if (!next.includes("/admin/site/home/documents")) {
    const target = /\{[^{}]*id\s*:\s*["']obituaries["'][^{}]*\}/m;
    next = requireChange(
      next.replace(
        target,
        (match) =>
          `${match},\n    {id:"documents",label:"Dokumenty",href:"/admin/site/home/documents",Icon:TbFileText}`,
      ),
      next,
      "admin sidebar sekcja",
    );
  }
  return next;
});

edit("src/app/(admin)/admin/(protected)/site/page.tsx", (source) => {
  if (source.includes("Kwiaciarnia · Nekrologi · Dokumenty")) return source;
  return source.replace("Kwiaciarnia · Nekrologi", "Kwiaciarnia · Nekrologi · Dokumenty");
});

edit("package.json", (source) => {
  const pkg = JSON.parse(source);
  if (!pkg.scripts) throw new Error("Brak sekcji scripts w package.json.");
  pkg.scripts["test:documents"] =
    "node --experimental-strip-types --test scripts/tests/documents-schema.test.mjs";
  pkg.scripts["test:home-documents"] =
    "node --experimental-strip-types --test scripts/tests/home-documents-schema.test.mjs";
  return JSON.stringify(pkg, null, 2) + "\n";
});

// Perform all modifications only after every required integration point matched.
for (const [path, body] of entries) writeFileSync(path, body, "utf8");
console.log(`✓ Dokumenty zintegrowane. Zmieniono ${entries.size} pliki. Możesz uruchomić npm run test.`);
