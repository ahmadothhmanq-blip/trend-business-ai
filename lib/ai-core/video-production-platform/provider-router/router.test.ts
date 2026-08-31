import assert from "node:assert/strict";
import { test } from "node:test";
import { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
import type { ModelRouterInput } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import {
  createMemoryProviderJobStore,
  createProviderRegistry,
  estimateProviderCost,
  getProviderV2,
  persistRoutedProviderJob,
  routeModel,
} from "@/lib/ai-core/video-production-platform/provider-router";

const PROJECT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SCENE = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function input(over: Partial<ModelRouterInput> = {}): ModelRouterInput {
  return {
    task: "text-to-video",
    quality: "standard",
    duration: 8,
    projectId: PROJECT,
    sceneId: SCENE,
    prompt: "Cinematic studio product hero shot",
    language: "en",
    latencyTarget: "balanced",
    ...over,
  };
}

const klingRunway = { veo: false, kling: true, runway: true, heygen: false, external: false };
const none = { veo: false, kling: false, runway: false, heygen: false, external: false };

test("unconfigured provider rejected", async () => {
  const veo = getProviderV2("veo");
  assert.equal(veo.status(), "unconfigured");
  assert.equal(veo.health().ok, false);
  await assert.rejects(
    () =>
      veo.createJob({
        projectId: PROJECT,
        sceneId: SCENE,
        prompt: "x",
        promptHash: "hashhashhash",
        durationSec: 5,
        idempotencyKey: `${PROJECT}:${SCENE}:veo:hashhashhash`,
      }),
    (error: unknown) => error instanceof ProviderRouterError && error.code === "unconfigured",
  );
  assert.throws(
    () => routeModel(input(), { snapshot: none }),
    (error: unknown) => error instanceof ProviderRouterError && error.code === "no_eligible_provider",
  );
});

test("preview rejected", () => {
  assert.throws(
    () => routeModel(input({ preferredProvider: "preview" }), { snapshot: klingRunway }),
    (error: unknown) => error instanceof ProviderRouterError && error.code === "preview_rejected",
  );
  const registry = createProviderRegistry(klingRunway);
  assert.equal("preview" in registry, false);
});

test("capability mismatch rejected", () => {
  assert.throws(
    () =>
      routeModel(input({ task: "avatar", avatarRequired: true, audioRequired: true }), {
        snapshot: klingRunway,
      }),
    (error: unknown) => error instanceof ProviderRouterError && error.code === "capability_mismatch",
  );
});

test("provider selection", () => {
  const decision = routeModel(input(), { snapshot: klingRunway });
  assert.equal(decision.primaryProvider, "kling");
  assert.equal(decision.capabilityMatch.kling, true);
  assert.ok(decision.metadata.reasons.some((reason) => reason.includes("kling")));
});

test("fallback", () => {
  const decision = routeModel(input(), { snapshot: klingRunway });
  assert.equal(decision.fallbackProvider, "runway");
  assert.deepEqual(decision.metadata.candidates, ["kling", "runway"]);
});

test("duplicate idempotency", async () => {
  const store = createMemoryProviderJobStore();
  const routeInput = input();
  const first = await persistRoutedProviderJob({
    userId: "user-1",
    routeInput,
    store,
    snapshot: klingRunway,
  });
  const second = await persistRoutedProviderJob({
    userId: "user-1",
    routeInput,
    store,
    snapshot: klingRunway,
  });
  assert.equal(first.reused, false);
  assert.equal(second.reused, true);
  assert.equal(first.job.idempotencyKey, second.job.idempotencyKey);
  assert.equal(first.job.id, second.job.id);
  assert.equal(first.job.provider, "kling");
});

test("cost estimate", () => {
  const estimate = estimateProviderCost("kling", { durationSec: 10, quality: "standard" });
  assert.equal(estimate.credits, 2);
  assert.equal(estimate.currency, "credits");
  const decision = routeModel(input({ duration: 10 }), { snapshot: klingRunway });
  assert.equal(decision.estimatedCost, 2);
});

test("health filtering", () => {
  const decision = routeModel(input(), {
    snapshot: { ...klingRunway, health: { kling: "down" } },
  });
  assert.equal(decision.primaryProvider, "runway");
  assert.ok(decision.metadata.excluded.some((row) => row.provider === "kling" && /down/i.test(row.reason)));
});
