import { MAX_WEBSITE_FILES } from "@/lib/ai/website-scaffold";
import type {
  WebsiteDynamicPlan,
  WebsiteProjectAnalysis,
  WebsiteProjectBlueprint,
} from "@/plugins/website/types";

export function validateWebsiteAnalysis(analysis: WebsiteProjectAnalysis): {
  valid: boolean;
  reason?: string;
} {
  if (!analysis?.projectName?.trim()) {
    return { valid: false, reason: "projectName is required." };
  }
  if (!Array.isArray(analysis.pages) || analysis.pages.length === 0) {
    return { valid: false, reason: "pages must be a non-empty array." };
  }
  if (typeof analysis.requiresAuth !== "boolean") {
    return { valid: false, reason: "requiresAuth must be a boolean." };
  }
  if (typeof analysis.requiresDatabase !== "boolean") {
    return { valid: false, reason: "requiresDatabase must be a boolean." };
  }
  return { valid: true };
}

export function validateWebsiteBlueprint(blueprint: WebsiteProjectBlueprint): {
  valid: boolean;
  reason?: string;
} {
  if (!blueprint?.title?.trim()) {
    return { valid: false, reason: "blueprint.title is required." };
  }
  if (!blueprint.description?.trim()) {
    return { valid: false, reason: "blueprint.description is required." };
  }
  if (!Array.isArray(blueprint.pages) || blueprint.pages.length === 0) {
    return { valid: false, reason: "blueprint.pages must be a non-empty array." };
  }
  return { valid: true };
}

export function validateWebsiteDynamicPlan(plan: WebsiteDynamicPlan): {
  valid: boolean;
  reason?: string;
} {
  if (!Array.isArray(plan?.files) || plan.files.length === 0) {
    return { valid: false, reason: "plan.files must be a non-empty array." };
  }
  if (plan.files.length > MAX_WEBSITE_FILES) {
    return {
      valid: false,
      reason: `plan.files has ${plan.files.length} entries; hard limit is ${MAX_WEBSITE_FILES}.`,
    };
  }

  const paths = new Set<string>();
  for (const file of plan.files) {
    if (!file?.path?.trim()) {
      return { valid: false, reason: "Every planned file needs a path." };
    }
    if (paths.has(file.path)) {
      return { valid: false, reason: `Duplicate planned path: ${file.path}` };
    }
    paths.add(file.path);
  }

  if (
    typeof plan.estimatedFileCount === "number" &&
    plan.estimatedFileCount > MAX_WEBSITE_FILES
  ) {
    return {
      valid: false,
      reason: `estimatedFileCount ${plan.estimatedFileCount} exceeds ${MAX_WEBSITE_FILES}.`,
    };
  }

  return { valid: true };
}
