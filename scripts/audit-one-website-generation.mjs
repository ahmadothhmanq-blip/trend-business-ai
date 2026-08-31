/**
 * Generate one site + audit skin, SitePlan, locales, publish readiness.
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { writeFileSync } from "node:fs";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";
import { ensureDevServer } from "./lib/dev-server.mjs";

loadEnvLocal();

const base = resolveHarnessBaseUrl();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

const findings = [];
function ok(msg, detail = "") {
  findings.push({ level: "ok", msg, detail });
  console.log(`OK   ${msg}${detail ? " — " + detail : ""}`);
}
function warn(msg, detail = "") {
  findings.push({ level: "warn", msg, detail });
  console.log(`WARN ${msg}${detail ? " — " + detail : ""}`);
}
function fail(msg, detail = "") {
  findings.push({ level: "fail", msg, detail });
  console.log(`FAIL ${msg}${detail ? " — " + detail : ""}`);
}

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
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function api(cookie, method, path, body, opts = {}) {
  const headers = { Cookie: cookie };
  if (opts.accept) headers.Accept = opts.accept;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const r = await fetch(base + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: r.status, text, json };
}

function parseSseComplete(text) {
  let complete = null;
  let generationId = null;
  let lastError = null;
  for (const block of text.split("\n\n")) {
    let event = "message";
    let data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    if (!data) continue;
    try {
      const parsed = JSON.parse(data);
      if (event === "complete") complete = parsed;
      if (event === "error") lastError = parsed.error || data;
      if (parsed.generationId) generationId = parsed.generationId;
      if (parsed.generation?.id) generationId = parsed.generation.id;
    } catch {
      /* ignore */
    }
  }
  return { complete, generationId, lastError };
}

async function generate(cookie, body) {
  const stream = await api(cookie, "POST", "/api/website-builder/stream", body, {
    accept: "text/event-stream",
  });
  if (stream.status !== 200) {
    return { ok: false, error: `stream ${stream.status}: ${stream.text.slice(0, 200)}` };
  }
  const { complete, generationId, lastError } = parseSseComplete(stream.text);
  const id =
    complete?.generation?.id ?? complete?.generationId ?? generationId;
  if (!id) return { ok: false, error: lastError || "no generation id" };
  const genRes = await api(cookie, "GET", `/api/website-builder/${id}`);
  const generation = genRes.json?.generation ?? genRes.json;
  return {
    ok: true,
    generationId: id,
    project: generation?.blueprint,
    generation,
  };
}

function auditProject(project) {
  const files = project?.files ?? [];
  const globals = files.find((f) => f.path?.endsWith("globals.css"));
  const settings = project?.settings ?? {};
  const sitePlan = project?.sitePlan;

  if (!files.length) fail("project files", "empty");
  else ok("project files", `${files.length} files`);

  if (sitePlan?.archetypeId || sitePlan?.industry) {
    ok("SitePlan", sitePlan.archetypeId || sitePlan.industry);
  } else if (settings?.sitePlanArchetype) {
    ok("SitePlan archetype (settings)", settings.sitePlanArchetype);
  } else {
    warn("SitePlan", "no archetype on blueprint — restart dev with WB_SITE_PLAN_V1=1");
  }

  if (settings.visualSkinId) ok("visualSkinId", settings.visualSkinId);
  else warn("visualSkinId", "not set on project");

  if (globals?.content?.includes("tb-visual-skin")) {
    ok("skin CSS layer", "tb-visual-skin in globals.css");
  } else if (globals?.content?.includes("--color-primary")) {
    warn("skin CSS layer", "globals has tokens but no tb-visual-skin marker");
  } else {
    warn("globals.css", globals ? "missing skin tokens" : "no globals.css");
  }

  if (globals?.content?.includes("--tb-img-radius")) {
    ok("image treatment vars", "present");
  } else {
    warn("image treatment", "--tb-img-radius missing");
  }

  const hasPage = files.some((f) => f.path === "app/page.tsx");
  if (hasPage) ok("app/page.tsx", "present");
  else fail("app/page.tsx", "missing");

  return { globals, sitePlan, settings };
}

async function main() {
  console.log("=== Audit: one website generation ===\n");
  await ensureDevServer();

  if (!url || !anon || !email || !password) {
    fail("credentials", "E2E_TEST_EMAIL/PASSWORD required");
    process.exit(1);
  }

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: si, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !si.session) {
    fail("login", error?.message || "no session");
    process.exit(1);
  }
  ok("login", email);

  const cookie = await buildSsrCookieHeader(
    si.session.access_token,
    si.session.refresh_token,
  );

  console.log("\nGenerating mobile retail site (ultra)…\n");
  const gen = await generate(cookie, {
    prompt:
      "Mobile phone store — latest smartphones, trade-in program, repair service, and installment plans. Modern tech retail in Riyadh.",
    projectType: "Business Website",
    language: "Arabic",
    theme: "Gold Luxury",
    features: ["Contact", "product:website-builder"],
    productId: "website-builder",
    mode: "generate",
    generationProfile: "ultra",
    visualSkinId: "apex",
    imageStrategyMode: "with-images",
  });

  if (!gen.ok) {
    fail("generation", gen.error);
    writeReport(findings, null);
    process.exit(1);
  }

  ok("generation", gen.generationId);
  const project = gen.project;
  auditProject(project);

  console.log("\nApplying skin reapply (API)…\n");
  const skinRes = await api(
    cookie,
    "POST",
    `/api/website-builder/${gen.generationId}/visual-skin`,
    { visualSkinId: "vault" },
  );
  if (skinRes.status === 200) {
    ok("skin reapply API", "vault");
    const updated = skinRes.json?.project;
    if (updated) auditProject(updated);
  } else {
    warn("skin reapply API", `${skinRes.status} ${skinRes.text.slice(0, 120)}`);
  }

  console.log("\nPublish prepare…\n");
  const pub = await api(
    cookie,
    "POST",
    `/api/website-builder/${gen.generationId}/publish`,
    { action: "prepare" },
  );
  if (pub.status === 200) ok("publish prepare");
  else warn("publish prepare", `${pub.status} ${pub.text.slice(0, 120)}`);

  writeReport(findings, gen.generationId);
  const failed = findings.filter((f) => f.level === "fail").length;
  process.exit(failed ? 1 : 0);
}

function writeReport(items, generationId) {
  const out = {
    timestamp: new Date().toISOString(),
    generationId,
    findings: items,
    summary: {
      ok: items.filter((f) => f.level === "ok").length,
      warn: items.filter((f) => f.level === "warn").length,
      fail: items.filter((f) => f.level === "fail").length,
    },
  };
  writeFileSync(
    "scripts/benchmark-results/audit-one-site-latest.json",
    JSON.stringify(out, null, 2),
  );
  console.log("\n=== Summary ===");
  console.log(JSON.stringify(out.summary));
  if (generationId) {
    console.log(`Report: scripts/benchmark-results/audit-one-site-latest.json`);
    console.log(`Dashboard: ${base}/dashboard/website-builder?generation=${generationId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
