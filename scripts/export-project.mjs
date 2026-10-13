/**
 * npm run export
 * Creates PROJECT_EXPORT.md in the project root: a single readable dump of source
 * and important project configuration. No dependencies, works on Windows/macOS/Linux.
 * Not to be confused with Next.js static-site export.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const root = process.cwd();
const outputName = "PROJECT_EXPORT.md";
const sourceFolders = ["src", "app", "pages", "components", "lib", "hooks", "types", "styles", "scripts", "public"];
const rootFiles = [
  "package.json", "next.config.js", "next.config.mjs", "next.config.ts", "next.config.cjs",
  "tsconfig.json", "postcss.config.js", "postcss.config.mjs", "postcss.config.cjs",
  "eslint.config.js", "eslint.config.mjs", "eslint.config.cjs", "eslint.config.ts",
  "tailwind.config.js", "tailwind.config.ts", "components.json", "README.md",
  "firebase.json", "firestore.rules", "firestore.indexes.json", "storage.rules", ".gitignore",
];
const validExtensions = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css", ".scss",
  ".md", ".mdx", ".txt", ".html", ".svg", ".sh", ".yml", ".yaml", ".graphql", ".gql",
]);
const ignoredFolders = new Set([
  ".git", ".next", "node_modules", ".vercel", "coverage", "dist", "build", "out",
  "tmp", "temp", ".turbo", ".cache", "playwright-report", "test-results", "exports", "__pycache__",
]);
const ignoredNames = new Set([
  outputName.toLowerCase(), "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "bun.lockb", ".ds_store",
]);
const maxFileSizeBytes = 200 * 1024;
const skipped = [];
const accepted = [];

// The tree additionally lists asset filenames (not their binary contents).
const treeAssetExtensions = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".ico",
  ".pdf", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm",
]);
const treeRootExtras = new Set([
  "next-env.d.ts", "middleware.ts", "proxy.ts", "instrumentation.ts",
  "vercel.json", "vitest.config.ts", "jest.config.ts", "jest.config.js",
  "playwright.config.ts", ".prettierrc.json", "LICENSE",
]);

const looksSensitive = (name) => {
  const lowered = name.toLowerCase();
  return lowered === ".env" || lowered.startsWith(".env.") || lowered.endsWith(".pem") ||
    lowered.endsWith(".p12") || lowered.endsWith(".pfx") || lowered.endsWith(".key") ||
    lowered.includes("service-account") || lowered.includes("service_account") ||
    lowered.includes("firebase-adminsdk") || lowered.includes("credential") ||
    lowered.includes("private-key") || lowered.includes("private_key") ||
    lowered.includes("secret") || lowered.includes("token.json");
};

async function walk(dir) {
  let items;
  try { items = await readdir(dir, { withFileTypes: true }); }
  catch { return; }
  items.sort((a, b) => a.name.localeCompare(b.name));
  for (const item of items) {
    const fullPath = join(dir, item.name);
    const rel = relative(root, fullPath).split(sep).join("/");
    if (item.isSymbolicLink()) continue;
    if (item.isDirectory()) {
      if (!ignoredFolders.has(item.name) && !looksSensitive(item.name)) await walk(fullPath);
      continue;
    }
    if (!item.isFile() || ignoredNames.has(item.name.toLowerCase()) || looksSensitive(item.name)) continue;
    if (!validExtensions.has(extname(item.name).toLowerCase())) continue;
    if (rel.startsWith("public/") && extname(item.name).toLowerCase() !== ".svg") continue;
    const bytes = await readFile(fullPath);
    if (bytes.length > maxFileSizeBytes) { skipped.push(`${rel} (plik ponad 200 KB)`); continue; }
    if (bytes.includes(0)) { skipped.push(`${rel} (plik binarny)`); continue; }
    accepted.push({ path: rel, contents: bytes.toString("utf8") });
  }
}

/** Build a compact, useful tree without exposing secret files, generated artifacts,
 * or dependency directories. Binary media is listed by filename only. */
function showTreeFile(filename) {
  const lower = filename.toLowerCase();
  if (ignoredNames.has(lower) || looksSensitive(filename)) return false;
  const extension = extname(filename).toLowerCase();
  return validExtensions.has(extension) || treeAssetExtensions.has(extension) ||
    filename === ".gitignore" || filename === "LICENSE" || filename === "next-env.d.ts";
}

