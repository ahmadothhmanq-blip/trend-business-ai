/**
 * TBDP Phase 5 verification — integration layer, bridges, isolation.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  TBDP_INTEGRATION_PHASE,
  TBDP_INTEGRATION_VERSION,
  resolveDesignContext,
  resolveTemplateBridge,
  enrichBuilderInput,
  resolveAiWebsiteDesign,
} from "@/lib/design-platform/integration";

const root = join(import.meta.dirname, "../..");
const resultsDir = join(root, "scripts/benchmark-results/design-platform");

type Check = { id: string; ok: boolean; detail?: string };

function record(checks: Check[], id: string, ok: boolean, detail?: string) {
  checks.push({ id, ok, detail });
}

function main() {
  const checks: Check[] = [];

  record(checks, "integration.phase", TBDP_INTEGRATION_PHASE === "integration-5");
  record(checks, "integration.version", TBDP_INTEGRATION_VERSION === "5.0.0");

  const modules = [
    "core",
    "bridges",
    "schema",
    "validation",
    "docs",
  ];
  for (const mod of modules) {
    record(
      checks,
      `module.${mod}`,
      existsSync(join(root, "lib/design-platform/integration", mod)),
    );
  }

  const resolvers = [
    "design-resolver.ts",
    "template-resolver.ts",
    "language-bridge.ts",
    "theme-resolver.ts",
    "industry-map.ts",
    "lifecycle.ts",
  ];
  for (const file of resolvers) {
    record(
      checks,
      `resolver.${file.replace(".ts", "")}`,
      existsSync(join(root, "lib/design-platform/integration", file)),
    );
  }

  const bridges = ["builder-bridge.ts", "ai-bridge.ts", "template-bridge.ts"];
  for (const file of bridges) {
    record(
      checks,
      `bridge.${file.replace("-bridge.ts", "")}`,
      existsSync(join(root, "lib/design-platform/integration/bridges", file)),
    );
  }

  const ctx = resolveDesignContext({ sectorId: "saas" });
  record(checks, "design.context", ctx.meta.sectorDnaId === "saas");
  record(checks, "design.foundations", Boolean(ctx.sectorResolved.foundations));
  record(checks, "design.experience", Boolean(ctx.sectorResolved.experience));

  const builder = enrichBuilderInput({ industryId: "restaurant" });
  record(checks, "builder.enrichment", builder.enrichment.sectorDnaId === "restaurant");

  const ai = resolveAiWebsiteDesign({ sectorId: "medical" });
  record(checks, "ai.components", ai.componentIds.length > 0);
  record(checks, "ai.deterministic", ai.componentIds === ai.designContext.components.preferred);

  const template = resolveTemplateBridge({ templateId: "medical-premium" });
  record(checks, "template.bridge", template.architectureVersion === "v2");
  record(checks, "template.css", template.tbdpCssLayer.includes("--tbdp-"));

  const docs = [
    "ARCHITECTURE.md",
    "INTEGRATION-DIAGRAM.md",
    "LIFECYCLE-DIAGRAM.md",
    "BACKWARD-COMPATIBILITY.md",
    "BRIDGES.md",
  ];
  for (const doc of docs) {
    record(
      checks,
      `docs.${doc.replace(".md", "").toLowerCase()}`,
      existsSync(join(root, "lib/design-platform/integration/docs", doc)),
    );
  }

  const protectedPaths = [
    "lib/website/builder/apply-structure-template.ts",
    "lib/website/template-v2/apply/apply-v2-template.ts",
    "templates/website",
  ];
  for (const rel of protectedPaths) {
    record(checks, `isolation.exists.${rel.split("/").pop()}`, existsSync(join(root, rel)));
  }

  let tscOk = true;
  try {
    execSync("npx tsc --noEmit --pretty false", {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    const output =
      (error as { stdout?: string; stderr?: string }).stdout ??
      (error as { stdout?: string; stderr?: string }).stderr ??
      "";
    tscOk = !output.includes("design-platform/integration");
  }
  record(checks, "tsc.integration", tscOk);

  let eslintOk = true;
  try {
    execSync("npx eslint lib/design-platform/integration --max-warnings 0", {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    eslintOk = false;
  }
  record(checks, "eslint.integration", eslintOk);

  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.filter((c) => !c.ok);

  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(
    join(resultsDir, "phase5-qa-report.json"),
    JSON.stringify({ passed, total: checks.length, checks, failed }, null, 2),
  );

  console.log(`\nTBDP Phase 5 QA: ${passed}/${checks.length} checks passed\n`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "✓" : "✗"} ${c.id}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }
}

main();
