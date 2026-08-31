import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { loadPlanById, loadSceneById, resolveActivePlanId } from "@/lib/ai-core/video-production-platform/persistence/repository";
import { EditorMvpError } from "@/lib/ai-core/video-production-platform/editor-mvp/errors";
import type { EditorPlanSummary, EditorProjectSummary } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type EditorContext = {
  userId: string;
  project: EditorProjectSummary;
  plan: EditorPlanSummary;
  scene?: Scene;
};

export async function loadOwnedProject(
  supabase: AnySupabase,
  input: { userId: string; projectId: string },
): Promise<EditorProjectSummary> {
  const { data, error } = await supabase
    .from("video_generations")
    .select("id, video_name, domain_state, user_id")
    .eq("id", input.projectId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (error) throw new EditorMvpError(error.message || "Project lookup failed.", "not_found");
  if (!data) throw new EditorMvpError("Video project not found.", "not_found");
  if (String(data.user_id) !== input.userId) {
    throw new EditorMvpError("Project does not belong to this user.", "ownership");
  }
  return {
    id: String(data.id),
    title: String(data.video_name || "Untitled video"),
    state: data.domain_state ? String(data.domain_state) : null,
  };
}

export async function assertActivePlanContext(
  supabase: AnySupabase,
  input: { userId: string; projectId: string; sceneId?: string },
): Promise<EditorContext> {
  const project = await loadOwnedProject(supabase, input);
  const planId = await resolveActivePlanId(supabase, input.projectId);
  if (!planId) throw new EditorMvpError("No active plan found for this project.", "no_active_plan");
  const plan = await loadPlanById(supabase, planId);
  if (!plan) throw new EditorMvpError("Active plan not found.", "no_active_plan");
  if (plan.projectId !== input.projectId) {
    throw new EditorMvpError("Plan does not belong to this project.", "foreign_plan");
  }
  if (!plan.isActive) {
    throw new EditorMvpError("Editor can only mutate the active plan.", "inactive_plan");
  }

  const ctx: EditorContext = {
    userId: input.userId,
    project,
    plan: { id: plan.id, version: plan.version, isActive: true },
  };

  if (!input.sceneId) return ctx;

  const scene = await loadSceneById(supabase, input.sceneId);
  if (!scene) throw new EditorMvpError("Scene not found.", "not_found");
  if (scene.projectId !== input.projectId) {
    throw new EditorMvpError("Scene does not belong to this project.", "foreign_scene");
  }
  if (scene.planId && scene.planId !== plan.id) {
    throw new EditorMvpError("Scene does not belong to the active plan.", "plan_mixing");
  }
  if (!scene.planId) {
    throw new EditorMvpError("Scene is not attached to the active plan.", "plan_mixing");
  }
  return { ...ctx, scene };
}
