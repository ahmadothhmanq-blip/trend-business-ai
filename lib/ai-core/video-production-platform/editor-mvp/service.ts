import { randomUUID } from "node:crypto";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { assertValidScene } from "@/lib/ai-core/video-production-platform/domain/validation";
import {
  deleteSceneRecord,
  insertVideoScenes,
  loadPlayableCompositeArtifact,
  loadPlayableSceneArtifact,
  loadSceneById,
  loadScenesForPlan,
  persistDomainScene,
  reorderVideoScenes,
} from "@/lib/ai-core/video-production-platform/persistence/repository";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { EditorMvpError } from "@/lib/ai-core/video-production-platform/editor-mvp/errors";
import {
  editorStateOf,
  withEditorState,
  type EditorDocument,
  type EditorScenePreview,
  type ScenePatch,
} from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
import { assertActivePlanContext } from "@/lib/ai-core/video-production-platform/editor-mvp/guards";
import { loadEditorAudioSnapshot } from "@/lib/ai-core/video-production-platform/editor-mvp/audio-snapshot";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MIN_DURATION = 0.5;

function clampDuration(value: number): number {
  if (!Number.isFinite(value) || value < MIN_DURATION) {
    throw new EditorMvpError("Scene duration must be greater than 0.", "invalid_trim");
  }
  return Math.min(600, value);
}

function applyPatch(scene: Scene, patch: ScenePatch): Scene {
  const next: Scene = {
    ...scene,
    prompt: patch.prompt ?? scene.prompt,
    duration: patch.duration != null ? clampDuration(patch.duration) : scene.duration,
    camera: patch.camera ? { ...scene.camera, ...patch.camera } : scene.camera,
    visualStyle: patch.visualStyle ?? scene.visualStyle,
    transition: patch.transition ?? scene.transition,
    dialogue: patch.dialogue ? { ...scene.dialogue, ...patch.dialogue } : scene.dialogue,
    voiceRequired: patch.voiceRequired ?? scene.voiceRequired,
    providerPreference: patch.providerPreference ?? scene.providerPreference,
    fallbackProvider: patch.fallbackProvider === undefined ? scene.fallbackProvider : patch.fallbackProvider,
    characters: patch.characters ?? scene.characters,
    products: patch.products ?? scene.products,
    references: patch.references ?? scene.references,
    audio: {
      ...scene.audio,
      voiceRequired: patch.voiceRequired ?? scene.audio.voiceRequired,
      editor: patch.editor ? { ...editorStateOf(scene), ...patch.editor } : editorStateOf(scene),
    },
  };
  try {
    assertValidScene(next);
  } catch (error) {
    throw new EditorMvpError(error instanceof Error ? error.message : "Invalid scene.", "invalid_scene");
  }
  return next;
}

function findByMutationKey(scenes: Scene[], key: string): Scene | undefined {
  return scenes.find((scene) => editorStateOf(scene).mutationKey === key);
}

export async function loadEditorDocument(
  supabase: AnySupabase,
  input: { userId: string; projectId: string },
): Promise<EditorDocument> {
  const ctx = await assertActivePlanContext(supabase, input);
  const scenes = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
  const audio = await loadEditorAudioSnapshot(supabase, input.projectId);
  const composite = await loadPlayableCompositeArtifact(supabase, input.projectId);
  const compositePreview: EditorScenePreview | null =
    composite && isValidVideoArtifact(composite)
      ? {
          sceneId: "composite",
          artifactId: composite.id,
          hasPlayable: true,
          mimeType: composite.mimeType,
          url: composite.url,
          durationSec: composite.durationSec,
        }
      : null;
  return {
    project: ctx.project,
    plan: ctx.plan,
    scenes,
    audio,
    compositePreview,
  };
}

export async function loadScenePreview(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId: string },
): Promise<EditorScenePreview> {
  const ctx = await assertActivePlanContext(supabase, input);
  const artifact = await loadPlayableSceneArtifact(supabase, input.projectId, input.sceneId);
  const playable = artifact && isValidVideoArtifact(artifact) ? artifact : null;
  return {
    sceneId: input.sceneId,
    artifactId: playable?.id ?? ctx.scene?.artifactId ?? null,
    hasPlayable: Boolean(playable),
    mimeType: playable?.mimeType,
    url: playable?.url,
    durationSec: playable?.durationSec,
  };
}

export async function patchEditorScene(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId: string; patch: ScenePatch },
): Promise<Scene> {
  const ctx = await assertActivePlanContext(supabase, input);
  const next = applyPatch(ctx.scene!, input.patch);
  return persistDomainScene(supabase, { userId: input.userId, scene: next });
}

