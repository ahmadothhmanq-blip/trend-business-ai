import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import {
  conversionPublishChecklist,
  runConversionOptimization,
} from "@/lib/ai-core/conversion";
import {
  runSeoPerformanceEngine,
  seoPerformancePublishChecklist,
} from "@/lib/ai-core/seo-performance";
import {
  buildFinalWebsiteQualityReport,
  finalQualityPublishChecklist,
} from "@/lib/ai-core/final-quality";
import { runDesignCritic } from "@/lib/ai-core/design-critic";
import {
  isWebsitePublishEnabled,
  prepareWebsitePublication,
  publishWebsitePublication,
  unpublishWebsitePublication,
  type PublishAction,
} from "@/lib/website/publish";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";
import { z } from "zod";

function loadProjectFromGeneration(
  generation: WebsiteGeneration,
): GeneratedWebsiteProject | null {
  const raw = generation.blueprint;
  if (!raw || typeof raw !== "object") return null;
  return raw as unknown as GeneratedWebsiteProject;
}

function buildPrePublishConversion(generation: WebsiteGeneration) {
  const project = loadProjectFromGeneration(generation);
  if (project?.conversionReport) {
    return {
      conversionReport: project.conversionReport,
      checklist: conversionPublishChecklist(project.conversionReport),
    };
  }
  if (!project?.files?.length) {
    return { conversionReport: null, checklist: null };
  }
  const report = runConversionOptimization({
    files: project.files,
    strategy: project.strategy as never,
    profile: project.businessProfile as never,
    industryId: project.businessProfile?.industry,
    websiteGoal:
      typeof (project as { settings?: { websiteGoal?: string } }).settings
        ?.websiteGoal === "string"
        ? (project as { settings?: { websiteGoal?: string } }).settings
            ?.websiteGoal
        : undefined,
  });
  return {
    conversionReport: report,
    checklist: conversionPublishChecklist(report),
  };
}

function buildPrePublishSeoPerformance(generation: WebsiteGeneration) {
  const project = loadProjectFromGeneration(generation);
  if (project?.seoPerformanceReport) {
    return {
      seoPerformanceReport: project.seoPerformanceReport,
      checklist: seoPerformancePublishChecklist(project.seoPerformanceReport),
    };
  }
  if (!project?.files?.length) {
    return { seoPerformanceReport: null, checklist: null };
  }
  const report = runSeoPerformanceEngine({
    files: project.files,
    strategy: project.strategy as never,
    profile: project.businessProfile as never,
    industryId: project.businessProfile?.industry,
    seoPackage: project.seoPackage,
    performanceReport: project.performanceReport,
    assetManifest: project.assetManifest,
    conversionScore: project.conversionReport?.score ?? null,
  });
  return {
    seoPerformanceReport: report,
    checklist: seoPerformancePublishChecklist(report),
  };
}

function buildPrePublishFinalQuality(generation: WebsiteGeneration) {
  const project = loadProjectFromGeneration(generation);
  if (project?.finalQualityReport) {
    return {
      finalQualityReport: project.finalQualityReport,
      checklist: finalQualityPublishChecklist(project.finalQualityReport),
    };
  }
  if (!project?.files?.length) {
    return { finalQualityReport: null, checklist: null };
  }
  const designCritic =
    project.designCriticReport ??
    runDesignCritic({ files: project.files });
  const conversion =
    project.conversionReport ??
    runConversionOptimization({
      files: project.files,
      strategy: project.strategy as never,
      profile: project.businessProfile as never,
      industryId: project.businessProfile?.industry,
    });
  const seoPerformance =
    project.seoPerformanceReport ??
    runSeoPerformanceEngine({
      files: project.files,
      strategy: project.strategy as never,
      profile: project.businessProfile as never,
      industryId: project.businessProfile?.industry,
      seoPackage: project.seoPackage,
      performanceReport: project.performanceReport,
      assetManifest: project.assetManifest,
      conversionScore: conversion.score,
    });
  const report = buildFinalWebsiteQualityReport({
    files: project.files,
    designCritic,
    conversion,
    seoPerformance,
    optimization: project.optimizationReport,
    seoPackage: project.seoPackage,
    performanceReport: project.performanceReport,
    editorSuggestions: project.editorSuggestions,
  });
  return {
    finalQualityReport: report,
    checklist: finalQualityPublishChecklist(report),
  };
}

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  action: z.enum(["prepare", "publish", "unpublish"]).default("publish"),
});

