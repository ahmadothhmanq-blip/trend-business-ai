/**
 * Finish ai-startup-signal (Aura) package from partial saas-enterprise copy.
 * Usage: node scripts/fix-aura-package.mjs
 */
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = path.join(root, "templates", "website", "ai-startup-signal");
const registryDir = path.join(root, "templates", "website-registry", "ai-startup-signal");

const REPLACEMENTS = [
  ["saas-enterprise", "ai-startup-signal"],
  ["SaasEnterprise", "AiStartupSignal"],
  ["se-", "as-"],
  ["se_", "as_"],
  ["ti-saas-growth", "ti-ai-company-signal"],
  ["nexus-command", "aura-signal"],
  ["nexus-grid-reveal", "signal-glow-reveal"],
  ["Horizon", "Aura"],
  ["Northline product systems", "Production AI platform"],
  ["\"saas\"", "\"ai-startup\""],
  ["\"SaaS\"", "\"AI Startup\""],
  ["أفق", "أورا"],
];

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

function applyReplacements(content) {
  let out = content;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

async function transformPackage(dir) {
  const files = await walk(dir);
  for (const file of files) {
    let rel = path.relative(dir, file).replaceAll("\\", "/");
    const newRel = rel.replaceAll("saas-enterprise", "ai-startup-signal");
    if (newRel !== rel) {
      const newPath = path.join(dir, newRel);
      await rename(file, newPath);
      rel = newRel;
    }
    const target = path.join(dir, rel);
    if (!/\.(tsx?|json|md|svg)$/.test(target)) continue;
    const content = await readFile(target, "utf8");
    await writeFile(target, applyReplacements(content));
  }
}

async function main() {
  await transformPackage(pkgDir);
  const { cp, rm, mkdir } = await import("node:fs/promises");
  await rm(registryDir, { recursive: true, force: true });
  await mkdir(path.dirname(registryDir), { recursive: true });
  await cp(pkgDir, registryDir, { recursive: true });
  console.log("✓ Aura package transformed:", pkgDir);
  console.log("✓ Registry copy:", registryDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
