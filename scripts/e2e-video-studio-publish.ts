/**
 * P0-5 runtime: publish/unpublish.
 * Live account has no playable composite — prove honest rejection.
 * Fixture MP4 is used only for in-process publish mechanics (not Video Generation).
 * Does not start paid generation, campaigns, or a second Next.js server.
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { randomUUID } from "node:crypto";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";
import {
  loadPublicVideoPage,
  publishVideoProject,
  unpublishVideoProject,
} from "@/lib/ai-core/video-production-platform/publish";
import { sha256Hex } from "@/lib/ai-core/video-production-platform/runtime/ingest";

loadEnvLocal();

const steps: Array<{ name: string; status: "PASS" | "FAIL"; detail?: string }> = [];
function log(name: string, status: "PASS" | "FAIL", detail = "") {
  steps.push({ name, status, detail });
  console.log(`${status.padEnd(4)} ${name}${detail ? ` — ${detail}` : ""}`);
}

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
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

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_generations: [],
    video_plans: [],
    video_media: [],
    video_quality_reports: [],
    video_publications: [],
  };
  function matches(row: Record<string, unknown>, filters: Array<[string, string, unknown]>) {
    return filters.every(([op, key, value]) => (op === "eq" ? row[key] === value : Array.isArray(value) && value.includes(row[key])));
  }
  function from(table: string) {
    const state: {
      action: string;
      payload: unknown;
      filters: Array<[string, string, unknown]>;
      orderCol: string | null;
      orderAsc: boolean;
      limitN: number | null;
    } = { action: "select", payload: null, filters: [], orderCol: null, orderAsc: true, limitN: null };
    async function execute(shape: "single" | "maybe" | "many") {
      const rows = tables[table] || (tables[table] = []);
      let data: Record<string, unknown>[] = [];
      if (state.action === "insert") {
        const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
        for (const raw of incoming as Record<string, unknown>[]) {
          const row = { created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...raw };
          if (!row.id) row.id = randomUUID();
          rows.push(row);
          data.push(row);
        }
      } else if (state.action === "update") {
        for (const row of rows) {
          if (matches(row, state.filters)) {
            Object.assign(row, state.payload as object);
            data.push(row);
          }
        }
      } else {
        data = rows.filter((row) => matches(row, state.filters));
        if (state.limitN != null) data = data.slice(0, state.limitN);
      }
      if (shape === "single") return { data: data[0] || null, error: data[0] ? null : { code: "PGRST116" } };
      if (shape === "maybe") return { data: data[0] || null, error: null };
      return { data, error: null };
    }
    const api: Record<string, unknown> = {
      insert(payload: unknown) {
        state.action = "insert";
        state.payload = payload;
        return api;
      },
      update(payload: unknown) {
        state.action = "update";
        state.payload = payload;
        return api;
      },
      select() {
        return api;
      },
      eq(key: string, value: unknown) {
        state.filters.push(["eq", key, value]);
        return api;
      },
      in(key: string, value: unknown) {
        state.filters.push(["in", key, value]);
        return api;
      },
      order() {
        return api;
      },
      limit(n: number) {
        state.limitN = n;
        return api;
      },
      maybeSingle: () => execute("maybe"),
      single: () => execute("single"),
      then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) {
        return execute("many").then(resolve, reject);
      },
    };
    return api;
  }
  return {
    from,
    storage: {
      from() {
        return {
          async createSignedUrl() {
            return { data: { signedUrl: "https://signed.example/delivery.mp4" } };
          },
          async download() {
            return { data: { arrayBuffer: async () => contractMp4().buffer } };
          },
        };
      },
    },
    _tables: tables,
  };
}

async function fixtureMechanics() {
  const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const PROJECT = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  const bytes = contractMp4();
  const supabase = createMemorySupabase();
  supabase._tables.video_generations.push({
    id: PROJECT,
    user_id: USER,
    video_name: "Fixture publish film",
    prompt: "Studio fixture used only to prove publish mechanics.",
    domain_state: "video_rendered",
    status: "video_rendered",
  });
  supabase._tables.video_plans.push({
    id: randomUUID(),
    user_id: USER,
    project_id: PROJECT,
    is_active: true,
  });
  supabase._tables.video_media.push({
    id: "fixture-composite",
    user_id: USER,
    generation_id: PROJECT,
    kind: "composite",
    mime_type: "video/mp4",
    storage_path: `${USER}/${PROJECT}/fixture.mp4`,
    public_url: `data:video/mp4;base64,${Buffer.from(bytes).toString("base64")}`,
    duration_sec: 8,
    provider: "kling",
    sha256: sha256Hex(bytes),
  });
  const published = await publishVideoProject({ supabase, userId: USER, projectId: PROJECT });
  const page = await loadPublicVideoPage({
    supabase,
    slug: published.publication.slug,
    origin: "https://app.example",
  });
  const unpublished = await unpublishVideoProject({ supabase, userId: USER, projectId: PROJECT });
  const gone = await loadPublicVideoPage({
    supabase,
    slug: published.publication.slug,
    origin: "https://app.example",
  });
  const ok =
    published.domainState === "published" &&
    page.status === 200 &&
    unpublished.publication?.status === "unpublished" &&
    gone.status === 410 &&
    supabase._tables.video_media.some((row) => row.id === "fixture-composite");
  log(
    "fixture publish mechanics (not generation)",
    ok ? "PASS" : "FAIL",
    `publish=${published.domainState} public=${page.status} unpublish=${unpublished.publication?.status} gone=${gone.status}`,
  );
  return ok;
}

async function main() {
  const fixtureOk = await fixtureMechanics();
  const base = resolveHarnessBaseUrl();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!url || !anon || !email || !password) {
    log("env", "FAIL", "E2E credentials missing");
    process.exit(fixtureOk ? 0 : 1);
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

  const list = await jsonFetch(`${base}/api/video-studio?limit=20`, { headers });
  const generations = (list.body?.generations || list.body?.data || []) as Array<{ id: string }>;
  if (!list.res.ok || !generations.length) {
    log("list projects", "FAIL", `${list.res.status}`);
    process.exit(1);
  }
  const projectId = generations[0]!.id;
  log("list projects", "PASS", projectId.slice(0, 8));

  const published = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/publish`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const message = String(published.body?.message || published.body?.error || "");
  const rejected =
    published.res.status >= 400 &&
    /composite|playable|artifact|plan|state/i.test(message) &&
    !published.body?.publicUrl;
  log("live publish without playable artifact", rejected ? "PASS" : "FAIL", `${published.res.status} ${message.slice(0, 180)}`);

  const unpublished = await jsonFetch(`${base}/api/video-studio/projects/${projectId}/unpublish`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  const unpublishOk = unpublished.res.ok || unpublished.res.status === 404;
  log("live unpublish idempotent/safe", unpublishOk ? "PASS" : "FAIL", `${unpublished.res.status}`);

  const publicMissing = await fetch(`${base}/w/video/not-a-published-video`);
  log("public unknown slug", publicMissing.status === 404 ? "PASS" : "FAIL", `${publicMissing.status}`);

  if (!fixtureOk || !rejected || !unpublishOk || publicMissing.status !== 404) process.exit(1);
  console.log("P0-5 RUNTIME: fixture mechanics only. Live publish correctly refused. Not a Veo/generation proof.");
}

main().catch((error) => {
  log("runtime", "FAIL", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
