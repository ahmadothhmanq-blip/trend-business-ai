import type {
  AudioPlan,
  ProviderJob,
  QualityReport,
  Scene,
  SceneCamera,
  SceneDialogue,
  SceneAudio,
  SceneReference,
  SceneStatus,
  SceneProviderPreference,
  ProductionVideoProvider,
  VideoArtifact,
  VideoPlan,
  VideoPlanStatus,
  VideoProject,
  VideoProjectState,
  VideoWorkflow,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import { readProjectFromGeneration, readScenesFromBlueprint } from "@/lib/ai-core/video-production-platform/domain/legacy";
import type { VideoGeneration } from "@/types/video";

export type VideoPlanRecord = VideoPlan & {
  version: number;
  objective: string;
  language: string;
  aspectRatio: string;
  durationSec: number;
  style: string;
  budgetCredits: number | null;
  userId: string;
  spec?: Record<string, unknown> | null;
  idempotencyKey?: string | null;
  status: VideoPlanStatus;
  isActive: boolean;
  sourcePrompt: string | null;
  sourceHash: string | null;
};

export type VideoSceneRow = {
  id: string;
  user_id: string;
  project_id: string;
  plan_id: string | null;
  scene_order: number;
  duration_sec: number;
  prompt: string;
  camera: SceneCamera;
  visual_style: string;
  scene_references: SceneReference[];
  characters: string[];
  products: string[];
  dialogue: SceneDialogue;
  audio: SceneAudio;
  transition: string;
  provider_preference: SceneProviderPreference;
  fallback_provider: ProductionVideoProvider | null;
  status: SceneStatus;
  quality_score: number | null;
  artifact_id: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoPlanRow = {
  id: string;
  user_id: string;
  project_id: string;
  version: number;
  objective: string;
  language: string;
  aspect_ratio: string;
  duration_sec: number;
  style: string;
  budget_credits: number | null;
  pacing: string;
  preferred_provider: SceneProviderPreference;
  created_at: string;
  spec?: Record<string, unknown> | null;
  idempotency_key?: string | null;
  status?: VideoPlanStatus | null;
  is_active?: boolean | null;
  source_prompt?: string | null;
  source_hash?: string | null;
};

export type VideoProviderJobRow = {
  id: string;
  user_id: string;
  project_id: string;
  scene_id: string;
  provider: ProductionVideoProvider;
  external_job_id: string | null;
  status: ProviderJob["status"];
  attempt: number;
  idempotency_key: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  error_code: string | null;
  error_message: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  retry_count?: number | null;
  next_poll_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
};

export type VideoMediaArtifactRow = {
  id: string;
  user_id: string;
  generation_id: string | null;
  scene_id: string | null;
  kind: string;
  mime_type: string;
  storage_path: string;
  public_url: string | null;
  size_bytes: number;
  duration_sec: number | null;
  provider: string;
  sha256: string | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  codec: string | null;
  qc_score: number | null;
  created_at: string;
};

export type VideoQualityReportRow = {
  id: string;
  user_id: string;
  project_id: string;
  scene_id: string | null;
  artifact_id: string | null;
  score: number;
  blockers: string[];
  warnings: string[];
  report: Record<string, unknown>;
  created_at: string;
};

export function sceneFromRow(row: VideoSceneRow): Scene {
  const camera = row.camera || { move: "Static" };
  const audio = row.audio || {};
  return {
    id: row.id,
    projectId: row.project_id,
    order: row.scene_order,
    duration: Number(row.duration_sec),
    prompt: row.prompt,
    camera: {
      move: camera.move,
      shotSize: camera.shotSize,
      lens: camera.lens,
      purpose: camera.purpose,
      environment: camera.environment,
      lighting: camera.lighting,
    },
    visualStyle: row.visual_style,
    references: Array.isArray(row.scene_references) ? row.scene_references : [],
    characters: Array.isArray(row.characters) ? row.characters : [],
    products: Array.isArray(row.products) ? row.products : [],
    dialogue: row.dialogue,
    audio,
    transition: row.transition,
    providerPreference: row.provider_preference,
    fallbackProvider: row.fallback_provider,
    status: row.status,
    qualityScore: row.quality_score == null ? null : Number(row.quality_score),
    artifactId: row.artifact_id || undefined,
    purpose: camera.purpose,
    environment: camera.environment,
    lighting: camera.lighting,
    voiceRequired: audio.voiceRequired,
    planId: row.plan_id,
  };
}

export function sceneToRow(scene: Scene, userId: string, planId: string | null): Omit<VideoSceneRow, "created_at" | "updated_at"> {
  return {
    id: scene.id,
    user_id: userId,
    project_id: scene.projectId,
    plan_id: planId ?? scene.planId ?? null,
    scene_order: scene.order,
    duration_sec: scene.duration,
    prompt: scene.prompt,
    camera: {
      ...scene.camera,
      purpose: scene.purpose ?? scene.camera.purpose,
      environment: scene.environment ?? scene.camera.environment,
      lighting: scene.lighting ?? scene.camera.lighting,
    },
    visual_style: scene.visualStyle,
    scene_references: scene.references,
    characters: scene.characters,
    products: scene.products,
    dialogue: scene.dialogue,
    audio: {
      ...scene.audio,
      voiceRequired: scene.voiceRequired ?? scene.audio.voiceRequired,
    },
    transition: scene.transition,
    provider_preference: scene.providerPreference,
    fallback_provider: scene.fallbackProvider,
    status: scene.status,
    quality_score: scene.qualityScore,
    artifact_id: scene.artifactId ?? null,
  };
}

export function planFromRow(row: VideoPlanRow, sceneIds: string[]): VideoPlanRecord {
  const isActive = row.is_active === true;
  const status: VideoPlanStatus =
    row.status === "active" || row.status === "inactive" || row.status === "archived"
      ? row.status
      : isActive
        ? "active"
        : "inactive";
  return {
    id: row.id,
    projectId: row.project_id,
    narrativeArc: row.objective,
    pacing: row.pacing,
    preferredProvider: row.preferred_provider,
    sceneIds,
    createdAt: row.created_at,
    version: row.version,
    objective: row.objective,
    language: row.language,
    aspectRatio: row.aspect_ratio,
    durationSec: Number(row.duration_sec),
    style: row.style,
    budgetCredits: row.budget_credits == null ? null : Number(row.budget_credits),
    userId: row.user_id,
    spec: row.spec ?? null,
    idempotencyKey: row.idempotency_key ?? null,
    status,
    isActive,
    sourcePrompt: row.source_prompt ?? null,
    sourceHash: row.source_hash ?? row.idempotency_key ?? null,
  };
}

export function artifactFromMediaRow(row: VideoMediaArtifactRow): VideoArtifact {
  const kind = row.kind === "clip" || row.kind === "scene_clip" ? "scene_clip" : "composite";
  return {
    id: row.id,
    projectId: row.generation_id || "",
    kind,
    mimeType: row.mime_type,
    url: row.public_url || `storage://${row.storage_path}`,
    durationSec: Number(row.duration_sec || 0),
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    provider: row.provider,
    isStub: row.provider === "preview" || row.provider === "preview-stub",
  };
}

export type ProviderJobRecord = ProviderJob & {
  userId?: string;
  estimatedCost: number | null;
  actualCost: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
  nextPollAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
};

export function providerJobFromRow(row: VideoProviderJobRow): ProviderJob {
  return {
    id: row.id,
    projectId: row.project_id,
    sceneId: row.scene_id,
    provider: row.provider,
    status: row.status,
    idempotencyKey: row.idempotency_key,
    attempt: row.attempt,
    externalJobId: row.external_job_id || undefined,
  };
}

export function providerJobRecordFromRow(row: VideoProviderJobRow): ProviderJobRecord {
  return {
    ...providerJobFromRow(row),
    userId: row.user_id,
    estimatedCost: row.estimated_cost == null ? null : Number(row.estimated_cost),
    actualCost: row.actual_cost == null ? null : Number(row.actual_cost),
    errorCode: row.error_code,
    errorMessage: row.error_message,
    retryCount: Number(row.retry_count || 0),
    nextPollAt: row.next_poll_at ?? null,
    startedAt: row.started_at ?? null,
    submittedAt: row.submitted_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at ?? null,
  };
}

export function qualityReportFromRow(row: VideoQualityReportRow): QualityReport {
  const subject: QualityReport["subject"] = row.scene_id ? "scene" : row.artifact_id ? "artifact" : "project";
  const subjectId = row.scene_id || row.artifact_id || row.project_id;
  const summary = typeof row.report.summary === "string" ? row.report.summary : "";
  return {
    id: row.id,
    projectId: row.project_id,
    subject,
    subjectId,
    ready: Array.isArray(row.blockers) && row.blockers.length === 0,
    score: Number(row.score),
    summary,
    blockers: Array.isArray(row.blockers) ? row.blockers : [],
  };
}

export function audioPlanFromPlanRow(row: VideoPlanRow, scenes: Scene[]): AudioPlan {
  const sfx = scenes.flatMap((scene) => scene.audio.sfx ?? []);
  return {
    id: `audio-${row.id}`,
    projectId: row.project_id,
    language: row.language,
    voiceScript: scenes.map((scene) => scene.dialogue.text).filter(Boolean).join("\n"),
    musicCue: scenes.find((scene) => scene.audio.musicCue)?.audio.musicCue,
    sfx,
  };
}

export function projectFromGenerationRow(
  generation: VideoGeneration & { domain_state?: string | null; workflow?: string | null; language?: string | null; active_plan_id?: string | null },
): VideoProject {
  const base = readProjectFromGeneration(generation);
  return {
    ...base,
    state: (generation.domain_state as VideoProjectState | undefined) || base.state,
    workflow: (generation.workflow as VideoWorkflow | undefined) || base.workflow,
    language: generation.language || base.language,
    planId: generation.active_plan_id ?? base.planId,
  };
}

/** Domain tables win; JSONB blueprint is read-only fallback. */
export function scenesFromDomainOrLegacy(input: {
  generation: VideoGeneration;
  sceneRows: VideoSceneRow[] | null | undefined;
}): Scene[] {
  if (input.sceneRows && input.sceneRows.length > 0) {
    return [...input.sceneRows]
      .sort((a, b) => a.scene_order - b.scene_order)
      .map(sceneFromRow);
  }
  return readScenesFromBlueprint(input.generation.blueprint, input.generation.id);
}
