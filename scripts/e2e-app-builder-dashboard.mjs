/**
 * Dashboard App Builder E2E (login → generate → live preview → manage page)
 * Usage: node scripts/e2e-app-builder-dashboard.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";
import { ensureDevServer } from "./lib/dev-server.mjs";

loadEnvLocal();
await ensureDevServer();

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

let failed = 0;

if (!url || !anon || !email || !password) {
  fail("env", "Missing Supabase or E2E_TEST_* credentials");
  process.exit(1);
}

const supabase = createClient(url, anon);
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (authError || !authData.session) {
  fail("login", authError?.message ?? "no session");
  process.exit(1);
}
pass("login", email);

const cookie = await buildSsrCookieHeader(
  authData.session.access_token,
  authData.session.refresh_token,
);

const dash = await api(cookie, "GET", "/dashboard/app-builder");
if (dash.status === 200) pass("dashboard page", `${dash.ms}ms`);
else fail("dashboard page", `HTTP ${dash.status}`);

const templates = await api(cookie, "GET", "/api/webapp-builder/design-platform");
if (templates.status === 200) {
  try {
    const json = JSON.parse(templates.text);
    const count = json.templates?.length ?? 0;
    pass("template gallery API", `${count} templates`);
  } catch {
    fail("template gallery API", "invalid JSON");
  }
} else {
  fail("template gallery API", `HTTP ${templates.status}`);
}

console.log("… generating app (template: booking) …");
const gen = await api(cookie, "POST", "/api/webapp-builder", {
  prompt:
    "Appointments and scheduling with calendar, services, availability, and admin dashboard.",
  appType: "booking",
  templateId: "booking",
  language: "English",
  designStyle: "Modern",
  colorStyle: "Dark Minimal",
  features: ["auth", "calendar", "bookings", "availability", "notifications"],
});

let generationId = null;
let appName = null;
if (gen.status === 200) {
  try {
    const json = JSON.parse(gen.text);
    generationId = json.generation?.id ?? null;
    appName = json.generation?.app_name ?? json.project?.title ?? null;
    const fileCount = json.project?.files?.length ?? json.generation?.blueprint?.files?.length ?? "?";
    pass("generate app", `${appName} · ${fileCount} files · ${gen.ms}ms`);
  } catch {
    fail("generate app", "invalid JSON");
  }
} else {
  fail("generate app", `HTTP ${gen.status} — ${gen.text.slice(0, 200)}`);
}

if (generationId) {
  const preview = await api(
    cookie,
    "GET",
    `/api/webapp-builder/${generationId}/live-preview`,
  );
  if (preview.status === 200 && preview.text.includes("<html")) {
    pass("live preview", `${preview.text.length} bytes HTML · ${preview.ms}ms`);
  } else {
    fail("live preview", `HTTP ${preview.status}`);
  }

  const manage = await api(cookie, "GET", `/dashboard/app-builder/${generationId}`);
  if (manage.status === 200) pass("manage page", `${manage.ms}ms`);
  else fail("manage page", `HTTP ${manage.status}`);

  const list = await api(cookie, "GET", "/api/webapp-builder?limit=5");
  if (list.status === 200) {
    try {
      const json = JSON.parse(list.text);
      const found = (json.generations ?? []).some((g) => g.id === generationId);
      if (found) pass("history list", "new app visible");
      else fail("history list", "generation not in list");
    } catch {
      fail("history list", "invalid JSON");
    }
  } else {
    fail("history list", `HTTP ${list.status}`);
  }

  const zip = await api(cookie, "GET", `/api/webapp-builder/${generationId}/export`);
  const isZip =
    zip.status === 200 &&
    (zip.headers.get("content-type") ?? "").includes("zip") &&
    zip.text.length > 1000;
  if (isZip) pass("download ZIP export", `${Math.round(zip.text.length / 1024)} KB · ${zip.ms}ms`);
  else fail("download ZIP export", `HTTP ${zip.status}`);
}

failed = steps.filter((s) => s.status === "FAIL").length;
console.log("");
console.log(JSON.stringify({ pass: failed === 0, steps, generationId, appName, base }, null, 2));
process.exit(failed > 0 ? 1 : 0);
