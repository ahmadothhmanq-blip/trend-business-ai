import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
import { applyTemplateIntelligenceRetheme } from "@/lib/ai-core/template-intelligence";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  templateIntelligenceId: z.string().trim().min(1),
});

/**
 * POST /api/website-builder/[id]/template
 * Switch Template Intelligence visual template without regenerating content/images/pages.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = bodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const { data: row, error } = await auth.supabase
      .from("website_generations")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Generation not found." }, { status: 404 });
    }

    const generation = row as WebsiteGeneration;
    const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
    const blueprint = (generation.blueprint || {}) as unknown as GeneratedWebsiteProject;
    const project: GeneratedWebsiteProject = {
      ...blueprint,
      projectKind: blueprint.projectKind || "website",
      title: blueprint.title || generation.project_name || "Website",
      description:
        blueprint.description || generation.business_description || "",
      pages: blueprint.pages || [],
      sections: blueprint.sections || [],
      colorPalette: blueprint.colorPalette || [],
      typography: blueprint.typography || [],
      components: blueprint.components || [],
      content: blueprint.content || [],
      seo: blueprint.seo || [],
      roadmap: blueprint.roadmap || [],
      files: files.length ? files : blueprint.files || [],
      businessProfile: blueprint.businessProfile,
      strategy: blueprint.strategy,
      designSystem: blueprint.designSystem,
      assetManifest: blueprint.assetManifest,
    };

    const retheme = applyTemplateIntelligenceRetheme({
      project,
      templateId: parsed.data.templateIntelligenceId,
    });

    const saved = await persistWebsiteGeneration({
      supabase: auth.supabase,
      userId: auth.user!.id,
      project: retheme.project,
      projectKind: retheme.project.projectKind || "website",
      existingGenerationId: generation.id,
      input: {
        prompt:
          generation.business_description ||
          retheme.project.description ||
          "Template switch",
        language: "English",
        theme: `${retheme.template.category} ${retheme.template.designStyle}`,
        features: [],
        productId: "website-builder",
        projectId: generation.project_id || undefined,
        mode: "continue",
        parentGenerationId: generation.id,
        continueInstruction: `[template-intelligence] Apply visual template ${retheme.template.id} without rewriting content.`,
      },
    });

    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      notes: retheme.notes,
      template: retheme.template,
      project: saved.project,
      generation: saved.generation,
    });
  } catch (error) {
    return serverErrorResponse(
      "POST /api/website-builder/[id]/template",
      error,
    );
  }
}
