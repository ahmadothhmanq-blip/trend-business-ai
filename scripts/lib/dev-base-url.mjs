/**
 * Shared local dev base URL resolution for QA / E2E / smoke scripts.
 *
 * Priority: QA_BASE → NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_APP_URL → http://localhost:{PORT|DEV_PORT|3003}
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");

export const DEFAULT_DEV_PORT = 3003;

export function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

export function resolveDevPort() {
  const raw =
    process.env.PORT?.trim() ||
    process.env.DEV_PORT?.trim() ||
    String(DEFAULT_DEV_PORT);
  const port = Number.parseInt(raw, 10);
  return Number.isFinite(port) && port > 0 ? port : DEFAULT_DEV_PORT;
}

export function resolveLocalDevBaseUrl(host = "localhost") {
  return `http://${host}:${resolveDevPort()}`;
}

/** Base URL for QA/E2E/smoke HTTP probes against the dev server. */
export function resolveQaBaseUrl() {
  const qa = process.env.QA_BASE?.trim();
  if (qa) return qa.replace(/\/+$/, "");

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/+$/, "");

  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (app) return app.replace(/\/+$/, "");

  return resolveLocalDevBaseUrl();
}

/**
 * Base URL for local dev-server lifecycle + local E2E harnesses.
 * Never targets a remote NEXT_PUBLIC_SITE_URL — only QA_BASE or localhost.
 */
export function resolveHarnessBaseUrl() {
  const qa = process.env.QA_BASE?.trim();
  if (qa) return qa.replace(/\/+$/, "");

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site && /localhost|127\.0\.0\.1/i.test(site)) {
    return site.replace(/\/+$/, "");
  }

  const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (app && /localhost|127\.0\.0\.1/i.test(app)) {
    return app.replace(/\/+$/, "");
  }

  return resolveLocalDevBaseUrl();
}

/** CLI argv override, then {@link resolveHarnessBaseUrl}. */
export function resolveProbeBaseUrl(argvOverride) {
  const fromArg = argvOverride?.trim();
  if (fromArg) return fromArg.replace(/\/+$/, "");
  return resolveHarnessBaseUrl();
}
