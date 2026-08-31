import assert from "node:assert/strict";
import { test } from "node:test";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain";
import type { VideoArtifact } from "@/lib/ai-core/video-production-platform/domain";
import { canTransition } from "@/lib/ai-core/video-production-platform/domain";
import {
  assertTransition,
  listAllowedTargets,
  transition,
} from "@/lib/ai-core/video-production-platform/state-machine";

function artifact(): VideoArtifact {
  return {
    id: "art-1",
    projectId: "proj-1",
    kind: "composite",
    mimeType: "video/mp4",
    url: "https://cdn.example/out.mp4",
    durationSec: 8,
    provider: "kling",
  };
}

test("invalid transition rejected at runtime", () => {
  assert.equal(canTransition("draft", "published"), false);
  assert.equal(canTransition("storyboard_ready", "video_rendered", { artifact: artifact() }), false);
  assert.throws(() => transition("draft", "published"), DomainValidationError);
  assert.throws(
    () => assertTransition("storyboard_ready", "video_rendered", { artifact: artifact() }),
    DomainValidationError,
  );
});

test("valid transition allowed at runtime", () => {
  const planning = transition("draft", "planning");
  assert.equal(planning.to, "planning");
  assert.equal(planning.generationStatus, "pending");
  const generating = transition("storyboard_ready", "generating");
  assert.equal(generating.to, "generating");
  assert.equal(generating.generationStatus, "generating");
  const rendered = transition("assembling", "video_rendered", { artifact: artifact() });
  assert.equal(rendered.to, "video_rendered");
  assert.equal(rendered.generationStatus, "video_rendered");
  const published = transition("video_rendered", "published", { artifact: artifact() });
  assert.equal(published.to, "published");
  const unpublished = transition("published", "video_rendered", { artifact: artifact() });
  assert.equal(unpublished.to, "video_rendered");
  assert.ok(listAllowedTargets("published").includes("video_rendered"));
  assert.deepEqual(listAllowedTargets("generating"), ["processing", "failed", "cancelled"]);
});
