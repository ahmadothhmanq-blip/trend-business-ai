/**
 * Scaffold a new flagship V2 package from an existing V2 template.
 * Usage: node scripts/scaffold-flagship-from-source.mjs <target-id> <source-id> [--keep-prefix]
 */
import { cp, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const websiteRoot = path.join(root, "templates", "website");

function toPascal(id) {
  return id
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function derivePrefix(id) {
  const parts = id
    .split("-")
    .filter(
      (p) =>
        !["premium", "prestige", "enterprise", "business", "portfolio", "agency", "resort"].includes(p),
    );
  if (parts.length >= 2) return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}-`;
  return `${parts[0]?.slice(0, 2) ?? "fg"}-`;
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

async function main() {
  const keepPrefix = process.argv.includes("--keep-prefix");
  const args = process.argv.filter((a) => !a.startsWith("--"));
  const targetId = args[2];
  const sourceId = args[3];
  if (!targetId || !sourceId) {
    console.error(
      "Usage: node scripts/scaffold-flagship-from-source.mjs <target-id> <source-id> [--keep-prefix]",
    );
    process.exit(1);
  }

  const srcDir = path.join(websiteRoot, sourceId);
  const destDir = path.join(websiteRoot, targetId);
  const sourcePascal = toPascal(sourceId);
  const targetPascal = toPascal(targetId);
  const fromPrefix = derivePrefix(sourceId);
  const toPrefix = derivePrefix(targetId);

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

    if (!/\.(tsx?|json|md)$/.test(file)) continue;
    let content = await readFile(file, "utf8");
    content = content
      .replaceAll(sourceId, targetId)
      .replaceAll(sourcePascal, targetPascal);
    if (!keepPrefix && fromPrefix !== toPrefix) {
      content = content.replaceAll(fromPrefix, toPrefix);
    }
    await writeFile(file, content);
  }

  console.log(`✓ scaffolded ${targetId} from ${sourceId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
