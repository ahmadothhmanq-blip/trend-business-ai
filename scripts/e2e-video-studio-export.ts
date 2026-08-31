/**
 * P0-4 runtime: POST /api/video-studio/[id]/manage action=export_social once.
 * If no playable composite exists, prove honest rejection. Do not fake success.
 * Does not start Publish. Does not start a second Next.js server.
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
  if (error || !data.session || !data.user) {
    log("login", "FAIL", error?.message || "no session");
    process.exit(1);
  }
  log("login", "PASS");
  const cookie = await buildCookie(data.session.access_token, data.session.refresh_token);
  const headers = { Cookie: cookie, "Content-Type": "application/json" };
  const userId = data.user.id;

  const list = await jsonFetch(`${base}/api/video-studio?limit=20`, { headers });
  const generations = (list.body?.generations || list.body?.data || []) as Array<{ id: string }>;
  if (!list.res.ok || !generations.length) {
    log("list projects", "FAIL", `${list.res.status}`);
    process.exit(1);
  }
  const projectId = generations[0]!.id;
  log("list projects", "PASS", `n=${generations.length} using ${projectId.slice(0, 8)}`);

  const { data: media, error: mediaError } = await auth
    .from("video_media")
    .select("id,kind,mime_type,duration_sec,provider,public_url,sha256,width,height,codec,size_bytes")
    .eq("user_id", userId)
    .eq("generation_id", projectId)
    .eq("kind", "composite")
    .in("mime_type", ["video/mp4", "video/webm"])
    .order("created_at", { ascending: false })
    .limit(8);
  if (mediaError) {
    log("composite query", "FAIL", mediaError.message);
    process.exit(1);
  }
  const playable = (media || []).filter(
    (row) =>
      Number(row.duration_sec) > 0 &&
      row.provider !== "preview" &&
      row.provider !== "preview-stub" &&
      Boolean(row.public_url),
  );
  log(
    "composite inventory",
    "PASS",
    playable.length ? `PLAYABLE_COMPOSITE=${playable.length}` : "PLAYABLE_COMPOSITE=0",
  );

  const exported = await jsonFetch(`${base}/api/video-studio/${projectId}/manage`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      action: "export_social",
      presetId: "tiktok",
      persistAssets: false,
      reencode: true,
    }),
  });
  const message = String(exported.body?.message || exported.body?.error || "");
  const social = exported.body?.socialExport as { videoUrl?: string; publishReady?: boolean } | undefined;

  if (!playable.length) {
    const rejected =
      exported.res.status >= 400 &&
      /composite|playable|assembled video/i.test(message) &&
      !social?.videoUrl &&
      social?.publishReady !== true;
    log(
      "export rejects missing composite",
      rejected ? "PASS" : "FAIL",
      `${exported.res.status} ${message.slice(0, 180)}`,
    );
    if (!rejected) process.exit(1);
    console.log("P0-4 RUNTIME: honest rejection (no playable composite). Publish not started.");
    process.exit(0);
  }

  const ok =
    exported.res.ok &&
    Boolean(social?.videoUrl) &&
    /verified|exported|reused/i.test(message) &&
    social?.publishReady !== true;
  log("export one playable composite", ok ? "PASS" : "FAIL", `${exported.res.status} ${message.slice(0, 180)}`);
  if (!ok) process.exit(1);
  console.log("P0-4 RUNTIME: one verified export completed. Publish not started.");
}

main().catch((error) => {
  log("runtime", "FAIL", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
