/**
 * Authenticated Website Builder journey:
 * Login → create → generate → preview → improve → publish → public URL
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    }
  }
}

loadEnvLocal();

const base = process.env.QA_BASE || "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

const steps = [];
function pass(name, detail = "") {
  steps.push({ name, status: "PASS", detail });
  console.log(`PASS  ${name}${detail ? " — " + detail : ""}`);
}
function fail(name, detail = "") {
  steps.push({ name, status: "FAIL", detail });
  console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`);
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
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw new Error(`setSession: ${error.message}`);
  const cookie = [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
  if (!cookie) throw new Error("No SSR cookies after setSession");
  return cookie;
}

async function api(cookie, method, path, body, opts = {}) {
  const headers = { Cookie: cookie };
  if (opts.accept) headers.Accept = opts.accept;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const t0 = Date.now();
  const r = await fetch(base + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const text = await r.text();
  return { status: r.status, text, ms: Date.now() - t0, headers: r.headers };
}

function parseSseComplete(text) {
  let complete = null;
  let lastError = null;
  for (const block of text.split("\n\n")) {
    const lines = block.split("\n");
    let event = "message";
    let data = "";
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    if (!data) continue;
    try {
      const parsed = JSON.parse(data);
      if (event === "complete") complete = parsed;
      if (event === "error") lastError = parsed.error || data;
    } catch {
      /* ignore */
    }
  }
  return { complete, lastError };
}

async function generate(cookie, body) {
  const stream = await api(cookie, "POST", "/api/website-builder/stream", body, {
    accept: "text/event-stream",
  });
  if (stream.status === 200) {
    const { complete, lastError } = parseSseComplete(stream.text);
    if (complete?.generation?.id) {
      return { ok: true, complete, ms: stream.ms, via: "stream" };
    }
    return { ok: false, error: lastError || "no complete event", ms: stream.ms };
  }
  const fallback = await api(cookie, "POST", "/api/website-builder", body);
  if (fallback.status === 200) {
    const json = JSON.parse(fallback.text);
    return {
      ok: true,
      complete: json,
      ms: fallback.ms,
      via: "fallback",
    };
  }
  return {
    ok: false,
    error: `stream=${stream.status} ${stream.text.slice(0, 160)}; fallback=${fallback.status} ${fallback.text.slice(0, 160)}`,
    ms: fallback.ms,
  };
}

