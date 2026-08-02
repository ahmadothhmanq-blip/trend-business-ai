/**
 * Upstash Redis verification for Website Builder distributed rate limiting.
 *
 * Usage:
 *   npm run verify:upstash-redis
 *   npm run verify:upstash-redis -- --strict
 *
 * Env files loaded (first wins per key): process.env, then .env.staging, then .env.local
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  executeWithUpstashFallback,
  isUpstashRedisConfigured,
  pingUpstashRedis,
} from "@/lib/api/upstash-redis";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

function loadEnvFile(rel: string) {
  const envPath = path.join(root, rel);
  if (!existsSync(envPath)) return false;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
  return true;
}

loadEnvFile(".env.staging");
loadEnvFile(".env.local");

const checks: Array<{ level: string; id: string; message: string }> = [];
let fail = 0;
let warn = 0;
let pass = 0;

function record(level: "pass" | "warn" | "fail", id: string, message: string) {
  checks.push({ level, id, message });
  if (level === "fail") fail += 1;
  else if (level === "warn") warn += 1;
  else pass += 1;
  const tag = level.toUpperCase().padEnd(4);
  console.log(`[${tag}] ${id}: ${message}`);
}

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

if (!url || !token) {
  const level = strict ? "fail" : "warn";
  record(
    level,
    "env",
    "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN unset — memory fallback active",
  );
} else {
  record("pass", "env", "Upstash credentials loaded (values not logged)");

  if (!url.startsWith("https://")) {
    record("fail", "env-https", "UPSTASH_REDIS_REST_URL must use https://");
  } else {
    record("pass", "env-https", "REST URL uses https");
  }
}

async function main() {
  if (isUpstashRedisConfigured()) {
    const ping = await pingUpstashRedis();
    if (ping.ok) {
      record(
        "pass",
        "connectivity",
        `Redis probe ok (${ping.latencyMs ?? "?"}ms)`,
      );
    } else {
      record(
        strict ? "fail" : "warn",
        "connectivity",
        `Redis probe failed — memory fallback will be used: ${ping.error}`,
      );
    }
  } else {
    record("pass", "connectivity", "Skipped live probe (credentials unset)");
  }

  const fallbackOk =
    (await executeWithUpstashFallback(
      async () => {
        throw new Error("simulated outage");
      },
      () => "memory",
      "verify-script",
    )) === "memory";

  if (fallbackOk) {
    record("pass", "fallback", "executeWithUpstashFallback returns memory path on error");
  } else {
    record("fail", "fallback", "executeWithUpstashFallback did not fall back");
  }

  console.log("\n--- Summary ---");
  console.log(`pass=${pass} warn=${warn} fail=${fail}`);

  if (fail > 0) {
    process.exit(1);
  }
}

void main();
