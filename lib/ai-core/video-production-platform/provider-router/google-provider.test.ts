import assert from "node:assert/strict";
import { test } from "node:test";

import type { ProviderEnvSnapshot } from "@/lib/ai-core/video-production-platform/provider-router/registry";
import type { ModelRouterInput } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { getProviderV2, createProviderRegistry } from "@/lib/ai-core/video-production-platform/provider-router/registry";
import { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
import { routeModel } from "@/lib/ai-core/video-production-platform/provider-router/router";

function input(over: Partial<ModelRouterInput> = {}): ModelRouterInput {
  return {
    task: "text-to-video",
    quality: "standard",
    duration: 8,
    projectId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    sceneId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    prompt: "Cinematic luxury commercial shot",
    language: "en",
    latencyTarget: "balanced",
    ...over,
  };
}

const none: ProviderEnvSnapshot = {
  veo: false,
  omni_flash: false,
  kling: false,
  runway: false,
  heygen: false,
  external: false,
};

test("provider registration includes omni_flash", () => {
  const registry = createProviderRegistry(none);
  assert.ok("omni_flash" in registry);
});

test("Omni Flash capabilities + unconfigured health", () => {
  const omni = getProviderV2("omni_flash", none);
  assert.equal(omni.status(), "unconfigured");
  const h = omni.health();
  assert.equal(h.ok, false);
  assert.equal(h.status, "unconfigured");
  assert.ok(/not configured/i.test(h.reason));
  const caps = omni.capabilities();
  assert.equal(caps.textToVideo, true);
  assert.equal(caps.imageToVideo, true);
});

test("Veo 3.1 unconfigured when snapshot says so", () => {
  const veo = getProviderV2("veo", none);
  assert.equal(veo.status(), "unconfigured");
  const h = veo.health();
  assert.equal(h.ok, false);
  assert.equal(h.status, "unconfigured");
});

test("router selection picks omni_flash when configured", () => {
  const snapshot: ProviderEnvSnapshot = {
    ...none,
    omni_flash: true,
  };
  const decision = routeModel(input(), { snapshot });
  assert.equal(decision.primaryProvider, "omni_flash");
});

test("router selection rejects all providers when none configured", () => {
  assert.throws(
    () => routeModel(input(), { snapshot: none }),
    (error: unknown) =>
      error instanceof ProviderRouterError && error.code === "no_eligible_provider",
  );
});

test("router selection respects preferredProvider=omni_flash", () => {
  const snapshot: ProviderEnvSnapshot = {
    ...none,
    veo: true,
    omni_flash: true,
  };
  const decision = routeModel(input({ preferredProvider: "omni_flash" }), { snapshot });
  assert.equal(decision.primaryProvider, "omni_flash");
});

