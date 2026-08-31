/**
 * Read adapter: domain tables first, legacy JSONB blueprint second.
 * Never treats SVG storyboards as video artifacts.
 */

import type { Scene, VideoProject } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { VideoGeneration } from "@/types/video";
import {
  projectFromGenerationRow,
  scenesFromDomainOrLegacy,
  type VideoSceneRow,
} from "@/lib/ai-core/video-production-platform/persistence/mappers";
import { loadDomainScenes } from "@/lib/ai-core/video-production-platform/persistence/repository";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function readProjectWithScenes(
  supabase: AnySupabase,
  generation: VideoGeneration,
): Promise<{ project: VideoProject; scenes: Scene[]; source: "domain" | "legacy_blueprint" }> {
  const project = projectFromGenerationRow(generation);
  try {
    const domainScenes = await loadDomainScenes(supabase, generation.id);
    if (domainScenes.length > 0) {
      return { project: { ...project, planId: project.planId }, scenes: domainScenes, source: "domain" };
    }
  } catch {
    // Domain tables may be missing until migration 090 is applied.
  }
  return {
    project,
    scenes: scenesFromDomainOrLegacy({ generation, sceneRows: [] }),
    source: "legacy_blueprint",
  };
}

export function readProjectWithSceneRows(
  generation: VideoGeneration,
  sceneRows: VideoSceneRow[] | null | undefined,
): { project: VideoProject; scenes: Scene[]; source: "domain" | "legacy_blueprint" } {
  const scenes = scenesFromDomainOrLegacy({ generation, sceneRows });
  return {
    project: projectFromGenerationRow(generation),
    scenes,
    source: sceneRows && sceneRows.length > 0 ? "domain" : "legacy_blueprint",
  };
}
