import { NextResponse } from "next/server";
import {
  runAutoDesignDecision,
  DESIGN_PLATFORM_TAXONOMY,
  buildControlSurfaceForTemplate,
} from "@/lib/ai-core/website-design-platform";
import {
  listTemplateIntelligence,
  getTemplateIntelligence,
  TEMPLATE_INTELLIGENCE_CATEGORIES,
} from "@/lib/ai-core/template-intelligence";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/website-builder/design-platform
 * Taxonomy + template architecture catalog for Website Builder.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId")?.trim();

  if (templateId) {
    const template = getTemplateIntelligence(templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({
      template,
      controlSurface: buildControlSurfaceForTemplate(template),
    });
  }

  const templates = listTemplateIntelligence();
  return NextResponse.json({
    taxonomy: DESIGN_PLATFORM_TAXONOMY,
    categories: TEMPLATE_INTELLIGENCE_CATEGORIES,
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      industry: t.industry,
      designPreset: t.designPreset,
      layoutStructure: t.layoutStructure,
      controlSurface: buildControlSurfaceForTemplate(t),
    })),
    count: templates.length,
  });
}

const autoSchema = z.object({
  prompt: z.string().trim().min(3),
  language: z.string().trim().optional(),
  brandStyle: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  explicitTemplateId: z.string().trim().optional(),
});

/**
 * POST — Run AI Auto Design Decision Engine (Phase 1).
 */
export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const parsed = autoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const decision = runAutoDesignDecision(parsed.data);
  const template = getTemplateIntelligence(decision.templateIntelligenceId);

  return NextResponse.json({
    decision,
    template,
    message:
      "Auto design complete — template, layout, colors, typography, components, and animations selected.",
  });
}
