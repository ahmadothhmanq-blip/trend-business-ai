import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync, spawn } from "node:child_process";

import { resolveAppPlannerIntegration } from "@/lib/webapp/universal-planner-integration";
import { getLastAppBuilderPlanningMetrics } from "@/lib/webapp/planning-metrics";
import {
  beginAppBuilderPipelineProfiler,
  endAppBuilderPipelineProfiler,
  type PipelineStageId,
} from "@/lib/webapp/pipeline-profiler";
import { getUiRepairMetrics } from "@/lib/webapp/ui-repair-metrics";
import { generateWebApp } from "@/lib/webapp-generator";
import { validateWebAppProject } from "@/lib/ai/webapp-requirements";
import type { WebAppPluginInput, WebAppOutput } from "@/plugins/webapp/types";

loadEnvConfig(process.cwd());

function envOn(name: string) {
  process.env[name] = "1";
}

function flagsFromOutput(output: WebAppOutput) {
  return {
    requiresAuth: output.settings?.requiresAuth === "true",
    requiresDatabase: output.settings?.requiresDatabase === "true",
    requiresDashboard: output.settings?.requiresDashboard === "true",
    isEcommerce: output.settings?.isEcommerce === "true",
    isSaas: output.settings?.isSaas === "true",
    databaseProvider:
      (output.settings?.databaseProvider as "prisma" | "supabase" | "none") ?? "none",
  };
}

