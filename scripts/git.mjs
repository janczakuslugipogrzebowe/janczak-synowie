import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import process from "node:process";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function git(args, { capture = false, allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) throw new Error(`Nie udało się uruchomić Git: ${result.error.message}`);
  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      capture
        ? result.stderr?.trim() || `Git zakończył się kodem ${result.status}.`
        : `Polecenie git ${args[0]} nie powiodło się (kod ${result.status}).`,
    );
  }
  return result;
}

function verifyProject() {
  const repo = git(["rev-parse", "--show-toplevel"], { capture: true }).stdout.trim();
  const normal = (path) => resolve(path).replaceAll("\\", "/").toLowerCase();
  if (normal(repo) !== normal(projectRoot)) {
    throw new Error("Skrypt należy uruchomić w głównym repozytorium projektu.");
  }

  const branch = git(["branch", "--show-current"], { capture: true }).stdout.trim();
  if (branch !== "main") {
    throw new Error(`Aktualna gałąź to „${branch || "(brak)"}”. Przełącz się na main przed publikacją.`);
  }

  git(["remote", "get-url", "origin"], { capture: true });
}

function checkForSecrets() {
  const staged = git(["diff", "--cached", "--name-only", "-z"], { capture: true })
    .stdout.split("\0")
    .filter(Boolean);

  const unsafe = staged.filter((file) => {
    const name = file.replaceAll("\\", "/").split("/").at(-1) ?? "";
    return (
      (/^\.env(?:\..*)?$/i.test(name) && !/^\.env\.(example|sample)$/i.test(name)) ||
      /firebase-adminsdk.*\.json$/i.test(name) ||
      /service[-_]account.*\.json$/i.test(name) ||
      /\.(pem|p12|pfx|key)$/i.test(name)
    );
  });

  if (unsafe.length > 0) {
    throw new Error(
      `Wstrzymano commit: wykryto potencjalne sekrety w Git:\n${unsafe.join("\n")}\nUsuń je z indeksu przed ponowną próbą.`,
    );
  }
}

async function main() {
  verifyProject();

  let version = process.argv[2]?.trim();
  if (!version) {
    if (!process.stdin.isTTY) {
      throw new Error("Brak interaktywnego terminala. Użyj np. npm run git -- 0.06.");
    }
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    try {
      version = (await prompt.question("Podaj numer wersji (np. 0.06): ")).trim();
    } finally {
      prompt.close();
    }
  }

  version = version.replace(/^v\.\s*/i, "");
  if (!/^\d+(?:\.\d+){1,3}$/.test(version)) {
    throw new Error("Nieprawidłowa wersja. Wpisz np. 0.06, 1.1 albo 1.1.2.");
  }

  console.log("\n→ git add -A");
  git(["add", "-A"]);
  checkForSecrets();

  const changes = git(["diff", "--cached", "--quiet"], { allowFailure: true });
  if (changes.status === 1) {
    console.log(`\n→ git commit -m "v. ${version}"`);
    git(["commit", "-m", `v. ${version}`]);
  } else if (changes.status === 0) {
    console.log("\nBrak nowych zmian do commitowania. Sprawdzam, czy jest coś do wysłania.");
  } else {
    throw new Error("Nie udało się sprawdzić przygotowanych zmian Git.");
  }

  console.log("\n→ git push -u origin main");
  git(["push", "-u", "origin", "main"]);
  console.log("\nGotowe — zmiany zostały wysłane do origin/main.");
}

main().catch((error) => {
  console.error(`\nBłąd: ${error.message}`);
  process.exitCode = 1;
});
