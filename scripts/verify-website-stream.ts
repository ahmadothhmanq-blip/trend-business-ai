/**
 * Website Builder SSE streaming verification.
 *
 * Usage:
 *   npm run verify:website-stream
 *   npm run verify:website-stream -- --strict
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getClientStreamRecoveryPollMs,
  getStreamHandoffDelayMs,
  getWebsiteStreamMaxDurationSec,
} from "@/lib/website/stream-limits";
import { resolveWebsiteStreamMaxDurationSec } from "@/lib/website/route-limits";
import { SSE_HEARTBEAT_INTERVAL_MS } from "@/lib/ai/timeouts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

let pass = 0;
let warn = 0;
let fail = 0;

function record(level: "pass" | "warn" | "fail", id: string, message: string) {
  if (level === "fail") fail += 1;
  else if (level === "warn") warn += 1;
  else pass += 1;
  console.log(`[${level.toUpperCase().padEnd(4)}] ${id}: ${message}`);
}

const streamRoutePath = path.join(
  root,
  "app/api/website-builder/stream/route.ts",
);
const streamRouteSource = readFileSync(streamRoutePath, "utf8");

if (streamRouteSource.includes("export const maxDuration = 900")) {
  record("pass", "route-max-duration", "Stream route maxDuration raised to 900s (was 300s)");
} else if (streamRouteSource.includes("resolveWebsiteStreamMaxDurationSec()")) {
  record("pass", "route-max-duration", "Stream route uses dynamic maxDuration resolver");
} else if (streamRouteSource.includes("maxDuration = 300")) {
  record("fail", "route-max-duration", "Stream route still hardcodes maxDuration = 300");
} else {
  record("warn", "route-max-duration", "Could not verify maxDuration wiring");
}

if (streamRouteSource.includes('send("handoff"')) {
  record("pass", "route-handoff", "Stream route emits handoff before route budget ends");
} else {
  record("fail", "route-handoff", "Stream route missing handoff event");
}

if (streamRouteSource.includes("X-WB-Stream-Max-Duration")) {
  record("pass", "route-header", "Stream route exposes X-WB-Stream-Max-Duration header");
} else {
  record("warn", "route-header", "Missing X-WB-Stream-Max-Duration response header");
}

const maxSec = resolveWebsiteStreamMaxDurationSec();
const handoffDelay = getStreamHandoffDelayMs(maxSec);
if (handoffDelay > 0 && handoffDelay < maxSec * 1000) {
  record(
    "pass",
    "handoff-timing",
    `Handoff fires at ${Math.round(handoffDelay / 1000)}s (max ${maxSec}s)`,
  );
} else {
  record("fail", "handoff-timing", "Invalid handoff delay calculation");
}

const recoveryMs = getClientStreamRecoveryPollMs(maxSec);
if (recoveryMs >= 25 * 60 * 1000) {
  record(
    "pass",
    "client-recovery",
    `Client recovery window ${Math.round(recoveryMs / 60_000)} minutes`,
  );
} else {
  record(
    strict ? "fail" : "warn",
    "client-recovery",
    `Client recovery window only ${Math.round(recoveryMs / 1000)}s`,
  );
}

if (SSE_HEARTBEAT_INTERVAL_MS <= 15_000) {
  record(
    "pass",
    "heartbeat-interval",
    `SSE heartbeat every ${SSE_HEARTBEAT_INTERVAL_MS}ms`,
  );
} else {
  record("warn", "heartbeat-interval", "SSE heartbeat interval may be too slow for proxies");
}

const sseStreamPath = path.join(root, "lib/api/sse-stream.ts");
const sseStreamSource = readFileSync(sseStreamPath, "utf8");
if (
  sseStreamSource.includes("sendCommentKeepalive") &&
  sseStreamSource.includes(": keepalive")
) {
  record("pass", "sse-keepalive", "SSE emits comment + ping heartbeats");
} else {
  record("fail", "sse-keepalive", "SSE heartbeat format incomplete");
}

async function main() {
  const sseClientPath = path.join(root, "lib/api/sse-client.ts");
  const sseClientSource = readFileSync(sseClientPath, "utf8");
  if (sseClientSource.includes('event === "handoff"')) {
    record("pass", "client-handoff", "SSE client handles handoff events");
  } else {
    record("fail", "client-handoff", "SSE client missing handoff handler");
  }

  const envExamplePath = path.join(root, ".env.example");
  if (existsSync(envExamplePath)) {
    const envExample = readFileSync(envExamplePath, "utf8");
    if (envExample.includes("WEBSITE_STREAM_MAX_DURATION_SEC")) {
      record("pass", "env-docs", "WEBSITE_STREAM_MAX_DURATION_SEC documented");
    } else {
      record("warn", "env-docs", "Add WEBSITE_STREAM_MAX_DURATION_SEC to .env.example");
    }
  }

  console.log("\n--- Summary ---");
  console.log(`pass=${pass} warn=${warn} fail=${fail}`);
  console.log(`resolved maxDuration=${getWebsiteStreamMaxDurationSec()}s`);

  if (fail > 0) {
    process.exit(1);
  }
}

void main();
