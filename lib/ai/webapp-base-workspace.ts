/**
 * Reusable App Builder dependency workspace.
 * Caches node_modules by package.json dependency hash so verify/build
 * runs skip full npm install when deps are unchanged.
 *
 * Does not alter generated project file contents — only the install/verify workspace.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type WebAppDependencySnapshot = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  lockfile?: string;
};

export type WebAppBaseWorkspaceMetrics = {
  hash: string;
  cacheHit: boolean;
  installSkipped: boolean;
  installDurationMs: number;
  linkDurationMs: number;
  workspaceDir: string;
  invalidationReason?: string;
};

export type EnsureWebAppBaseWorkspaceOptions = {
  /** Override cache root (tests). Default: os.tmpdir()/webapp-dep-workspaces */
  cacheRoot?: string;
  /** Inject install for unit tests. */
  runInstall?: (workspaceDir: string) => void;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
};

const READY_MARKER = ".webapp-deps-ready";

export function getDefaultWebAppDepCacheRoot(): string {
  return path.join(os.tmpdir(), "webapp-dep-workspaces");
}

/**
 * Stable hash of dependency ranges (+ optional lockfile).
 * Project name/scripts/metadata are ignored so scaffolds with different titles share a cache.
 */
export function computeWebAppDependencyHash(
  packageJsonContent: string,
  lockfileContent?: string,
): string {
  const snapshot = extractDependencySnapshot(packageJsonContent, lockfileContent);
  const payload = JSON.stringify({
    dependencies: sortRecord(snapshot.dependencies),
    devDependencies: sortRecord(snapshot.devDependencies),
    lockfile: snapshot.lockfile ?? null,
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

export function extractDependencySnapshot(
  packageJsonContent: string,
  lockfileContent?: string,
): WebAppDependencySnapshot {
  let parsed: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  try {
    parsed = JSON.parse(packageJsonContent) as typeof parsed;
  } catch {
    parsed = {};
  }
  return {
    dependencies: { ...(parsed.dependencies ?? {}) },
    devDependencies: { ...(parsed.devDependencies ?? {}) },
    lockfile: lockfileContent?.trim() ? lockfileContent : undefined,
  };
}

function sortRecord(input: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(input).sort((a, b) => a.localeCompare(b))) {
    out[key] = input[key]!;
  }
  return out;
}

function defaultRunInstall(
  workspaceDir: string,
  timeoutMs: number,
  env: NodeJS.ProcessEnv,
): void {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npmCmd, ["install", "--no-audit", "--no-fund"], {
    cwd: workspaceDir,
    env,
    stdio: "pipe",
    timeout: timeoutMs,
    windowsHide: true,
    shell: process.platform === "win32",
  });
}

export function isWebAppDepWorkspaceHealthy(
  workspaceDir: string,
  expectedHash: string,
): { healthy: boolean; reason?: string } {
  const markerPath = path.join(workspaceDir, READY_MARKER);
  const nodeModules = path.join(workspaceDir, "node_modules");
  if (!fs.existsSync(nodeModules)) {
    return { healthy: false, reason: "missing-node-modules" };
  }
  if (!fs.existsSync(markerPath)) {
    return { healthy: false, reason: "missing-ready-marker" };
  }
  const marker = fs.readFileSync(markerPath, "utf8").trim();
  if (marker !== expectedHash) {
    return { healthy: false, reason: "hash-mismatch" };
  }
  // Spot-check a critical package present in every App Builder scaffold.
  const nextPkg = path.join(nodeModules, "next", "package.json");
  if (!fs.existsSync(nextPkg)) {
    return { healthy: false, reason: "corrupted-node-modules" };
  }
  return { healthy: true };
}

/**
 * Ensure a dependency workspace exists for this package.json hash.
 * Cache hit → no npm install. Miss / corrupt → install once into the workspace.
 */
export function ensureWebAppBaseWorkspace(
  packageJsonContent: string,
  options: EnsureWebAppBaseWorkspaceOptions & { lockfileContent?: string } = {},
): WebAppBaseWorkspaceMetrics {
  const hash = computeWebAppDependencyHash(
    packageJsonContent,
    options.lockfileContent,
  );
  const cacheRoot = options.cacheRoot ?? getDefaultWebAppDepCacheRoot();
  const workspaceDir = path.join(cacheRoot, hash);
  fs.mkdirSync(workspaceDir, { recursive: true });

  const health = isWebAppDepWorkspaceHealthy(workspaceDir, hash);
  if (health.healthy) {
    return {
      hash,
      cacheHit: true,
      installSkipped: true,
      installDurationMs: 0,
      linkDurationMs: 0,
      workspaceDir,
    };
  }

  // Refresh package.json used for install (name irrelevant).
  // Strip lifecycle scripts that need project files (e.g. postinstall: prisma generate).
  // Generated project package.json is unchanged; verify still runs prisma generate after link.
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(packageJsonContent) as Record<string, unknown>;
  } catch {
    pkg = { name: "webapp-dep-workspace", private: true };
  }
  pkg.name = `webapp-deps-${hash}`;
  pkg.private = true;
  if (pkg.scripts && typeof pkg.scripts === "object" && !Array.isArray(pkg.scripts)) {
    const scripts = { ...(pkg.scripts as Record<string, unknown>) };
    delete scripts.postinstall;
    delete scripts.prepare;
    delete scripts.prepublishOnly;
    pkg.scripts = scripts;
  }
  fs.writeFileSync(
    path.join(workspaceDir, "package.json"),
    `${JSON.stringify(pkg, null, 2)}\n`,
    "utf8",
  );
  if (options.lockfileContent) {
    fs.writeFileSync(
      path.join(workspaceDir, "package-lock.json"),
      options.lockfileContent,
      "utf8",
    );
  }

  // Drop broken node_modules before reinstall.
  const nodeModules = path.join(workspaceDir, "node_modules");
  if (fs.existsSync(nodeModules)) {
    fs.rmSync(nodeModules, { recursive: true, force: true });
  }
  const markerPath = path.join(workspaceDir, READY_MARKER);
  if (fs.existsSync(markerPath)) {
    fs.rmSync(markerPath, { force: true });
  }

  const timeoutMs = options.timeoutMs ?? 10 * 60_000;
  const env = { ...process.env, ...options.env, CI: "1" };
  const started = Date.now();
  const runInstall =
    options.runInstall ??
    ((dir: string) => defaultRunInstall(dir, timeoutMs, env));
  runInstall(workspaceDir);
  const installDurationMs = Date.now() - started;

  fs.writeFileSync(markerPath, `${hash}\n`, "utf8");

  return {
    hash,
    cacheHit: false,
    installSkipped: false,
    installDurationMs,
    linkDurationMs: 0,
    workspaceDir,
    invalidationReason: health.reason ?? "cold-cache",
  };
}

