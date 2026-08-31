/**
 * E2E: generate → skin → visitor locales → publish → language switcher
 *
 * Requires: E2E_TEST_EMAIL, E2E_TEST_PASSWORD, Supabase env, dev server
 * Offline fallback: runs locale pipeline unit assertions only
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
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
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function api(cookie, method, path, body) {
  const headers = { Cookie: cookie };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const r = await fetch(base + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: "manual",
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

async function runOfflinePipelineCheck() {
  const { execSync } = await import("node:child_process");
  execSync(
    "npx tsx --test lib/website/visitor-locale/locale-content.test.ts lib/website/visitor-locale/llm-translate.test.ts",
    { stdio: "inherit", cwd: process.cwd() },
  );
  pass("offline locale pipeline tests");
}

async function main() {
  console.log("=== Visitor Locale Publish E2E ===");
  console.log(`base=${base}`);

  const dev = await ensureDevServer();
  console.log(`[dev] ${dev.action} → ${dev.baseUrl}`);

  if (!url || !anon || !email || !password) {
    console.log("No E2E credentials — running offline pipeline checks only");
    await runOfflinePipelineCheck();
    return finish();
  }

  const health = await fetch(base + "/api/health");
  if (!health.ok) {
    fail("health", `HTTP ${health.status}`);
    return finish();
  }
  pass("health");

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: si, error: siErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (siErr || !si.session) {
    fail("login", siErr?.message || "no session");
    return finish();
  }
  pass("login", email);

  const cookie = await buildSsrCookieHeader(
    si.session.access_token,
    si.session.refresh_token,
  );
  pass("session cookies");

  const createRes = await api(cookie, "POST", "/api/website-builder", {
    projectName: `Locale E2E ${Date.now()}`,
    businessDescription: "Coffee shop with bilingual visitors",
    websiteType: "business",
    language: "English",
    visualSkinId: "modern-minimal",
    visitorLocales: true,
    generationProfile: "ultra",
  });

  const generationId =
    createRes.json?.generation?.id ?? createRes.json?.generationId;
  if (!generationId) {
    fail("create generation", createRes.text.slice(0, 200));
    return finish();
  }
  pass("create generation", generationId);

  const skinRes = await api(
    cookie,
    "POST",
    `/api/website-builder/${generationId}/visual-skin`,
    { visualSkinId: "luxury-gold" },
  );
  if (skinRes.status === 200) {
    pass("apply visual skin");
  } else {
    fail("apply visual skin", skinRes.text.slice(0, 160));
  }

  const publishRes = await api(
    cookie,
    "POST",
    `/api/website-builder/${generationId}/publish`,
    { action: "publish" },
  );
  if (publishRes.status !== 200 || !publishRes.json?.publicUrl) {
    fail("publish", publishRes.text.slice(0, 200));
    return finish();
  }
  const publicUrl = publishRes.json.publicUrl;
  pass("publish", publicUrl);

  const primary = await fetch(publicUrl);
  if (!primary.ok) {
    fail("fetch primary", `HTTP ${primary.status}`);
    return finish();
  }
  const primaryHtml = await primary.text();
  if (!primaryHtml.includes("tb-language-switcher")) {
    fail("primary switcher", "missing tb-language-switcher");
    return finish();
  }
  pass("primary has language switcher");

  const localeUrl = `${publicUrl.replace(/\/$/, "")}/ar`;
  const localeRes = await fetch(localeUrl);
  if (!localeRes.ok) {
    fail("fetch /ar", `HTTP ${localeRes.status}`);
    return finish();
  }
  const localeHtml = await localeRes.text();
  if (!localeHtml.includes("tb-locale:ar")) {
    fail("locale marker", "missing tb-locale:ar");
    return finish();
  }
  if (localeHtml === primaryHtml) {
    fail("locale content", "ar HTML identical to primary");
    return finish();
  }
  pass("locale /ar differs from primary");

  return finish();
}

function finish() {
  const failed = steps.filter((s) => s.status === "FAIL");
  console.log("\n=== Summary ===");
  console.log(`PASS ${steps.filter((s) => s.status === "PASS").length}`);
  console.log(`FAIL ${failed.length}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
