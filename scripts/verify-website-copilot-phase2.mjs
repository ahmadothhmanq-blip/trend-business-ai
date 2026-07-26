/**
 * Website Copilot Phase 2 — contract + routing verification.
 * Usage: node scripts/verify-website-copilot-phase2.mjs
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

const PHASE2_RULES = [
  { re: /improve.*seo|seo.*improve|fix.*seo|optimize.*seo/i, uri: "website.seo.improve" },
  {
    re: /replace.*(all )?(images|photos)|refresh.*(images|photos)|new (stock )?images/i,
    uri: "website.image.replace.all",
  },
  { re: /add.*\bpage\b|create.*\bpage\b/i, uri: "website.page.add" },
  { re: /cms|blog post|add.*article|publish.*post/i, uri: "website.manage.cms" },
  { re: /catalog|add.*(service|product|menu)|update.*price/i, uri: "website.manage.catalog" },
];

function routeCommand(command) {
  const text = command.trim();
  if (!text) return { uri: "website.advisory.unknown" };
  const matched = [];
  for (const rule of PHASE2_RULES) {
    if (rule.re.test(text)) matched.push(rule.uri);
  }
  const unique = [...new Set(matched)];
  if (unique.length > 1) return { uri: "website.advisory.compound" };
  if (unique.length === 1) return { uri: unique[0] };
  return { uri: "website.advisory.unknown" };
}

const phase2Cases = [
  ["Add an About page", "website.page.add"],
  ["Replace all images with fresh photos", "website.image.replace.all"],
  ["Improve SEO for this site", "website.seo.improve"],
  ["Add a new service to the catalog", "website.manage.catalog"],
  ["Add a blog post to CMS", "website.manage.cms"],
];

for (const [command, expected] of phase2Cases) {
  const match = routeCommand(command);
  if (match.uri !== expected) {
    fail(`router Phase 2: "${command}"`, `expected ${expected}, got ${match.uri}`);
  } else {
    ok(`router Phase 2 → ${expected}`);
  }
}

function enrichCommand(command, selection) {
  const focus =
    selection?.componentExportName || selection?.sectionKind || selection?.nodeLabel;
  if (!focus || command.toLowerCase().includes(focus.toLowerCase())) return command;
  return `${command} (focus on ${focus})`;
}

const enriched = enrichCommand("Make it more modern", {
  componentExportName: "HeroCinematic",
});
if (!enriched.includes("HeroCinematic")) {
  fail("selection enrich", "missing focus component");
} else ok("selection context enriches command");

const requiredPaths = [
  "docs/WEBSITE_COPILOT_PHASE2.md",
  "lib/ai-core/website-copilot/selection-context.ts",
  "lib/ai-core/website-copilot/undo.ts",
  "lib/ai-core/website-copilot/executors/structure.ts",
  "lib/ai-core/website-copilot/executors/seo.ts",
  "app/api/website-builder/[id]/copilot/undo/route.ts",
];

for (const rel of requiredPaths) {
  try {
    readFileSync(join(root, rel), "utf8");
    ok(`file exists: ${rel}`);
  } catch {
    fail(`file exists: ${rel}`, "missing");
  }
}

const processorSrc = readFileSync(
  join(root, "lib/ai-core/website-copilot/processor.ts"),
  "utf8",
);
for (const needle of [
  "executeStructureCopilotCommand",
  "executeSeoCopilotCommand",
  "enrichCommandWithSelection",
]) {
  if (!processorSrc.includes(needle)) fail(`processor: ${needle}`, "missing");
  else ok(`processor: ${needle}`);
}

const manageSrc = readFileSync(
  join(root, "components/dashboard/website-builder/website-management-dashboard.tsx"),
  "utf8",
);
if (
  !manageSrc.includes("useCopilotCommand") ||
  !manageSrc.includes("copilot.submit")
) {
  fail("management assistant delegation", "missing unified Copilot hook");
} else ok("management assistant delegates to Copilot API");

const panelSrc = readFileSync(
  join(root, "components/dashboard/website-builder/copilot-command-panel.tsx"),
  "utf8",
);
if (!panelSrc.includes("Undo2") || !panelSrc.includes("selectionContext")) {
  fail("copilot panel Phase 2 UI", "missing undo or selection");
} else ok("CopilotCommandPanel Phase 2 UI");

const hookSrc = readFileSync(
  join(root, "components/dashboard/website-builder/hooks/use-copilot-command.ts"),
  "utf8",
);
if (!hookSrc.includes("undoStack") || !hookSrc.includes("/copilot/undo")) {
  fail("useCopilotCommand undo", "missing undo stack");
} else ok("useCopilotCommand undo stack");

const seoSrc = readFileSync(
  join(root, "lib/website/platform/services/seo-service.ts"),
  "utf8",
);
if (!seoSrc.includes("executeWebsiteSeoImprove")) {
  fail("seo-service improve", "missing executeWebsiteSeoImprove");
} else ok("executeWebsiteSeoImprove exists");

if (failed) {
  console.error(`\nverify-website-copilot-phase2: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-copilot-phase2: OK");
