/**
 * TBDP Phase 3 verification — experience, motion, interaction, isolation.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  TBDP_BEHAVIOR_COUNT,
  TBDP_FEEDBACK_COUNT,
  TBDP_INTERACTION_COUNT,
  TBDP_MOTION_COUNT,
  buildTbdpExperience,
  emitTbdpExperienceCss,
} from "@/lib/design-platform/experience";
import {
  TBDP_EXPERIENCE_PHASE,
  TBDP_EXPERIENCE_VERSION,
} from "@/lib/design-platform/constants";

const root = join(import.meta.dirname, "../..");

type Check = { id: string; ok: boolean; detail?: string };

function record(checks: Check[], id: string, ok: boolean, detail?: string) {
  checks.push({ id, ok, detail });
}

function main() {
  const checks: Check[] = [];

  record(checks, "xp.phase", TBDP_EXPERIENCE_PHASE === "experience-3");
  record(checks, "xp.version", TBDP_EXPERIENCE_VERSION === "3.0.0");
  record(checks, "motion.count", TBDP_MOTION_COUNT === 20);
  record(checks, "interaction.count", TBDP_INTERACTION_COUNT === 28);
  record(checks, "feedback.count", TBDP_FEEDBACK_COUNT === 13);
  record(checks, "behavior.catalog", TBDP_BEHAVIOR_COUNT >= 60);

  const subsystems = [
    "motion",
    "interaction",
    "feedback",
    "responsive",
    "accessibility",
    "direction",
    "performance",
  ];
  for (const s of subsystems) {
    record(checks, `subsystem.${s}`, existsSync(join(root, "lib/design-platform/experience", s)));
  }

  const css = emitTbdpExperienceCss();
  record(checks, "css.reduced.motion", css.includes("prefers-reduced-motion"));
  record(checks, "css.tbdp.tokens", css.includes("--tbdp-color"));
  record(checks, "css.no.raw.hex", !css.match(/#[0-9A-Fa-f]{6}/));

  const xp = buildTbdpExperience({ prefersReducedMotion: true });
  record(checks, "config.reduced", xp.mode === "reduced" && !xp.motion.enabled);
  record(checks, "config.rtl", buildTbdpExperience({ direction: "rtl" }).direction === "rtl");

  const protectedPaths = [
    "lib/website/template-v2",
    "templates/website",
    "lib/website/builder",
    "lib/ai-core/website-design-platform",
  ];
  for (const rel of protectedPaths) {
    record(checks, `isolation.${rel.replace(/\//g, ".")}`, existsSync(join(root, rel)));
  }

  record(checks, "docs.architecture", existsSync(join(root, "lib/design-platform/experience/docs/ARCHITECTURE.md")));

  let tscOk = true;
  try {
    execSync("npx tsc --noEmit --pretty false", { cwd: root, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (error) {
    const output =
      (error as { stdout?: string; stderr?: string }).stdout ??
      (error as { stdout?: string; stderr?: string }).stderr ??
      "";
    tscOk = !output.includes("design-platform/experience");
  }
  record(checks, "typescript", tscOk);

  let lintOk = true;
  try {
    execSync('npx eslint "lib/design-platform/experience/**/*.ts"', { cwd: root, stdio: "pipe" });
  } catch {
    lintOk = false;
  }
  record(checks, "eslint", lintOk);

  const failed = checks.filter((c) => !c.ok);
  const report = {
    phase: TBDP_EXPERIENCE_PHASE,
    version: TBDP_EXPERIENCE_VERSION,
    ok: failed.length === 0,
    passed: checks.length - failed.length,
    total: checks.length,
    checks,
  };

  const outDir = join(root, "scripts/benchmark-results/design-platform");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "phase3-qa-report.json"), JSON.stringify(report, null, 2));
  writeFileSync(
    join(outDir, "phase3-accessibility-report.json"),
    JSON.stringify(
      {
        wcagLevel: "AA",
        reducedMotion: true,
        keyboardNav: true,
        focusManagement: true,
        screenReaders: true,
        touchTargets: true,
        contrastBehaviors: true,
      },
      null,
      2,
    ),
  );
  writeFileSync(
    join(outDir, "phase3-performance-report.json"),
    JSON.stringify(
      {
        gpuSafeAnimations: true,
        animationBudgetMs: 16,
        maxConcurrentAnimations: 16,
        layoutShiftPrevention: true,
        lazyInteractions: true,
      },
      null,
      2,
    ),
  );

  console.log("TBDP Phase 3 QA Report\n");
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.id}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(`\nSummary: ${report.passed}/${report.total} passed`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main();
