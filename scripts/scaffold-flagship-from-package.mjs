/**
 * Clone a V2 flagship package with id/prefix renames.
 * Usage: node scripts/scaffold-flagship-from-package.mjs <sourceId> <targetId> <SourcePascal> <TargetPascal> <cssPrefix>
 */
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.join(__dirname, "..", "templates", "website");

const [sourceId, targetId, sourcePascal, targetPascal, cssPrefix] = process.argv.slice(2);
if (!sourceId || !targetId || !sourcePascal || !targetPascal || !cssPrefix) {
  console.error(
    "Usage: node scripts/scaffold-flagship-from-package.mjs <sourceId> <targetId> <SourcePascal> <TargetPascal> <cssPrefix>",
  );
  process.exit(1);
}

const sourceDir = path.join(websiteRoot, sourceId);
const targetDir = path.join(websiteRoot, targetId);
const oldCssPrefix = sourceId === "corporate-business" ? "cb-" : "se-";

function transform(content, filePath) {
  let out = content;
  out = out.replaceAll(sourceId, targetId);
  out = out.replaceAll(sourcePascal, targetPascal);
  if (/\.(tsx|json|css)$/i.test(filePath)) {
    out = out.replaceAll(oldCssPrefix, `${cssPrefix}-`);
    out = out.replaceAll("SAAS_FLAGSHIP_UI", "AI_AURA_FLAGSHIP_UI");
  }
  return out;
}

async function walkCopy(src, dest, rel = "") {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const relPath = path.join(rel, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await walkCopy(srcPath, destPath, relPath);
    } else if (/\.(tsx?|json|css|svg|md)$/i.test(entry.name)) {
      const raw = await readFile(srcPath, "utf8");
      await writeFile(destPath, transform(raw, relPath), "utf8");
    } else {
      await cp(srcPath, destPath);
    }
  }
}

await walkCopy(sourceDir, targetDir);
console.log(`Scaffolded ${targetId} from ${sourceId}`);
