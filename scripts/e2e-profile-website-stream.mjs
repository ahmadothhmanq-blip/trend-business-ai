/**
 * End-to-end Website Builder performance profile.
 * Exercises the REAL stream API path (auth → SSE → persist → complete).
 *
 * Usage:
 *   node scripts/e2e-profile-website-stream.mjs
 *   WB_PROFILE=ultra node scripts/e2e-profile-website-stream.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadEnvLocal,
  resolveHarnessBaseUrl,
} from "./lib/dev-base-url.mjs";
import {
  ensureDevServer,
  registerHarnessDevServerCleanup,
} from "./lib/dev-server.mjs";

loadEnvLocal();
registerHarnessDevServerCleanup();

const base = resolveHarnessBaseUrl();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const profile = process.env.WB_PROFILE ?? "ultra";

async function buildSsrCookieHeader(accessToken, refreshToken) {
  const jar = new Map();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          if (value === "" || value == null) jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw new Error(`setSession: ${error.message}`);
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function readSseWithTimings(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events = [];
  let complete = null;
  let error = null;
  let generationId = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const block of parts) {
      if (!block.trim()) continue;
      const lines = block.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      const atMs = Date.now();
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = { raw: data };
      }
      events.push({ event, atMs, bytes: data.length, data: parsed });
      if (event === "complete") complete = parsed;
      if (event === "error") error = parsed.error || data;
      if (parsed.generationId) generationId = parsed.generationId;
      if (parsed.generation?.id) generationId = parsed.generation.id;
    }
  }

  return { events, complete, error, generationId };
}

function simulateUiApply(complete) {
  const t0 = Date.now();
  const project = complete?.project;
  const generation = complete?.generation;
  const files = project?.files ?? [];
  const fileCount = files.length;
  const previewPath =
    files.find((f) => f.path?.includes("preview/"))?.path ?? files[0]?.path ?? "";
  void previewPath;
  void generation;
  return Date.now() - t0;
}

async function main() {
  console.log("=== Website Builder E2E Performance Profile ===");
  console.log(`base=${base} profile=${profile}`);

  const dev = await ensureDevServer();
  console.log(`[dev] ${dev.action} → ${dev.baseUrl}`);

  if (!url || !anon || !email || !password) {
    console.error("Missing E2E auth — run: node scripts/e2e-auth-bootstrap.mjs");
    process.exit(1);
  }

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: si, error: siErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (siErr || !si.session) {
    console.error("Login failed:", siErr?.message);
    process.exit(1);
  }
  const cookie = await buildSsrCookieHeader(
    si.session.access_token,
    si.session.refresh_token,
  );

  const prompt =
    process.env.WB_PROMPT ??
    "B2B SaaS project management platform with pricing, features grid, customer testimonials, and signup CTA. Modern professional aesthetic.";

  const body = {
    prompt,
    projectType: "Business Website",
    projectKind: "website",
    language: "English",
    theme: "Gold Luxury",
    features: ["contact-form", "seo", "product:website-builder"],
    productId: "website-builder",
    mode: "generate",
    generationProfile: profile,
  };

  const clickAt = Date.now();
  const fetchStart = performance.now();

  const response = await fetch(`${base}/api/website-builder/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Cookie: cookie,
      "X-WB-E2E-Profile": "1",
    },
    body: JSON.stringify(body),
  });

  const headersAt = Date.now();
  const ttfbMs = headersAt - clickAt;

  if (!response.ok || !response.body) {
    const text = await response.text();
    console.error(`Stream failed: ${response.status} ${text.slice(0, 300)}`);
    process.exit(1);
  }

  const { events, complete, error, generationId } = await readSseWithTimings(response);
  const streamEndAt = Date.now();

  const serverReport =
    complete?.e2ePerformanceReport ??
    events.find((e) => e.data?.e2ePerformanceReport)?.data?.e2ePerformanceReport ??
    null;
  const serverMarkdown =
    complete?.e2ePerformanceMarkdown ??
    events.find((e) => e.data?.e2ePerformanceMarkdown)?.data?.e2ePerformanceMarkdown ??
    null;

  if (error && !complete && !serverReport) {
    const outDir = join(process.cwd(), "scripts", "benchmark-results");
    mkdirSync(outDir, { recursive: true });
    const partial = {
      failed: true,
      error,
      clientWallMs: streamEndAt - clickAt,
      ttfbMs,
      sseEventCount: events.length,
      events: events.map((e) => ({
        event: e.event,
        atMs: e.atMs - clickAt,
        bytes: e.bytes,
        message: e.data?.message ?? e.data?.error,
      })),
    };
    const jsonPath = join(outDir, `e2e-performance-partial-${profile}-${Date.now()}.json`);
    writeFileSync(jsonPath, JSON.stringify(partial, null, 2));
    console.error("Generation failed:", error);
    console.error(`Partial timings saved: ${jsonPath}`);
    process.exit(1);
  }

  if (error && !complete) {
    console.error("Generation failed:", error);
    process.exit(1);
  }

  const uiApplyMs = simulateUiApply(complete);
  const uiCompleteAt = Date.now();
  const totalWallMs = uiCompleteAt - clickAt;

  const clientStages = {
    "browser-request": ttfbMs,
    "ui-rendering": uiApplyMs,
  };

  const merged = serverReport
    ? {
        ...serverReport,
        clientWallMs: totalWallMs,
        clientStages,
        clientSseEvents: events.map((e) => ({
          event: e.event,
          atMs: e.atMs - clickAt,
          bytes: e.bytes,
        })),
        timings: {
          clickToHeadersMs: ttfbMs,
          clickToStreamEndMs: streamEndAt - clickAt,
          clickToUiCompleteMs: totalWallMs,
          fetchDurationMs: Math.round(performance.now() - fetchStart),
        },
      }
    : {
        error: "Server did not return e2ePerformanceReport — ensure X-WB-E2E-Profile header",
        clientWallMs: totalWallMs,
        clientSseEvents: events,
      };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, `e2e-performance-${profile}-${Date.now()}.json`);
  writeFileSync(jsonPath, JSON.stringify(merged, null, 2));

  const mdPath = join(
    process.cwd(),
    "docs",
    "WEBSITE_BUILDER_E2E_PERFORMANCE_REPORT.md",
  );

  const md =
    serverMarkdown ??
    `# E2E Profile (client-only)\n\nTotal: ${totalWallMs}ms\nTTFB: ${ttfbMs}ms\n`;

  const clientSection = [
    "",
    "## Client-Side Timings (Generate click → UI complete)",
    "",
    `| Metric | Duration |`,
    `|--------|----------|`,
    `| Click → response headers (TTFB) | ${ttfbMs}ms |`,
    `| Click → SSE stream complete | ${streamEndAt - clickAt}ms |`,
    `| UI apply simulation | ${uiApplyMs}ms |`,
    `| **Click → UI complete** | **${totalWallMs}ms** |`,
    "",
    `**SSE events received:** ${events.length}`,
    `**Generation ID:** ${generationId ?? complete.generationId ?? "?"}`,
    "",
  ].join("\n");

  writeFileSync(mdPath, md + clientSection);
  console.log(md + clientSection);
  console.log(`\nJSON: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
