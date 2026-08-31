import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";
import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";
import { updateWebsiteGenerationInPlace } from "@/lib/website/save-generation";
import {
  applyImageManagementOperation,
  type ImageManagementRequest,
  type ManagedSiteImage,
} from "@/lib/website/image-management/operations";
import { buildSiteImageSlotInventory } from "@/lib/website/image-management/list-slots";
import {
  validateAndRepairProjectImages,
  type ImageValidationResult,
} from "@/lib/website/image-management/validate-before-render";

const PACKAGE_INDUSTRY: Record<string, string> = {};

function resolveProjectIndustry(project: GeneratedWebsiteProject): string {
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  const packageId = String(settings.templatePackageId ?? "");
  if (packageId && PACKAGE_INDUSTRY[packageId]) {
    return PACKAGE_INDUSTRY[packageId]!;
  }
  const industry = String(
    settings.industryId ?? project.businessProfile?.industry ?? "",
  );
  return industry || "corporate";
}

export async function loadProjectForImageManagement(args: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
}): Promise<
  | { ok: true; project: GeneratedWebsiteProject; generation: WebsiteGeneration }
  | { ok: false; error: string }
> {
  const loaded = await loadWebsiteGenerationForUser(
    args.supabase,
    args.userId,
    args.generationId,
  );
  if (!loaded) return { ok: false, error: "Website not found." };
  return {
    ok: true,
    project: toWebsiteProject(loaded),
    generation: loaded,
  };
}

export async function listProjectSiteImages(args: {
  project: GeneratedWebsiteProject;
}): Promise<{ images: ManagedSiteImage[]; industry: string }> {
  const industry = resolveProjectIndustry(args.project);
  const images = buildSiteImageSlotInventory(
    args.project.files ?? [],
    args.project.assetManifest?.items,
  );
  return { images, industry };
}

export async function applyProjectImageOperation(args: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: ImageManagementRequest;
}): Promise<
  | {
      ok: true;
      project: GeneratedWebsiteProject;
      generation: WebsiteGeneration;
      image?: ManagedSiteImage;
    }
  | { ok: false; error: string }
> {
  const loaded = await loadProjectForImageManagement(args);
  if (!loaded.ok) return loaded;

  const { project, generation } = loaded;
  const files = [...(project.files ?? [])];
  const industry = resolveProjectIndustry(project);

  let request = args.request;
  if (request.action === "restore-default") {
    const slot = request.slot ?? "hero";
    const defaults = buildSlotsFromProfile(
      { industry },
      { projectSeed: `${project.title}-${slot}` },
    ).slots[slot];
    const index = Number.parseInt(request.imageId.split("-").pop() ?? "1", 10) - 1;
    const fallback = defaults[index] ?? defaults[0];
    if (fallback) {
      request = {
        ...request,
        action: "replace",
        url: fallback.url,
        alt: fallback.alt,
      };
    }
  }

  if (request.action === "generate") {
    const slot = request.slot ?? "hero";
    const prompt =
      request.generatePrompt?.trim() ||
      `${industry} ${slot} professional website photography`;
    const url = resolvePremiumStockUrl({
      industry,
      role: slot === "products" ? "product" : slot === "backgrounds" ? "background" : slot,
      seed: request.imageId,
      semanticQuery: prompt,
    });
    request = {
      ...request,
      action: "generate",
      url,
      alt: request.alt ?? prompt.slice(0, 120),
    };
  }

  const result = applyImageManagementOperation(files, request);
  if (!result.ok) return { ok: false, error: result.error ?? "Image operation failed" };

  const validated = validateAndRepairProjectImages(result.files, {
    industry,
    templatePackageId: String(
      (project.settings as Record<string, unknown> | undefined)?.templatePackageId ?? "",
    ),
  });

  const nextProject: GeneratedWebsiteProject = {
    ...project,
    files: validated.files,
  };

  const saved = await updateWebsiteGenerationInPlace({
    supabase: args.supabase,
    userId: args.userId,
    generationId: args.generationId,
    project: nextProject,
  });

  if (!saved.ok) return { ok: false, error: saved.error };

  return {
    ok: true,
    project: saved.project,
    generation: saved.generation,
    image: result.image,
  };
}

export function validateProjectImages(
  files: GeneratedProjectFile[],
  ctx: { industry?: string; templatePackageId?: string },
): ImageValidationResult {
  return validateAndRepairProjectImages(files, ctx);
}
