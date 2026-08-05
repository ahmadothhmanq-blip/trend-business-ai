import type { MasterPlanContentLlmRequest } from "@/lib/ai-core/generation-engine/master-plan/llm-request-builder";
import { validateMasterPlan } from "@/lib/ai-core/generation-engine/master-plan/validate";
import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";
import type { GeneratedWebsiteProject } from "@/lib/website/types";
import type {
  IntegrationValidationResult,
  MasterPlanIntegrationStage,
  StructuredContentResult,
} from "@/lib/ai-core/generation-engine/integration/types";

/** Before generation — validate Master Plan authority. */
export function validateBeforeGeneration(plan: MasterPlan): IntegrationValidationResult {
  const result = validateMasterPlan(plan);
  if (!result.valid) {
    return { valid: false, errors: result.errors, stage: "master_plan" };
  }
  return { valid: true };
}

/** Before LLM — validate content tasks are copy-only. */
export function validateContentTasks(
  request: MasterPlanContentLlmRequest,
): IntegrationValidationResult {
  const errors: string[] = [];

  if (!request.systemPrompt.includes("LOCKED Master Plan")) {
    errors.push("Content request must reference locked Master Plan");
  }
  if (!request.userPrompt.includes("copyTasks")) {
    errors.push("Content request must include copyTasks");
  }
  try {
    const parsed = JSON.parse(request.userPrompt) as { locked?: boolean };
    if (!parsed || typeof parsed !== "object") {
      errors.push("Content request userPrompt must be valid JSON");
    } else if (parsed.locked !== true) {
      errors.push("Content request must be locked to Master Plan");
    }
  } catch {
    errors.push("Content request userPrompt must be valid JSON");
  }

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors, stage: "content_tasks" };
}

/** After LLM — validate structured content response. */
export function validateStructuredContent(
  plan: MasterPlan,
  content: StructuredContentResult,
): IntegrationValidationResult {
  const errors: string[] = [];

  if (content.masterPlanId !== plan.id) {
    errors.push("Structured content masterPlanId mismatch");
  }
  if (!Array.isArray(content.content)) {
    errors.push("Structured content must include content array");
  }

  const blockIds = new Set(
    plan.sections.flatMap((s) => s.contentBlocks),
  );
  for (const item of content.content) {
    if (!blockIds.has(item.blockId)) {
      errors.push(`Unknown content block: ${item.blockId}`);
    }
    for (const value of Object.values(item.fields)) {
      if (typeof value !== "string") {
        errors.push(`Content field for ${item.blockId} must be string`);
      }
    }
  }

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors, stage: "structured_content" };
}

/** Before builder — validate required fields from Master Plan. */
export function validateBeforeBuilder(plan: MasterPlan): IntegrationValidationResult {
  const errors: string[] = [];

  if (!plan.pages.length) errors.push("Master Plan must have pages");
  if (!plan.sections.length) errors.push("Master Plan must have sections");
  if (!plan.navigation.length) errors.push("Master Plan must have navigation");
  if (!plan.ctaStrategy.primary) errors.push("Master Plan must have primary CTA");
  if (!plan.localization.language) errors.push("Master Plan must have language");

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors, stage: "builder" };
}

/** Before export — validate generated website has required artifacts. */
export function validateBeforeExport(
  project: Pick<GeneratedWebsiteProject, "pages" | "sections" | "files" | "title">,
): IntegrationValidationResult {
  const errors: string[] = [];

  if (!project.title?.trim()) errors.push("Project title required");
  if (!project.pages?.length) errors.push("Project pages required");
  if (!project.files?.length) errors.push("Project files required");

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors, stage: "export" };
}

export function assertIntegrationValid(
  result: IntegrationValidationResult,
  label: string,
): void {
  if (!result.valid) {
    throw new Error(
      `[master-plan-integration] ${label} failed at ${result.stage}: ${result.errors.join("; ")}`,
    );
  }
}
