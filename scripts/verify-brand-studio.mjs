/**
 * Verify Brand Studio platform upgrade.
 * Usage: npm run verify:brand-studio
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

const BRAND_STUDIO_FILES = [
  "lib/ai-core/brand-studio/engine.ts",
  "lib/ai-core/brand-studio/model.ts",
  "lib/ai-core/brand-studio/logos.ts",
  "lib/ai-core/brand-studio/kit.ts",
  "lib/ai-core/brand-studio/templates.ts",
  "lib/ai-core/brand-studio/assistant.ts",
  "lib/ai-core/brand-studio/apply.ts",
  "lib/ai-core/brand-studio/export.ts",
  "app/api/brand-identity/health/route.ts",
  "app/api/brand-identity/templates/route.ts",
  "app/api/brand-identity/stream/route.ts",
  "app/api/brand-identity/[id]/logos/route.ts",
  "app/api/brand-identity/[id]/kit/route.ts",
  "app/api/brand-identity/[id]/assistant/route.ts",
  "app/api/brand-identity/[id]/export/route.ts",
  "components/dashboard/brand-identity/brand-management-dashboard.tsx",
  "app/(dashboard)/dashboard/brand-studio/[id]/page.tsx",
  "supabase/migrations/048_brand_kits.sql",
  "supabase/migrations/049_brand_assets.sql",
  "supabase/migrations/050_brand_constraints.sql",
  "supabase/migrations/051_brand_project_fk.sql",
  "supabase/migrations/052_brand_assistant_sessions.sql",
];

const REQUIRED_EXPORTS = [
  ["lib/ai-core/brand-studio/index.ts", "brandIdentityEngine"],
  ["lib/ai-core/brand-studio/index.ts", "runBrandAssistant"],
  ["lib/ai-core/brand-studio/index.ts", "generateBrandLogos"],
  ["lib/ai-core/brand-studio/index.ts", "applyBrandKit"],
  ["lib/ai-core/brand-studio/index.ts", "buildBrandStudioHealthReport"],
];

console.log("\n[1] Brand Studio platform files");
for (const rel of BRAND_STUDIO_FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Public exports");
for (const [file, symbol] of REQUIRED_EXPORTS) {
  const src = readFileSync(join(root, file), "utf8");
  if (src.includes(symbol)) ok(`${file} exports ${symbol}`);
  else fail(`${file} missing export ${symbol}`);
}

console.log("\n[3] API route markers");
const kitRoute = readFileSync(join(root, "app/api/brand-identity/[id]/kit/route.ts"), "utf8");
if (kitRoute.includes("saveBrandKit")) ok("kit route persists brand kits");
else fail("kit route missing saveBrandKit");

const assistantRoute = readFileSync(
  join(root, "app/api/brand-identity/[id]/assistant/route.ts"),
  "utf8",
);
if (assistantRoute.includes("runBrandAssistant")) ok("assistant route wired");
else fail("assistant route missing runBrandAssistant");

console.log("\n[4] Management workspace");
const dashboard = readFileSync(
  join(root, "components/dashboard/brand-identity/brand-management-dashboard.tsx"),
  "utf8",
);
for (const marker of ["/logos", "/kit", "/assistant", "/export"]) {
  if (dashboard.includes(marker)) ok(`workspace calls ${marker}`);
  else fail(`workspace missing ${marker}`);
}

console.log("\n[5] package.json script");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:brand-studio"]) ok("npm run verify:brand-studio");
else fail("package.json missing verify:brand-studio script");

console.log(
  failed ? `\nBrand Studio verify: ${failed} issue(s)\n` : "\nBrand Studio verify: PASS\n",
);
process.exit(failed ? 1 : 0);
