/**
 * Sync harmonized color tokens from manifest → TBDP profile files.
 * Usage: node scripts/sync-skin-harmonized-colors.mjs [--dry-run]
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

const runner = `
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { FLAGSHIP_SKIN_MANIFEST } from ${JSON.stringify(pathToFileURL(path.join(root, "scripts/visual-skin-catalog-manifest.mjs")).href)};
import { harmonizePalette } from ${JSON.stringify(pathToFileURL(path.join(root, "lib/website/template-v2/tokens/harmonize-palette.ts")).href)};

const root = ${JSON.stringify(root)};
const dryRun = ${dryRun};

function formatRecord(obj, indent = 4) {
  const pad = " ".repeat(indent);
  const close = " ".repeat(indent - 2);
  const lines = Object.entries(obj).map(([k, v]) => \`\${pad}\${k}: \${JSON.stringify(v)},\`);
  return \`{\${lines.length ? "\\n" + lines.join("\\n") + "\\n" + close : ""}},\`;
}

function replaceBlock(source, key, replacement) {
  const marker = \`\${key}: {\`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(\`Missing \${key} block\`);
  let depth = 0;
  let end = start;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  const tail = source[end] === "," ? end + 1 : end;
  return source.slice(0, start) + \`\${key}: \${replacement}\` + source.slice(tail);
}

const results = [];

for (const skin of FLAGSHIP_SKIN_MANIFEST) {
  const profilePath = path.join(
    root,
    "lib/website/template-v2/tbdp/profiles",
    skin.packageId,
    \`\${skin.tbdpIdentity}.ts\`,
  );
  const source = readFileSync(profilePath, "utf8");
  const palette = harmonizePalette(skin.tokens, skin.packageId);

  let next = source;
  next = replaceBlock(next, "colors", formatRecord(palette.colors));
  next = replaceBlock(next, "borders", formatRecord(palette.borders));
  next = replaceBlock(next, "shadows", formatRecord(palette.shadows));

  if (next !== source) {
    if (!dryRun) writeFileSync(profilePath, next, "utf8");
    results.push({ skinId: skin.skinId, packageId: skin.packageId, file: profilePath, updated: true });
  } else {
    results.push({ skinId: skin.skinId, packageId: skin.packageId, file: profilePath, updated: false });
  }
}

console.log("__SYNC_COLORS__" + JSON.stringify({ dryRun, count: results.length, results }));
`;

const runnerPath = path.join(tmpdir(), `sync-skin-colors-${Date.now()}.mts`);
await writeFile(runnerPath, runner, "utf8");

const result = spawnSync(`npx --yes tsx "${runnerPath.replaceAll('"', '\\"')}"`, {
  cwd: root,
  encoding: "utf8",
  shell: true,
});

const output = (result.stdout || "") + (result.stderr || "");
const marker = output.indexOf("__SYNC_COLORS__");
if (marker < 0) {
  console.error(output || "Sync failed");
  process.exit(result.status ?? 1);
}

const info = JSON.parse(output.slice(marker + "__SYNC_COLORS__".length).trim().split(/\r?\n/)[0]);
console.log(JSON.stringify(info, null, 2));
process.exit(result.status ?? 0);