async function waitForHttp(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function classifyBottleneck(
  stage: PipelineStageId,
  durationMs: number,
  detail?: Record<string, unknown>,
): string {
  if (durationMs < 30_000) return "—";
  switch (stage) {
    case "planning":
      return "DeepSeek (single unified planning JSON; network/TTFT bound)";
    case "file-generation":
      return `DeepSeek (per-file LLM × ${detail?.aiFileCount ?? detail?.llmCalls ?? "?"}; network bound)`;
    case "repair-loop":
      return detail?.repairedFiles
        ? "DeepSeek (repair regenerations)"
        : "none (no LLM repairs; duration is LLM-repair accumulator)";
    case "hardener":
      return "CPU (deterministic AST/string transforms)";
    case "validation":
      return "CPU (project/contract checks)";
    case "npm-install":
      return "I/O + network (npm registry download + extract; may include postinstall)";
    case "prisma-generate":
      return "CPU + filesystem (Prisma client codegen)";
    case "build":
      return "CPU + filesystem (next build; may re-run prisma generate)";
    case "typescript":
      return "CPU (tsc --noEmit)";
    case "eslint":
      return "CPU (eslint .)";
    case "runtime":
      return "I/O + CPU (server boot + HTTP probe)";
    case "universal-planner":
      return "CPU (deterministic UP/PRE/MAOE; no App Builder Stage-2 DeepSeek)";
    default:
      return "unknown";
  }
}

async function main() {
  envOn("UNIVERSAL_PLANNER_ENABLED");
  envOn("UNIVERSAL_PLANNER_APP_ENABLED");
  process.env.UNIVERSAL_PLANNER_WEBSITE_ENABLED =
    process.env.UNIVERSAL_PLANNER_WEBSITE_ENABLED ?? "0";

  const input: WebAppPluginInput = {
    prompt: "Build a CRUD SaaS dashboard app with auth and an inventory database.",
    appType: "SaaS Dashboard",
    language: "English",
    designStyle: "professional",
    colorStyle: "modern",
    features: ["auth", "dashboard", "database"],
  };

  const profiler = beginAppBuilderPipelineProfiler(`e2e-${Date.now().toString(36)}`);
  const wallStartedAt = Date.now();
  let remainingBlockers: string[] = [];
  let pluginInput: WebAppPluginInput = input;

  try {
    await profiler.measure("universal-planner", async () => {
      const planner = await resolveAppPlannerIntegration({
        input,
        onProgress: (m) => console.log(m),
      });
      assert.equal(planner.enabled, true);
      assert.equal(planner.appServicePlan?.serviceId, "app-builder");
      pluginInput = { ...input, ...(planner.inputPatch ?? {}) };
    });

    const result = await generateWebApp(pluginInput);

    const planning = getLastAppBuilderPlanningMetrics();
    assert.ok(planning, "Stage 2 planning metrics missing");
    assert.ok(
      planning.llmRequestCount === 0 || planning.llmRequestCount === 1,
      `Stage 2 must issue 0 (deterministic) or 1 DeepSeek planning request, got ${planning.llmRequestCount}`,
    );
    if (planning.llmRequestCount === 0) {
      assert.equal(planning.mode, "deterministic-skip");
    }

    assert.ok(result.files?.length, "App Builder produced files");

    const prodValidation = validateWebAppProject(
      result.files,
      flagsFromOutput(result),
      result.appModel?.dataModels.map((m) => m.name) ?? [],
    );

    if (!prodValidation.valid) {
      remainingBlockers = prodValidation.issues;
      throw new Error(
        `Production validator failed:\n${prodValidation.issues.join("\n")}`,
      );
    }

    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-single-"));
    for (const file of result.files) {
      const target = path.join(outDir, file.path);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.content, "utf8");
    }

    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

    await profiler.measure("npm-install", async () => {
      const { ensureWebAppBaseWorkspace, linkWebAppNodeModules } = await import(
        "@/lib/ai/webapp-base-workspace"
      );
      const packageJson = result.files.find((file) => file.path === "package.json")?.content;
      if (!packageJson) throw new Error("Generated project missing package.json");
      console.log("ensure dependency workspace (cached npm install)…");
      const deps = ensureWebAppBaseWorkspace(packageJson);
      linkWebAppNodeModules(outDir, deps.workspaceDir);
      console.log(
        `dep-cache hit=${deps.cacheHit} skipped=${deps.installSkipped} installMs=${deps.installDurationMs}`,
      );
    });

    await profiler.measure("prisma-generate", () => {
      console.log("npx prisma generate…");
      execSync("npx prisma generate", {
        cwd: outDir,
        stdio: "inherit",
        env: process.env,
      });
    });

    await profiler.measure("build", () => {
      console.log("npm run build…");
      execSync("npm run build", {
        cwd: outDir,
        stdio: "inherit",
        env: process.env,
      });
    });

    await profiler.measure("typescript", () => {
      console.log("npm run typecheck…");
      execSync("npm run typecheck", {
        cwd: outDir,
        stdio: "inherit",
        env: process.env,
      });
    });

    await profiler.measure("eslint", () => {
      console.log("npm run lint…");
      execSync("npm run lint", {
        cwd: outDir,
        stdio: "inherit",
        env: process.env,
      });
    });

    const port = 4311;
    await profiler.measure("runtime", async () => {
      console.log("runtime start…");
      const child = spawn(npmCmd, ["start", "--", "-p", String(port)], {
        cwd: outDir,
        env: process.env,
        stdio: "ignore",
        shell: process.platform === "win32",
        windowsHide: true,
      });
      try {
        const runtimeOk = await waitForHttp(`http://127.0.0.1:${port}`, 60_000);
        if (!runtimeOk) throw new Error("Runtime check failed (no HTTP response).");
      } finally {
        if (!child.killed) {
          child.kill("SIGTERM");
        }
      }
    });

    const totalMs = Date.now() - wallStartedAt;
    const report = profiler.report(totalMs);
    const uiMetrics = getUiRepairMetrics();
    const repairRow = report.rows.find((r) => r.stage === "repair-loop");

    const order: PipelineStageId[] = [
      "universal-planner",
      "planning",
      "file-generation",
      "hardener",
      "validation",
      "repair-loop",
      "npm-install",
      "prisma-generate",
      "build",
      "typescript",
      "eslint",
      "runtime",
    ];

    const byStage = new Map(report.rows.map((r) => [r.stage, r]));
    const table = order.map((stage) => {
      const row = byStage.get(stage);
      const durationMs = row?.durationMs ?? 0;
      const percent = row?.percent ?? 0;
      return {
        stage,
        startMs: row?.startMs ?? null,
        endMs: row?.endMs ?? null,
        durationMs,
        percent,
        bottleneck: classifyBottleneck(stage, durationMs, row?.detail),
        detail: row?.detail ?? null,
      };
    });

    console.log(
      JSON.stringify(
        {
          pass: true,
          totalGenerationTimeMs: totalMs,
          repairLoopDurationMs: repairRow?.durationMs ?? 0,
          uiRepair: {
            localUiFixes: uiMetrics.localUiFixes,
            createdBarrel: uiMetrics.createdBarrel,
            repairRoundsAvoided: uiMetrics.repairRoundsAvoided,
            estimatedSecondsSaved: uiMetrics.estimatedSecondsSaved,
            remainingLlmRepairReasons: uiMetrics.remainingLlmRepairReasons,
          },
          planning,
          stages: table,
          validation: {
            generation: "PASS",
            install: "PASS",
            build: "PASS",
            typeScript: "PASS",
            eslint: "PASS",
            runtime: "PASS",
          },
          remainingBlockers: [],
          evidence: {
            title: result.title,
            fileCount: result.files.length,
            outDir,
          },
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const totalMs = Date.now() - wallStartedAt;
    const report = profiler.report(totalMs);
    const uiMetrics = getUiRepairMetrics();
    const repairRow = report.rows.find((r) => r.stage === "repair-loop");
    console.error(error);
    console.log(
      JSON.stringify(
        {
          pass: false,
          totalGenerationTimeMs: totalMs,
          repairLoopDurationMs: repairRow?.durationMs ?? 0,
          uiRepair: {
            localUiFixes: uiMetrics.localUiFixes,
            createdBarrel: uiMetrics.createdBarrel,
            repairRoundsAvoided: uiMetrics.repairRoundsAvoided,
            estimatedSecondsSaved: uiMetrics.estimatedSecondsSaved,
            remainingLlmRepairReasons: uiMetrics.remainingLlmRepairReasons,
          },
          stages: report.rows,
          remainingBlockers:
            remainingBlockers.length > 0
              ? remainingBlockers
              : [error instanceof Error ? error.message : String(error)],
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } finally {
    endAppBuilderPipelineProfiler();
  }
}

void main();
