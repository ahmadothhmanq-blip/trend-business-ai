import type { SceneStatus } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { SceneRegenerationError } from "@/lib/ai-core/video-production-platform/scene-regeneration/errors";

const REGENERATABLE: SceneStatus[] = ["ready", "failed"];

export function assertSceneRegeneratable(status: SceneStatus): void {
  if (!REGENERATABLE.includes(status)) {
    throw new SceneRegenerationError(
      `Scene cannot be regenerated from status "${status}".`,
      "invalid_scene_state",
    );
  }
}

export function sceneStatusAfterFailure(hadActiveArtifact: boolean): SceneStatus {
  return hadActiveArtifact ? "ready" : "failed";
}