/** Marker file read by generated next.config.ts (ISOLATED_NEXT_CONFIG). */
export const WEBAPP_TURBOPACK_ROOT_MARKER = ".webapp-turbopack-root";

/** Optional env override for turbopack.root (absolute path). */
export const WEBAPP_TURBOPACK_ROOT_ENV = "WEBAPP_TURBOPACK_ROOT";

/**
 * Lowest common filesystem ancestor of the materialized project and the
 * Base Workspace cache dir. Turbopack requires linked node_modules to resolve
 * inside turbopack.root.
 */
export function computeWebAppTurbopackRoot(
  projectDir: string,
  workspaceDir: string,
): string {
  const project = path.resolve(projectDir);
  const workspace = path.resolve(workspaceDir);
  const sep = path.sep;
  const projectParts = project.split(sep);
  const workspaceParts = workspace.split(sep);
  const common: string[] = [];
  const limit = Math.min(projectParts.length, workspaceParts.length);
  for (let i = 0; i < limit; i += 1) {
    if (projectParts[i] !== workspaceParts[i]) break;
    common.push(projectParts[i]!);
  }
  if (common.length === 0) {
    throw new Error(
      `Cannot compute turbopack.root: no common ancestor for ${project} and ${workspace}`,
    );
  }

  // Windows drive root must keep the trailing separator ("C:\").
  const root =
    common.length === 1 && /^[A-Za-z]:$/i.test(common[0]!)
      ? `${common[0]}${sep}`
      : path.resolve(path.join(...common));

  if (!isPathInsideOrEqual(project, root) || !isPathInsideOrEqual(workspace, root)) {
    throw new Error(
      `Computed turbopack.root ${root} does not contain project and workspace`,
    );
  }
  return root;
}

