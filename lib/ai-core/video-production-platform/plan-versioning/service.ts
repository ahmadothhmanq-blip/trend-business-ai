import type { VideoPlanStatus } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { PlanVersioningError } from "@/lib/ai-core/video-production-platform/plan-versioning/errors";
import type { ActivatePlanResult, PlanVersion } from "@/lib/ai-core/video-production-platform/plan-versioning/contracts";
import {
  listPlansForProject,
  loadPlanById,
  loadScenesForPlan,
  type VideoPlanRecord,
} from "@/lib/ai-core/video-production-platform/persistence";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export function toPlanVersion(record: VideoPlanRecord): PlanVersion {
  return {
    id: record.id,
    projectId: record.projectId,
    version: record.version,
    status: record.status,
    isActive: record.isActive,
    createdAt: record.createdAt,
    sourcePrompt: record.sourcePrompt,
    sourceHash: record.sourceHash,
  };
}

async function writePlanLifecycle(
  supabase: AnySupabase,
  input: { id: string; isActive: boolean; status: VideoPlanStatus },
): Promise<void> {
  const patch = { is_active: input.isActive, status: input.status };
  const { error } = await supabase.from("video_plans").update(patch).eq("id", input.id);
  if (error && /is_active|status|column|schema cache/i.test(error.message || "")) {
    return;
  }
  if (error) {
    throw new PlanVersioningError(error.message || "Failed to update plan lifecycle.", "persist_failed");
  }
}

async function writeActivePlanId(supabase: AnySupabase, projectId: string, planId: string): Promise<void> {
  const { error } = await supabase
    .from("video_generations")
    .update({ active_plan_id: planId, updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error && /active_plan_id|column|schema cache/i.test(error.message || "")) return;
  if (error) {
    throw new PlanVersioningError(error.message || "Failed to set active_plan_id.", "persist_failed");
  }
}

export async function activatePlan(
  supabase: AnySupabase,
  input: { projectId: string; planId: string },
): Promise<ActivatePlanResult> {
  const plan = await loadPlanById(supabase, input.planId);
  if (!plan) {
    throw new PlanVersioningError("Plan not found.", "plan_not_found");
  }
  if (plan.projectId !== input.projectId) {
    throw new PlanVersioningError("Plan does not belong to this project.", "foreign_plan");
  }

  const siblings = await listPlansForProject(supabase, input.projectId);
  const previous = siblings.find((row) => row.isActive && row.id !== plan.id) || null;

  if (plan.isActive) {
    await writeActivePlanId(supabase, input.projectId, plan.id);
    return {
      projectId: input.projectId,
      planId: plan.id,
      version: plan.version,
      reused: true,
      previousPlanId: previous?.id ?? null,
    };
  }

  for (const sibling of siblings) {
    if (sibling.id === plan.id) continue;
    if (sibling.isActive || sibling.status === "active") {
      await writePlanLifecycle(supabase, {
        id: sibling.id,
        isActive: false,
        status: sibling.status === "archived" ? "archived" : "inactive",
      });
    }
  }

  await writePlanLifecycle(supabase, { id: plan.id, isActive: true, status: "active" });
  await writeActivePlanId(supabase, input.projectId, plan.id);

  return {
    projectId: input.projectId,
    planId: plan.id,
    version: plan.version,
    reused: false,
    previousPlanId: previous?.id ?? null,
  };
}

export async function archivePlan(
  supabase: AnySupabase,
  input: { projectId: string; planId: string },
): Promise<PlanVersion> {
  const plan = await loadPlanById(supabase, input.planId);
  if (!plan) {
    throw new PlanVersioningError("Plan not found.", "plan_not_found");
  }
  if (plan.projectId !== input.projectId) {
    throw new PlanVersioningError("Plan does not belong to this project.", "foreign_plan");
  }
  if (plan.isActive) {
    throw new PlanVersioningError("The active plan cannot be deleted or archived. Activate another plan first.", "active_plan_delete");
  }
  await writePlanLifecycle(supabase, { id: plan.id, isActive: false, status: "archived" });
  const next = await loadPlanById(supabase, plan.id);
  return toPlanVersion(next || { ...plan, status: "archived", isActive: false });
}

export async function listProjectPlanVersions(
  supabase: AnySupabase,
  projectId: string,
): Promise<PlanVersion[]> {
  const plans = await listPlansForProject(supabase, projectId);
  return plans.map(toPlanVersion);
}

export async function loadActivePlanScenes(supabase: AnySupabase, projectId: string) {
  const plans = await listPlansForProject(supabase, projectId);
  const active = plans.find((row) => row.isActive);
  if (!active) {
    return { plan: null, scenes: [] as Awaited<ReturnType<typeof loadScenesForPlan>> };
  }
  return {
    plan: toPlanVersion(active),
    scenes: await loadScenesForPlan(supabase, projectId, active.id),
  };
}
