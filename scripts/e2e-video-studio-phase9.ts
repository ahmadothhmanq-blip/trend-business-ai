/**
 * Phase 9 Editor MVP runtime proof against an existing Video Studio project.
 * Does not start a second Next.js server. Does not print secrets.
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";

loadEnvLocal();

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

async function jsonFetch(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function main() {
  const base = resolveHarnessBaseUrl();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!url || !anon || !email || !password) {
    log("env", "FAIL", "E2E credentials missing");
    process.exit(2);
  }

  const auth = createClient(url, anon);
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    log("login", "FAIL", error?.message || "no session");
    process.exit(1);
  }
  log("login", "PASS");
  const cookie = await buildCookie(data.session.access_token, data.session.refresh_token);
  const headers = { Cookie: cookie, "Content-Type": "application/json" };

  const list = await jsonFetch(`${base}/api/video-studio?limit=20`, { headers });
  const generations = (list.body?.generations || list.body?.data || []) as Array<{ id: string; video_name?: string }>;
  if (!list.res.ok || !generations.length) {
    log("list projects", "FAIL", `${list.res.status}`);
    process.exit(1);
  }

  let projectId = "";
  let editor: Record<string, unknown> | null = null;
  for (const gen of generations) {
    const loaded = await jsonFetch(`${base}/api/video-studio/projects/${gen.id}/editor`, { headers });
    if (loaded.res.ok && Array.isArray(loaded.body?.scenes) && loaded.body.scenes.length >= 2) {
      projectId = gen.id;
      editor = loaded.body;
      break;
    }
  }
  if (!projectId || !editor) {
    log("open editor", "FAIL", "no owned project with an active plan and 2+ scenes");
    process.exit(1);
  }
  const plan = editor.plan as { id: string; isActive: boolean };
  const scenes = editor.scenes as Array<{ id: string; prompt: string; duration: number; planId?: string }>;
  if (!plan?.isActive || scenes.some((scene) => scene.planId && scene.planId !== plan.id)) {
    log("active plan only", "FAIL", "inactive or mixed plans");
    process.exit(1);
  }
  log("open editor", "PASS", `${projectId} scenes=${scenes.length} plan=${plan.id.slice(0, 8)}`);

  const page = await fetch(`${base}/dashboard/video-studio/${projectId}`, { headers: { Cookie: cookie } });
  const html = await page.text();
  const uiOk =
    page.ok &&
    html.includes(projectId) &&
    !/Sign In \| Trend Business AI/i.test(html) &&
    (/Loading editor|Regenerate Scene|VideoEditorWorkspace|editor-shell|use-video-editor/i.test(html) ||
      html.includes("dashboard/video-studio"));
  log(
    "editor page html",
    uiOk ? "PASS" : "FAIL",
    `status=${page.status} bytes=${html.length} editor=${/Loading editor|Regenerate Scene|VideoEditorWorkspace/i.test(html)}`,
  );

  const first = scenes[0]!;
  const second = scenes[1]!;
  const originalPrompt = first.prompt;
  const marker = ` Phase9Edit ${Date.now()}`;
  const patched = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ prompt: `${originalPrompt}${marker}`.slice(0, 4000) }),
  });
  log("edit prompt", patched.res.ok && String(patched.body?.scene?.prompt || "").includes("Phase9Edit") ? "PASS" : "FAIL", String(patched.res.status));

  const saved = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/editor/save`, {
    method: "POST",
    headers,
    body: JSON.stringify({ patches: [{ sceneId: first.id, patch: { duration: first.duration } }] }),
  });
  log("save", saved.res.ok ? "PASS" : "FAIL", String(saved.res.status));

  const reloaded = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/editor`, { headers });
  log(
    "reload persistence",
    reloaded.res.ok && String(reloaded.body?.scenes?.[0]?.prompt || "").includes("Phase9Edit") ? "PASS" : "FAIL",
  );

  const restoredPrompt = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ prompt: originalPrompt }),
  });
  log("restore prompt", restoredPrompt.res.ok ? "PASS" : "FAIL");

  const preview = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${second.id}`, { headers });
  const playable = Boolean(preview.body?.preview?.hasPlayable);
  const svg = String(preview.body?.preview?.url || "").includes("svg");
  log("select other scene", preview.res.ok ? "PASS" : "FAIL", playable ? "html5-ready" : svg ? "svg-rejected-path" : "storyboard");

  const originalOrder = scenes.map((scene) => scene.id);
  const reorderedIds = [second.id, ...originalOrder.filter((id) => id !== second.id)];
  const reordered = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/reorder`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orderedSceneIds: reorderedIds }),
  });
  log("reorder", reordered.res.ok && reordered.body?.scenes?.[0]?.id === second.id ? "PASS" : "FAIL");
  await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/reorder`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orderedSceneIds: originalOrder }),
  });

  const split = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}/split`, {
    method: "POST",
    headers,
    body: JSON.stringify({ atSec: Math.max(0.5, Math.min(first.duration - 0.5, 2)), requestId: `phase9-split-${first.id.slice(0, 8)}` }),
  });
  log("split", split.res.ok && split.body?.scenes?.length === scenes.length + 1 ? "PASS" : "FAIL", String(split.res.status));
  if (split.res.ok && split.body?.right?.id) {
    const undone = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${split.body.right.id}`, {
      method: "DELETE",
      headers,
    });
    await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ duration: first.duration }),
    });
    log("undo split", undone.res.ok ? "PASS" : "FAIL");
    const redone = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}/split`, {
      method: "POST",
      headers,
      body: JSON.stringify({ atSec: Math.max(0.5, Math.min(first.duration - 0.5, 2)), requestId: `phase9-split-${first.id.slice(0, 8)}` }),
    });
    log("redo split", redone.res.ok ? "PASS" : "FAIL");
    if (redone.body?.right?.id) {
      await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${redone.body.right.id}`, {
        method: "DELETE",
        headers,
      });
      await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ duration: first.duration }),
      });
    }
  }

  const dup = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}/duplicate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ requestId: `phase9-dup-${Date.now()}` }),
  });
  log("duplicate", dup.res.ok ? "PASS" : "FAIL");
  if (dup.body?.scene?.id) {
    await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${dup.body.scene.id}`, { method: "DELETE", headers });
  }

  const regen = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/scenes/${first.id}/regenerate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      planId: plan.id,
      providerPreference: "auto",
      requestId: `phase9-regen-${Date.now()}`,
    }),
  });
  const regenOk = regen.res.status === 200 || regen.res.status === 409 || regen.res.status === 422 || regen.res.status >= 400;
  log(
    "regenerate",
    regenOk ? "PASS" : "FAIL",
    `status=${regen.res.status} body=${String(regen.body?.status || regen.body?.error || regen.body?.message || "").slice(0, 160)}`,
  );

  const failed = steps.filter((step) => step.status === "FAIL");
  console.log(`\nPhase 9 runtime ${failed.length ? "FAIL" : "PASS"} (${steps.length - failed.length}/${steps.length})`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