function isPathInsideOrEqual(target: string, root: string): boolean {
  const resolvedTarget = path.resolve(target);
  const resolvedRoot = path.resolve(root);
  if (resolvedTarget === resolvedRoot) return true;
  const prefix = resolvedRoot.endsWith(path.sep)
    ? resolvedRoot
    : `${resolvedRoot}${path.sep}`;
  return resolvedTarget.startsWith(prefix);
}

/**
 * Write the turbopack.root marker so Next.js 16 Turbopack accepts a
 * junction/symlink to the Base Workspace node_modules.
 */
export function applyWebAppTurbopackRoot(
  projectDir: string,
  workspaceDir: string,
): string {
  const root = computeWebAppTurbopackRoot(projectDir, workspaceDir);
  fs.writeFileSync(
    path.join(projectDir, WEBAPP_TURBOPACK_ROOT_MARKER),
    `${root}\n`,
    "utf8",
  );
  return root;
}

/**
 * Attach cached node_modules into a materialized project directory.
 * Uses a directory junction on Windows and a symlink elsewhere.
 * Also applies turbopack.root so Turbopack can resolve the out-of-app link.
 */
export function linkWebAppNodeModules(
  projectDir: string,
  workspaceDir: string,
): { linkDurationMs: number; turbopackRoot: string } {
  const started = Date.now();
  const source = path.join(workspaceDir, "node_modules");
  const target = path.join(projectDir, "node_modules");
  if (!fs.existsSync(source)) {
    throw new Error(`Base workspace missing node_modules: ${source}`);
  }
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
  try {
    if (process.platform === "win32") {
      fs.symlinkSync(source, target, "junction");
    } else {
      fs.symlinkSync(source, target, "dir");
    }
  } catch {
    // Fallback: copy when symlink/junction is unavailable.
    fs.cpSync(source, target, { recursive: true });
  }
  const turbopackRoot = applyWebAppTurbopackRoot(projectDir, workspaceDir);
  return { linkDurationMs: Date.now() - started, turbopackRoot };
}

/** In-memory counters for verify tooling (process lifetime). */
const runtimeMetrics = {
  ensures: 0,
  hits: 0,
  misses: 0,
  previousInstallDurationMs: 0,
  lastInstallDurationMs: 0,
};

export function recordWebAppDepCacheResult(metrics: WebAppBaseWorkspaceMetrics): void {
  runtimeMetrics.ensures += 1;
  if (metrics.cacheHit) {
    runtimeMetrics.hits += 1;
  } else {
    runtimeMetrics.misses += 1;
    runtimeMetrics.previousInstallDurationMs = runtimeMetrics.lastInstallDurationMs;
    runtimeMetrics.lastInstallDurationMs = metrics.installDurationMs;
  }
}

export function getWebAppDepCacheRuntimeMetrics(): {
  ensures: number;
  hits: number;
  misses: number;
  hitRate: number;
  previousInstallDurationMs: number;
  lastInstallDurationMs: number;
} {
  const ensures = runtimeMetrics.ensures;
  return {
    ensures,
    hits: runtimeMetrics.hits,
    misses: runtimeMetrics.misses,
    hitRate: ensures === 0 ? 0 : runtimeMetrics.hits / ensures,
    previousInstallDurationMs: runtimeMetrics.previousInstallDurationMs,
    lastInstallDurationMs: runtimeMetrics.lastInstallDurationMs,
  };
}

export function resetWebAppDepCacheRuntimeMetrics(): void {
  runtimeMetrics.ensures = 0;
  runtimeMetrics.hits = 0;
  runtimeMetrics.misses = 0;
  runtimeMetrics.previousInstallDurationMs = 0;
  runtimeMetrics.lastInstallDurationMs = 0;
}

/** Documented invalidation rules for operators/tests. */
export const WEBAPP_DEP_CACHE_INVALIDATION_RULES = [
  "dependency or devDependency range change in package.json",
  "package-lock.json content change when provided",
  "missing node_modules in workspace",
  "missing .webapp-deps-ready marker",
  "ready marker hash mismatch",
  "corrupted node_modules (e.g. next package missing)",
] as const;
