/**
 * Verify AI Design Studio editor platform (Phase 2).
 * Usage: npm run verify:image-editor
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

const EDITOR_FILES = [
  "lib/ai-core/image-design-platform/editor/engine.ts",
  "lib/ai-core/image-design-platform/editor/document.ts",
  "lib/ai-core/image-design-platform/editor/layers.ts",
  "lib/ai-core/image-design-platform/editor/history.ts",
  "lib/ai-core/image-design-platform/editing/provider.ts",
  "lib/ai-core/image-design-platform/templates-v2.ts",
  "lib/ai-core/image-design-platform/brand-kit.ts",
  "lib/ai-core/image-design-platform/asset-library.ts",
  "lib/ai-core/image-design-platform/canvas-repository.ts",
  "app/api/image-generator/[id]/editor/route.ts",
  "app/api/image-generator/[id]/editor/save/route.ts",
  "app/api/image-generator/[id]/editor/history/route.ts",
  "app/api/image-generator/[id]/edit-image/route.ts",
  "app/api/image-generator/assets/search/route.ts",
  "components/dashboard/image-generator/design-editor.tsx",
  "components/dashboard/image-generator/editor/canvas-preview.tsx",
  "components/dashboard/image-generator/editor/layers-panel.tsx",
  "components/dashboard/image-generator/editor/properties-panel.tsx",
  "components/dashboard/image-generator/editor/toolbar.tsx",
  "components/dashboard/image-generator/editor/brand-kit-picker.tsx",
  "app/(dashboard)/dashboard/image-generator/[id]/editor/page.tsx",
  "supabase/migrations/056_design_canvas.sql",
  "supabase/migrations/057_design_layers.sql",
  "supabase/migrations/058_design_editor_history.sql",
  "supabase/migrations/059_design_templates_v2.sql",
];

const EXPORTS = [
  ["lib/ai-core/image-design-platform/index.ts", "DesignCanvasEngine"],
  ["lib/ai-core/image-design-platform/index.ts", "applyBrandKitToCanvas"],
  ["lib/ai-core/image-design-platform/index.ts", "listCanvasTemplatesV2"],
  ["lib/ai-core/image-design-platform/index.ts", "runDesignImageEdit"],
  ["lib/ai-core/image-design-platform/index.ts", "buildPdfFromCanvas"],
  ["lib/ai-core/image-design-platform/index.ts", "searchDesignAssets"],
];

console.log("\n[1] Design editor platform files");
for (const rel of EDITOR_FILES) {
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
const editorRoute = readFileSync(join(root, "app/api/image-generator/[id]/editor/route.ts"), "utf8");
if (editorRoute.includes("loadCanvasDocument")) ok("editor GET loads canvas");
else fail("editor GET missing loadCanvasDocument");

const saveRoute = readFileSync(join(root, "app/api/image-generator/[id]/editor/save/route.ts"), "utf8");
if (saveRoute.includes("saveCanvasDocument")) ok("editor save persists canvas");
else fail("editor save missing saveCanvasDocument");

const editRoute = readFileSync(join(root, "app/api/image-generator/[id]/edit-image/route.ts"), "utf8");
for (const op of ["background_removal", "enhance", "upscale", "variation"]) {
  if (editRoute.includes(op)) ok(`edit-image supports ${op}`);
  else fail(`edit-image missing ${op}`);
}

const searchRoute = readFileSync(join(root, "app/api/image-generator/assets/search/route.ts"), "utf8");
if (searchRoute.includes("searchDesignAssets")) ok("assets search API");
else fail("assets search missing");

console.log("\n[4] Editor UI wiring");
const editor = readFileSync(join(root, "components/dashboard/image-generator/design-editor.tsx"), "utf8");
for (const marker of ["DesignCanvasEngine", "LayersPanel", "PropertiesPanel", "BrandKitPicker", "/editor/save"]) {
  if (editor.includes(marker)) ok(`editor UI: ${marker}`);
  else fail(`editor UI missing ${marker}`);
}

const tool = readFileSync(join(root, "components/dashboard/image-generator/image-generator-tool.tsx"), "utf8");
if (tool.includes("/editor")) ok("dashboard: Open Editor link");
else fail("dashboard missing Open Editor link");

const exportRoute = readFileSync(join(root, "app/api/image-generator/[id]/export/route.ts"), "utf8");
for (const fmt of ["pdf", "project"]) {
  if (exportRoute.includes(fmt)) ok(`export supports ${fmt}`);
  else fail(`export missing ${fmt}`);
}

console.log("\n[5] Editor journey markers");
const engine = readFileSync(join(root, "lib/ai-core/image-design-platform/editor/engine.ts"), "utf8");
for (const action of ["addLayer", "duplicateLayer", "undo", "redo", "applyBrand"]) {
  if (engine.includes(action)) ok(`canvas engine: ${action}`);
  else fail(`canvas engine missing ${action}`);
}

const brandKit = readFileSync(join(root, "lib/ai-core/image-design-platform/brand-kit.ts"), "utf8");
if (brandKit.includes("applyBrandKitToCanvas")) ok("brand kit integration");
else fail("brand kit integration missing");

console.log("\n[6] package.json script");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:image-editor"]) ok("npm run verify:image-editor");
else fail("package.json missing verify:image-editor");

console.log(failed ? `\nImage Editor verify: ${failed} issue(s)\n` : "\nImage Editor verify: PASS\n");
process.exit(failed ? 1 : 0);