export async function saveEditorScenes(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; patches: Array<{ sceneId: string; patch: ScenePatch }> },
): Promise<Scene[]> {
  const ctx = await assertActivePlanContext(supabase, input);
  const scenes = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
  const byId = new Map(scenes.map((scene) => [scene.id, scene]));
  const seen = new Set<string>();
  for (const item of input.patches) {
    if (seen.has(item.sceneId)) continue;
    seen.add(item.sceneId);
    const current = byId.get(item.sceneId);
    if (!current) throw new EditorMvpError("Cannot save a scene from another plan.", "plan_mixing");
    const next = applyPatch(current, item.patch);
    const saved = await persistDomainScene(supabase, { userId: input.userId, scene: next });
    byId.set(saved.id, saved);
  }
  return loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
}

export async function trimEditorScene(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId: string; edge: "start" | "end"; seconds: number },
): Promise<Scene> {
  const ctx = await assertActivePlanContext(supabase, input);
  const scene = ctx.scene!;
  const amount = Number(input.seconds);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new EditorMvpError("Trim amount must be greater than 0.", "invalid_trim");
  }
  const trimIn = editorStateOf(scene).trimInSec || 0;
  if (input.edge === "start") {
    const nextDuration = clampDuration(scene.duration - amount);
    return persistDomainScene(supabase, {
      userId: input.userId,
      scene: withEditorState({ ...scene, duration: nextDuration }, { trimInSec: trimIn + amount }),
    });
  }
  return persistDomainScene(supabase, {
    userId: input.userId,
    scene: { ...scene, duration: clampDuration(scene.duration - amount) },
  });
}

export async function reorderEditorScenes(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; orderedSceneIds: string[] },
): Promise<Scene[]> {
  const ctx = await assertActivePlanContext(supabase, input);
  const current = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
  const currentIds = new Set(current.map((scene) => scene.id));
  if (input.orderedSceneIds.length !== current.length) {
    throw new EditorMvpError("Reorder must include every scene in the active plan.", "plan_mixing");
  }
  for (const id of input.orderedSceneIds) {
    if (!currentIds.has(id)) {
      throw new EditorMvpError("Cannot mix scenes from another plan.", "plan_mixing");
    }
  }
  const same =
    current.length === input.orderedSceneIds.length &&
    current.every((scene, index) => scene.id === input.orderedSceneIds[index]);
  if (same) return current;
  return reorderVideoScenes(supabase, {
    projectId: input.projectId,
    planId: ctx.plan.id,
    orderedSceneIds: input.orderedSceneIds,
  });
}

export async function splitEditorScene(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId: string; atSec: number; requestId?: string },
): Promise<{ left: Scene; right: Scene; scenes: Scene[] }> {
  const ctx = await assertActivePlanContext(supabase, input);
  const scene = ctx.scene!;
  const key = input.requestId ? `split:${input.requestId}` : "";
  const scenes = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
  if (key) {
    const existing = findByMutationKey(scenes, key);
    if (existing) {
      const left = scenes.find((row) => row.id === scene.id) || scene;
      return { left, right: existing, scenes };
    }
  }
  const atSec = Number(input.atSec);
  if (!Number.isFinite(atSec) || atSec < MIN_DURATION || atSec > scene.duration - MIN_DURATION) {
    throw new EditorMvpError("Split point must leave both sides with duration > 0.", "invalid_trim");
  }
  const leftDuration = clampDuration(atSec);
  const rightDuration = clampDuration(scene.duration - atSec);
  const right: Scene = {
    ...scene,
    id: randomUUID(),
    order: scenes.length,
    duration: rightDuration,
    artifactId: undefined,
    status: "planned",
    qualityScore: null,
    audio: {
      ...scene.audio,
      editor: {
        ...editorStateOf(scene),
        trimInSec: (editorStateOf(scene).trimInSec || 0) + leftDuration,
        mutationKey: key || undefined,
      },
    },
  };
  const left = await persistDomainScene(supabase, {
    userId: input.userId,
    scene: { ...scene, duration: leftDuration },
  });
  await insertVideoScenes(supabase, { userId: input.userId, planId: ctx.plan.id, scenes: [right] });
  const ordered = scenes.map((row) => row.id);
  const idx = ordered.indexOf(scene.id);
  ordered.splice(idx + 1, 0, right.id);
  const next = await reorderVideoScenes(supabase, {
    projectId: input.projectId,
    planId: ctx.plan.id,
    orderedSceneIds: ordered,
  });
  return {
    left: next.find((row) => row.id === left.id) || left,
    right: next.find((row) => row.id === right.id) || right,
    scenes: next,
  };
}

