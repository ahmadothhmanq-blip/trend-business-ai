/**
 * Phase 4 runtime proof: POST /api/video-studio → plan/scenes/SM,
 * then manage render through Router v2 + ProviderJob.
 *
 * Does not start Editor, Director, or Publish.
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";
import { ensureDevServer, registerHarnessDevServerCleanup } from "./lib/dev-server.mjs";

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
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  steps.push({ name, status: "FAIL", detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
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
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: r.status, text, json, ms: Date.now() - t0 };
}

async function main() {
  console.log(`Video Studio Phase 4 runtime @ ${base}`);
  if (!url || !anon) {
    fail("env", "NEXT_PUBLIC_SUPABASE_URL / ANON_KEY missing");
    process.exit(2);
  }
  if (!email || !password) {
    fail("env", "E2E_TEST_EMAIL / E2E_TEST_PASSWORD missing");
    process.exit(2);
  }

  await ensureDevServer();

  const auth = createClient(url, anon);
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    fail("login", error?.message || "no session");
    process.exit(1);
  }
  pass("login", data.user.id);
  const cookie = await buildSsrCookieHeader(data.session.access_token, data.session.refresh_token);

  const created = await api(cookie, "POST", "/api/video-studio", {
    prompt: "Cinematic studio product film for a B2B analytics platform, no people.",
    videoType: "product-demo",
    style: "Cinematic",
    aspectRatio: "16:9",
    duration: "8s",
    mood: "Professional",
    cameraMove: "Static",
    sceneCount: 1,
  });

  if (created.status !== 200 || !created.json?.generation?.id) {
    fail("POST /api/video-studio", `${created.status} ${created.text.slice(0, 400)}`);
    process.exit(1);
  }

  const generation = created.json.generation;
  const generationId = generation.id;
  const domainState = generation.domain_state || generation.status;
  if (domainState !== "storyboard_ready") {
    fail("generate state", `expected storyboard_ready, got ${domainState}`);
    process.exit(1);
  }
  if (created.json.playableVideo === true) {
    fail("generate honesty", "playableVideo must be false after storyboard generate");
    process.exit(1);
  }
  pass(
    "generate/plan",
    `${generationId} state=${domainState} plan=${generation.active_plan_id || "n/a"} ${created.ms}ms`,
  );

  const rendered = await api(cookie, "POST", `/api/video-studio/${generationId}/manage`, {
    action: "render",
    mode: "full",
  });

  const renderState =
    rendered.json?.generation?.domain_state ||
    rendered.json?.generation?.status ||
    "";
  const jobStatus = rendered.json?.job?.status || "";
  const message = rendered.json?.error || rendered.json?.message || rendered.text.slice(0, 240);

  if (rendered.status === 400) {
    if (!/configur/i.test(String(message))) {
      fail("render unconfigured", `${rendered.status} ${message}`);
      process.exit(1);
    }
    const after = await api(cookie, "GET", `/api/video-studio/${generationId}/manage`);
    const failedState =
      after.json?.generation?.domain_state || after.json?.generation?.status || "";
    if (failedState !== "failed") {
      fail("failed state after unconfigured", failedState || after.text.slice(0, 240));
      process.exit(1);
    }
    pass("render → Router v2 → failed/unconfigured", `${failedState} ${message}`);
  } else if (rendered.status === 200) {
    const allowed = new Set(["generating", "processing", "quality_check", "assembling", "video_rendered", "failed"]);
    if (!allowed.has(renderState) && renderState !== "storyboard_ready") {
      fail("render state", `unexpected ${renderState} / job ${jobStatus}`);
      process.exit(1);
    }
    if (renderState === "video_rendered" && !rendered.json?.job?.compositeAsset && !rendered.json?.job?.clips?.some((c) => c.asset?.url)) {
      fail("video_rendered without artifact", "no clip/composite URL");
      process.exit(1);
    }
    pass(
      "render path",
      `http=${rendered.status} domain=${renderState} job=${jobStatus} ${rendered.ms}ms`,
    );
  } else {
    fail("POST manage render", `${rendered.status} ${message}`);
    process.exit(1);
  }

  console.log("\nPhase 4 runtime flow verified:");
  console.log("  Generate/Plan → Scene → Router → ProviderJob → Artifact/QC/Render → video_rendered|failed");
  const failed = steps.filter((s) => s.status === "FAIL");
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
