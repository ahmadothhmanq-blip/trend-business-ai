/**
 * Phase 5 runtime proof: Prompt → Director → VideoPlan → persist plan/scenes → DB readback.
 * Does not render video, open Editor, publish, or start TTS/music/QC.
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
  console.log(`Video Studio Phase 5 runtime @ ${base}`);
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
    prompt: "Cinematic night film of a glass headquarters for a B2B analytics company. No people. Controlled architectural lighting.",
    videoType: "trailer",
    workflow: "cinematic",
    style: "Cinematic",
    aspectRatio: "16:9",
    duration: "8s",
    language: "en",
    mood: "Professional",
    cameraMove: "Static",
    sceneCount: 2,
  });

  if (created.status !== 200 || !created.json?.generation?.id) {
    fail("POST /api/video-studio Director", `${created.status} ${created.text.slice(0, 500)}`);
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
    fail("honesty", "Phase 5 must not claim a playable video");
    process.exit(1);
  }
  if (!created.json.plan || !Array.isArray(created.json.scenes) || created.json.scenes.length < 1) {
    fail("director payload", "response missing plan/scenes");
    process.exit(1);
  }
  pass("Prompt → Director → VideoPlan", `${generationId} scenes=${created.json.scenes.length} ${created.ms}ms`);

  const { data: plans, error: planError } = await auth
    .from("video_plans")
    .select("*")
    .eq("project_id", generationId)
    .order("version", { ascending: false })
    .limit(1);
  if (planError || !plans?.[0]) {
    fail("video_plans read", planError?.message || "no plan row");
    process.exit(1);
  }
  const planRow = plans[0];
  const { data: scenes, error: sceneError } = await auth
    .from("video_scenes")
    .select("*")
    .eq("project_id", generationId)
    .order("scene_order", { ascending: true });
  if (sceneError || !scenes?.length) {
    fail("video_scenes read", sceneError?.message || "no scene rows");
    process.exit(1);
  }

  const responsePlan = created.json.plan;
  if (planRow.id !== responsePlan.id) {
    fail("plan id mismatch", `${planRow.id} vs ${responsePlan.id}`);
    process.exit(1);
  }
  if (Number(planRow.duration_sec) !== responsePlan.totalDuration) {
    fail("duration mismatch", `${planRow.duration_sec} vs ${responsePlan.totalDuration}`);
    process.exit(1);
  }
  if (planRow.aspect_ratio !== "16:9" || responsePlan.aspectRatio !== "16:9") {
    fail("aspect ratio", `${planRow.aspect_ratio} / ${responsePlan.aspectRatio}`);
    process.exit(1);
  }
  if (!planRow.language || planRow.language !== responsePlan.language) {
    fail("language", `${planRow.language} / ${responsePlan.language}`);
    process.exit(1);
  }
  if (scenes.some((scene) => scene.dialogue?.language && scene.dialogue.language !== planRow.language)) {
    fail("scene language", "scene dialogue language diverged from plan");
    process.exit(1);
  }
  const durationSum = scenes.reduce((sum, scene) => sum + Number(scene.duration_sec), 0);
  if (Math.abs(durationSum - Number(planRow.duration_sec)) > 0.5) {
    fail("scene duration allocation", `sum=${durationSum} total=${planRow.duration_sec}`);
    process.exit(1);
  }
  const orders = scenes.map((scene) => scene.scene_order).join(",");
  const expected = scenes.map((_, index) => index).join(",");
  if (orders !== expected) {
    fail("scene order", orders);
    process.exit(1);
  }
  const spec = planRow.spec || {};
  if (!spec.audioPlan || !Array.isArray(spec.outputVariants) || spec.outputVariants.length !== 1) {
    fail("plan spec contract", JSON.stringify({ audioPlan: Boolean(spec.audioPlan), variants: spec.outputVariants }));
    process.exit(1);
  }
  if (spec.outputVariants[0]?.aspectRatio !== "16:9" || spec.outputVariants[0]?.supported !== true) {
    fail("output variants over-promised", JSON.stringify(spec.outputVariants));
    process.exit(1);
  }
  const firstScene = scenes[0];
  if (!firstScene.prompt || !firstScene.camera || !firstScene.provider_preference) {
    fail("scene contract", JSON.stringify(firstScene));
    process.exit(1);
  }
  pass(
    "DB readback matches contract",
    `plan=${planRow.id} scenes=${scenes.length} spec.audio=${Boolean(spec.audioPlan)}`,
  );

  console.log("\nPhase 5 runtime flow verified:");
  console.log("  Prompt → Director → VideoPlan → persist video_plans/video_scenes → readback");
  const failed = steps.filter((s) => s.status === "FAIL");
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
