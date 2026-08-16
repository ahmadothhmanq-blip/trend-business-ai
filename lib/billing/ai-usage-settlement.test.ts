/**
 * Credit settlement tests — authorize → settle/release semantics.
 *
 * Covers: success, failure, provider failure, timeout, retry, duplicate
 * settle/refund, and proof that failed generation does not permanently
 * consume credits.
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertSufficientCredits,
  consumeCreditsForUsage,
  refundCreditsForUsage,
} from "@/lib/billing/credits";
import { createAiUsageLease } from "@/lib/billing/ai-usage-settlement";
import {
  getMemoryCreditBalance,
  listMemoryCreditLedger,
  resetMemoryCreditLedger,
  seedMemoryCreditBalance,
} from "@/lib/billing/credit-ledger-memory";

const USER = "00000000-0000-4000-8000-000000000001";
const RESOURCE = "website-builder";
const fakeSupabase = {} as SupabaseClient;

describe("AI credit settlement", () => {
  beforeEach(() => {
    process.env.BILLING_CREDIT_TEST_HARNESS = "1";
    resetMemoryCreditLedger();
    seedMemoryCreditBalance(USER, 10);
  });

  afterEach(() => {
    resetMemoryCreditLedger();
    delete process.env.BILLING_CREDIT_TEST_HARNESS;
  });

  it("successful generation settles exactly one credit", async () => {
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-success-1",
    });

    const authorized = await assertSufficientCredits(fakeSupabase, USER, 1);
    assert.equal(authorized.ok, true);
    assert.equal(getMemoryCreditBalance(USER).balance, 10);

    // Generation succeeds → settle
    const settled = await lease.settle(fakeSupabase);
    assert.equal(settled.ok, true);
    assert.equal(getMemoryCreditBalance(USER).balance, 9);

    const ledger = listMemoryCreditLedger(USER);
    assert.equal(ledger.length, 1);
    assert.equal(ledger[0]?.reason, "usage");
    assert.equal(ledger[0]?.delta, -1);
    assert.equal(ledger[0]?.reference_id, "op-success-1");
  });

  it("failed generation does not permanently consume credits", async () => {
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-fail-1",
    });

    await assertSufficientCredits(fakeSupabase, USER, 1);
    // Provider/generation failure before settle
    const released = await lease.release(fakeSupabase);
    assert.equal(released.ok, true);
    assert.equal(released.skipped, true);
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    assert.equal(listMemoryCreditLedger(USER).length, 0);
  });

  it("provider failure after authorize leaves balance unchanged", async () => {
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-provider-fail",
    });

    await assertSufficientCredits(fakeSupabase, USER, 1);
    const providerError = new Error("DeepSeek 503 provider unavailable");
    try {
      throw providerError;
    } catch {
      await lease.release(fakeSupabase);
    }

    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    assert.deepEqual(
      listMemoryCreditLedger(USER).map((e) => e.reason),
      [],
    );
  });

  it("timeout before settle does not consume credits", async () => {
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-timeout-1",
    });

    await assertSufficientCredits(fakeSupabase, USER, 1);
    // Simulate AbortSignal / maxDuration timeout
    await lease.release(fakeSupabase);
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
  });

  it("malformed AI response path releases without charge", async () => {
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-malformed-1",
    });

    await assertSufficientCredits(fakeSupabase, USER, 1);
    await lease.release(fakeSupabase);
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
  });

  it("retry after failure charges only the successful attempt", async () => {
    const first = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-retry-a",
    });
    await assertSufficientCredits(fakeSupabase, USER, 1);
    await first.release(fakeSupabase); // failed attempt
    assert.equal(getMemoryCreditBalance(USER).balance, 10);

    const second = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-retry-b",
    });
    await assertSufficientCredits(fakeSupabase, USER, 1);
    await second.settle(fakeSupabase); // success
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
    assert.equal(listMemoryCreditLedger(USER).length, 1);
    assert.equal(listMemoryCreditLedger(USER)[0]?.reference_id, "op-retry-b");
  });

  it("duplicate settle does not double charge", async () => {
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-dup-settle",
    });

    await lease.settle(fakeSupabase);
    await lease.settle(fakeSupabase);
    await consumeCreditsForUsage(
      fakeSupabase,
      USER,
      RESOURCE,
      1,
      "op-dup-settle",
    );

    assert.equal(getMemoryCreditBalance(USER).balance, 9);
    assert.equal(
      listMemoryCreditLedger(USER).filter((e) => e.reason === "usage").length,
      1,
    );
  });

  it("refund after failure restores credits and is auditable", async () => {
    // Edge case: settle happened, then downstream failure requires refund
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-refund-1",
    });

    await lease.settle(fakeSupabase);
    assert.equal(getMemoryCreditBalance(USER).balance, 9);

    const refunded = await lease.release(fakeSupabase);
    assert.equal(refunded.ok, true);
    assert.equal(getMemoryCreditBalance(USER).balance, 10);

    const ledger = listMemoryCreditLedger(USER);
    assert.equal(ledger.length, 2);
    assert.equal(ledger[0]?.reason, "usage");
    assert.equal(ledger[1]?.reason, "refund");
    assert.equal(ledger[1]?.delta, 1);
    assert.equal(ledger[1]?.reference_id, "op-refund-1");
  });

  it("duplicate refund does not double refund", async () => {
    const lease = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "op-dup-refund",
    });

    await lease.settle(fakeSupabase);
    await lease.release(fakeSupabase);
    await lease.release(fakeSupabase);
    await refundCreditsForUsage(
      fakeSupabase,
      USER,
      RESOURCE,
      1,
      "op-dup-refund",
    );

    assert.equal(getMemoryCreditBalance(USER).balance, 10);
    assert.equal(
      listMemoryCreditLedger(USER).filter((e) => e.reason === "refund").length,
      1,
    );
  });

  it("duplicate request with distinct operation ids charges per success", async () => {
    const a = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "req-1",
    });
    const b = createAiUsageLease({
      supabase: fakeSupabase,
      userId: USER,
      resource: RESOURCE,
      operationId: "req-2",
    });

    await a.settle(fakeSupabase);
    await b.settle(fakeSupabase);
    assert.equal(getMemoryCreditBalance(USER).balance, 8);
  });

  it("insufficient credits blocks authorization before generation", async () => {
    seedMemoryCreditBalance(USER, 0);
    const check = await assertSufficientCredits(fakeSupabase, USER, 1);
    assert.equal(check.ok, false);
    if (!check.ok) {
      assert.equal(check.code, "INSUFFICIENT_CREDITS");
    }
    assert.equal(getMemoryCreditBalance(USER).balance, 0);
  });
});
