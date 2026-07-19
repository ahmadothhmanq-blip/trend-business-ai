/**
 * Smoke: DeepSeek is the default text/code provider; multi-provider registry intact.
 * Optional HTTP: CORE_SMOKE_BASE_URL=https://… probes Core generate APIs (expect 401).
 *
 * Usage: node scripts/smoke-ai-providers.mjs
 */
import assert from "node:assert/strict";
import { access, existsSync, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const accessAsync = promisify(access);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const requiredFiles = [
  "lib/ai/provider-config.ts",
  "lib/ai/provider-manager.ts",
  "lib/ai/adapters/deepseek-adapter.ts",
  "lib/ai/adapters/openai-adapter.ts",
  "lib/ai/adapters/anthropic-adapter.ts",
  "lib/deepseek.ts",
  "lib/webapp-generator.ts",
  "lib/landing-page-generator.ts",
  "lib/content-generator.ts",
  "lib/agent-runner.ts",
  "plugins/ai-agents/index.ts",
  "plugins/types.ts",
];

for (const rel of requiredFiles) {
  await accessAsync(path.join(root, rel));
}

const configSrc = readFileSync(
  path.join(root, "lib/ai/provider-config.ts"),
  "utf8",
);
assert.match(
  configSrc,
  /DEFAULT_TEXT_PROVIDER:\s*AIProviderName\s*=\s*"deepseek"/,
  "DEFAULT_TEXT_PROVIDER must be deepseek",
);
assert.match(
  configSrc,
  /name:\s*"openai"/,
  "OpenAI must remain in PROVIDER_REGISTRY for multi-provider",
);
assert.match(
  configSrc,
  /name:\s*"claude"/,
  "Claude must remain in PROVIDER_REGISTRY for multi-provider",
);

const agentSrc = readFileSync(
  path.join(root, "plugins/ai-agents/index.ts"),
  "utf8",
);
assert.match(
  agentSrc,
  /preferredProvider:\s*"deepseek"/,
  "AI Agents plugin must prefer deepseek",
);

const deepseekConfigured = Boolean(process.env.DEEPSEEK_API_KEY?.trim());
assert.ok(
  deepseekConfigured,
  "DEEPSEEK_API_KEY must be set for text/code generation",
);

// Live DeepSeek key probe (same as go-live / staging)
const res = await fetch("https://api.deepseek.com/models", {
  headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY.trim()}` },
  signal: AbortSignal.timeout(10000),
});
assert.ok(res.ok, `DeepSeek key rejected (${res.status})`);

const apis = [
  "/api/website-builder",
  "/api/webapp-builder",
  "/api/landing-page-builder",
  "/api/content-studio",
  "/api/ai-agents",
  "/api/brand-identity",
  "/api/video-studio",
  "/api/workspaces/marketing",
];

const base = (
  process.env.CORE_SMOKE_BASE_URL ||
  process.env.GOLIVE_LOCAL_BASE_URL ||
  process.env.PRODUCTION_BASE_URL ||
  ""
).replace(/\/+$/, "");

const httpResults = [];
if (base) {
  for (const api of apis) {
    const method = api === "/api/ai-agents" ? "GET" : "POST";
    const resApi = await fetch(`${base}${api}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body:
        method === "POST"
          ? JSON.stringify({ prompt: "provider smoke" })
          : undefined,
      signal: AbortSignal.timeout(10000),
    });
    assert.ok(
      [200, 401, 403, 400, 405].includes(resApi.status),
      `${api} unexpected ${resApi.status}`,
    );
    // Generate endpoints must not succeed without auth.
    if (method === "POST") {
      assert.ok(
        resApi.status === 401 || resApi.status === 403 || resApi.status === 400,
        `${api} expected auth gate, got ${resApi.status}`,
      );
    }
    httpResults.push({ api, status: resApi.status });
  }
}

console.log("smoke-ai-providers: OK", {
  default: "deepseek",
  deepseekKey: true,
  multiProviderRegistry: true,
  http: httpResults.length ? httpResults : "skipped (set CORE_SMOKE_BASE_URL or GOLIVE_LOCAL_BASE_URL)",
});
