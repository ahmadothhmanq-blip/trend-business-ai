/**
 * TBDP Phase 6 verification — website builder wiring.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  TBDP_WIRING_PHASE,
  TBDP_WIRING_VERSION,
  wireWebsiteGenerationStart,
  wireTemplateApply,
  validateWebsiteAgainstTbdp,
} from "@/lib/website/tbdp-wiring";

const root = join(import.meta.dirname, "../..");
const resultsDir = join(root, "scripts/benchmark-results/design-platform");

type Check = { id: string; ok: boolean; detail?: string };

function record(checks: Check[], id: string, ok: boolean, detail?: string) {
  checks.push({ id, ok, detail });
}

function main() {
  const checks: Check[] = [];

  record(checks, "wiring.phase", TBDP_WIRING_PHASE === "wiring-6");
  record(checks, "wiring.version", TBDP_WIRING_VERSION === "6.0.0");

  const modules = [
    "wire-generation.ts",
    "wire-template.ts",
    "wire-preview.ts",
    "wire-design-system.ts",
    "design-context-store.ts",
    "validate.ts",
  ];
  for (const file of modules) {
    record(
      checks,
      `module.${file.replace(".ts", "")}`,
      existsSync(join(root, "lib/website/tbdp-wiring", file)),
    );
  }

  const wiredFiles = [
    "lib/website/orchestrator.ts",
    "lib/website/builder/apply-structure-template.ts",
    "lib/website/save-generation.ts",
    "lib/website/build-static-preview.server.ts",
    "lib/ai-core/adapters/website-builder.ts",
  ];
  for (const file of wiredFiles) {
    const content = readFileSync(join(root, file), "utf8");
    record(checks, `wired.${file.split("/").pop()}`, content.includes("tbdp-wiring") || content.includes("tbdp"));
  }

  const gen = wireWebsiteGenerationStart({ industryId: "saas" });
  record(checks, "wire.generation", gen.enabled === true);

  const template = wireTemplateApply({
    project: { title: "T", settings: {} } as import("@/plugins/website/types").GeneratedWebsiteProject,
    templatePackageId: "saas-enterprise",
  });
  record(checks, "wire.template", Boolean(template.settingsPatch.tbdpSectorDnaId));

  const validation = validateWebsiteAgainstTbdp({
    title: "T",
    settings: {},
  } as import("@/plugins/website/types").GeneratedWebsiteProject);
  record(checks, "wire.validation", validation.valid === true);

  record(
    checks,
    "docs.architecture",
    existsSync(join(root, "lib/website/tbdp-wiring/docs/ARCHITECTURE.md")),
  );

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
    tscOk =
      !output.includes("tbdp-wiring") &&
      !output.includes("orchestrator.ts");
  }
  record(checks, "tsc.wiring", tscOk);

  let eslintOk = true;
  try {
    execSync("npx eslint lib/website/tbdp-wiring --max-warnings 0", {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    eslintOk = false;
  }
  record(checks, "eslint.wiring", eslintOk);

  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.filter((c) => !c.ok);

  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(
    join(resultsDir, "phase6-qa-report.json"),
    JSON.stringify({ passed, total: checks.length, checks, failed }, null, 2),
  );

  console.log(`\nTBDP Phase 6 QA: ${passed}/${checks.length} checks passed\n`);
  for (const c of checks) {
    console.log(`  ${c.ok ? "✓" : "✗"} ${c.id}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }
}

main();
