/**
 * Materialize a generated webapp and run install/typecheck/build.
 * Intended for CI / local verification of OUR scaffolds — not for
 * untrusted customer code in production APIs (see D-004 / WEBSITE_PREVIEW_BUILDER).
 *
 * npm install is reused via webapp-base-workspace when dependency hash matches.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  ensureWebAppBaseWorkspace,
  linkWebAppNodeModules,
  recordWebAppDepCacheResult,
  type WebAppBaseWorkspaceMetrics,
} from "@/lib/ai/webapp-base-workspace";

export type WebAppVerifyStep = "install" | "prisma-generate" | "typecheck" | "build";

export type WebAppVerifyOptions = {
  steps?: WebAppVerifyStep[];
  /** Keep the temp directory for inspection. */
  keepDir?: boolean;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  /** Override dep cache root (tests). */
  depCacheRoot?: string;
  /** Inject npm install for base workspace (tests). */
  runDepInstall?: (workspaceDir: string) => void;
  /** Force a full local npm install in the project dir (disables base cache). */
  disableDepCache?: boolean;
};

export type WebAppVerifyResult = {
  ok: boolean;
  dir: string;
  steps: Array<{ step: WebAppVerifyStep; ok: boolean; durationMs: number; error?: string }>;
  cleaned: boolean;
  depCache?: WebAppBaseWorkspaceMetrics;
};

function writeProjectFiles(dir: string, files: GeneratedProjectFile[]): void {
  for (const file of files) {
    const target = path.join(dir, file.path.replaceAll("\\", "/"));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.content, "utf8");
  }

  const envPath = path.join(dir, ".env");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(
      envPath,
      `DATABASE_URL="file:./dev.db"\nSESSION_SECRET="verify-session-secret"\n`,
      "utf8",
    );
  }
}

function runNpm(
  dir: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  timeoutMs: number,
): void {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npmCmd, args, {
    cwd: dir,
    env,
    stdio: "pipe",
    timeout: timeoutMs,
    windowsHide: true,
    shell: process.platform === "win32",
  });
}

function runNpx(
  dir: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  timeoutMs: number,
): void {
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  execFileSync(npxCmd, args, {
    cwd: dir,
    env,
    stdio: "pipe",
    timeout: timeoutMs,
    windowsHide: true,
    shell: process.platform === "win32",
  });
}

export function materializeWebAppProject(
  files: GeneratedProjectFile[],
  baseDir?: string,
): string {
  const dir =
    baseDir ??
    fs.mkdtempSync(path.join(os.tmpdir(), "webapp-verify-"));
  writeProjectFiles(dir, files);
  return dir;
}

function readGeneratedPackageJson(files: GeneratedProjectFile[]): {
  packageJson?: string;
  lockfile?: string;
} {
  const packageJson = files.find(
    (file) => file.path.replaceAll("\\", "/") === "package.json",
  )?.content;
  const lockfile = files.find(
    (file) => file.path.replaceAll("\\", "/") === "package-lock.json",
  )?.content;
  return { packageJson, lockfile };
}

/**
 * Run verification steps against generated project files.
 * Defaults: install → prisma generate (if schema) → typecheck.
 * Pass `build` explicitly for full next build (slower).
 *
 * `install` uses a reusable base workspace: full npm install only when the
 * dependency hash changes; otherwise node_modules is linked from cache.
 */
export function verifyWebAppProjectBuild(
  files: GeneratedProjectFile[],
  options: WebAppVerifyOptions = {},
): WebAppVerifyResult {
  const dir = materializeWebAppProject(files, options.cwd);
  const hasPrisma = files.some(
    (file) => file.path.replaceAll("\\", "/") === "prisma/schema.prisma",
  );
  const steps: WebAppVerifyStep[] =
    options.steps ??
    (hasPrisma
      ? ["install", "prisma-generate", "typecheck"]
      : ["install", "typecheck"]);
  const timeoutMs = options.timeoutMs ?? 10 * 60_000;
  const env = { ...process.env, ...options.env, CI: "1" };
  const results: WebAppVerifyResult["steps"] = [];
  let depCache: WebAppBaseWorkspaceMetrics | undefined;

  for (const step of steps) {
    const started = Date.now();
    try {
      if (step === "install") {
        if (options.disableDepCache) {
          runNpm(dir, ["install", "--no-audit", "--no-fund"], env, timeoutMs);
        } else {
          const { packageJson, lockfile } = readGeneratedPackageJson(files);
          if (!packageJson) {
            throw new Error("Generated project is missing package.json");
          }
          const metrics = ensureWebAppBaseWorkspace(packageJson, {
            lockfileContent: lockfile,
            cacheRoot: options.depCacheRoot,
            runInstall: options.runDepInstall,
            timeoutMs,
            env,
          });
          const link = linkWebAppNodeModules(dir, metrics.workspaceDir);
          depCache = {
            ...metrics,
            linkDurationMs: link.linkDurationMs,
          };
          recordWebAppDepCacheResult(depCache);
        }
      } else if (step === "prisma-generate") {
        if (hasPrisma) runNpx(dir, ["prisma", "generate"], env, timeoutMs);
      } else if (step === "typecheck") {
        runNpm(dir, ["run", "typecheck"], env, timeoutMs);
      } else if (step === "build") {
        runNpm(dir, ["run", "build"], env, timeoutMs);
      }
      results.push({
        step,
        ok: true,
        durationMs:
          step === "install" && depCache
            ? depCache.installDurationMs + depCache.linkDurationMs
            : Date.now() - started,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error &&
              "stderr" in error &&
              Buffer.isBuffer((error as { stderr?: Buffer }).stderr)
            ? (error as { stderr: Buffer }).stderr.toString("utf8").slice(-4000)
            : String(error);
      results.push({
        step,
        ok: false,
        durationMs: Date.now() - started,
        error: message.slice(0, 4000),
      });
      break;
    }
  }

  const ok = results.length === steps.length && results.every((entry) => entry.ok);
  let cleaned = false;
  if (!options.keepDir && !options.cwd) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      cleaned = true;
    } catch {
      cleaned = false;
    }
  }

  return { ok, dir, steps: results, cleaned, depCache };
}
