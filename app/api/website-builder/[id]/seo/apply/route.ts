import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const applySchema = z.object({
  fixId: z.string().trim().min(1).max(120),
  /** When true, also run editor actions for dual-mode fixes. */
  applyEditor: z.boolean().optional(),
});

/**
 * POST — Apply a single SEO Agent fix (package inject and/or editor actions).
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid apply request" },
      { status: 400 },
    );
  }

  const { data: existing, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const generation = existing as WebsiteGeneration;
  const project = generation.blueprint as unknown as GeneratedWebsiteProject;
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
  if (!files.length) {
    return NextResponse.json(
      { error: "Generation has no editable files." },
      { status: 400 },
    );
  }

  const profile = (project.businessProfile ||
    null) as CoreBusinessProfile | null;
  const strategy = (project.strategy || null) as CoreProductStrategy | null;

  const analytics = buildWebsiteAnalyticsSummary(parsedId.id, 14);
  const conversionOptimizer = runConversionOptimizer({
    generationId: parsedId.id,
    conversionReport: project.conversionReport ?? null,
    industry: profile?.industry || null,
    projectName: generation.project_name || profile?.projectName || null,
  });

  const agent = runSeoAgent({
    generationId: parsedId.id,
    files,
    strategy: strategy || undefined,
    profile: profile || undefined,
    industryId: profile?.industry || null,
    seoPackage: project.seoPackage || null,
    performanceReport: project.performanceReport || null,
    assetManifest: (project.assetManifest as never) || null,
    analytics,
    conversionOptimizer,
  });

  const fix = getSeoFix(agent.optimizer, parsed.data.fixId);
  if (!fix) {
    return NextResponse.json({ error: "SEO fix not found." }, { status: 404 });
  }

  let nextFiles = files;
  let seoPackage = project.seoPackage;
  const notes: string[] = [];

  try {
    if (fix.injectSeoPackage || fix.applyMode === "seo-package" || fix.applyMode === "both") {
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
      parsed.data.applyEditor !== false &&
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
    return NextResponse.json({ error: message }, { status: 400 });
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

  const saved = await persistWebsiteGeneration({
    supabase: auth.supabase,
    userId: auth.user!.id,
    project: nextProject,
    projectKind: nextProject.projectKind ?? "website",
    input: {
      prompt: generation.business_description || `SEO fix: ${fix.title}`,
      language: "en",
      theme: "modern",
      features: [],
      productId: "website-builder",
      projectId: generation.project_id ?? undefined,
      mode: "continue",
      parentGenerationId: parsedId.id,
      continueInstruction: fix.command || fix.title,
    },
  });

  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 500 });
  }

  // Re-run agent on saved files for refreshed dashboard
  const refreshed = runSeoAgent({
    generationId: parsedId.id,
    files: extractWebsiteFilesFromBlueprint(saved.generation.blueprint),
    strategy: strategy || undefined,
    profile: profile || undefined,
    industryId: profile?.industry || null,
    seoPackage: saved.project.seoPackage || null,
    performanceReport: saved.project.performanceReport || null,
    analytics,
    conversionOptimizer,
  });

  return NextResponse.json({
    success: true,
    fix,
    notes,
    report: refreshed,
    project: saved.project,
    generation: saved.generation,
    message: `Applied: ${fix.title}`,
  });
}
