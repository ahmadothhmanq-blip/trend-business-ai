/**
 * Scaffold flagship from source with package id + CSS prefix transform.
 * Usage: node scripts/scaffold-prefix-flagship.mjs <target-id> <source-id> <to-prefix> <from-prefix>
 */
import { cp, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const websiteRoot = path.join(root, "templates", "website");

function toPascal(id) {
  return id.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const targetId = process.argv[2];
const sourceId = process.argv[3];
const toPrefix = process.argv[4];
const fromPrefix = process.argv[5];
if (!targetId || !sourceId || !toPrefix || !fromPrefix) {
  console.error(
    "Usage: node scripts/scaffold-prefix-flagship.mjs <target-id> <source-id> <to-prefix> <from-prefix>",
  );
  process.exit(1);
}

const srcDir = path.join(websiteRoot, sourceId);
const destDir = path.join(websiteRoot, targetId);
const sourcePascal = toPascal(sourceId);
const targetPascal = toPascal(targetId);

await rm(destDir, { recursive: true, force: true });
await cp(srcDir, destDir, { recursive: true });

let files = await walk(destDir);
for (let file of files) {
  let rel = path.relative(destDir, file).replaceAll("\\", "/");
  const newRel = rel.replaceAll(sourceId, targetId);
  if (newRel !== rel) {
    const newPath = path.join(destDir, newRel);
    await mkdir(path.dirname(newPath), { recursive: true });
    await rename(file, newPath);
    file = newPath;
  }
  if (!/\.(tsx?|json|md|css)$/.test(file)) continue;
  let content = await readFile(file, "utf8");
  content = content
    .replaceAll(sourceId, targetId)
    .replaceAll(sourcePascal, targetPascal)
    .replaceAll(fromPrefix, toPrefix);
  await writeFile(file, content);
}

console.log(`✓ scaffolded ${targetId} from ${sourceId} (${fromPrefix} → ${toPrefix})`);
