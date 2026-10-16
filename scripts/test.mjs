import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import process from "node:process";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8"));
const commands = Object.keys(packageJson.scripts ?? {})
  .filter((name) => name.startsWith("test:"))
  .sort();

if (!commands.length) {
  console.error("Nie znaleziono żadnych skryptów test:* w package.json.");
  process.exit(1);
}

commands.push("lint", "build");
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error("Uruchom kontrolę przez npm run test (brak ścieżki do npm CLI).");
  process.exit(1);
}

for (const [index, command] of commands.entries()) {
  console.log(`\n${"═".repeat(55)}\n[${index + 1}/${commands.length}] npm run ${command}\n${"═".repeat(55)}\n`);

  const result = spawnSync(process.execPath, [npmCli, "run", command], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) {
    console.error(`\nNie można uruchomić ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`\nKontrola zatrzymana: npm run ${command} nie przeszedł. Popraw błąd i uruchom npm run test ponownie.`);
    process.exit(result.status || 1);
  }
}

console.log("\n✓ Wszystkie testy, ESLint i build zakończone poprawnie.");
console.log("Możesz uruchomić serwer: npm run dev");
