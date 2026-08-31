/**
 * Phase 6A runtime proof:
 * Project → Plan v1 → Scenes v1 → Plan v2 → Scenes v2 → Activate v2 → Load v2 only
 * → Activate v1 → Load v1 only
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";
import { ensureDevServer, registerHarnessDevServerCleanup } from "./lib/dev-server.mjs";
import { activatePlan } from "../lib/ai-core/video-production-platform/plan-versioning/index.ts";
import { directorInputFromGenerateRequest } from "../lib/ai-core/video-production-platform/director/from-generate.ts";
import { runDirector } from "../lib/ai-core/video-production-platform/director/service.ts";
import { loadDomainScenes, listPlansForProject } from "../lib/ai-core/video-production-platform/persistence/index.ts";

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
    /* not json */
  }
  return { status: r.status, text, json };
}

function draftFor(prompt) {
  return {
    objective: `Objective for ${prompt}`,
    narrative: `Narrative for ${prompt}`,
    visualStyle: "cinematic",
    scenes: [
      {
        purpose: "establish",
        duration: 4,
        prompt: `${prompt} wide establishing shot`,
        cameraMove: "static",
        shotSize: "wide",
        environment: "studio",
        lighting: "controlled",
        transition: "cut",
      },
      {
        purpose: "develop",
        duration: 4,
        prompt: `${prompt} closer detail shot`,
        cameraMove: "static",
        shotSize: "medium",
        environment: "studio",
        lighting: "controlled",
        transition: "fade",
      },
    ],
  };
}

async function main() {
  console.log(`Video Studio Phase 6A runtime @ ${base}`);
  if (!url || !anon || !email || !password) {
    fail("env", "Supabase URL/anon or E2E credentials missing");
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
    prompt: "Phase 6A v1 cinematic glass headquarters film without people.",
    videoType: "trailer",
    workflow: "cinematic",
    style: "Cinematic",
    aspectRatio: "16:9",
    duration: "8s",
    language: "en",
  });
  if (created.status !== 200 || !created.json?.generation?.id) {
    fail("Plan v1 generate", `${created.status} ${created.text.slice(0, 400)}`);
    process.exit(1);
  }

  const projectId = created.json.generation.id;
  const v1PlanId = created.json.plan?.id;
  const v1SceneIds = (created.json.scenes || []).map((scene) => scene.id);
  if (!v1PlanId || v1SceneIds.length < 1) {
    fail("Plan v1 payload", "missing plan/scenes");
    process.exit(1);
  }
  pass("Plan v1 + Scenes v1", `${projectId} plan=${v1PlanId} scenes=${v1SceneIds.length}`);

  const v2Prompt = "Phase 6A v2 analytics headquarters night film with controlled lighting.";
  const directed = await runDirector({
    supabase: auth,
    userId: data.user.id,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: v2Prompt,
      videoType: "trailer",
      workflow: "cinematic",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      style: "Cinematic",
      projectId,
    }),
    client: {
      async generateJson() {
        return draftFor(v2Prompt);
      },
    },
  });
  if (directed.status !== "ready" || !directed.plan) {
    fail("Plan v2 Director", directed.errorMessage || directed.status);
    process.exit(1);
  }
  const v2PlanId = directed.plan.id;
  const v2SceneIds = directed.plan.scenes.map((scene) => scene.id);
  pass("Plan v2 + Scenes v2", `plan=${v2PlanId} scenes=${v2SceneIds.length}`);

  const plansAfterV2 = await listPlansForProject(auth, projectId);
  if (plansAfterV2.length !== 2) {
    fail("two plan versions", `count=${plansAfterV2.length}`);
    process.exit(1);
  }
  const v1Row = plansAfterV2.find((row) => row.id === v1PlanId);
  const v2Row = plansAfterV2.find((row) => row.id === v2PlanId);
  if (!v1Row || !v2Row || v1Row.isActive || !v2Row.isActive) {
    fail("v1 inactive after v2", JSON.stringify({ v1: v1Row, v2: v2Row }));
    process.exit(1);
  }
  pass("v1 inactive / v2 active", `v1=${v1Row.status} v2=${v2Row.status}`);

  let loaded = await loadDomainScenes(auth, projectId);
  if (loaded.some((scene) => v1SceneIds.includes(scene.id)) || loaded.some((scene) => scene.planId !== v2PlanId)) {
    fail("load after v2", "mixed or v1 scenes visible");
    process.exit(1);
  }
  pass("loadDomainScenes v2 only", loaded.map((scene) => scene.id).join(","));

  await activatePlan(auth, { projectId, planId: v1PlanId });
  loaded = await loadDomainScenes(auth, projectId);
  if (loaded.some((scene) => v2SceneIds.includes(scene.id)) || loaded.some((scene) => scene.planId !== v1PlanId)) {
    fail("rollback load v1", "v2 scenes visible after activate v1");
    process.exit(1);
  }
  pass("activate v1 rollback", loaded.map((scene) => scene.id).join(","));

  await activatePlan(auth, { projectId, planId: v2PlanId });
  loaded = await loadDomainScenes(auth, projectId);
  if (loaded.some((scene) => scene.planId !== v2PlanId)) {
    fail("activate v2 again", "active plan scenes mismatch");
    process.exit(1);
  }
  pass("activate v2 idempotent path", loaded.map((scene) => scene.id).join(","));

  const { data: allScenes } = await auth
    .from("video_scenes")
    .select("id, plan_id")
    .eq("project_id", projectId);
  const distinctPlans = new Set((allScenes || []).map((row) => row.plan_id));
  if (distinctPlans.size !== 2 || (allScenes || []).length !== v1SceneIds.length + v2SceneIds.length) {
    fail("DB isolation", JSON.stringify({ distinctPlans: [...distinctPlans], count: allScenes?.length }));
    process.exit(1);
  }
  pass("DB keeps both plan scene sets", `rows=${allScenes?.length} plans=${distinctPlans.size}`);

  console.log("\nPhase 6A runtime flow verified:");
  console.log("  v1 + v2 plans persisted, active plan gates scene reads, explicit rollback works");
  const failed = steps.filter((s) => s.status === "FAIL");
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
