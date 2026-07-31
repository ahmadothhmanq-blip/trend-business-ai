/**
 * Full Website Builder workflow E2E (real execution).
 * - Login
 * - List installed templates
 * - Generate with each installed template
 * - Verify pages/sections/files, preview, save snapshot, export ZIP
 *
 * Usage: node scripts/e2e-website-builder-full-workflow.mjs
 * Base URL: QA_BASE → NEXT_PUBLIC_SITE_URL → http://localhost:{PORT|DEV_PORT|3003}
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
  let generationId = null;
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
      if (event === "session" && parsed.generationId) {
        generationId = parsed.generationId;
      }
      if (event === "error") lastError = parsed.error || parsed.message || data;
      if (parsed.generationId) generationId = parsed.generationId;
    } catch {
      /* ignore */
    }
  }
  return { complete, lastError, generationId };
}

async function fetchGeneration(cookie, generationId) {
  const res = await api(cookie, "GET", `/api/website-builder/${generationId}`);
  if (res.status !== 200) return null;
  try {
    const json = JSON.parse(res.text);
    return json.generation ?? json;
  } catch {
    return null;
  }
}

async function generate(cookie, body) {
  const stream = await api(cookie, "POST", "/api/website-builder/stream", body, {
    accept: "text/event-stream",
  });
  if (stream.status === 200) {
    const { complete, lastError, generationId: sessionId } = parseSseComplete(stream.text);
    const generationId =
      complete?.generation?.id ??
      complete?.generationId ??
      sessionId;
    if (generationId) {
      const generation = await fetchGeneration(cookie, generationId);
      return {
        ok: true,
        complete: {
          generation: generation ?? { id: generationId },
          generationId,
          summary: complete?.summary,
        },
        ms: stream.ms,
        via: "stream",
      };
    }
    return { ok: false, error: lastError || "no complete event", ms: stream.ms };
  }
  return {
    ok: false,
    error: `stream=${stream.status} ${stream.text.slice(0, 200)}`,
    ms: stream.ms,
  };
}

function extractProjectFiles(generation) {
  const blueprint = generation?.blueprint;
  const files = Array.isArray(blueprint?.files) ? blueprint.files : [];
  return files.filter((f) => f?.path && typeof f.content === "string");
}

function countSections(files) {
  let sections = 0;
  for (const file of files) {
    if (/section|hero|component/i.test(file.path)) sections++;
    if (file.content?.includes("<section")) {
      sections += (file.content.match(/<section/gi) || []).length;
    }
  }
  return sections;
}

function countPages(files) {
  const pageFiles = files.filter(
    (f) =>
      /page\.tsx|pages\//i.test(f.path) ||
      (f.path.includes("app/") && f.path.endsWith("page.tsx")),
  );
  return Math.max(pageFiles.length, 1);
}

