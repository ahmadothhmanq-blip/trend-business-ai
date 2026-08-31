/**
 * Single dev-server lifecycle for local development and QA harnesses.
 *
 * Next.js 16 uses a project-level lock (.next/dev/lock) — only one `next dev`
 * per repo regardless of port. Multiple background `npm run dev` invocations
 * (e.g. from agents) leave orphan processes and block new starts.
 */
import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadEnvLocal,
  resolveDevPort,
  resolveHarnessBaseUrl,
} from "./dev-base-url.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const projectRoot = join(__dirname, "../..");
const LOCK_PATH = join(projectRoot, ".next/dev/lock");
const HARNESS_MARKER = join(projectRoot, ".next/dev/harness-owner.json");

let startedByHarness = false;

export function getDevLockPath() {
  return LOCK_PATH;
}

export function readDevLockInfo() {
  if (!existsSync(LOCK_PATH)) return null;
  try {
    return JSON.parse(readFileSync(LOCK_PATH, "utf8"));
  } catch {
    return null;
  }
}

/** True when the PID still exists (cross-platform). */
export function isPidAlive(pid) {
  if (!pid || !Number.isFinite(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err?.code === "EPERM";
  }
}

export async function probeHealth(baseUrl, timeoutMs = 3000) {
  const url = `${String(baseUrl).replace(/\/+$/, "")}/api/health`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/** Nested App Router API routes can go stale while /api/health still passes. */
export async function probeWebsiteBuilderApiRouting(baseUrl, timeoutMs = 3000) {
  const url = `${String(baseUrl).replace(/\/+$/, "")}/api/website-builder/00000000-0000-4000-8000-000000000001/review`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    const contentType = res.headers.get("content-type") ?? "";
    return res.status === 401 && contentType.includes("application/json");
  } catch {
    return false;
  }
}

function normalizeBase(url) {
  return String(url || "").replace(/\/+$/, "");
}

function portFromBase(baseUrl) {
  try {
    const u = new URL(baseUrl);
    if (u.port) return Number.parseInt(u.port, 10);
    return u.protocol === "https:" ? 443 : 80;
  } catch {
    return null;
  }
}

/**
 * Returns an active dev server if health or lockfile+PID proves one is running.
 */
export async function findActiveDevServer() {
  const expectedBase = normalizeBase(resolveHarnessBaseUrl());
  const lock = readDevLockInfo();
  const lockBase = lock?.appUrl ? normalizeBase(lock.appUrl) : null;

  if (await probeHealth(expectedBase)) {
    const routingOk = await probeWebsiteBuilderApiRouting(expectedBase);
    if (routingOk) {
      return { baseUrl: expectedBase, lock, healthy: true, source: "expected" };
    }
    if (lock?.pid && isPidAlive(lock.pid)) {
      return {
        baseUrl: expectedBase,
        lock,
        healthy: false,
        source: "stale-api-routing",
      };
    }
  }

  if (lockBase && lockBase !== expectedBase && (await probeHealth(lockBase))) {
    const routingOk = await probeWebsiteBuilderApiRouting(lockBase);
    if (routingOk) {
      return { baseUrl: lockBase, lock, healthy: true, source: "lockfile-url" };
    }
    if (lock?.pid && isPidAlive(lock.pid)) {
      return {
        baseUrl: lockBase,
        lock,
        healthy: false,
        source: "stale-api-routing",
      };
    }
  }

  if (lock?.pid && isPidAlive(lock.pid)) {
    return {
      baseUrl: lockBase || expectedBase,
      lock,
      healthy: false,
      source: "pid-alive",
    };
  }

  return null;
}

export function clearStaleLock() {
  const lock = readDevLockInfo();
  if (lock?.pid && isPidAlive(lock.pid)) {
    return { cleared: false, reason: "process-still-running", pid: lock.pid };
  }
  if (!existsSync(LOCK_PATH)) {
    return { cleared: true, reason: "no-lock" };
  }
  try {
    unlinkSync(LOCK_PATH);
    return { cleared: true, reason: "removed-stale-lock" };
  } catch (err) {
    return { cleared: false, reason: err.message };
  }
}

function stopProcessTree(pid) {
  if (!isPidAlive(pid)) return true;
  try {
    if (process.platform === "win32") {
      // Next.js dev on Windows often ignores a non-forced taskkill.
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGTERM");
    }
  } catch {
    /* may already be gone */
  }

  if (process.platform !== "win32" && isPidAlive(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      /* ignore */
    }
  }

  return !isPidAlive(pid);
}

function killProcessListeningOnPort(port) {
  if (!port || !Number.isFinite(port)) return false;
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const pids = new Set(
        output
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.includes("LISTENING"))
          .map((line) => Number.parseInt(line.split(/\s+/).pop() ?? "", 10))
          .filter((pid) => Number.isFinite(pid) && pid > 0),
      );
      for (const pid of pids) {
        stopProcessTree(pid);
      }
      return pids.size > 0;
    }

    const output = execSync(`lsof -ti tcp:${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const pids = output
      .split(/\s+/)
      .map((value) => Number.parseInt(value, 10))
      .filter((pid) => Number.isFinite(pid) && pid > 0);
    for (const pid of pids) {
      stopProcessTree(pid);
    }
    return pids.length > 0;
  } catch {
    return false;
  }
}

export async function stopDevServer({ waitMs = 10_000 } = {}) {
  const lock = readDevLockInfo();
  if (!lock?.pid) {
    clearStaleLock();
    return { ok: true, action: "no-process" };
  }

  if (!isPidAlive(lock.pid)) {
    clearStaleLock();
    return { ok: true, action: "stale-lock-cleared", pid: lock.pid };
  }

  stopProcessTree(lock.pid);
  const start = Date.now();
  while (Date.now() - start < waitMs) {
    if (!isPidAlive(lock.pid)) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  let alive = isPidAlive(lock.pid);
  if (alive && lock.port) {
    killProcessListeningOnPort(Number(lock.port));
    await new Promise((r) => setTimeout(r, 400));
    alive = isPidAlive(lock.pid);
  }

  if (!alive) {
    clearStaleLock();
    clearHarnessMarker();
  }
  return { ok: !alive, action: alive ? "still-running" : "stopped", pid: lock.pid };
}

export async function waitForHealth(baseUrl, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await probeHealth(baseUrl)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function writeHarnessMarker() {
  mkdirSync(dirname(HARNESS_MARKER), { recursive: true });
  writeFileSync(
    HARNESS_MARKER,
    JSON.stringify({ ownerPid: process.pid, at: Date.now() }, null, 2),
    "utf8",
  );
}

function clearHarnessMarker() {
  try {
    if (existsSync(HARNESS_MARKER)) unlinkSync(HARNESS_MARKER);
  } catch {
    /* ignore */
  }
}

function readHarnessMarker() {
  if (!existsSync(HARNESS_MARKER)) return null;
  try {
    return JSON.parse(readFileSync(HARNESS_MARKER, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Start next dev in the background (for QA harnesses only).
 */
export async function startDevServerBackground() {
  const port = resolveDevPort();
  const baseUrl = normalizeBase(resolveHarnessBaseUrl());

  clearStaleLock();

  const child = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: projectRoot,
    stdio: "ignore",
    detached: true,
    shell: true,
    env: { ...process.env, PORT: String(port) },
  });
  child.unref();

  const healthy = await waitForHealth(baseUrl);
  if (!healthy) {
    throw new Error(`Dev server did not become healthy at ${baseUrl}`);
  }

  startedByHarness = true;
  writeHarnessMarker();
  return { baseUrl, childPid: child.pid };
}

/**
 * Ensure a single healthy dev server exists.
 * - Reuses an existing healthy server when possible.
 * - Stops stale/orphan/wrong-port instances before starting.
 */
export async function ensureDevServer({ allowStart = true } = {}) {
  loadEnvLocal();
  const expectedBase = normalizeBase(resolveHarnessBaseUrl());
  const expectedPort = resolveDevPort();

  const active = await findActiveDevServer();
  if (active?.healthy) {
    const activePort = portFromBase(active.baseUrl);
    if (activePort === expectedPort || active.baseUrl === expectedBase) {
      return { action: "reuse", baseUrl: active.baseUrl, lock: active.lock };
    }
    await stopDevServer();
    clearStaleLock();
  } else if (active && !active.healthy) {
    await stopDevServer();
    clearStaleLock();
  } else {
    clearStaleLock();
  }

  if (!allowStart) {
    return { action: "missing", baseUrl: null };
  }

  const started = await startDevServerBackground();
  return { action: "started", baseUrl: started.baseUrl };
}

/**
 * Foreground dev server for interactive `npm run dev`.
 */
export async function startDevServerForeground() {
  loadEnvLocal();
  const expectedBase = normalizeBase(resolveHarnessBaseUrl());
  const port = resolveDevPort();

  const active = await findActiveDevServer();
  if (active?.healthy) {
    console.log(`[dev] Server already running at ${active.baseUrl}`);
    if (active.lock?.pid) console.log(`[dev] PID ${active.lock.pid}`);
    console.log("[dev] Reusing existing server — stop with: npm run dev:stop");
    return { action: "reuse", baseUrl: active.baseUrl };
  }

  if (active && !active.healthy) {
    if (active.source === "stale-api-routing") {
      console.log(
        "[dev] Stale API routing detected — nested routes (e.g. /api/website-builder/*) may return 404. Restarting…",
      );
    } else {
      console.log("[dev] Stopping unhealthy dev server…");
    }
    await stopDevServer();
  }
  clearStaleLock();

  const child = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: String(port) },
  });

  const shutdown = () => {
    if (!child.killed) stopProcessTree(child.pid);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  child.on("exit", (code, signal) => {
    clearHarnessMarker();
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
}

export async function getDevServerStatus() {
  loadEnvLocal();
  const expectedBase = normalizeBase(resolveHarnessBaseUrl());
  const lock = readDevLockInfo();
  const active = await findActiveDevServer();
  const harness = readHarnessMarker();

  return {
    expectedBase,
    expectedPort: resolveDevPort(),
    lock,
    active,
    harness,
    lockPath: LOCK_PATH,
  };
}

/** Stop only when this harness started the server. */
export async function stopHarnessDevServer() {
  if (!startedByHarness) {
    const marker = readHarnessMarker();
    if (!marker || marker.ownerPid !== process.pid) {
      return { ok: true, action: "not-owner" };
    }
  }
  startedByHarness = false;
  clearHarnessMarker();
  return stopDevServer();
}

export function registerHarnessDevServerCleanup() {
  const cleanup = () => {
    if (!startedByHarness) return;
    const lock = readDevLockInfo();
    if (lock?.pid) stopProcessTree(lock.pid);
    clearStaleLock();
    clearHarnessMarker();
    startedByHarness = false;
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });
}
