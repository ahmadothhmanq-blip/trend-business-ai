import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { listDueProviderJobs } from "@/lib/ai-core/video-production-platform/persistence";
import { processPendingRenderJobs } from "@/lib/ai-core/video-production-platform/generation-pipeline";
import { processDueProviderJobs } from "@/lib/ai-core/video-production-platform/runtime/provider-job-worker";

const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const JOB_A = "11111111-1111-4111-8111-111111111111";
const JOB_B = "22222222-2222-4222-8222-222222222222";

type Row = Record<string, unknown>;

function createTenantSupabase(jobs: Row[]) {
  const eqCalls: Array<{ table: string; column: string; value: unknown }> = [];
  const updateCalls: Array<{ id: unknown; userId: unknown; status: unknown }> = [];

  function from(table: string) {
    const state: {
      filters: Array<[string, string, unknown]>;
      action: "select" | "update";
      payload: Record<string, unknown> | null;
    } = { filters: [], action: "select", payload: null };

    const chain = {
      select() {
        state.action = "select";
        return chain;
      },
      update(payload: Record<string, unknown>) {
        state.action = "update";
        state.payload = payload;
        return chain;
      },
      in() {
        return chain;
      },
      eq(column: string, value: unknown) {
        state.filters.push(["eq", column, value]);
        eqCalls.push({ table, column, value });
        return chain;
      },
      order() {
        return chain;
      },
      limit() {
        return chain;
      },
      maybeSingle: execute,
      single: execute,
      then(resolve: (value: { data: Row[] | null; error: null }) => unknown) {
        return Promise.resolve(execute()).then(resolve);
      },
    };

    async function execute() {
      const rows = jobs.filter((row) =>
        state.filters.every(([op, key, value]) => (op === "eq" ? row[key] === value : true)),
      );
      if (state.action === "update" && state.payload) {
        for (const row of rows) {
          Object.assign(row, state.payload);
          updateCalls.push({
            id: row.id,
            userId: state.filters.find((f) => f[1] === "user_id")?.[2],
            status: state.payload.status,
          });
        }
      }
      return { data: rows, error: null };
    }

    return chain;
  }

  return { from, eqCalls, updateCalls };
}

function dueJob(id: string, userId: string): Row {
  return {
    id,
    user_id: userId,
    project_id: `project-${userId}`,
    scene_id: `scene-${id}`,
    provider: "kling",
    status: "processing",
    idempotency_key: `key-${id}`,
    attempt: 1,
    external_job_id: `ext-${id}`,
    estimated_cost: null,
    actual_cost: null,
    error_code: null,
    error_message: null,
    retry_count: 0,
    next_poll_at: new Date(Date.now() - 1000).toISOString(),
    started_at: new Date().toISOString(),
    submitted_at: new Date().toISOString(),
    completed_at: null,
    created_at: new Date().toISOString(),
  };
}

test("jobs HTTP route cannot opt into cross-tenant processing", () => {
  const src = readFileSync(
    join(process.cwd(), "app/api/video-studio/jobs/route.ts"),
    "utf8",
  );
  assert.equal(src.includes("mineOnly"), false);
  assert.equal(src.includes("userId: parsed.data.mineOnly"), false);
  assert.match(src, /const userId = auth\.user!\.id/);
  assert.match(src, /userId,/);
});

test("listDueProviderJobs for user A does not return user B jobs", async () => {
  const supabase = createTenantSupabase([dueJob(JOB_A, USER_A), dueJob(JOB_B, USER_B)]);
  const aJobs = await listDueProviderJobs(supabase, { userId: USER_A, limit: 10 });
  const bJobs = await listDueProviderJobs(supabase, { userId: USER_B, limit: 10 });
  assert.deepEqual(aJobs.map((job) => job.id), [JOB_A]);
  assert.deepEqual(bJobs.map((job) => job.id), [JOB_B]);
  assert.ok(supabase.eqCalls.some((call) => call.column === "user_id" && call.value === USER_A));
  assert.ok(supabase.eqCalls.some((call) => call.column === "user_id" && call.value === USER_B));
});

test("processPendingRenderJobs for user A does not select user B rows", async () => {
  const supabase = createTenantSupabase([
    {
      id: JOB_A,
      user_id: USER_A,
      generation_id: "gen-a",
      status: "queued",
      payload: { attemptCount: 1 },
      updated_at: new Date().toISOString(),
    },
    {
      id: JOB_B,
      user_id: USER_B,
      generation_id: "gen-b",
      status: "queued",
      payload: { attemptCount: 1 },
      updated_at: new Date().toISOString(),
    },
  ]);
  const result = await processPendingRenderJobs({
    supabase,
    userId: USER_A,
    limit: 10,
  });
  assert.ok(supabase.eqCalls.some((call) => call.column === "user_id" && call.value === USER_A));
  assert.equal(
    supabase.eqCalls.some((call) => call.column === "user_id" && call.value === USER_B),
    false,
  );
  assert.equal(
    result.results.some((row) => row.jobId === JOB_B),
    false,
  );
});

test("processDueProviderJobs scoped to user A never updates user B jobs", async () => {
  const supabase = createTenantSupabase([dueJob(JOB_A, USER_A), dueJob(JOB_B, USER_B)]);
  const registry = {
    kling: {
      id: "kling",
      status: () => "unconfigured" as const,
      pollJob: async () => {
        throw new Error("must not poll");
      },
    },
  };
  const result = await processDueProviderJobs({
    supabase,
    userId: USER_A,
    limit: 10,
    registry: registry as never,
  });
  assert.equal(result.results.some((row) => row.jobId === JOB_B), false);
  assert.equal(supabase.updateCalls.some((call) => call.id === JOB_B), false);
});