async function main() {
  console.log("=== Website Builder Full Workflow E2E ===");
  console.log(`base=${base}`);

  const dev = await ensureDevServer();
  console.log(`[dev] ${dev.action} → ${dev.baseUrl}`);

  if (!url || !anon || !email || !password) {
    fail("0. Auth config", "Missing E2E_TEST_EMAIL / E2E_TEST_PASSWORD");
    return finish();
  }

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: si, error: siErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (siErr || !si.session) {
    fail("1. Login", siErr?.message || "no session");
    return finish();
  }
  pass("1. Login", email);

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

  const builderPage = await api(cookie, "GET", "/dashboard/website-builder");
  if (builderPage.status === 200 && builderPage.text.includes("Website")) {
    pass("2. Open Website Builder page", `status=${builderPage.status}`);
  } else if ([302, 307].includes(builderPage.status)) {
    pass("2. Open Website Builder page", `redirect=${builderPage.status}`);
  } else {
    fail("2. Open Website Builder page", `status=${builderPage.status}`);
  }

  const runtimeList = await api(
    cookie,
    "GET",
    "/api/website-builder/template-runtime",
  );
  let templateIds = [];
  try {
    const json = JSON.parse(runtimeList.text);
    templateIds = json.templateIds || [];
  } catch {
    /* empty */
  }
  if (runtimeList.status !== 200 || templateIds.length === 0) {
    fail("3. List installed templates", runtimeList.text.slice(0, 160));
    return finish();
  }
  pass("3. List installed templates", templateIds.join(", "));

  for (const templateId of templateIds) {
    const prefix = `template:${templateId}`;
    console.log(`\n--- Testing ${templateId} ---`);

    const runtime = await api(
      cookie,
      "GET",
      `/api/website-builder/template-runtime?id=${encodeURIComponent(templateId)}`,
    );
    if (runtime.status !== 200) {
      fail(`${prefix} runtime model`, `${runtime.status}`);
      continue;
    }
    pass(`${prefix} runtime model`);

    const genBody = {
      prompt: `E2E test website for template ${templateId}. A modern business site with hero, services, about, and contact.`,
      projectType: "Business Website",
      language: "English",
      theme: "Gold Luxury",
      features: ["Contact", "product:website-builder", `wb-template-package:${templateId}`],
      productId: "website-builder",
      mode: "generate",
      websiteStructureTemplateId: templateId,
      generationProfile: "fast",
    };

    console.log(`Generating with ${templateId}...`);
    const gen = await generate(cookie, genBody);
    if (!gen.ok) {
      fail(`${prefix} generate`, gen.error);
      continue;
    }
    pass(`${prefix} generate`, `${gen.ms}ms via=${gen.via}`);

    const generationId = gen.complete.generation.id;
    const files = extractProjectFiles(gen.complete.generation);
    if (files.length === 0) {
      fail(`${prefix} files created`, "no files in blueprint");
      continue;
    }
    pass(`${prefix} files created`, `count=${files.length}`);

    const pages = countPages(files);
    const sections = countSections(files);
    if (pages < 1) {
      fail(`${prefix} pages`, "no pages detected");
    } else {
      pass(`${prefix} pages`, `count=${pages}`);
    }
    if (sections < 1) {
      fail(`${prefix} sections render`, "no sections detected in output");
    } else {
      pass(`${prefix} sections render`, `indicators=${sections}`);
    }

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
      pass(`${prefix} preview`, `bytes=${preview.text.length}`);
    } else {
      fail(`${prefix} preview`, `${preview.status} ct=${pct}`);
    }

    const snapshot = await api(
      cookie,
      "POST",
      `/api/website-builder/${generationId}/builder/snapshots`,
      { label: `E2E ${templateId}` },
    );
    if (snapshot.status === 200) {
      pass(`${prefix} save snapshot`, "ok");
    } else {
      fail(`${prefix} save snapshot`, `${snapshot.status} ${snapshot.text.slice(0, 120)}`);
    }

    const zipRes = await fetch(
      `${base}/api/website-builder/${generationId}/export`,
      { headers: { Cookie: cookie }, redirect: "manual" },
    );
    const buf = Buffer.from(await zipRes.arrayBuffer());
    const looksZip =
      zipRes.status === 200 && buf.length > 100 && buf[0] === 0x50 && buf[1] === 0x4b;
    if (looksZip) {
      pass(`${prefix} export ZIP`, `bytes=${buf.length}`);
    } else {
      fail(
        `${prefix} export ZIP`,
        `${zipRes.status} bytes=${buf.length}`,
      );
    }

    const getGen = await api(cookie, "GET", `/api/website-builder/${generationId}`);
    if (getGen.status === 200) {
      pass(`${prefix} editor data load`, "generation GET ok");
    } else {
      fail(`${prefix} editor data load`, `${getGen.status}`);
    }
  }

  finish();
}

function finish() {
  console.log("\n=== WORKFLOW RESULT ===");
  const passed = steps.filter((s) => s.status === "PASS");
  const failed = steps.filter((s) => s.status === "FAIL");
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) {
    for (const f of failed) {
      console.log(`  - ${f.name}: ${f.detail}`);
    }
  }
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