export async function duplicateEditorScene(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId: string; requestId?: string },
): Promise<{ scene: Scene; scenes: Scene[] }> {
  const ctx = await assertActivePlanContext(supabase, input);
  const scene = ctx.scene!;
  const key = input.requestId ? `duplicate:${input.requestId}` : "";
  const scenes = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
  if (key) {
    const existing = findByMutationKey(scenes, key);
    if (existing) return { scene: existing, scenes };
  }
  const copy: Scene = {
    ...scene,
    id: randomUUID(),
    order: scenes.length,
    status: scene.artifactId ? scene.status : "planned",
    audio: {
      ...scene.audio,
      editor: { ...editorStateOf(scene), mutationKey: key || undefined },
    },
  };
  await insertVideoScenes(supabase, { userId: input.userId, planId: ctx.plan.id, scenes: [copy] });
  const ordered = scenes.map((row) => row.id);
  const idx = ordered.indexOf(scene.id);
  ordered.splice(idx + 1, 0, copy.id);
  const next = await reorderVideoScenes(supabase, {
    projectId: input.projectId,
    planId: ctx.plan.id,
    orderedSceneIds: ordered,
  });
  return { scene: next.find((row) => row.id === copy.id) || copy, scenes: next };
}

export async function deleteEditorScene(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId: string },
): Promise<{ deletedId: string; scenes: Scene[] }> {
  const ctx = await assertActivePlanContext(supabase, input);
  const scenes = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
  if (scenes.length <= 1) {
    throw new EditorMvpError("The last scene on the active plan cannot be deleted.", "last_scene");
  }
  await deleteSceneRecord(supabase, {
    userId: input.userId,
    sceneId: input.sceneId,
    planId: ctx.plan.id,
  });
  const remaining = scenes.filter((scene) => scene.id !== input.sceneId).map((scene) => scene.id);
  const next = await reorderVideoScenes(supabase, {
    projectId: input.projectId,
    planId: ctx.plan.id,
    orderedSceneIds: remaining,
  });
  return { deletedId: input.sceneId, scenes: next };
}

export async function restoreEditorScene(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId: string; index: number; scene: Scene },
): Promise<{ scene: Scene; scenes: Scene[] }> {
  const ctx = await assertActivePlanContext(supabase, { userId: input.userId, projectId: input.projectId });
  if (input.scene.id !== input.sceneId) {
    throw new EditorMvpError("Restore scene id does not match the route.", "invalid_scene");
  }
  if (input.scene.projectId !== input.projectId) {
    throw new EditorMvpError("Scene does not belong to this project.", "foreign_scene");
  }
  if (input.scene.planId !== ctx.plan.id) {
    throw new EditorMvpError("Cannot restore a scene from another plan.", "plan_mixing");
  }

  const existing = await loadSceneById(supabase, input.sceneId);
  if (existing) {
    if (existing.projectId !== input.projectId) {
      throw new EditorMvpError("Scene does not belong to this project.", "foreign_scene");
    }
    if (existing.planId !== ctx.plan.id) {
      throw new EditorMvpError("Scene does not belong to the active plan.", "plan_mixing");
    }
  } else {
    const toInsert: Scene = {
      ...input.scene,
      id: input.sceneId,
      projectId: input.projectId,
      planId: ctx.plan.id,
      order: 0,
    };
    try {
      assertValidScene(toInsert);
    } catch (error) {
      throw new EditorMvpError(error instanceof Error ? error.message : "Invalid scene.", "invalid_scene");
    }
    const current = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
    await insertVideoScenes(supabase, {
      userId: input.userId,
      planId: ctx.plan.id,
      scenes: [{ ...toInsert, order: current.length }],
    });
  }

  const scenes = await loadScenesForPlan(supabase, input.projectId, ctx.plan.id);
  const ids = scenes.map((scene) => scene.id).filter((id) => id !== input.sceneId);
  const index = Math.min(Math.max(0, Math.floor(input.index)), ids.length);
  ids.splice(index, 0, input.sceneId);
  const next = await reorderVideoScenes(supabase, {
    projectId: input.projectId,
    planId: ctx.plan.id,
    orderedSceneIds: ids,
  });
  const restored = next.find((scene) => scene.id === input.sceneId);
  if (!restored) throw new EditorMvpError("Failed to restore scene on the active plan.", "invalid_scene");
  return { scene: restored, scenes: next };
}
