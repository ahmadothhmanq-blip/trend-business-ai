/**
 * WebsiteSeoService — apply SEO agent fixes to saved generations.
 * Extracted from POST /api/website-builder/[id]/seo/apply (Phase 0).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { runSeoAgent } from "@/lib/ai-core/seo-agent";
import {
  applySeoPackageFix,
  getSeoFix,
} from "@/lib/ai-core/seo-optimizer";
import {
  runWebsiteEditor,
  type WebsiteEditAction,
} from "@/lib/ai-core/website-editor";
import { buildWebsiteAnalyticsSummary } from "@/lib/ai-core/analytics";
import { runConversionOptimizer } from "@/lib/ai-core/conversion-optimizer";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import { commitBlueprintRevision } from "@/lib/website/platform/commit";
import { readBlueprintRevisionFromGeneration } from "@/lib/website/platform/revision";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";
import type { WebsiteCommitOptions } from "@/lib/website/platform/types";

export type WebsiteSeoApplyRequest = {
  fixId: string;
  applyEditor?: boolean;
};

export type WebsiteSeoApplySuccess = {
  ok: true;
  fix: NonNullable<ReturnType<typeof getSeoFix>>;
  notes: string[];
  report: ReturnType<typeof runSeoAgent>;
  project: GeneratedWebsiteProject;
  generation: WebsiteGeneration;
  revision?: number;
  aiRunId?: string | null;
};

export type WebsiteSeoApplyFailure = {
  ok: false;
  code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "SERVER";
  error: string;
};

export type WebsiteSeoApplyResult = WebsiteSeoApplySuccess | WebsiteSeoApplyFailure;

function buildSeoAgentContext(params: {
  generationId: string;
  generation: WebsiteGeneration;
  project: GeneratedWebsiteProject;
  files: ReturnType<typeof extractWebsiteFilesFromBlueprint>;
  analytics: Awaited<ReturnType<typeof buildWebsiteAnalyticsSummary>>;
  conversionOptimizer: Awaited<ReturnType<typeof runConversionOptimizer>>;
}) {
  const profile = (params.project.businessProfile ||
    null) as CoreBusinessProfile | null;
  const strategy = (params.project.strategy || null) as CoreProductStrategy | null;

  return runSeoAgent({
    generationId: params.generationId,
    files: params.files,
    strategy: strategy || undefined,
    profile: profile || undefined,
    industryId: profile?.industry || null,
    seoPackage: params.project.seoPackage || null,
    performanceReport: params.project.performanceReport || null,
    assetManifest: (params.project.assetManifest as never) || null,
    analytics: params.analytics,
    conversionOptimizer: params.conversionOptimizer,
  });
}

export async function executeWebsiteSeoApply(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: WebsiteSeoApplyRequest;
  commit?: Pick<WebsiteCommitOptions, "expectedRevision" | "idempotencyKey"> &
    Partial<Pick<WebsiteCommitOptions, "operation" | "mutationMeta">>;
}): Promise<WebsiteSeoApplyResult> {
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
      error: "Generation has no editable files.",
    };
  }

  const profile = (project.businessProfile || null) as CoreBusinessProfile | null;
  const strategy = (project.strategy || null) as CoreProductStrategy | null;

  const analytics = await buildWebsiteAnalyticsSummary(
    params.generationId,
    14,
    params.supabase,
  );
  const conversionOptimizer = await runConversionOptimizer({
    generationId: params.generationId,
    conversionReport: project.conversionReport ?? null,
    industry: profile?.industry || null,
    projectName: generation.project_name || profile?.projectName || null,
    client: params.supabase,
  });

  const agent = buildSeoAgentContext({
    generationId: params.generationId,
    generation,
    project,
    files,
    analytics,
    conversionOptimizer,
  });

  const fix = getSeoFix(agent.optimizer, params.request.fixId);
  if (!fix) {
    return { ok: false, code: "NOT_FOUND", error: "SEO fix not found." };
  }

  let nextFiles = files;
  let seoPackage = project.seoPackage;
  const notes: string[] = [];

  try {
    if (
      fix.injectSeoPackage ||
      fix.applyMode === "seo-package" ||
      fix.applyMode === "both"
    ) {
      const applied = applySeoPackageFix({
        files: nextFiles,
        optimizer: agent.optimizer,
        fixId: fix.id,
      });
      nextFiles = applied.files;
      seoPackage = applied.seoPackage;
      notes.push(...applied.notes);
    }

    const shouldEditor =
      params.request.applyEditor !== false &&
      (fix.applyMode === "editor" || fix.applyMode === "both") &&
      (fix.command || fix.actions?.length);

    if (shouldEditor) {
      const editResult = runWebsiteEditor({
        files: nextFiles,
        project: { ...project, files: nextFiles },
        command: fix.command || fix.title,
        actions: (fix.actions || []) as WebsiteEditAction[],
      });
      nextFiles = editResult.files;
      notes.push(editResult.summary);
      notes.push(...editResult.appliedNotes.slice(0, 4));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apply fix failed";
    return { ok: false, code: "VALIDATION", error: message };
  }

  const nextProject: GeneratedWebsiteProject = {
    ...project,
    files: nextFiles,
    seoPackage: seoPackage || agent.optimizer.assets.seoPackage,
    seoPerformanceReport: agent.analysis.performanceReport,
    progressEvents: [
      ...(project.progressEvents ?? []),
      `[seo-agent] Applied fix ${fix.id}: ${fix.title}`,
    ],
  };

  const committed = await commitBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    project: nextProject,
    projectKind: nextProject.projectKind ?? "website",
    input: {
      prompt: generation.business_description || `SEO fix: ${fix.title}`,
      language: generation.language || "English",
      theme: "modern",
      features: [],
      productId: "website-builder",
      projectId: generation.project_id ?? undefined,
      mode: "continue",
      parentGenerationId: params.generationId,
      continueInstruction: fix.command || fix.title,
    },
    commit: {
      operation: params.commit?.operation ?? "website.seo.apply",
      expectedRevision: params.commit?.expectedRevision,
      idempotencyKey: params.commit?.idempotencyKey,
      mutationMeta: params.commit?.mutationMeta ?? {
        fixId: fix.id,
        fixTitle: fix.title,
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

  const refreshed = buildSeoAgentContext({
    generationId: params.generationId,
    generation: committed.generation,
    project: committed.project,
    files: extractWebsiteFilesFromBlueprint(committed.generation.blueprint),
    analytics,
    conversionOptimizer,
  });

  return {
    ok: true,
    fix,
    notes,
    report: refreshed,
    project: committed.project,
    generation: committed.generation,
    revision: readBlueprintRevisionFromGeneration(committed.generation),
    aiRunId: committed.aiRunId,
  };
}

/**
 * Phase 2 — pick the highest-priority SEO fix and apply it (Copilot SEO improve).
 */
