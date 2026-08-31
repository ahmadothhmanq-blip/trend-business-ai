/**
 * Domain persistence for Video Studio (Phase 2+).
 * Generate/render HTTP routes write here; JSONB blueprint remains a legacy read path.
 */

import type {
  ProviderJob,
  QualityReport,
  Scene,
  VideoArtifact,
  VideoPlan,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";
import {
  assertCanPersistArtifact,
  assertCanPersistProviderJob,
  assertCanPersistScene,
} from "@/lib/ai-core/video-production-platform/persistence/guards";
import {
  artifactFromMediaRow,
  planFromRow,
  providerJobFromRow,
  providerJobRecordFromRow,
  qualityReportFromRow,
  sceneFromRow,
  sceneToRow,
  type ProviderJobRecord,
  type VideoMediaArtifactRow,
  type VideoPlanRecord,
  type VideoPlanRow,
  type VideoProviderJobRow,
  type VideoQualityReportRow,
  type VideoSceneRow,
} from "@/lib/ai-core/video-production-platform/persistence/mappers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

function throwIfError(error: { message?: string; code?: string } | null, action: string): void {
  if (!error) return;
  if (error.code === "23505") {
    throw new DomainValidationError(`Duplicate ${action} rejected (${error.message || "unique_violation"}).`);
  }
  if (error.code === "23514" || error.code === "23503") {
    throw new DomainValidationError(`${action} rejected: ${error.message || error.code}`);
  }
  throw new DomainValidationError(`${action} failed: ${error.message || "unknown error"}`);
}

export async function insertVideoPlan(
  supabase: AnySupabase,
  input: {
    userId: string;
    projectId: string;
    plan: Pick<VideoPlan, "narrativeArc" | "pacing" | "preferredProvider"> & {
      id?: string;
      version?: number;
      language?: string;
      aspectRatio?: string;
      durationSec?: number;
      style?: string;
      budgetCredits?: number | null;
      spec?: Record<string, unknown> | null;
      idempotencyKey?: string | null;
      sourcePrompt?: string | null;
      sourceHash?: string | null;
    };
  },
): Promise<VideoPlanRecord> {
  const row: Record<string, unknown> = {
    id: input.plan.id,
    user_id: input.userId,
    project_id: input.projectId,
    version: input.plan.version ?? 1,
    objective: input.plan.narrativeArc,
    language: input.plan.language ?? "en",
    aspect_ratio: input.plan.aspectRatio ?? "16:9",
    duration_sec: input.plan.durationSec ?? 0,
    style: input.plan.style ?? "",
    budget_credits: input.plan.budgetCredits ?? null,
    pacing: input.plan.pacing,
    preferred_provider: input.plan.preferredProvider,
    status: "inactive",
    is_active: false,
    source_prompt: input.plan.sourcePrompt ?? null,
    source_hash: input.plan.sourceHash ?? input.plan.idempotencyKey ?? null,
  };
  if (input.plan.spec) row.spec = input.plan.spec;
  if (input.plan.idempotencyKey) row.idempotency_key = input.plan.idempotencyKey;

  let { data, error } = await supabase.from("video_plans").insert(row).select("*").single();
  if (error && /spec|idempotency_key|status|is_active|source_prompt|source_hash|column|schema cache/i.test(error.message || "")) {
    delete row.spec;
    delete row.idempotency_key;
    delete row.status;
    delete row.is_active;
    delete row.source_prompt;
    delete row.source_hash;
    ({ data, error } = await supabase.from("video_plans").insert(row).select("*").single());
  }
  throwIfError(error, "video_plans.insert");
  return planFromRow(data as VideoPlanRow, []);
}

export async function insertVideoScenes(
  supabase: AnySupabase,
  input: { userId: string; planId: string; scenes: Scene[] },
): Promise<Scene[]> {
  if (!input.planId?.trim()) {
    throw new DomainValidationError("Scenes must be persisted with a planId. Project-scoped scene writes are not allowed.");
  }
  for (const scene of input.scenes) {
    assertCanPersistScene(scene);
  }
  const rows = input.scenes.map((scene) => sceneToRow({ ...scene, planId: input.planId }, input.userId, input.planId));
  const { data, error } = await supabase.from("video_scenes").insert(rows).select("*");
  throwIfError(error, "video_scenes.insert");
  return ((data || []) as VideoSceneRow[])
    .sort((a, b) => a.scene_order - b.scene_order)
    .map(sceneFromRow);
}

export async function reorderVideoScenes(
  supabase: AnySupabase,
  input: { projectId: string; orderedSceneIds: string[]; planId?: string },
): Promise<Scene[]> {
  const planId = input.planId || (await resolveActivePlanId(supabase, input.projectId));
  if (!planId) {
    throw new DomainValidationError("Cannot reorder scenes without an active plan.");
  }
  const { data: existing, error: readError } = await supabase
    .from("video_scenes")
    .select("*")
    .eq("project_id", input.projectId)
    .eq("plan_id", planId);
  throwIfError(readError, "video_scenes.read");
  const rows = (existing || []) as VideoSceneRow[];
  if (rows.length !== input.orderedSceneIds.length) {
    throw new DomainValidationError("Scene reorder must include every scene in the active plan.");
  }
  const byId = new Map(rows.map((row) => [row.id, row]));
  for (const id of input.orderedSceneIds) {
    if (!byId.has(id)) {
      throw new DomainValidationError(`Cannot reorder unknown scene ${id} on the active plan.`);
    }
  }
  // Unique (plan_id, scene_order): shift then assign so versions stay isolated.
  for (const row of rows) {
    const { error } = await supabase
      .from("video_scenes")
      .update({ scene_order: row.scene_order + 1000 })
      .eq("id", row.id)
      .eq("plan_id", planId);
    throwIfError(error, "video_scenes.reorder");
  }
  for (const [index, id] of input.orderedSceneIds.entries()) {
    const { error } = await supabase
      .from("video_scenes")
      .update({ scene_order: index })
      .eq("id", id)
      .eq("plan_id", planId);
    throwIfError(error, "video_scenes.reorder");
  }
  return loadScenesForPlan(supabase, input.projectId, planId);
}

export async function insertProviderJob(
  supabase: AnySupabase,
  input: { userId: string; job: ProviderJob; estimatedCost?: number | null },
): Promise<ProviderJob> {
  assertCanPersistProviderJob(input.job);
  const { data, error } = await supabase
    .from("video_provider_jobs")
    .insert({
      id: input.job.id,
      user_id: input.userId,
      project_id: input.job.projectId,
      scene_id: input.job.sceneId,
      provider: input.job.provider,
      external_job_id: input.job.externalJobId ?? null,
      status: input.job.status,
      attempt: input.job.attempt,
      idempotency_key: input.job.idempotencyKey,
      estimated_cost: input.estimatedCost ?? null,
      retry_count: 0,
      next_poll_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  throwIfError(error, "video_provider_jobs.insert");
  return providerJobFromRow(data as VideoProviderJobRow);
}

export async function findProviderJobByIdempotencyKey(
  supabase: AnySupabase,
  idempotencyKey: string,
): Promise<ProviderJobRecord | null> {
  const { data, error } = await supabase
    .from("video_provider_jobs")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    throwIfError(error, "video_provider_jobs.read");
  }
  if (!data) return null;
  return providerJobRecordFromRow(data as VideoProviderJobRow);
}

export async function listProviderJobsForProject(
  supabase: AnySupabase,
  projectId: string,
): Promise<ProviderJobRecord[]> {
  const { data, error } = await supabase
    .from("video_provider_jobs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  throwIfError(error, "video_provider_jobs.list");
  return ((data || []) as VideoProviderJobRow[]).map(providerJobRecordFromRow);
}

export async function listDueProviderJobs(
  supabase: AnySupabase,
  input: { limit?: number; nowIso?: string; userId?: string } = {},
): Promise<ProviderJobRecord[]> {
  let query = supabase
    .from("video_provider_jobs")
    .select("*")
    .in("status", ["queued", "submitted", "processing"])
    .order("created_at", { ascending: true })
    .limit(Math.max(1, input.limit ?? 20) * 3);
  if (input.userId) {
    query = query.eq("user_id", input.userId);
  }
  const { data, error } = await query;
  throwIfError(error, "video_provider_jobs.due");
  const now = Date.parse(input.nowIso || new Date().toISOString());
  return ((data || []) as VideoProviderJobRow[])
    .map(providerJobRecordFromRow)
    .filter((job) => {
      if (input.userId && job.userId && job.userId !== input.userId) return false;
      return !job.nextPollAt || Date.parse(job.nextPollAt) <= now;
    })
    .slice(0, Math.max(1, input.limit ?? 20));
}

export async function updateProviderJob(
  supabase: AnySupabase,
  input: {
    id: string;
    status?: ProviderJob["status"];
    attempt?: number;
    externalJobId?: string | null;
    actualCost?: number | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    submittedAt?: string | null;
    completedAt?: string | null;
    retryCount?: number;
    nextPollAt?: string | null;
    startedAt?: string | null;
    userId?: string;
  },
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (input.attempt != null) patch.attempt = input.attempt;
  if (input.externalJobId !== undefined) patch.external_job_id = input.externalJobId;
  if (input.actualCost !== undefined) patch.actual_cost = input.actualCost;
  if (input.errorCode !== undefined) patch.error_code = input.errorCode;
  if (input.errorMessage !== undefined) patch.error_message = input.errorMessage;
  if (input.submittedAt !== undefined) patch.submitted_at = input.submittedAt;
  if (input.completedAt !== undefined) patch.completed_at = input.completedAt;
  if (input.retryCount != null) patch.retry_count = input.retryCount;
  if (input.nextPollAt !== undefined) patch.next_poll_at = input.nextPollAt;
  if (input.startedAt !== undefined) patch.started_at = input.startedAt;
  let update = supabase.from("video_provider_jobs").update(patch).eq("id", input.id);
  if (input.userId) {
    update = update.eq("user_id", input.userId);
  }
  const { error } = await update;
  throwIfError(error, "video_provider_jobs.update");
}

export async function loadOwnedFinalComposite(
  supabase: AnySupabase,
  input: { userId: string; projectId: string },
): Promise<{ artifact: VideoArtifact; row: VideoMediaArtifactRow } | null> {
  const { data, error } = await supabase
    .from("video_media")
    .select("*")
    .eq("generation_id", input.projectId)
    .eq("kind", "composite")
    .in("mime_type", ["video/mp4", "video/webm"])
    .order("created_at", { ascending: false })
    .limit(8);
  if (error && error.code !== "PGRST116") {
    throwIfError(error, "video_media.read");
  }
  const rows = (data || []) as VideoMediaArtifactRow[];
  if (!rows.length) return null;
  const owned = rows.filter((row) => row.user_id === input.userId);
  if (!owned.length) {
    const err = new Error("Composite artifact does not belong to this user.");
    err.name = "CompositeOwnershipError";
    throw err;
  }
  for (const row of owned) {
    const artifact = artifactFromMediaRow(row);
    if (isValidVideoArtifact(artifact)) return { artifact, row };
  }
  return { artifact: artifactFromMediaRow(owned[0]!), row: owned[0]! };
}

export async function loadPlayableCompositeArtifact(
  supabase: AnySupabase,
  projectId: string,
): Promise<VideoArtifact | null> {
  const { data, error } = await supabase
    .from("video_media")
    .select("*")
    .eq("generation_id", projectId)
    .in("kind", ["composite", "scene_clip", "clip"])
    .in("mime_type", ["video/mp4", "video/webm"])
    .order("created_at", { ascending: false })
    .limit(8);
  if (error && error.code !== "PGRST116") {
    throwIfError(error, "video_media.read");
  }
  const rows = (data || []) as VideoMediaArtifactRow[];
  const ordered = [
    ...rows.filter((row) => row.kind === "composite"),
    ...rows.filter((row) => row.kind !== "composite"),
  ];
  for (const row of ordered) {
    const artifact = artifactFromMediaRow(row);
    if (isValidVideoArtifact(artifact)) return artifact;
  }
  return null;
}

export async function loadPlayableSceneArtifact(
  supabase: AnySupabase,
  projectId: string,
  sceneId: string,
): Promise<VideoArtifact | null> {
  const { data, error } = await supabase
    .from("video_media")
    .select("*")
    .eq("generation_id", projectId)
    .eq("scene_id", sceneId)
    .in("mime_type", ["video/mp4", "video/webm"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    throwIfError(error, "video_media.read");
  }
  if (!data) return null;
  const artifact = artifactFromMediaRow(data as VideoMediaArtifactRow);
  return isValidVideoArtifact(artifact) ? artifact : null;
}

export async function insertPlayableArtifact(
  supabase: AnySupabase,
  input: {
    userId: string;
    artifact: VideoArtifact;
    storagePath: string;
    sizeBytes?: number;
    sha256?: string | null;
    sceneId?: string | null;
  },
): Promise<VideoArtifact> {
  assertCanPersistArtifact(input.artifact);
  const kind = input.artifact.kind === "scene_clip" ? "clip" : "composite";
  const { data, error } = await supabase
    .from("video_media")
    .insert({
      id: input.artifact.id,
      user_id: input.userId,
      generation_id: input.artifact.projectId,
      scene_id: input.sceneId ?? null,
      kind,
      mime_type: input.artifact.mimeType,
      storage_path: input.storagePath,
      public_url: input.artifact.url.startsWith("storage://") ? null : input.artifact.url,
      size_bytes: input.sizeBytes ?? 0,
      duration_sec: input.artifact.durationSec,
      provider: input.artifact.provider,
      sha256: input.sha256 ?? null,
      width: input.artifact.width ?? null,
      height: input.artifact.height ?? null,
    })
    .select("*")
    .single();
  throwIfError(error, "video_media.insert");
  return artifactFromMediaRow(data as VideoMediaArtifactRow);
}

export async function insertQualityReport(
  supabase: AnySupabase,
  input: {
    userId: string;
    report: QualityReport;
    warnings?: string[];
    extra?: Record<string, unknown>;
  },
): Promise<QualityReport> {
  const sceneId = input.report.subject === "scene" ? input.report.subjectId : null;
  const artifactId = input.report.subject === "artifact" ? input.report.subjectId : null;
  const { data, error } = await supabase
    .from("video_quality_reports")
    .insert({
      id: input.report.id,
      user_id: input.userId,
      project_id: input.report.projectId,
      scene_id: sceneId,
      artifact_id: artifactId,
      score: input.report.score,
      blockers: input.report.blockers,
      warnings: input.warnings ?? [],
      report: {
        summary: input.report.summary,
        ready: input.report.ready,
        ...(input.extra || {}),
      },
    })
    .select("*")
    .single();
  throwIfError(error, "video_quality_reports.insert");
  const row = data as VideoQualityReportRow;
  return qualityReportFromRow({
    ...row,
    blockers: Array.isArray(row.blockers) ? row.blockers : input.report.blockers,
    warnings: Array.isArray(row.warnings) ? row.warnings : input.warnings ?? [],
    report: row.report || { summary: input.report.summary },
  });
}

export async function loadLatestQualityReport(
  supabase: AnySupabase,
  projectId: string,
): Promise<{ report: QualityReport; verdict: string | null } | null> {
  const { data, error } = await supabase
    .from("video_quality_reports")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throwIfError(error, "video_quality_reports.read");
  if (!data) return null;
  const row = data as VideoQualityReportRow;
  const mapped = qualityReportFromRow({
    ...row,
    blockers: Array.isArray(row.blockers) ? row.blockers : [],
    warnings: Array.isArray(row.warnings) ? row.warnings : [],
    report: row.report || {},
  });
  const verdict = typeof row.report?.verdict === "string" ? row.report.verdict : null;
  return { report: mapped, verdict };
}

export async function loadScenesForPlan(
  supabase: AnySupabase,
  projectId: string,
  planId: string,
): Promise<Scene[]> {
  const { data, error } = await supabase
    .from("video_scenes")
    .select("*")
    .eq("project_id", projectId)
    .eq("plan_id", planId)
    .order("scene_order", { ascending: true });
  throwIfError(error, "video_scenes.read");
  return ((data || []) as VideoSceneRow[]).map(sceneFromRow);
}

export async function resolveActivePlanId(
  supabase: AnySupabase,
  projectId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("video_plans")
    .select("id")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .maybeSingle();
  if (error && /is_active|column|schema cache/i.test(error.message || "")) {
    const { data: generation, error: genError } = await supabase
      .from("video_generations")
      .select("active_plan_id")
      .eq("id", projectId)
      .maybeSingle();
    if (genError && genError.code !== "PGRST116") throwIfError(genError, "video_generations.read");
    return (generation?.active_plan_id as string | null | undefined) || null;
  }
  if (error && error.code !== "PGRST116") throwIfError(error, "video_plans.read");
  if (data?.id) return String(data.id);
  return null;
}

/** Default scene read: ACTIVE PLAN only. Never mixes scenes across plan versions. */
export async function loadDomainScenes(
  supabase: AnySupabase,
  projectId: string,
): Promise<Scene[]> {
  const planId = await resolveActivePlanId(supabase, projectId);
  if (!planId) return [];
  return loadScenesForPlan(supabase, projectId, planId);
}

export async function findPlanByIdempotencyKey(
  supabase: AnySupabase,
  projectId: string,
  idempotencyKey: string,
): Promise<VideoPlanRecord | null> {
  const { data, error } = await supabase
    .from("video_plans")
    .select("*")
    .eq("project_id", projectId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    if (/idempotency_key|column|schema cache/i.test(error.message || "")) return null;
    throwIfError(error, "video_plans.read");
  }
  if (!data) return null;
  const scenes = await loadScenesForPlan(supabase, projectId, (data as VideoPlanRow).id);
  return planFromRow(data as VideoPlanRow, scenes.map((scene) => scene.id));
}

export async function listPlansForProject(
  supabase: AnySupabase,
  projectId: string,
): Promise<VideoPlanRecord[]> {
  const { data, error } = await supabase
    .from("video_plans")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: true });
  throwIfError(error, "video_plans.list");
  return ((data || []) as VideoPlanRow[]).map((row) => planFromRow(row, []));
}

export async function loadPlanById(
  supabase: AnySupabase,
  planId: string,
): Promise<VideoPlanRecord | null> {
  const { data, error } = await supabase.from("video_plans").select("*").eq("id", planId).maybeSingle();
  if (error && error.code !== "PGRST116") throwIfError(error, "video_plans.read");
  if (!data) return null;
  const row = data as VideoPlanRow;
  const scenes = await loadScenesForPlan(supabase, row.project_id, row.id);
  return planFromRow(row, scenes.map((scene) => scene.id));
}

export async function nextPlanVersion(supabase: AnySupabase, projectId: string): Promise<number> {
  const { data, error } = await supabase
    .from("video_plans")
    .select("version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throwIfError(error, "video_plans.read");
  return (Number(data?.version) || 0) + 1;
}

/** Active plan only. Highest version is not an implicit fallback. */
export async function loadPlanForProject(
  supabase: AnySupabase,
  projectId: string,
): Promise<VideoPlanRecord | null> {
  const planId = await resolveActivePlanId(supabase, projectId);
  if (!planId) return null;
  return loadPlanById(supabase, planId);
}

export async function loadSceneById(supabase: AnySupabase, sceneId: string): Promise<Scene | null> {
  const { data, error } = await supabase.from("video_scenes").select("*").eq("id", sceneId).maybeSingle();
  if (error && error.code !== "PGRST116") {
    throwIfError(error, "video_scenes.read");
  }
  if (!data) return null;
  return sceneFromRow(data as VideoSceneRow);
}

export async function listProviderJobsForScene(
  supabase: AnySupabase,
  projectId: string,
  sceneId: string,
): Promise<ProviderJobRecord[]> {
  const { data, error } = await supabase
    .from("video_provider_jobs")
    .select("*")
    .eq("project_id", projectId)
    .eq("scene_id", sceneId)
    .order("created_at", { ascending: true });
  throwIfError(error, "video_provider_jobs.list");
  return ((data || []) as VideoProviderJobRow[]).map(providerJobRecordFromRow);
}

export async function updateSceneRecord(
  supabase: AnySupabase,
  input: {
    id: string;
    status?: Scene["status"];
    artifactId?: string | null;
    qualityScore?: number | null;
    prompt?: string;
  },
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (input.artifactId !== undefined) patch.artifact_id = input.artifactId;
  if (input.qualityScore !== undefined) patch.quality_score = input.qualityScore;
  if (input.prompt !== undefined) patch.prompt = input.prompt;
  const { error } = await supabase.from("video_scenes").update(patch).eq("id", input.id);
  throwIfError(error, "video_scenes.update");
}

export async function persistDomainScene(
  supabase: AnySupabase,
  input: { userId: string; scene: Scene },
): Promise<Scene> {
  assertCanPersistScene(input.scene);
  const row = sceneToRow(input.scene, input.userId, input.scene.planId ?? null);
  const { data, error } = await supabase
    .from("video_scenes")
    .update({
      scene_order: row.scene_order,
      duration_sec: row.duration_sec,
      prompt: row.prompt,
      camera: row.camera,
      visual_style: row.visual_style,
      scene_references: row.scene_references,
      characters: row.characters,
      products: row.products,
      dialogue: row.dialogue,
      audio: row.audio,
      transition: row.transition,
      provider_preference: row.provider_preference,
      fallback_provider: row.fallback_provider,
      status: row.status,
      quality_score: row.quality_score,
      artifact_id: row.artifact_id,
    })
    .eq("id", input.scene.id)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  throwIfError(error, "video_scenes.persist");
  return sceneFromRow(data as VideoSceneRow);
}

export async function deleteSceneRecord(
  supabase: AnySupabase,
  input: { userId: string; sceneId: string; planId: string },
): Promise<void> {
  const { error } = await supabase
    .from("video_scenes")
    .delete()
    .eq("id", input.sceneId)
    .eq("user_id", input.userId)
    .eq("plan_id", input.planId);
  throwIfError(error, "video_scenes.delete");
}
