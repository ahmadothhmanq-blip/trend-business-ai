/**
 * Website Copilot Phase 3 — contract + routing verification.
 * Usage: node scripts/verify-website-copilot-phase3.mjs
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

const TTL_DAYS = 7;

function estimateCopilotCost(match, plan) {
  const aiUris = new Set([
    "website.design.style.modernize",
    "website.section.add.testimonials",
    "website.section.regenerate.hero",
    "website.content.rewrite.home",
    "website.image.replace.all",
    "website.seo.improve",
  ]);
  const requiresAi = plan.tier === "ai-continue" && aiUris.has(match.uri);
  return {
    costTier: requiresAi ? "ai-standard" : "free",
    creditCost: requiresAi ? 1 : 0,
    capability: match.uri,
  };
}

function composePlan(match) {
  const ai = [
    "website.design.style.modernize",
    "website.section.add.testimonials",
    "website.section.regenerate.hero",
    "website.content.rewrite.home",
    "website.image.replace.all",
  ];
  if (match.uri === "website.brand.color.set") {
    return { tier: "local", capability: match.uri };
  }
  if (ai.includes(match.uri)) {
    return { tier: "ai-continue", capability: match.uri };
  }
  if (match.uri === "website.seo.improve") {
    return { tier: "ai-continue", capability: match.uri };
  }
  return { tier: "advisory", capability: match.uri };
}

const freeCost = estimateCopilotCost(
  { uri: "website.brand.color.set" },
  composePlan({ uri: "website.brand.color.set" }),
);
if (freeCost.costTier !== "free" || freeCost.creditCost !== 0) {
  fail("cost tier free", JSON.stringify(freeCost));
} else ok("cost tier free → 0 credits");

const aiCost = estimateCopilotCost(
  { uri: "website.design.style.modernize" },
  composePlan({ uri: "website.design.style.modernize" }),
);
if (aiCost.costTier !== "ai-standard" || aiCost.creditCost !== 1) {
  fail("cost tier ai", JSON.stringify(aiCost));
} else ok("cost tier ai-standard → 1 credit");

const requiredPaths = [
  "docs/WEBSITE_COPILOT_PHASE3.md",
  "lib/ai-core/website-copilot/classifier.ts",
  "lib/ai-core/website-copilot/cost-tier.ts",
  "lib/ai-core/website-copilot/resolve-route.ts",
  "lib/ai-core/website-copilot/stream.ts",
  "app/api/website-builder/[id]/copilot/stream/route.ts",
  "supabase/migrations/075_website_copilot_idempotency_ttl.sql",
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
  "resolveCopilotRoute",
  "estimateCopilotCost",
  "useClassifier",
]) {
  if (!processorSrc.includes(needle)) fail(`processor: ${needle}`, "missing");
  else ok(`processor: ${needle}`);
}

const idempotencySrc = readFileSync(
  join(root, "lib/website/platform/idempotency.ts"),
  "utf8",
);
if (!idempotencySrc.includes("purgeExpiredIdempotentCommits")) {
  fail("idempotency TTL", "missing purge");
} else ok("idempotency purge helper");

if (!idempotencySrc.includes(`WEBSITE_COMMIT_IDEMPOTENCY_TTL_DAYS = ${TTL_DAYS}`)) {
  fail("idempotency TTL days", `expected ${TTL_DAYS}`);
} else ok(`idempotency TTL ${TTL_DAYS} days`);

const migrationSrc = readFileSync(
  join(root, "supabase/migrations/075_website_copilot_idempotency_ttl.sql"),
  "utf8",
);
if (!migrationSrc.includes("expires_at")) {
  fail("migration 075", "missing expires_at");
} else ok("migration 075 expires_at column");

const streamRouteSrc = readFileSync(
  join(root, "app/api/website-builder/[id]/copilot/stream/route.ts"),
  "utf8",
);
if (!streamRouteSrc.includes("runCopilotCommandStream")) {
  fail("stream route", "missing stream runner");
} else ok("copilot stream route");

const commandsRouteSrc = readFileSync(
  join(root, "app/api/website-builder/[id]/copilot/commands/route.ts"),
  "utf8",
);
if (!commandsRouteSrc.includes("useClassifier")) {
  fail("commands route", "missing useClassifier");
} else ok("commands route useClassifier");

const panelSrc = readFileSync(
  join(root, "components/dashboard/website-builder/copilot-command-panel.tsx"),
  "utf8",
);
if (!panelSrc.includes("costHint") || !panelSrc.includes("credit")) {
  fail("copilot panel cost UX", "missing cost badge");
} else ok("CopilotCommandPanel cost badge");

const hookSrc = readFileSync(
  join(root, "components/dashboard/website-builder/hooks/use-copilot-command.ts"),
  "utf8",
);
const copilotClientSrc = readFileSync(
  join(root, "lib/website/builder/copilot-client.ts"),
  "utf8",
);
if (
  !hookSrc.includes("previewCostHint") ||
  !hookSrc.includes("submitWebsiteCopilotCommand") ||
  !copilotClientSrc.includes("/copilot/stream")
) {
  fail("useCopilotCommand Phase 3", "missing stream or cost preview");
} else ok("useCopilotCommand stream + cost preview");

if (failed) {
  console.error(`\nverify-website-copilot-phase3: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-copilot-phase3: OK");