async function loadOwnedGeneration(
  auth: Awaited<ReturnType<typeof requireUser>>,
  id: string,
) {
  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as WebsiteGeneration;
}

async function readPublishBody(request: Request) {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Publish actions for a website generation:
 * - prepare → status prepared (draft snapshot)
 * - publish → prepared→published + public /w/[slug]
 * - unpublish → remove from public access
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rawBody = await readPublishBody(request);
  if (rawBody === null) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid publish request" },
      { status: 400 },
    );
  }

  const action = parsed.data.action as PublishAction;

  if (action === "unpublish") {
    const result = await unpublishWebsitePublication({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      publication: result.publication,
      publishEnabled: isWebsitePublishEnabled(),
      message: "Website unpublished. Public URL no longer serves this version.",
    });
  }

  const generation = await loadOwnedGeneration(auth, id);
  if (!generation) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  // Pre-publish: Conversion + SEO/Performance + Final Quality Intelligence.
  const prePublish = buildPrePublishConversion(generation);
  const seoPerf = buildPrePublishSeoPerformance(generation);
  const finalQuality = buildPrePublishFinalQuality(generation);
  const checklist = prePublish.checklist;
  const seoChecklist = seoPerf.checklist;
  const finalChecklist = finalQuality.checklist;

  // Website Management — broken links / missing pages gate
  const projectForLinks = loadProjectFromGeneration(generation);
  let managementQuality: ReturnType<
    typeof import("@/lib/ai-core/website-management").runPrePublishQualityControl
  > | null = null;
  if (projectForLinks?.files?.length) {
    const { resolveSiteStructure, runPrePublishQualityControl } = await import(
      "@/lib/ai-core/website-management"
    );
    const structure = resolveSiteStructure(
      projectForLinks.businessProfile?.industry ||
        projectForLinks.designSystem?.industryPattern,
      projectForLinks.description,
    );
    managementQuality = runPrePublishQualityControl({
      files: projectForLinks.files,
      structure,
    });
  }

  if (action === "prepare") {
    const prepared = await prepareWebsitePublication({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generation,
    });
    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: prepared.status });
    }
    const ready =
      (finalChecklist?.publishReady ??
        ((checklist?.conversionReady ?? true) &&
          (seoChecklist?.publishReady ?? true))) &&
      (managementQuality?.ready ?? true);
    return NextResponse.json({
      publication: prepared.publication,
      publishEnabled: prepared.publishEnabled,
      htmlBytes: prepared.htmlBytes,
      publicPath: prepared.publication.public_path,
      plannedPublicUrl: prepared.publication.planned_public_url,
      managementQuality,
      conversionReport: prePublish.conversionReport,
      conversionChecklist: checklist,
      seoPerformanceReport: seoPerf.seoPerformanceReport,
      seoPerformanceChecklist: seoChecklist,
      finalQualityReport: finalQuality.finalQualityReport,
      finalQualityChecklist: finalChecklist,
      qualityRecommendations: {
        conversionReady: checklist?.conversionReady ?? null,
        score: finalChecklist?.scores.overall ?? checklist?.score ?? null,
        goal: checklist?.goal ?? null,
        publishReady: finalChecklist?.publishReady ?? ready,
        scores: finalChecklist?.scores ?? null,
        blockers: Array.from(
          new Set([
            ...(finalChecklist?.blockers ?? []),
            ...(checklist?.blockers ?? []),
            ...(seoChecklist?.blockers ?? []),
            ...(managementQuality?.checks
              .filter((c) => !c.passed && c.severity === "blocker")
              .map((c) => c.detail) ?? []),
          ]),
        ),
        warnings: Array.from(
          new Set([
            ...(finalChecklist?.warnings ?? []),
            ...(checklist?.warnings ?? []),
            ...(seoChecklist?.warnings ?? []),
            ...(managementQuality?.checks
              .filter((c) => !c.passed && c.severity === "warning")
              .map((c) => c.detail) ?? []),
          ]),
        ),
        opportunities: Array.from(
          new Set([
            ...(finalChecklist?.opportunities ?? []),
            ...(checklist?.opportunities ?? []),
            ...(seoChecklist?.opportunities ?? []),
          ]),
        ),
        improvementActions: finalChecklist?.topActions ?? [],
        designScore: finalChecklist?.scores.design ?? null,
        uxScore: finalChecklist?.scores.ux ?? null,
        seoScore:
          finalChecklist?.scores.seo ?? seoChecklist?.seoScore ?? null,
        conversionScore: finalChecklist?.scores.conversion ?? null,
        performanceScore:
          finalChecklist?.scores.performance ??
          seoChecklist?.performanceScore ??
          null,
        mobileScore: seoChecklist?.mobileScore ?? null,
        overallTechnicalScore: seoChecklist?.overallScore ?? null,
        suggestedTitle: seoChecklist?.suggestedTitle ?? null,
        suggestedDescription: seoChecklist?.suggestedDescription ?? null,
        primaryKeyword: seoChecklist?.primaryKeyword ?? null,
      },
      message: ready
        ? "Publication prepared. Final quality review passed — click Publish when ready."
        : "Publication prepared. Review Final Quality scores and improvement actions before publishing.",
    });
  }

  // Soft gate on publish: surface blockers but still allow publish (ops can override).
  const published = await publishWebsitePublication({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generation,
  });

  if (!published.ok) {
    return NextResponse.json({ error: published.error }, { status: published.status });
  }

  return NextResponse.json({
    publication: published.publication,
    publishEnabled: published.publishEnabled,
    htmlBytes: published.htmlBytes,
    publicUrl: published.publicUrl,
    publicPath: published.publication.public_path,
    conversionChecklist: checklist,
    seoPerformanceChecklist: seoChecklist,
    finalQualityChecklist: finalChecklist,
    finalQualityReport: finalQuality.finalQualityReport,
    qualityRecommendations: {
      conversionReady: checklist?.conversionReady ?? null,
      score: finalChecklist?.scores.overall ?? checklist?.score ?? null,
      goal: checklist?.goal ?? null,
      publishReady: finalChecklist?.publishReady ?? null,
      scores: finalChecklist?.scores ?? null,
      seoScore: finalChecklist?.scores.seo ?? seoChecklist?.seoScore ?? null,
      performanceScore:
        finalChecklist?.scores.performance ??
        seoChecklist?.performanceScore ??
        null,
      mobileScore: seoChecklist?.mobileScore ?? null,
      blockers: Array.from(
        new Set([
          ...(finalChecklist?.blockers ?? []),
          ...(checklist?.blockers ?? []),
          ...(seoChecklist?.blockers ?? []),
        ]),
      ),
      warnings: Array.from(
        new Set([
          ...(finalChecklist?.warnings ?? []),
          ...(checklist?.warnings ?? []),
          ...(seoChecklist?.warnings ?? []),
        ]),
      ),
      improvementActions: finalChecklist?.topActions ?? [],
    },
    message: finalChecklist?.publishReady
      ? "Website published. Final quality review passed — public URL is live."
      : "Website published. Review remaining quality recommendations for a stronger live site.",
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("website_publications")
    .select("*")
    .eq("generation_id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    if (isMissingTableMessage(error.message)) {
      return NextResponse.json({
        publication: null,
        publishEnabled: isWebsitePublishEnabled(),
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    publication: data,
    publishEnabled: isWebsitePublishEnabled(),
    publicUrl:
      data?.status === "published"
        ? data.planned_public_url || data.public_path
        : null,
  });
}

function isMissingTableMessage(message?: string) {
  const msg = message?.toLowerCase() ?? "";
  return msg.includes("relation") || msg.includes("does not exist");
}
