/**
 * Social Media Manager Phase 2 publishing verification.
 * Usage: npm run verify:social-media-publishing
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

const FILES = [
  "supabase/migrations/063_social_media_publishing.sql",
  "lib/social-media/crypto.ts",
  "lib/social-media/accounts.ts",
  "lib/social-media/webhooks.ts",
  "lib/social-media/oauth/providers.ts",
  "lib/social-media/oauth/state.ts",
  "lib/social-media/oauth/tokens.ts",
  "lib/social-media/publishing/engine.ts",
  "lib/social-media/publishing/publishers.ts",
  "lib/social-media/publishing/types.ts",
  "app/api/social-media/accounts/connect/[platform]/route.ts",
  "app/api/social-media/accounts/callback/[platform]/route.ts",
  "app/api/social-media/accounts/[id]/route.ts",
  "app/api/social-media/posts/[id]/publish/route.ts",
  "app/api/social-media/analytics/live/route.ts",
  "app/api/social-media/worker/process/route.ts",
  "app/api/social-media/webhooks/facebook/route.ts",
  "app/api/social-media/webhooks/instagram/route.ts",
  "app/api/social-media/webhooks/whatsapp/route.ts",
  "components/dashboard/social-media/connected-accounts.tsx",
  "scripts/verify-social-media-publishing.mjs",
];

console.log("\n[1] Publishing infrastructure files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 063");
const m063 = readFileSync(join(root, "supabase/migrations/063_social_media_publishing.sql"), "utf8");
for (const item of [
  "social_publish_jobs",
  "access_token_encrypted",
  "refresh_token_encrypted",
  "social_webhook_events",
  "clicks",
  "enable row level security",
]) {
  if (m063.includes(item)) ok(`migration: ${item}`);
  else fail(`migration missing: ${item}`);
}

console.log("\n[3] OAuth providers");
const providers = readFileSync(join(root, "lib/social-media/oauth/providers.ts"), "utf8");
for (const p of ["facebook", "instagram", "whatsapp", "messenger", "linkedin", "x"]) {
  if (providers.includes(p)) ok(`oauth: ${p}`);
  else fail(`oauth missing: ${p}`);
}

console.log("\n[4] Platform publishers");
const publishers = readFileSync(join(root, "lib/social-media/publishing/publishers.ts"), "utf8");
for (const pub of ["FacebookPublisher", "InstagramPublisher", "WhatsAppPublisher", "MessengerPublisher", "LinkedInPublisher", "XPublisher"]) {
  if (publishers.includes(pub)) ok(pub);
  else fail(`publisher missing: ${pub}`);
}

console.log("\n[5] Publishing engine");
const engine = readFileSync(join(root, "lib/social-media/publishing/engine.ts"), "utf8");
for (const fn of ["publishPost", "schedulePost", "retryFailedJob", "processScheduledJobs"]) {
  if (engine.includes(fn)) ok(`engine: ${fn}`);
  else fail(`engine missing: ${fn}`);
}

console.log("\n[6] API security");
const routes = [
  ["app/api/social-media/accounts/connect/[platform]/route.ts", "requireUser"],
  ["app/api/social-media/accounts/[id]/route.ts", "requireUser"],
  ["app/api/social-media/posts/[id]/publish/route.ts", "requireUser"],
  ["app/api/social-media/analytics/live/route.ts", "requireUser"],
  ["app/api/social-media/webhooks/facebook/route.ts", "enforceWebhookRateLimit"],
];
for (const [rel, check] of routes) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes(check)) ok(`${rel}: ${check}`);
  else fail(`${rel}: missing ${check}`);
}

const accounts = readFileSync(join(root, "app/api/social-media/accounts/route.ts"), "utf8");
if (accounts.includes("SAFE_ACCOUNT_SELECT") && !accounts.match(/\.select\([^)]*access_token_encrypted/)) ok("accounts: tokens not exposed");
else fail("accounts: possible token leak");

const crypto = readFileSync(join(root, "lib/social-media/crypto.ts"), "utf8");
if (crypto.includes("encryptToken") && crypto.includes("decryptToken")) ok("crypto: AES encryption");

console.log("\n[7] UI publishing controls");
const composer = readFileSync(join(root, "components/dashboard/social-media/post-composer.tsx"), "utf8");
if (composer.includes("publishNow") && composer.includes("/publish")) ok("composer: publish button");
else fail("composer: publish missing");
const workspace = readFileSync(join(root, "components/dashboard/social-media/social-media-workspace.tsx"), "utf8");
if (workspace.includes("ConnectedAccountsPanel") && workspace.includes("accounts")) ok("workspace: accounts tab");

console.log("\n[8] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:social-media-publishing"]) ok("npm run verify:social-media-publishing");
else fail("verify:social-media-publishing script missing");

console.log(failed ? `\nSocial Media publishing verify: ${failed} issue(s)\n` : "\nSocial Media publishing verify: PASS\n");
process.exit(failed ? 1 : 0);