async function main() {
  console.log("=== Website Builder Customer Journey ===");
  console.log(`base=${base}`);
  console.log(`SITE_URL=${process.env.NEXT_PUBLIC_SITE_URL || "MISSING"}`);

  if (!url || !anon || !email || !password) {
    fail(
      "1. User login",
      "Missing env — run: node scripts/e2e-auth-bootstrap.mjs",
    );
    return finish();
  }

  const health = await fetch(base + "/api/health");
  if (!health.ok) {
    fail("0. App health", `HTTP ${health.status}`);
    return finish();
  }
  pass("0. App health");

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: si, error: siErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (siErr || !si.session) {
    fail("1. User login", siErr?.message || "no session");
    return finish();
  }
  pass("1. User login", email);

  let cookie;
  try {
    cookie = await buildSsrCookieHeader(
      si.session.access_token,
      si.session.refresh_token,
    );
    pass("1b. Session cookies");
  } catch (e) {
    fail("1b. Session cookies", e.message);
    return finish();
  }

  const authCheck = await api(cookie, "GET", "/api/website-builder?page=1&limit=1");
  if (authCheck.status !== 200) {
    fail("1c. Authenticated API", `${authCheck.status} ${authCheck.text.slice(0, 120)}`);
    return finish();
  }
  pass("1c. Authenticated API");

  const generateBody = {
    prompt:
      "A boutique coffee shop website with menu highlights, location, and contact form. Warm modern look.",
    projectType: "Business Website",
    language: "English",
    theme: "Gold Luxury",
    features: ["Contact", "product:website-builder"],
    productId: "website-builder",
    mode: "generate",
  };

  console.log("Generating website...");
  const gen = await generate(cookie, generateBody);
  if (!gen.ok) {
    fail("2. Create website request", gen.error);
    fail("3. AI generation", gen.error);
    return finish();
  }
  let generationId = gen.complete.generation.id;
  const title =
    gen.complete.project?.title || gen.complete.generation?.project_name || "?";
  pass("2. Create website request", `generation=${generationId} via=${gen.via}`);
  pass("3. AI generation", `title=${title} ${gen.ms}ms`);

  const preview = await api(
    cookie,
    "GET",
    `/api/website-builder/${generationId}/live-preview`,
  );
  const pct = preview.headers.get("content-type") || "";
  if (
    preview.status === 200 &&
    pct.includes("text/html") &&
    preview.text.length > 200
  ) {
    pass("4. Preview", `bytes=${preview.text.length}`);
  } else {
    fail(
      "4. Preview",
      `${preview.status} ct=${pct} ${preview.text.slice(0, 160)}`,
    );
  }

  console.log("Improving with AI...");
  const improve = await generate(cookie, {
    ...generateBody,
    mode: "continue",
    parentGenerationId: generationId,
    continueInstruction:
      "Clarify the hero headline and add a short seasonal specials section.",
  });
  if (!improve.ok) {
    fail("5. AI improvement", improve.error);
  } else {
    generationId = improve.complete.generation.id;
    pass(
      "5. AI improvement",
      `newGeneration=${generationId} ${improve.ms}ms via=${improve.via}`,
    );
  }

  const pub = await api(cookie, "POST", `/api/website-builder/${generationId}/publish`, {
    action: "publish",
  });
  let publicPath = null;
  let publicUrl = null;
  if (pub.status === 200) {
    const json = JSON.parse(pub.text);
    publicUrl = json.publicUrl || json.publication?.planned_public_url;
    publicPath = json.publicPath || json.publication?.public_path;
    if (json.publication?.status === "published") {
      pass("6. Publish", `url=${publicUrl || publicPath}`);
    } else {
      fail("6. Publish", `status=${json.publication?.status} ${pub.text.slice(0, 180)}`);
    }
  } else {
    fail("6. Publish", `${pub.status} ${pub.text.slice(0, 220)}`);
  }

  let resolvedPath = null;
  if (publicPath || publicUrl) {
    resolvedPath = publicPath || new URL(publicUrl, base).pathname;
    const live = await fetch(base + resolvedPath, { redirect: "manual" });
    const text = await live.text();
    const ct = live.headers.get("content-type") || "";
    if (live.status === 200 && ct.includes("text/html") && text.length > 200) {
      pass("7. Open public URL", `${resolvedPath} bytes=${text.length}`);
    } else {
      fail(
        "7. Open public URL",
        `${live.status} ct=${ct} ${text.slice(0, 160)}`,
      );
    }
  } else {
    fail("7. Open public URL", "No public path from publish");
  }

  // 8. ZIP export (launch checklist)
  {
    const zipRes = await fetch(
      `${base}/api/website-builder/${generationId}/export`,
      { headers: { Cookie: cookie }, redirect: "manual" },
    );
    const buf = Buffer.from(await zipRes.arrayBuffer());
    const ct = zipRes.headers.get("content-type") || "";
    const looksZip =
      zipRes.status === 200 &&
      buf.length > 100 &&
      buf[0] === 0x50 &&
      buf[1] === 0x4b; // PK..
    if (looksZip) {
      pass("8. ZIP export", `status=200 ct=${ct || "n/a"} bytes=${buf.length}`);
    } else {
      fail(
        "8. ZIP export",
        `${zipRes.status} ct=${ct} bytes=${buf.length} head=${buf.slice(0, 80).toString("utf8")}`,
      );
    }
  }

  // 9. Unpublish → public URL must 404 (security + launch checklist)
  if (resolvedPath) {
    const unpub = await api(
      cookie,
      "POST",
      `/api/website-builder/${generationId}/publish`,
      { action: "unpublish" },
    );
    if (unpub.status === 200) {
      const json = JSON.parse(unpub.text);
      if (json.publication?.status === "unpublished") {
        pass("9. Unpublish", `status=unpublished`);
      } else {
        fail(
          "9. Unpublish",
          `status=${json.publication?.status} ${unpub.text.slice(0, 160)}`,
        );
      }
    } else {
      fail("9. Unpublish", `${unpub.status} ${unpub.text.slice(0, 200)}`);
    }

    const after = await fetch(base + resolvedPath, { redirect: "manual" });
    const afterText = await after.text();
    if (after.status === 404) {
      pass("10. Public URL after unpublish", "404 as expected");
    } else {
      fail(
        "10. Public URL after unpublish",
        `${after.status} ${afterText.slice(0, 160)}`,
      );
    }
  } else {
    fail("9. Unpublish", "Skipped — no public path");
    fail("10. Public URL after unpublish", "Skipped — no public path");
  }

  finish();
}

function finish() {
  console.log("\n=== JOURNEY RESULT ===");
  const passed = steps.filter((s) => s.status === "PASS").map((s) => s.name);
  const failed = steps
    .filter((s) => s.status === "FAIL")
    .map((s) => `${s.name}: ${s.detail}`);
  console.log("Passed:", passed.join(" → ") || "(none)");
  console.log("Failed:", failed.join(" | ") || "(none)");
  console.log(
    JSON.stringify(
      {
        passed,
        failed: steps
          .filter((s) => s.status === "FAIL")
          .map((s) => ({ step: s.name, detail: s.detail })),
        ok: failed.length === 0,
      },
      null,
      2,
    ),
  );
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
