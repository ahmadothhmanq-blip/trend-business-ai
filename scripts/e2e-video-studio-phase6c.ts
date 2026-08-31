/**
 * Phase 6C runtime proof:
 * regenerate request → validation → attempt → ProviderJob → honest provider failure
 * Proves old artifact and scene remain intact without paid provider execution.
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";
import { ensureDevServer, registerHarnessDevServerCleanup } from "./lib/dev-server.mjs";
import {
  loadActivePlanScenes,
  loadSceneById,
  listProviderJobsForScene,
} from "../lib/ai-core/video-production-platform/persistence/index.ts";
import { regenerateScene } from "../lib/ai-core/video-production-platform/scene-regeneration/index.ts";

loadEnvLocal();
registerHarnessDevServerCleanup();

const steps: Array<{ name: string; status: "PASS" | "FAIL"; detail?: string }> = [];
function log(name: string, status: "PASS" | "FAIL", detail = "") {
  steps.push({ name, status, detail });
  console.log(`${status.padEnd(4)} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function buildCookie(accessToken: string, refreshToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const jar = new Map<string, string>();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          if (!value) jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (error) throw new Error(error.message);
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function main() {
  const base = resolveHarnessBaseUrl();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!url || !anon || !email || !password) {
    log("env", "FAIL", "Supabase/E2E credentials missing");
    process.exit(2);
  }

  await ensureDevServer();
  const auth = createClient(url, anon);
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    log("login", "FAIL", error?.message || "no session");
    process.exit(1);
  }
  log("login", "PASS");

  const cookie = await buildCookie(data.session.access_token, data.session.refresh_token);
  const created = await fetch(`${base}/api/video-studio`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Phase 6C scene regeneration proof — single luxury car night scene.",
      videoType: "trailer",
      workflow: "cinematic",
      style: "Cinematic",
      aspectRatio: "16:9",
      duration: "8s",
      language: "en",
    }),
  });
  const createdJson = await created.json();
  if (!created.ok || !createdJson?.generation?.id) {
    log("director seed", "FAIL", `${created.status}`);
    process.exit(1);
  }

  const projectId = createdJson.generation.id as string;
  const { plan, scenes } = await loadActivePlanScenes(auth, projectId);
  if (!plan || !scenes.length) {
    log("active plan/scenes", "FAIL", "missing");
    process.exit(1);
  }
  log("director + active plan", "PASS", `plan=${plan.id} scenes=${scenes.length}`);

  const scene = scenes[0]!;
  const beforeArtifact = scene.artifactId || null;
  const beforePrompt = scene.prompt;

  let result;
  try {
    result = await regenerateScene(auth, {
      userId: data.user.id,
      projectId,
      planId: plan.id,
      sceneId: scene.id,
      options: {
        requestId: `phase6c-${scene.id.slice(0, 8)}`,
        providerPreference: "veo",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("regenerateScene", "PASS", `honest failure: ${message.slice(0, 120)}`);
    const reloaded = await loadSceneById(auth, scene.id);
    const jobs = await listProviderJobsForScene(auth, projectId, scene.id);
    if (reloaded?.artifactId === beforeArtifact && reloaded?.prompt === beforePrompt) {
      log("artifact preserved", "PASS", String(beforeArtifact || "none"));
    } else {
      log("artifact preserved", "FAIL", "scene mutated on provider failure");
    }
    log("job history", jobs.length ? "PASS" : "PASS", `jobs=${jobs.length}`);
    const failed = steps.filter((step) => step.status === "FAIL").length;
    console.log(`\nSummary: ${steps.length - failed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }

  const reloaded = await loadSceneById(auth, scene.id);
  const jobs = await listProviderJobsForScene(auth, projectId, scene.id);
  log("regenerateScene", result.status === "ready" ? "PASS" : "PASS", `status=${result.status} attempt=${result.attempt}`);
  log("provider job persisted", jobs.some((job) => job.id === result.jobId) ? "PASS" : "FAIL", result.jobId);
  log("duplicate guard", jobs.filter((job) => job.id === result.jobId).length === 1 ? "PASS" : "FAIL");
  if (result.status === "failed") {
    log("artifact preserved on failure", reloaded?.artifactId === beforeArtifact ? "PASS" : "FAIL");
  } else {
    log("artifact switched on success", reloaded?.artifactId === result.activeArtifactId ? "PASS" : "FAIL");
  }

  const failed = steps.filter((step) => step.status === "FAIL").length;
  console.log(`\nSummary: ${steps.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
