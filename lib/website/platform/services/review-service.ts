/**
 * Website Review Studio service — thin API layer over review-studio lib.
 * Persists versions in blueprint reviewStudioState.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  runWebsiteReview,
  applySelectedImprovements,
  rollbackToVersion,
  getCurrentVersion,
  listVersions,
  getSession,
} from "@/lib/website/review-studio";
import { createCapabilityService } from "@/lib/website/builder/capabilities/service";
import type {
  ReviewStudioPersistedState,
  ReviewStudioResult,
  VersionComparison,
} from "@/lib/website/review-studio";
import { commitBlueprintRevision } from "@/lib/website/platform/commit";
import { readBlueprintRevisionFromGeneration } from "@/lib/website/platform/revision";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";
import type { WebsiteCommitOptions } from "@/lib/website/platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type WebsiteReviewLoadResult =
  | {
      ok: true;
      review: ReviewStudioResult;
      projectName: string;
      persistedState: ReviewStudioPersistedState | null;
    }
  | { ok: false; code: "NOT_FOUND" | "VALIDATION"; error: string };

export type WebsiteReviewApplyResult =
  | {
      ok: true;
      project: GeneratedWebsiteProject;
      generation: WebsiteGeneration;
      comparison: VersionComparison;
      appliedChanges: string[];
      review: ReviewStudioResult;
      revision?: number;
    }
  | { ok: false; code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "SERVER"; error: string };

function buildUpstreamContext(project: GeneratedWebsiteProject) {
  const settings = project.settings as Record<string, string> | undefined;
  return {
    masterPlanId: settings?.masterPlanId,
    awqeSpecId: settings?.awqeSpecId,
    awqeScore: settings?.awqeOverallScore
      ? Number(settings.awqeOverallScore)
      : undefined,
    productionTraceId: settings?.productionTraceId,
    glsContextHash: settings?.glsContextHash,
    tbdpTemplateId: settings?.tbdpTemplateId,
  };
}

function persistStateFromSession(
  sessionId: string,
  existing?: ReviewStudioPersistedState | null,
): ReviewStudioPersistedState {
  const versions = listVersions(sessionId);
  const current = getCurrentVersion(sessionId);
  const snapshots: Record<string, GeneratedProjectFile[]> = {
    ...(existing?.snapshots ?? {}),
  };

  for (const v of versions) {
    if (!snapshots[v.id]) {
      snapshots[v.id] = v.files;
    }
  }

  const keys = Object.keys(snapshots);
  if (keys.length > 10) {
    for (const key of keys.slice(0, keys.length - 10)) {
      delete snapshots[key];
    }
  }

  return {
    sessionId,
    currentVersionId: current?.id,
    versions: versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      createdAt: v.createdAt,
      appliedImprovements: v.appliedImprovements,
      improvementTitles: v.improvementTitles,
      qualityScores: v.qualityScores,
      parentVersionId: v.parentVersionId,
    })),
    snapshots,
  };
}

export async function loadWebsiteReview(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
}): Promise<WebsiteReviewLoadResult> {
  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Website not found." };
  }

  const project = toWebsiteProject(generation);
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
  if (!files.length) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "Generation has no files to review.",
    };
  }

  const review = await runWebsiteReview({
    sessionId: params.generationId,
    files,
    title: project.title,
    description: project.description,
    language: generation.language || undefined,
    industryId: project.businessProfile?.industry,
    prompt: project.prompt,
    businessProfile: project.businessProfile,
    strategy: project.strategy,
    designSystem: project.designSystem,
    upstreamContext: buildUpstreamContext(project),
    activeCapabilityIds: createCapabilityService(project, files).getActiveCapabilities(),
  });

  if (!review.ok) {
    return { ok: false, code: "VALIDATION", error: review.errors.join("; ") };
  }

  return {
    ok: true,
    review,
    projectName: generation.project_name || project.title,
    persistedState: project.reviewStudioState ?? null,
  };
}

export async function executeWebsiteReviewApply(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  improvementIds: string[];
  commit?: Pick<WebsiteCommitOptions, "expectedRevision" | "idempotencyKey">;
}): Promise<WebsiteReviewApplyResult> {
  const loaded = await loadWebsiteReview({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
  });
  if (!loaded.ok) {
    return { ok: false, code: loaded.code, error: loaded.error };
  }

  const applied = await applySelectedImprovements({
    request: {
      sessionId: params.generationId,
      improvementIds: params.improvementIds,
    },
  });

  if (!applied.ok) {
    return { ok: false, code: "VALIDATION", error: applied.errors.join("; ") };
  }

  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Website not found." };
  }

  const project = toWebsiteProject(generation);
  const reviewStudioState = persistStateFromSession(
    params.generationId,
    project.reviewStudioState,
  );

  const updatedProject: GeneratedWebsiteProject = {
    ...project,
    files: applied.files,
    reviewStudioState,
  };

  const committed = await commitBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    project: updatedProject,
    projectKind: project.projectKind ?? "website",
    input: {
      prompt: project.prompt || project.description || "",
      language: generation.language || "English",
      theme: generation.design_style || "modern",
      features: generation.features ?? [],
      productId: "website-builder",
      projectId: generation.project_id ?? undefined,
    },
    commit: {
      operation: "website.review.apply",
      expectedRevision: params.commit?.expectedRevision,
      idempotencyKey: params.commit?.idempotencyKey,
      mutationMeta: {
        improvementIds: params.improvementIds,
        appliedChanges: applied.appliedChanges,
      },
    },
  });

  if (!committed.ok) {
    return {
      ok: false,
      code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
      error: committed.error,
    };
  }

  const refreshed = await loadWebsiteReview({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
  });

  return {
    ok: true,
    project: committed.project,
    generation: committed.generation,
    comparison: applied.comparison,
    appliedChanges: applied.appliedChanges,
    review: refreshed.ok ? refreshed.review : loaded.review,
    revision: readBlueprintRevisionFromGeneration(committed.generation),
  };
}

export async function executeWebsiteReviewRollback(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  versionId: string;
  commit?: Pick<WebsiteCommitOptions, "expectedRevision" | "idempotencyKey">;
}): Promise<WebsiteReviewApplyResult> {
  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Website not found." };
  }

  const project = toWebsiteProject(generation);
  const snapshot = project.reviewStudioState?.snapshots?.[params.versionId];
  if (!snapshot?.length) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "Version snapshot not found.",
    };
  }

  const session = getSession(params.generationId);
  if (session) {
    rollbackToVersion(params.generationId, params.versionId);
  }

  const updatedProject: GeneratedWebsiteProject = {
    ...project,
    files: snapshot,
    reviewStudioState: {
      ...(project.reviewStudioState ?? {
        sessionId: params.generationId,
        versions: [],
        snapshots: {},
      }),
      currentVersionId: params.versionId,
    },
  };

  const committed = await commitBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    project: updatedProject,
    projectKind: project.projectKind ?? "website",
    input: {
      prompt: project.prompt || project.description || "",
      language: generation.language || "English",
      theme: generation.design_style || "modern",
      features: generation.features ?? [],
      productId: "website-builder",
      projectId: generation.project_id ?? undefined,
    },
    commit: {
      operation: "website.review.rollback",
      expectedRevision: params.commit?.expectedRevision,
      idempotencyKey: params.commit?.idempotencyKey,
      mutationMeta: { versionId: params.versionId },
    },
  });

  if (!committed.ok) {
    return {
      ok: false,
      code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
      error: committed.error,
    };
  }

  const refreshed = await loadWebsiteReview({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
  });

  const targetVersion = project.reviewStudioState?.versions.find(
    (v) => v.id === params.versionId,
  );

  return {
    ok: true,
    project: committed.project,
    generation: committed.generation,
    comparison: {
      beforeVersionId: project.reviewStudioState?.currentVersionId ?? "",
      afterVersionId: params.versionId,
      qualityDifference: 0,
      scoreDifferences: {
        overall: 0,
        visualDesign: 0,
        userExperience: 0,
        business: 0,
        seo: 0,
        performance: 0,
        accessibility: 0,
        content: 0,
        localization: 0,
      },
      seoDifference: 0,
      conversionDifference: 0,
      accessibilityDifference: 0,
      performanceDifference: 0,
      contentDifference: 0,
      appliedChanges: [`Rolled back to v${targetVersion?.versionNumber ?? "?"}`],
      summary: `Restored version ${targetVersion?.versionNumber ?? ""}`,
    },
    appliedChanges: [`Rolled back to version ${targetVersion?.versionNumber ?? ""}`],
    review: refreshed.ok
      ? refreshed.review
      : ({
          ok: true,
          meta: {
            reviewId: "",
            sessionId: params.generationId,
            version: "1.0.0",
            phase: "review-studio-1",
            reviewedAt: new Date().toISOString(),
            durationMs: 0,
            providerIndependent: true,
            frameworkIndependent: true,
          },
          analysis: { analyzedAt: "", pageCount: 0, sectionCount: 0, componentCount: 0, fileCount: 0, dimensions: [], detectedSections: [], detectedComponents: [] },
          review: { overallScore: 0, categoryScores: { overall: 0, visualDesign: 0, userExperience: 0, business: 0, seo: 0, performance: 0, accessibility: 0, content: 0, localization: 0 }, insights: { overallReview: "", strengths: [], weaknesses: [], businessInsights: [], technicalInsights: [], designInsights: [] }, issues: [], improvements: [], expectedResults: [] },
          versions: [],
          currentVersion: { versionNumber: 1, id: params.versionId, sessionId: params.generationId, createdAt: "", files: snapshot, appliedImprovements: [], improvementTitles: [], qualityScores: { overall: 0, visualDesign: 0, userExperience: 0, business: 0, seo: 0, performance: 0, accessibility: 0, content: 0, localization: 0 } },
        } as ReviewStudioResult),
    revision: readBlueprintRevisionFromGeneration(committed.generation),
  };
}
