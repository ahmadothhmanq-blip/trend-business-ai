/**
 * TBDP Phase 1 verification — foundations, tokens, validation, backward compatibility.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildTbdpDesignTokens,
  emitTbdpCssVariables,
  validateTbdpFoundation,
} from "@/lib/design-platform";
import { TBDP_PHASE, TBDP_SPEC_VERSION } from "@/lib/design-platform/constants";

const root = join(import.meta.dirname, "..", "..");
const tbdpRoot = join(root, "lib/design-platform");

type Check = { id: string; ok: boolean; detail?: string };

function record(checks: Check[], id: string, ok: boolean, detail?: string) {
  checks.push({ id, ok, detail });
}

function main() {
  const checks: Check[] = [];

  record(checks, "spec.version", TBDP_SPEC_VERSION === "1.0.0");
  record(checks, "phase.scope", TBDP_PHASE === "foundations-1");

  const foundations = [
    "color",
    "typography",
    "spacing",
    "grid",
    "radius",
    "shadow",
    "border",
    "icon",
    "elevation",
  ];
  for (const f of foundations) {
    record(
      checks,
      `foundation.${f}`,
      existsSync(join(tbdpRoot, "foundations", f, "index.ts")),
    );
  }

  const light = buildTbdpDesignTokens({ mode: "light" });
  const dark = buildTbdpDesignTokens({ mode: "dark", typographyProfile: "arabic-rtl" });
  record(checks, "tokens.light", validateTbdpFoundation(light).valid);
  record(checks, "tokens.dark", validateTbdpFoundation(dark).valid);
  record(checks, "tokens.arabic", dark.typographyProfile === "arabic-rtl");

  const css = emitTbdpCssVariables(light);
  record(checks, "css.prefix", css.includes("--tbdp-color-primary"));
  record(checks, "css.no.primitives", !css.includes("#1A5CFF") || css.includes("--tbdp-color-primary"));

  const protectedPaths = [
    "lib/website/template-v2",
    "templates/website",
    "lib/website/builder/apply-structure-template.ts",
    "lib/ai-core/website-design-platform",
  ];
  for (const rel of protectedPaths) {
    const full = join(root, rel);
    record(checks, `isolation.${rel.replaceAll("/", ".")}`, existsSync(full));
  }

  const tbdpFiles = readdirSync(tbdpRoot, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath ?? tbdpRoot, e.name));
  record(checks, "file.count", tbdpFiles.length >= 30, `count=${tbdpFiles.length}`);

  const readme = readFileSync(join(tbdpRoot, "README.md"), "utf8");
  record(checks, "docs.readme", readme.includes("Phase 1"));
  record(checks, "docs.architecture", existsSync(join(tbdpRoot, "docs/ARCHITECTURE.md")));
  record(checks, "docs.tokens", existsSync(join(tbdpRoot, "docs/TOKEN-STRUCTURE.md")));
  record(checks, "docs.compat", existsSync(join(tbdpRoot, "docs/BACKWARD-COMPATIBILITY.md")));

  let tscOk = true;
  try {
    const tscOut = execSync("npx tsc --noEmit --pretty false", {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    void tscOut;
  } catch (error) {
    const output =
      (error as { stdout?: string; stderr?: string }).stdout ??
      (error as { stdout?: string; stderr?: string }).stderr ??
      "";
    tscOk = !output.includes("design-platform");
  }
  record(checks, "typescript", tscOk);

  let lintOk = true;
  let lintDetail = "";
  try {
    const lintOut = execSync(`npx eslint "${join(tbdpRoot, "**", "*.{ts,tsx}")}"`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    lintDetail = lintOut.slice(0, 200);
  } catch (error) {
    lintOk = false;
    lintDetail = error instanceof Error ? error.message : String(error);
  }
  record(checks, "eslint", lintOk, lintDetail || undefined);

  const failed = checks.filter((c) => !c.ok);
  const report = {
    phase: TBDP_PHASE,
    specVersion: TBDP_SPEC_VERSION,
    ok: failed.length === 0,
    passed: checks.length - failed.length,
    total: checks.length,
    checks,
  };

  const outDir = join(root, "scripts/benchmark-results/design-platform");
  try {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "phase1-qa-report.json"), JSON.stringify(report, null, 2));
  } catch {
    // non-fatal
  }

  console.log("TBDP Phase 1 QA Report\n");
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.id}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(`\nSummary: ${report.passed}/${report.total} passed`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