async function directoryTree(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return []; }
  const nodes = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink() || looksSensitive(entry.name)) continue;
    if (entry.isDirectory()) {
      if (ignoredFolders.has(entry.name)) continue;
      const children = await directoryTree(join(dir, entry.name));
      if (children.length) nodes.push({ name: entry.name, directory: true, children });
    } else if (entry.isFile() && showTreeFile(entry.name)) {
      nodes.push({ name: entry.name, directory: false });
    }
  }
  return sortTreeNodes(nodes);
}

function sortTreeNodes(nodes) {
  return nodes.sort((a, b) =>
    Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name, "pl"));
}

async function projectTree() {
  let entries;
  try { entries = await readdir(root, { withFileTypes: true }); }
  catch { return []; }
  const allowedDirs = new Set(sourceFolders);
  const allowedFiles = new Set([...rootFiles, ...treeRootExtras]);
  const nodes = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink() || looksSensitive(entry.name)) continue;
    if (entry.isDirectory() && allowedDirs.has(entry.name)) {
      const children = await directoryTree(join(root, entry.name));
      nodes.push({ name: entry.name, directory: true, children });
    } else if (entry.isFile() && allowedFiles.has(entry.name) && showTreeFile(entry.name)) {
      nodes.push({ name: entry.name, directory: false });
    }
  }
  return sortTreeNodes(nodes);
}

function drawTree(nodes, prefix = "") {
  const result = [];
  nodes.forEach((node, index) => {
    const last = index === nodes.length - 1;
    result.push(`${prefix}${last ? "└── " : "├── "}${node.name}${node.directory ? "/" : ""}`);
    if (node.directory) result.push(...drawTree(node.children, prefix + (last ? "    " : "│   ")));
  });
  return result;
}

function countTreeFiles(nodes) {
  return nodes.reduce((sum, node) => sum + (node.directory ? countTreeFiles(node.children) : 1), 0);
}

for (const f of rootFiles) {
  try {
    const bytes = await readFile(join(root, f));
    if (bytes.length <= maxFileSizeBytes) accepted.push({ path: f, contents: bytes.toString("utf8") });
  } catch { /* optional config file */ }
}
for (const folder of sourceFolders) await walk(resolve(root, folder));

accepted.sort((a, b) => a.path.localeCompare(b.path));
const tree = await projectTree();
const treeLines = [`${root.split(sep).filter(Boolean).at(-1) || "projekt"}/`, ...drawTree(tree)];
const fenceLanguage = (path) => ({
  ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx", mjs: "javascript", cjs: "javascript",
  json: "json", md: "markdown", mdx: "mdx", css: "css", scss: "scss", sh: "bash",
  html: "html", svg: "xml", yml: "yaml", yaml: "yaml",
})[extname(path).slice(1)] ?? "text";
const lines = [
  "# Eksport kodu projektu", "",
  `Wygenerowano: ${new Date().toISOString()}`,
  `Liczba plików: ${accepted.length}`,
  "",
  "To tekstowy zrzut plików źródłowych i konfiguracji do analizy lub udostępnienia.",
  "Pominięto node_modules, .next, .git, buildy, pliki binarne, lockfile i znane pliki z sekretami.",
  "**Uwaga:** przed udostępnieniem sprawdź, czy w kodzie nie ma przypadkowo wpisanych haseł lub kluczy prywatnych.",
  "",
  "## Drzewo projektu",
  "",
  `Pliki widoczne w drzewie: ${countTreeFiles(tree)}. Drzewo pokazuje również nazwy grafik, fontów i PDF-ów, ale nie ich zawartość.`,
  "",
  "```text",
  ...treeLines,
  "```",
  "",
  "## Zawartość plików",
  "",
];
for (const file of accepted) {
  const maxBackticks = Math.max(0, ...Array.from(file.contents.matchAll(/`+/g), (m) => m[0].length));
  const fence = "`".repeat(Math.max(5, maxBackticks + 1));
  lines.push(`## ${file.path}`, "", `${fence}${fenceLanguage(file.path)}`, file.contents.replace(/\s+$/, ""), fence, "");
}
if (skipped.length) lines.push("## Pominięte z powodu rozmiaru lub formatu", "", ...skipped.map((p) => `- ${p}`), "");
await writeFile(join(root, outputName), lines.join("\n"), "utf8");
const totalBytes = Buffer.byteLength(lines.join("\n"), "utf8");
console.log(`✓ Zapisano ${outputName} (${accepted.length} plików, ${(totalBytes / 1024).toFixed(1)} KB)`);
