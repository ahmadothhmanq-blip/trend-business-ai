/**
 * Video Studio credit semantics — test adapters, not live paid providers.
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyVideoStudioCreditOutcome,
  authorizeVideoStudioCredits,
  directorCreditOutcome,
  honestProviderJobCost,
  lipSyncCreditOutcome,
  regenerationCreditOutcome,
  renderCreditOutcome,
  videoStudioCreditOperationId,
} from "@/lib/ai-core/video-production-platform/runtime/video-credits";
import {
  getMemoryCreditBalance,
  listMemoryCreditLedger,
  resetMemoryCreditLedger,
  seedMemoryCreditBalance,
} from "@/lib/billing/credit-ledger-memory";

const USER = "00000000-0000-4000-8000-000000000001";
const PROJECT = "11111111-1111-4111-8111-111111111111";
const SCENE = "22222222-2222-4222-8222-222222222222";
const fakeSupabase = {} as SupabaseClient;

type AdapterResult = { ok: boolean; reused?: boolean; deferred?: boolean };

async function runPaidPath(input: {
  kind: "director" | "render" | "regenerate" | "lipsync";
  attempt?: number;
  execute: () => Promise<AdapterResult>;
}) {
  const operationId = videoStudioCreditOperationId({
    kind: input.kind,
    projectId: PROJECT,
    sceneId: SCENE,
    attempt: input.attempt,
    jobKey: `${PROJECT}:lipsync:a${input.attempt ?? 1}`,
  });
  const authorized = await authorizeVideoStudioCredits({
    supabase: fakeSupabase,
    userId: USER,
    operationId,
  });
  assert.equal(authorized.ok, true);
  const executed = await input.execute();
  const outcome = executed.reused
    ? "reused"
    : executed.deferred
      ? "deferred"
      : executed.ok
        ? "success"
        : "failed";
  await applyVideoStudioCreditOutcome({
    supabase: fakeSupabase,
    userId: USER,
    operationId,
    outcome,
  });
  return { operationId, outcome };
}

describe("Video Studio credits", () => {
  beforeEach(() => {
    process.env.BILLING_CREDIT_TEST_HARNESS = "1";
    resetMemoryCreditLedger();
    seedMemoryCreditBalance(USER, 10);
  });

  afterEach(() => {
    resetMemoryCreditLedger();
    delete process.env.BILLING_CREDIT_TEST_HARNESS;
  });

  it("authorize success does not deduct until settle", async () => {
    const operationId = videoStudioCreditOperationId({ kind: "director", projectId: PROJECT });
    const authorized = await authorizeVideoStudioCredits({
      supabase: fakeSupabase,
      userId: USER,
      operationId,
    });
    assert.equal(authorized.ok, true);
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    assert.equal(listMemoryCreditLedger(USER).length, 0);
  });

  it("settle success charges exactly one credit", async () => {
    await runPaidPath({
      kind: "director",
      execute: async () => ({ ok: true }),
    });
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
    const ledger = listMemoryCreditLedger(USER);
    assert.equal(ledger.length, 1);
    assert.equal(ledger[0]?.reason, "usage");
    assert.equal(ledger[0]?.delta, -1);
    assert.equal(ledger[0]?.resource, "video-studio");
  });

  it("release/refund on failure does not permanently charge", async () => {
    await runPaidPath({
      kind: "director",
      execute: async () => ({ ok: false }),
    });
    assert.equal(directorCreditOutcome({ status: "failed", plan: null }), "failed");
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    assert.equal(listMemoryCreditLedger(USER).length, 0);
  });

  it("Director failure is not a settle", () => {
    assert.equal(directorCreditOutcome({ status: "failed", plan: null }), "failed");
    assert.equal(directorCreditOutcome({ status: "ready", plan: { id: "p" } }), "success");
    assert.equal(directorCreditOutcome({ status: "reused", reused: true, plan: { id: "p" } }), "reused");
  });

  it("duplicate request does not double charge", async () => {
    const execute = async () => ({ ok: true });
    await runPaidPath({ kind: "director", execute });
    await runPaidPath({ kind: "director", execute });
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
    assert.equal(listMemoryCreditLedger(USER).filter((row) => row.reason === "usage").length, 1);
  });

  it("provider failure leaves the ledger unchanged", async () => {
    await runPaidPath({
      kind: "render",
      execute: async () => ({ ok: false }),
    });
    assert.equal(renderCreditOutcome({ domainState: "failed", job: { status: "failed" }, errorCode: "provider_failed" }), "failed");
    assert.equal(
      renderCreditOutcome({
        domainState: "video_rendered",
        job: { status: "completed", assemblyManifest: { method: "first-clip" } },
      }),
      "failed",
    );
    assert.equal(
      renderCreditOutcome({
        domainState: "video_rendered",
        job: { status: "completed", assemblyManifest: { method: "ffmpeg" } },
      }),
      "success",
    );
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
  });

  it("render retry charges only the successful attempt", async () => {
    await runPaidPath({
      kind: "render",
      attempt: 1,
      execute: async () => ({ ok: false }),
    });
    await runPaidPath({
      kind: "render",
      attempt: 2,
      execute: async () => ({ ok: true }),
    });
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
    const usage = listMemoryCreditLedger(USER).filter((row) => row.reason === "usage");
    assert.equal(usage.length, 1);
    assert.match(usage[0]?.reference_id || "", /:a2$/);
  });

  it("regenerate retry charges only a successful new attempt", async () => {
    await runPaidPath({
      kind: "regenerate",
      attempt: 1,
      execute: async () => ({ ok: false }),
    });
    await runPaidPath({
      kind: "regenerate",
      attempt: 2,
      execute: async () => ({ ok: true }),
    });
    assert.equal(regenerationCreditOutcome({ status: "failed" }), "failed");
    assert.equal(regenerationCreditOutcome({ status: "ready" }), "success");
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
  });

  it("lip sync failure does not charge; success charges once", async () => {
    await runPaidPath({
      kind: "lipsync",
      attempt: 1,
      execute: async () => ({ ok: false }),
    });
    assert.equal(lipSyncCreditOutcome({ succeeded: false }), "failed");
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    await runPaidPath({
      kind: "lipsync",
      attempt: 2,
      execute: async () => ({ ok: true }),
    });
    assert.equal(lipSyncCreditOutcome({ succeeded: true }), "success");
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
  });

  it("no double charge across reused idempotent work", async () => {
    await runPaidPath({
      kind: "lipsync",
      attempt: 1,
      execute: async () => ({ ok: true }),
    });
    await runPaidPath({
      kind: "lipsync",
      attempt: 1,
      execute: async () => ({ ok: true, reused: true }),
    });
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
  });

  it("ledger integrity: usage then refund nets to zero", async () => {
    const operationId = videoStudioCreditOperationId({ kind: "render", projectId: PROJECT, attempt: 1 });
    await applyVideoStudioCreditOutcome({
      supabase: fakeSupabase,
      userId: USER,
      operationId,
      outcome: "success",
    });
    await applyVideoStudioCreditOutcome({
      supabase: fakeSupabase,
      userId: USER,
      operationId,
      outcome: "failed",
    });
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    const ledger = listMemoryCreditLedger(USER);
    assert.equal(ledger[0]?.reason, "usage");
    assert.equal(ledger[1]?.reason, "refund");
    assert.equal(ledger[0]?.reference_id, ledger[1]?.reference_id);
  });

  it("idempotency: deferred jobs are not charged until confirmed success", async () => {
    await runPaidPath({
      kind: "render",
      execute: async () => ({ ok: true, deferred: true }),
    });
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    await runPaidPath({
      kind: "render",
      execute: async () => ({ ok: true }),
    });
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
  });

  it("does not treat estimated provider cost as actual billing", () => {
    assert.deepEqual(
      honestProviderJobCost({ succeeded: true, reused: false, estimated: 8 }),
      { estimatedCost: 8, actualCost: null },
    );
    assert.deepEqual(
      honestProviderJobCost({ succeeded: false, reused: false, estimated: 8 }),
      { estimatedCost: 8, actualCost: 0 },
    );
    assert.deepEqual(
      honestProviderJobCost({ succeeded: true, reused: true, estimated: 8, providerActual: 8 }),
      { estimatedCost: null, actualCost: null },
    );
    assert.deepEqual(
      honestProviderJobCost({ succeeded: true, reused: false, estimated: 8, providerActual: 3.5 }),
      { estimatedCost: 8, actualCost: 3.5 },
    );
  });
});
