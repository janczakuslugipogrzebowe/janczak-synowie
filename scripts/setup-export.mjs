/** Run once: node scripts/setup-export.mjs */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const packagePath = join(process.cwd(), "package.json");
let pkg;
try { pkg = JSON.parse(await readFile(packagePath, "utf8")); }
catch { console.error("Nie znaleziono poprawnego package.json. Uruchom skrypt w katalogu głównym projektu."); process.exit(1); }
pkg.scripts = { ...pkg.scripts, export: "node scripts/export-project.mjs" };
await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

const gitignorePath = join(process.cwd(), ".gitignore");
try {
  const current = await readFile(gitignorePath, "utf8");
  if (!current.split(/\r?\n/).some((line) => line.trim() === "/PROJECT_EXPORT.md")) {
    await writeFile(gitignorePath, `${current.trimEnd()}\n\n# Local readable code export\n/PROJECT_EXPORT.md\n`, "utf8");
  }
} catch { await writeFile(gitignorePath, "# Local readable code export\n/PROJECT_EXPORT.md\n", "utf8"); }
console.log("✓ Dodano do package.json: npm run export");
console.log("✓ PROJECT_EXPORT.md dodano do .gitignore");
