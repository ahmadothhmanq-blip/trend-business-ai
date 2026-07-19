import { NextResponse } from "next/server";
import {
  TEMPLATE_INTELLIGENCE_CATEGORIES,
  listTemplateIntelligence,
  getTemplateIntelligence,
  selectTemplateIntelligence,
  buildTemplateIntelligencePreviewHtml,
} from "@/lib/ai-core/template-intelligence";
import type { TemplateIntelligenceCategory } from "@/lib/ai-core/template-intelligence";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/website-builder/template-intelligence
 * Catalog + optional single template preview.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (id) {
    const template = getTemplateIntelligence(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({
      template,
      previewHtml: buildTemplateIntelligencePreviewHtml(template),
    });
  }

  const category = (searchParams.get("category") || "all") as
    | TemplateIntelligenceCategory
    | "all";
  const industry = searchParams.get("industry") || undefined;
  const query = searchParams.get("q") || undefined;

  const templates = listTemplateIntelligence({ category, industry, query });

  return NextResponse.json({
    templates,
    count: templates.length,
    categories: TEMPLATE_INTELLIGENCE_CATEGORIES,
  });
}

const selectSchema = z.object({
  businessType: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  targetAudience: z.string().trim().optional(),
  brandStyle: z.string().trim().optional(),
  designStyle: z.string().trim().optional(),
  prompt: z.string().trim().optional(),
  explicitTemplateId: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

/**
 * POST — recommend / auto-select a Template Intelligence template.
 */
export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const parsed = selectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = selectTemplateIntelligence({
    ...parsed.data,
    category: parsed.data.category as TemplateIntelligenceCategory | undefined,
  });

  return NextResponse.json({
    ...result,
    previewHtml: buildTemplateIntelligencePreviewHtml(result.template),
  });
}
