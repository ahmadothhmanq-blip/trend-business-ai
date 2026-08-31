/**
 * P0-5 Production Video Publish / Unpublish.
 * Fixture MP4 proves publish mechanics, not Video Generation.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";
import {
  htmlContainsInternalStorage,
  loadPublicVideoPage,
  publishVideoProject,
  unpublishVideoProject,
} from "@/lib/ai-core/video-production-platform/publish";
import { VideoPublishError } from "@/lib/ai-core/video-production-platform/publish/errors";
import { videoPublishUiFromApi } from "@/lib/ai-core/video-production-platform/publish/ui-state";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";
import { sha256Hex } from "@/lib/ai-core/video-production-platform/runtime/ingest";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const PROJECT = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const PLAN = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

function stubMp4(): Uint8Array {
  const bytes = new Uint8Array(2000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], 0);
  bytes.set(Buffer.from("TB-AI-VIDEO:preview"), 64);
  return bytes;
}

function dataUrl(bytes: Uint8Array, mime = "video/mp4"): string {
  return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
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
    return filters.every(([op, key, value]) => {
      if (op === "eq") return row[key] === value;
      if (op === "in") return Array.isArray(value) && value.includes(row[key]);
      return true;
    });
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
      const error: { message: string; code?: string } | null = null;
      if (state.action === "insert") {
        const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
        for (const raw of incoming as Record<string, unknown>[]) {
          const row: Record<string, unknown> = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...raw,
          };
          if (!row.id) row.id = randomUUID();
          rows.push(row);
          data.push(row);
        }
      } else if (state.action === "update") {
        for (const row of rows) {
          if (matches(row, state.filters)) {
            Object.assign(row, state.payload as object, { updated_at: new Date().toISOString() });
            data.push(row);
          }
        }
      } else {
        data = rows.filter((row) => matches(row, state.filters));
        if (state.orderCol) {
          const col = state.orderCol;
          data.sort((a, b) => String(a[col] ?? "").localeCompare(String(b[col] ?? "")));
          if (!state.orderAsc) data.reverse();
        }
        if (state.limitN != null) data = data.slice(0, state.limitN);
      }
      if (error) return { data: null, error };
      if (shape === "single") {
        return { data: data[0] || null, error: data[0] ? null : { message: "missing", code: "PGRST116" } };
      }
      if (shape === "maybe") return { data: data[0] || null, error: null };
      return { data, error: null };
    }

    const api: MemoryQueryBuilder = {
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
      order(col: string, opts?: { ascending?: boolean }) {
        state.orderCol = col;
        state.orderAsc = opts?.ascending !== false;
        return api;
      },
      limit(n: number) {
        state.limitN = n;
        return api;
      },
      maybeSingle: () => execute("maybe"),
      single: () => execute("single"),
      then(resolve, reject?) {
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
          async upload() {
            return { error: null };
          },
          async createSignedUrl() {
            return { data: { signedUrl: "https://signed.example/delivery.mp4" } };
          },
          getPublicUrl() {
            return { data: { publicUrl: "https://signed.example/delivery.mp4" } };
          },
          async download() {
            return {
              data: { arrayBuffer: async () => contractMp4().buffer },
            };
          },
        };
      },
    },
    _tables: tables,
  };
}

function seedProject(
  supabase: ReturnType<typeof createMemorySupabase>,
  over: {
    userId?: string;
    state?: string;
    plan?: boolean;
    composite?: "mp4" | "stub" | "svg" | "none";
    qc?: "PASS" | "BLOCKED" | null;
  } = {},
) {
  const userId = over.userId || USER;
  supabase._tables.video_generations.push({
    id: PROJECT,
    user_id: userId,
    video_name: "Studio product film",
    prompt: "Cinematic studio product table with controlled lighting.",
    domain_state: over.state ?? "video_rendered",
    status: over.state === "published" ? "video_rendered" : over.state ?? "video_rendered",
    updated_at: new Date().toISOString(),
  });
  if (over.plan !== false) {
    supabase._tables.video_plans.push({
      id: PLAN,
      user_id: userId,
      project_id: PROJECT,
      is_active: true,
      version: 1,
    });
  }
  if (over.composite === "mp4" || over.composite === undefined) {
    const bytes = contractMp4();
    supabase._tables.video_media.push({
      id: "composite-1",
      user_id: userId,
      generation_id: PROJECT,
      kind: "composite",
      mime_type: "video/mp4",
      storage_path: `${userId}/${PROJECT}/final.mp4`,
      public_url: dataUrl(bytes),
      size_bytes: bytes.byteLength,
      duration_sec: 8,
      provider: "kling",
      sha256: sha256Hex(bytes),
      width: 1080,
      height: 1920,
      codec: "h264",
      created_at: new Date().toISOString(),
    });
  } else if (over.composite === "stub") {
    const bytes = stubMp4();
    supabase._tables.video_media.push({
      id: "composite-stub",
      user_id: userId,
      generation_id: PROJECT,
      kind: "composite",
      mime_type: "video/mp4",
      storage_path: `${userId}/${PROJECT}/stub.mp4`,
      public_url: dataUrl(bytes),
      size_bytes: bytes.byteLength,
      duration_sec: 8,
      provider: "kling",
      created_at: new Date().toISOString(),
    });
  } else if (over.composite === "svg") {
    supabase._tables.video_media.push({
      id: "storyboard-1",
      user_id: userId,
      generation_id: PROJECT,
      kind: "poster",
      mime_type: "image/svg+xml",
      storage_path: `${userId}/${PROJECT}/board.svg`,
      public_url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'></svg>",
      size_bytes: 80,
      duration_sec: 0,
      provider: "preview",
      created_at: new Date().toISOString(),
    });
  }
  if (over.qc === "BLOCKED" || over.qc === "PASS") {
    supabase._tables.video_quality_reports.push({
      id: randomUUID(),
      user_id: userId,
      project_id: PROJECT,
      score: over.qc === "BLOCKED" ? 10 : 90,
      blockers: over.qc === "BLOCKED" ? ["visual integrity"] : [],
      warnings: [],
      report: { verdict: over.qc, summary: over.qc, ready: over.qc !== "BLOCKED" },
      created_at: new Date().toISOString(),
    });
  }
}

describe("P0-5 production video publish", () => {
  it("publish without artifact is rejected", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "none" });
    await assert.rejects(
      () => publishVideoProject({ supabase, userId: USER, projectId: PROJECT }),
      (error: unknown) => error instanceof VideoPublishError && error.code === "missing_artifact",
    );
  });

  it("publish with storyboard/SVG is rejected", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { state: "storyboard_ready", composite: "svg" });
    await assert.rejects(
      () => publishVideoProject({ supabase, userId: USER, projectId: PROJECT }),
      (error: unknown) =>
        error instanceof VideoPublishError &&
        (error.code === "missing_artifact" || error.code === "invalid_state"),
    );
  });

  it("publish with valid MP4 fixture succeeds", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "mp4" });
    const result = await publishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    assert.equal(result.domainState, "published");
    assert.equal(result.target.platform, "web");
    assert.equal(result.target.status, "published");
    assert.equal(result.target.artifactId, "composite-1");
    assert.equal(result.publicPath, `/w/video/${result.publication.slug}`);
    assert.equal(supabase._tables.video_generations[0]?.domain_state, "published");
    assert.match(result.publication.slug, /^[a-z0-9-]{2,80}$/);
  });

  it("rejects another user's project (ownership)", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { userId: OTHER, composite: "mp4" });
    await assert.rejects(
      () => publishVideoProject({ supabase, userId: USER, projectId: PROJECT }),
      (error: unknown) => error instanceof VideoPublishError && error.code === "ownership",
    );
  });

  it("QC BLOCKED rejection", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "mp4", qc: "BLOCKED" });
    await assert.rejects(
      () => publishVideoProject({ supabase, userId: USER, projectId: PROJECT }),
      (error: unknown) => error instanceof VideoPublishError && error.code === "qc_blocked",
    );
  });

  it("stub / invalid signature cannot be published", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "stub" });
    await assert.rejects(
      () => publishVideoProject({ supabase, userId: USER, projectId: PROJECT }),
      (error: unknown) => error instanceof VideoPublishError && error.code === "invalid_artifact",
    );
  });

  it("successful publish then public URL serves HTML5 video without storage path", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "mp4" });
    const published = await publishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    const page = await loadPublicVideoPage({
      supabase,
      slug: published.publication.slug,
      origin: "https://app.example",
    });
    assert.equal(page.status, 200);
    if (page.status !== 200) return;
    assert.match(page.html, /<video /);
    assert.match(page.html, /<source src="/);
    assert.match(page.html, /og:video/);
    assert.match(page.html, /Studio product film/);
    assert.equal(htmlContainsInternalStorage(page.html), false);
    assert.doesNotMatch(page.html, /storage:\/\//);
  });

  it("unpublish stops public access and keeps the original artifact", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "mp4" });
    const published = await publishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    const unpublished = await unpublishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    assert.equal(unpublished.publication?.status, "unpublished");
    assert.equal(supabase._tables.video_media.some((row) => row.id === "composite-1"), true);
    const page = await loadPublicVideoPage({
      supabase,
      slug: published.publication.slug,
      origin: "https://app.example",
    });
    assert.equal(page.status, 410);
  });

  it("duplicate publish returns the same PublishTarget and slug", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "mp4" });
    const first = await publishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    const second = await publishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    assert.equal(second.reused, true);
    assert.equal(second.target.id, first.target.id);
    assert.equal(second.publication.slug, first.publication.slug);
    assert.equal(supabase._tables.video_publications.length, 1);
  });

  it("duplicate unpublish is idempotent", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "mp4" });
    await publishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    const first = await unpublishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    const second = await unpublishVideoProject({ supabase, userId: USER, projectId: PROJECT });
    assert.equal(first.publication?.status, "unpublished");
    assert.equal(second.reused, true);
    assert.equal(second.publication?.status, "unpublished");
  });

  it("unknown public slug is 404, not a draft leak", async () => {
    const supabase = createMemorySupabase();
    const page = await loadPublicVideoPage({ supabase, slug: "missing-video", origin: "https://app.example" });
    assert.equal(page.status, 404);
  });

  it("publish without an active plan is rejected", async () => {
    const supabase = createMemorySupabase();
    seedProject(supabase, { composite: "mp4", plan: false });
    await assert.rejects(
      () => publishVideoProject({ supabase, userId: USER, projectId: PROJECT }),
      (error: unknown) => error instanceof VideoPublishError && error.code === "missing_plan",
    );
  });
});

describe("Video Studio publish dashboard mapping", () => {
  it("maps a published API payload to public URL, path, and embed snippet", () => {
    const ui = videoPublishUiFromApi(
      {
        publicUrl: "https://app.example/w/video/hero-abcd1234",
        publicPath: "/w/video/hero-abcd1234",
        publication: { status: "published", slug: "hero-abcd1234", title: "Hero film" },
      },
      "https://app.example",
    );
    assert.equal(ui.published, true);
    assert.equal(ui.publicUrl, "https://app.example/w/video/hero-abcd1234");
    assert.equal(ui.publicPath, "/w/video/hero-abcd1234");
    assert.match(ui.embedHtml || "", /iframe/);
    assert.match(ui.embedHtml || "", /hero-abcd1234/);
    assert.match(ui.embedHtml || "", /Hero film/);
  });

  it("clears public link and embed when unpublished", () => {
    const ui = videoPublishUiFromApi({
      publicPath: "/w/video/hero-abcd1234",
      publication: { status: "unpublished", slug: "hero-abcd1234", title: "Hero film" },
    });
    assert.equal(ui.published, false);
    assert.equal(ui.publicUrl, null);
    assert.equal(ui.embedHtml, null);
  });

  it("builds public URL from origin + path when API omits publicUrl", () => {
    const ui = videoPublishUiFromApi(
      {
        publicPath: "/w/video/studio-clip",
        publication: { status: "published", slug: "studio-clip" },
      },
      "https://trend.example/",
    );
    assert.equal(ui.publicUrl, "https://trend.example/w/video/studio-clip");
  });
});
