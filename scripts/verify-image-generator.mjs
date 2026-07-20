/**
 * Verify Image Generator / Design Studio platform upgrade.
 * Usage: npm run verify:image-generator
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

const FILES = [
  "lib/ai-core/image-design-platform/engine.ts",
  "lib/ai-core/image-design-platform/pipeline.ts",
  "lib/ai-core/image-design-platform/providers.ts",
  "lib/ai-core/image-design-platform/assets.ts",
  "lib/ai-core/image-design-platform/storage.ts",
  "lib/ai-core/image-design-platform/templates.ts",
  "lib/ai-core/image-design-platform/brand.ts",
  "app/api/image-generator/health/route.ts",
  "app/api/image-generator/templates/route.ts",
  "app/api/image-generator/stream/route.ts",
  "app/api/image-generator/[id]/export/route.ts",
  "app/api/image-generator/[id]/assets/route.ts",
  "supabase/migrations/053_design_projects.sql",
  "supabase/migrations/054_design_assets.sql",
  "supabase/migrations/055_design_generations.sql",
];

const EXPORTS = [
  ["lib/ai-core/image-design-platform/index.ts", "imageDesignEngine"],
  ["lib/ai-core/image-design-platform/index.ts", "generateRasterAssets"],
  ["lib/ai-core/image-design-platform/index.ts", "isRasterGenerationAvailable"],
  ["lib/ai-core/image-design-platform/index.ts", "buildImageDesignHealthReport"],
];

console.log("\n[1] Design Studio platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Public exports");
for (const [file, symbol] of EXPORTS) {
  const src = readFileSync(join(root, file), "utf8");
  if (src.includes(symbol)) ok(`${file} exports ${symbol}`);
  else fail(`${file} missing export ${symbol}`);
}

console.log("\n[3] API route markers");
const mainRoute = readFileSync(join(root, "app/api/image-generator/route.ts"), "utf8");
if (mainRoute.includes("imageDesignEngine") || mainRoute.includes("generateImage")) ok("main route uses unified engine");
else fail("main route missing unified engine");

const exportRoute = readFileSync(join(root, "app/api/image-generator/[id]/export/route.ts"), "utf8");
if (exportRoute.includes("format === \"zip\"")) ok("export supports ZIP");
else fail("export missing ZIP");

console.log("\n[4] Dashboard wiring");
const tool = readFileSync(join(root, "components/dashboard/image-generator/image-generator-tool.tsx"), "utf8");
for (const marker of ["rasterAssets", "/templates", "Use my brand identity", "/export?format=zip"]) {
  if (tool.includes(marker)) ok(`dashboard: ${marker}`);
  else fail(`dashboard missing ${marker}`);
}

console.log("\n[5] package.json script");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:image-generator"]) ok("npm run verify:image-generator");
else fail("package.json missing verify:image-generator");

console.log(failed ? `\nImage Generator verify: ${failed} issue(s)\n` : "\nImage Generator verify: PASS\n");
process.exit(failed ? 1 : 0);
