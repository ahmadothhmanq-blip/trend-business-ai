/**
 * Website Builder Phases 2–8 — unified verification.
 * Usage: node scripts/verify-website-builder-phases.mjs
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

const phase2Paths = [
  "lib/website/builder/design-system.ts",
  "lib/website/builder/responsive.ts",
  "components/dashboard/website-builder/design-system-panel.tsx",
];

const phase3Paths = [
  "lib/website/builder/blocks.ts",
  "components/dashboard/website-builder/blocks-panel.tsx",
  "components/dashboard/website-builder/builder-tool-rail.tsx",
];

const phase4Paths = [
  "lib/website/builder/ai-builder.ts",
  "components/dashboard/website-builder/ai-builder-panel.tsx",
];

const phase5Paths = [
  "lib/website/builder/professional.ts",
  "components/dashboard/website-builder/professional-panel.tsx",
];

const phase6Paths = [
  "lib/website/builder/business.ts",
  "components/dashboard/website-builder/business-hub-panel.tsx",
];

const phase7Paths = [
  "lib/website/builder/publishing.ts",
  "components/dashboard/website-builder/publishing-hub-panel.tsx",
  "app/api/website-builder/[id]/builder/snapshots/route.ts",
  "supabase/migrations/078_website_builder_extensions.sql",
];

const phase8Paths = [
  "lib/website/builder/enterprise.ts",
  "components/dashboard/website-builder/enterprise-panel.tsx",
  "app/api/website-builder/[id]/builder/members/route.ts",
];

for (const [phase, paths] of [
  ["Phase 2 Design System", phase2Paths],
  ["Phase 3 Builder Components", phase3Paths],
  ["Phase 4 AI Builder", phase4Paths],
  ["Phase 5 Professional", phase5Paths],
  ["Phase 6 Business", phase6Paths],
  ["Phase 7 Publishing", phase7Paths],
  ["Phase 8 Enterprise", phase8Paths],
]) {
  console.log(`\n${phase}`);
  for (const rel of paths) {
    try {
      readFileSync(join(root, rel), "utf8");
      ok(`file exists: ${rel}`);
    } catch {
      fail(`file exists: ${rel}`, "missing");
    }
  }
}

const workspace = readFileSync(
  join(root, "components/dashboard/website-builder/builder-workspace.tsx"),
  "utf8",
);
for (const needle of [
  "BuilderToolRail",
  "DesignSystemPanel",
  "BlocksPanel",
  "AiBuilderPanel",
  "ProfessionalPanel",
  "BusinessHubPanel",
  "PublishingHubPanel",
  "EnterprisePanel",
  "onAiCommand",
  "onOpenWorkspaceTab",
  "onReorderSection",
]) {
  if (!workspace.includes(needle)) fail(`builder-workspace: ${needle}`, "missing");
  else ok(`builder-workspace: ${needle}`);
}

const tool = readFileSync(
  join(root, "components/dashboard/website-builder-tool.tsx"),
  "utf8",
);
for (const needle of ["onAiCommand", "onOpenWorkspaceTab", "aiLoading", "handleAiCopilotCommand"]) {
  if (!tool.includes(needle)) fail(`website-builder-tool: ${needle}`, "missing");
  else ok(`website-builder-tool: ${needle}`);
}

const editor = readFileSync(
  join(root, "components/dashboard/visual-editor/visual-website-editor.tsx"),
  "utf8",
);
for (const needle of [
  "moveSection",
  "insertBlock",
  "getTokens",
  "updateTokens",
  "setViewport",
]) {
  if (!editor.includes(needle)) fail(`visual editor: ${needle}`, "missing");
  else ok(`visual editor: ${needle}`);
}

const index = readFileSync(join(root, "lib/website/builder/index.ts"), "utf8");
for (const needle of [
  "mergeThemePreset",
  "listBuilderBlocks",
  "AI_BUILDER_ACTIONS",
  "PROFESSIONAL_FEATURES",
  "BUSINESS_FEATURES",
  "PUBLISHING_CHECKLIST",
  "ENTERPRISE_CAPABILITIES",
  "submitWebsiteCopilotCommand",
  "deliverBuilderInvitationEmail",
]) {
  if (!index.includes(needle)) fail(`builder index: ${needle}`, "missing");
  else ok(`builder index: ${needle}`);
}

if (failed) {
  console.error(`\nverify-website-builder-phases: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-builder-phases: OK");