export async function executeWebsiteSeoImprove(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  command?: string;
  commit?: Pick<WebsiteCommitOptions, "expectedRevision" | "idempotencyKey"> &
    Partial<Pick<WebsiteCommitOptions, "operation" | "mutationMeta">>;
}): Promise<WebsiteSeoApplyResult> {
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
      error: "Generation has no editable files.",
    };
  }

  const profile = (project.businessProfile || null) as CoreBusinessProfile | null;
  const analytics = await buildWebsiteAnalyticsSummary(
    params.generationId,
    14,
    params.supabase,
  );
  const conversionOptimizer = await runConversionOptimizer({
    generationId: params.generationId,
    conversionReport: project.conversionReport ?? null,
    industry: profile?.industry || null,
    projectName: generation.project_name || profile?.projectName || null,
    client: params.supabase,
  });

  const agent = buildSeoAgentContext({
    generationId: params.generationId,
    generation,
    project,
    files,
    analytics,
    conversionOptimizer,
  });

  const fixes = agent.optimizer.fixes;
  if (!fixes.length) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "No SEO fixes available for this site.",
    };
  }

  const topFix = fixes[0]!;

  return executeWebsiteSeoApply({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    request: { fixId: topFix.id, applyEditor: true },
    commit: params.commit,
  });
}
