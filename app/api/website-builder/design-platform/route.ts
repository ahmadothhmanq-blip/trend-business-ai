import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import {
  getRequestClientIp,
  enforceWebsitePublicRateLimit,
} from "@/lib/website/public-endpoints";
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
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Template not found.");
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
  const ip = getRequestClientIp(request);
  const rateLimited = await enforceWebsitePublicRateLimit("design-platform", ip);
  if (rateLimited) return rateLimited;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const parsed = autoSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
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
