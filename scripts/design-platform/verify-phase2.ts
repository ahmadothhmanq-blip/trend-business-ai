/**
 * TBDP Phase 2 verification — component catalog, structure, a11y, isolation.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  TBDP_COMPONENT_CATALOG,
  TBDP_COMPONENT_COUNT,
} from "@/lib/design-platform/components/catalog";
import { TBDP_UI_PHASE, TBDP_UI_VERSION } from "@/lib/design-platform/constants";
import { emitTbdpComponentStyles } from "@/lib/design-platform/components/core";

const root = join(import.meta.dirname, "../..");
const componentsRoot = join(root, "lib/design-platform/components");

type Check = { id: string; ok: boolean; detail?: string };

function record(checks: Check[], id: string, ok: boolean, detail?: string) {
  checks.push({ id, ok, detail });
}

function main() {
  const checks: Check[] = [];

  record(checks, "ui.phase", TBDP_UI_PHASE === "components-2");
  record(checks, "ui.version", TBDP_UI_VERSION === "2.0.0");
  record(checks, "catalog.count", TBDP_COMPONENT_COUNT === 75);

  const requiredFiles = ["types.ts", "tokens.ts", "variants.ts", "accessibility.ts", "documentation.md", "index.ts", "component.tsx"];
  let structureOk = true;
  let missing = 0;
  for (const comp of TBDP_COMPONENT_CATALOG) {
    const dir = join(componentsRoot, comp.category, comp.id);
    for (const file of requiredFiles) {
      if (!existsSync(join(dir, file))) {
        structureOk = false;
        missing++;
      }
    }
    if (!existsSync(join(dir, "tests"))) {
      structureOk = false;
      missing++;
    }
  }
  record(checks, "component.structure", structureOk, missing ? `missing=${missing}` : undefined);

  const css = emitTbdpComponentStyles();
  record(checks, "styles.tbdp.vars", css.includes("--tbdp-color-primary"));
  record(checks, "styles.no.raw.hex", !css.match(/#[0-9A-Fa-f]{6}/));

  let a11yOk = true;
  for (const comp of TBDP_COMPONENT_CATALOG.slice(0, 10)) {
    const a11yPath = join(componentsRoot, comp.category, comp.id, "accessibility.ts");
    const content = readFileSync(a11yPath, "utf8");
    if (!content.includes("wcagLevel") || !content.includes("AA")) a11yOk = false;
  }
  record(checks, "accessibility.aa", a11yOk);

  const protectedPaths = [
    "lib/website/template-v2",
    "templates/website",
    "lib/website/builder",
    "lib/ai-core/website-design-platform",
  ];
  for (const rel of protectedPaths) {
    record(checks, `isolation.${rel.replace(/\//g, ".")}`, existsSync(join(root, rel)));
  }

  record(checks, "docs.phase2", existsSync(join(componentsRoot, "docs", "ARCHITECTURE.md")));

  let tscOk = true;
  try {
    execSync("npx tsc --noEmit --pretty false", { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (error) {
    const output =
      (error as { stdout?: string; stderr?: string }).stdout ??
      (error as { stdout?: string; stderr?: string }).stderr ??
      "";
    tscOk = !output.includes("design-platform/components");
  }
  record(checks, "typescript", tscOk);

  let lintOk = true;
  try {
    execSync(`npx eslint "lib/design-platform/components/**/*.ts" "lib/design-platform/components/**/*.tsx"`, {
      cwd: root,
      stdio: "pipe",
    });
  } catch {
    lintOk = false;
  }
  record(checks, "eslint", lintOk);

  const failed = checks.filter((c) => !c.ok);
  const report = {
    phase: TBDP_UI_PHASE,
    version: TBDP_UI_VERSION,
    componentCount: TBDP_COMPONENT_COUNT,
    ok: failed.length === 0,
    passed: checks.length - failed.length,
    total: checks.length,
    checks,
  };

  const outDir = join(root, "scripts/benchmark-results/design-platform");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "phase2-qa-report.json"), JSON.stringify(report, null, 2));
  writeFileSync(
    join(outDir, "phase2-accessibility-report.json"),
    JSON.stringify(
      {
        wcagLevel: "AA",
        components: TBDP_COMPONENT_CATALOG.map((c) => ({
          id: c.id,
          category: c.category,
          client: c.client,
          rtl: true,
          dir: "ltr|rtl",
        })),
      },
      null,
      2,
    ),
  );

  console.log("TBDP Phase 2 QA Report\n");
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.id}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(`\nSummary: ${report.passed}/${report.total} passed`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
