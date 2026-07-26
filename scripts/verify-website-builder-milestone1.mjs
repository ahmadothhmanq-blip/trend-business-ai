/**
 * Website Builder Milestone 1 — unified workspace verification.
 * Usage: node scripts/verify-website-builder-milestone1.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
function ok(label) {
  console.log(`  ✓ ${label}`);
}
function fail(label, err) {
  failed++;
  console.log(`  ✗ ${label}: ${err}`);
}

const requiredPaths = [
  "docs/WEBSITE_BUILDER_MILESTONES.md",
  "lib/website/builder/index.ts",
  "lib/website/builder/structure.ts",
  "lib/website/builder/autosave.ts",
  "lib/website/builder/version-history.ts",
  "components/dashboard/website-builder/builder-workspace.tsx",
  "components/dashboard/website-builder/builder-pages-sidebar.tsx",
  "components/dashboard/website-builder/builder-sections-panel.tsx",
];

for (const rel of requiredPaths) {
  try {
    readFileSync(join(root, rel), "utf8");
    ok(`file exists: ${rel}`);
  } catch {
    fail(`file exists: ${rel}`, "missing");
  }
}

const tool = readFileSync(
  join(root, "components/dashboard/website-builder-tool.tsx"),
  "utf8",
);
for (const needle of ["BuilderWorkspace", "copilotSlot", 'setOutputTab("canvas")']) {
  if (!tool.includes(needle)) fail(`website-builder-tool: ${needle}`, "missing");
  else ok(`website-builder-tool: ${needle}`);
}

const editor = readFileSync(
  join(root, "components/dashboard/visual-editor/visual-website-editor.tsx"),
  "utf8",
);
for (const needle of [
  "forwardRef",
  "VisualWebsiteEditorHandle",
  'chrome === "workspace"',
  "autosaveEnabled",
]) {
  if (!editor.includes(needle)) fail(`visual editor: ${needle}`, "missing");
  else ok(`visual editor: ${needle}`);
}

const structure = readFileSync(
  join(root, "lib/website/builder/structure.ts"),
  "utf8",
);
if (!structure.includes("resolveBuilderWorkspaceStructure")) {
  fail("builder structure service", "missing resolver");
} else ok("builder structure service");

if (failed) {
  console.error(`\nverify-website-builder-milestone1: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-builder-milestone1: OK");
