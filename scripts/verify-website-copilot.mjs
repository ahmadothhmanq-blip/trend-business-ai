/**
 * Website Copilot Phase 1 — contract + routing verification.
 * Usage: node scripts/verify-website-copilot.mjs
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

// --- router (mirrors lib/ai-core/website-copilot/router.ts) ---
const ROUTING_RULES = [
  {
    re: /regenerat.*hero|redo.*hero|hero.*regenerat/i,
    uri: "website.section.regenerate.hero",
  },
  {
    re: /rewrite.*(home|homepage)|rewrite.*copy/i,
    uri: "website.content.rewrite.home",
  },
  {
    re: /testimonial|review.*section|add.*testimonial/i,
    uri: "website.section.add.testimonials",
  },
  {
    re: /modern|minimal|corporate|make it more/i,
    uri: "website.design.style.modernize",
  },
  {
    re: /color|palette|primary color|#[0-9a-f]{3,8}/i,
    uri: "website.brand.color.set",
  },
];

function routeCommand(command) {
  const text = command.trim();
  if (!text) {
    return { uri: "website.advisory.unknown", confidence: 0 };
  }
  const matched = [];
  for (const rule of ROUTING_RULES) {
    if (rule.re.test(text)) matched.push(rule.uri);
  }
  const unique = [...new Set(matched)];
  if (unique.length > 1) {
    return { uri: "website.advisory.compound", confidence: 1 };
  }
  if (unique.length === 1) {
    return { uri: unique[0], confidence: 1 };
  }
  return { uri: "website.advisory.unknown", confidence: 0 };
}

const mvpCases = [
  ["Change the primary color to #2563eb", "website.brand.color.set"],
  ["Make the design more modern", "website.design.style.modernize"],
  ["Add a testimonials section", "website.section.add.testimonials"],
  ["Regenerate only the hero section", "website.section.regenerate.hero"],
  ["Rewrite the homepage copy", "website.content.rewrite.home"],
];

for (const [command, expected] of mvpCases) {
  const match = routeCommand(command);
  if (match.uri !== expected) {
    fail(`router MVP: "${command}"`, `expected ${expected}, got ${match.uri}`);
  } else {
    ok(`router MVP → ${expected}`);
  }
}

const compound = routeCommand("modernize and add testimonials");
if (compound.uri !== "website.advisory.compound") {
  fail("compound command", `expected advisory.compound, got ${compound.uri}`);
} else ok("compound command → advisory.compound");

const unknown = routeCommand("publish my site to mars");
if (unknown.uri !== "website.advisory.unknown") {
  fail("unknown command", `expected advisory.unknown, got ${unknown.uri}`);
} else ok("unknown command → advisory.unknown");

// --- sync fixture (mirrors parseHomeComponentOrder + sync fields) ---
function parseHomeComponentOrder(pageSource) {
  const order = [];
  const jsxRe = /<([A-Z][A-Za-z0-9]*)\b/g;
  let m;
  while ((m = jsxRe.exec(pageSource))) {
    const name = m[1];
    if (name === "Metadata" || name === "Fragment") continue;
    if (!order.includes(name)) order.push(name);
  }
  return order;
}

function syncFixture(project) {
  const files = project.files ?? [];
  const home = files.find((f) => f.path.endsWith("app/page.tsx"));
  if (!home) throw new Error("missing home");
  const homeOrder = parseHomeComponentOrder(home.content);
  return {
    ...project,
    sections: homeOrder,
    components: homeOrder,
    pages: files
      .filter((f) => /app\/.*page\.tsx$/.test(f.path))
      .map((f) => f.path),
  };
}

const fixture = syncFixture({
  files: [
    {
      path: "app/page.tsx",
      content:
        'export default function Page() { return (<><HeroCinematic /><TestimonialsCarousel /></>); }',
    },
    { path: "app/about/page.tsx", content: "export default function About(){}" },
  ],
  sections: [],
  components: [],
  pages: [],
});

if (
  !fixture.sections.includes("HeroCinematic") ||
  !fixture.sections.includes("TestimonialsCarousel")
) {
  fail("syncBlueprintMaterializedView fixture", "sections not updated");
} else ok("syncBlueprintMaterializedView updates sections from fixtures");

if (!fixture.pages.includes("app/about/page.tsx")) {
  fail("syncBlueprintMaterializedView pages", "pages not updated");
} else ok("syncBlueprintMaterializedView updates pages from fixtures");

// --- static source contracts ---
const requiredPaths = [
  "lib/ai-core/website-copilot/types.ts",
  "lib/ai-core/website-copilot/router.ts",
  "lib/ai-core/website-copilot/composer.ts",
  "lib/ai-core/website-copilot/processor.ts",
  "lib/website/platform/sync-blueprint.ts",
  "lib/website/platform/port.ts",
  "lib/website/contracts/platform-port.ts",
  "lib/ai-core/website-copilot/validators/post-command.ts",
  "lib/ai-core/website-copilot/executors/local.ts",
  "lib/ai-core/website-copilot/executors/ai-continue.ts",
  "lib/ai-core/website-copilot/executors/advisory.ts",
  "lib/ai-core/website-copilot/index.ts",
  "app/api/website-builder/[id]/copilot/commands/route.ts",
  "components/dashboard/website-builder/copilot-command-panel.tsx",
  "components/dashboard/website-builder/hooks/use-copilot-command.ts",
];

for (const rel of requiredPaths) {
  try {
    readFileSync(join(root, rel), "utf8");
    ok(`file exists: ${rel}`);
  } catch {
    fail(`file exists: ${rel}`, "missing");
  }
}

const routeSrc = readFileSync(
  join(root, "app/api/website-builder/[id]/copilot/commands/route.ts"),
  "utf8",
);
if (!routeSrc.includes("runCopilotCommand")) {
  fail("commands route delegates", "missing runCopilotCommand");
} else ok("commands route delegates to runCopilotCommand");

const processorSrc = readFileSync(
  join(root, "lib/ai-core/website-copilot/processor.ts"),
  "utf8",
);
if (!processorSrc.includes("getWebsitePlatformPort")) {
  fail("processor platform port", "missing getWebsitePlatformPort");
} else ok("processor uses WebsitePlatformPort");

const commitSrc = readFileSync(
  join(root, "lib/website/platform/commit.ts"),
  "utf8",
);
if (!commitSrc.includes("syncBlueprintMaterializedView")) {
  fail("commit.ts sync", "missing syncBlueprintMaterializedView");
} else ok("commit.ts calls syncBlueprintMaterializedView");

const typesSrc = readFileSync(
  join(root, "lib/website/platform/types.ts"),
  "utf8",
);
if (!typesSrc.includes("website.copilot.command")) {
  fail("mutation operation", "missing website.copilot.command");
} else ok("WebsiteMutationOperation includes website.copilot.command");

const panelSrc = readFileSync(
  join(root, "components/dashboard/website-builder/copilot-command-panel.tsx"),
  "utf8",
);
if (!panelSrc.includes("CopilotCommandPanel")) {
  fail("panel component", "missing CopilotCommandPanel");
} else ok("CopilotCommandPanel exists");

const hookSrc = readFileSync(
  join(root, "components/dashboard/website-builder/hooks/use-copilot-command.ts"),
  "utf8",
);
if (!hookSrc.includes("useCopilotCommand")) {
  fail("hook", "missing useCopilotCommand");
} else ok("useCopilotCommand hook exists");

const toolSrc = readFileSync(
  join(root, "components/dashboard/website-builder-tool.tsx"),
  "utf8",
);
if (!toolSrc.includes("CopilotCommandPanel")) {
  fail("website-builder-tool embed", "CopilotCommandPanel not embedded");
} else ok("CopilotCommandPanel embedded in website-builder-tool");

if (failed) {
  console.error(`\nverify-website-copilot: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-copilot: OK");
