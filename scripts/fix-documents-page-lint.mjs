import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const file = resolve("src/app/(site)/dokumenty/page.tsx");
let source;
try {
  source = await readFile(file, "utf8");
} catch {
  console.error("Nie znalazłem strony dokumentów. Uruchom skrypt z katalogu głównego projektu.");
  process.exitCode = 1;
}

if (source !== undefined) {
  const original = source;
  const introImport = /^\s*import\s+SubpageIntro\s+from\s+["']@\/components\/subpage-intro["'];?\s*\r?\n/m;
  const dataImport =
    /^\s*import\s*\{\s*getPublishedPage\s*\}\s*from\s*["']@\/lib\/pages\/data["'];?\s*\r?\n/m;
  const unusedIntro = !/<SubpageIntro\b/.test(source);
  const unusedContent = !/\bcontent\b/.test(
    source.replace(
      /const\s*\[\s*content\s*,\s*library\s*\]\s*=\s*await\s+Promise\.all\s*\([\s\S]*?\)\s*;/,
      "",
    ),
  );

  if (unusedIntro) source = source.replace(introImport, "");
  if (unusedContent) {
    const declaration =
      /const\s*\[\s*content\s*,\s*library\s*\]\s*=\s*await\s+Promise\.all\s*\(\s*\[\s*getPublishedPage\s*\(\s*["']dokumenty["']\s*\)\s*,\s*getPublishedDocumentsLibrary\s*\(\s*\)\s*,?\s*\]\s*\)\s*;/m;
    if (declaration.test(source)) {
      source = source.replace(declaration, "const library = await getPublishedDocumentsLibrary();");
      source = source.replace(dataImport, "");
    } else if (/\bgetPublishedPage\b/.test(source)) {
      console.error("Nieznana wersja pobierania danych /dokumenty — nic nie zmieniam. Podeślij ten plik.");
      process.exitCode = 1;
      source = original;
    }
  }

  if (source !== original) {
    await writeFile(file, source, "utf8");
    console.log("OK: usunięto nieużywane elementy ze strony /dokumenty, bez zmiany wyglądu.");
  } else if (process.exitCode !== 1) {
    console.log("OK: strona /dokumenty nie wymaga zmian.");
  }
}
