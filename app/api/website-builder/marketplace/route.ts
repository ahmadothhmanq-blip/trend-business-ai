import { NextResponse } from "next/server";
import {
  listMarketplaceTemplates,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_STYLE_VARIATIONS,
  recommendMarketplaceTemplates,
  getMarketplaceTemplate,
  buildMarketplacePreviewHtml,
} from "@/lib/ai-core/template-marketplace";
import type {
  MarketplaceCategory,
  MarketplaceStyleVariation,
} from "@/lib/ai-core/template-marketplace";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET — Template Marketplace catalog (+ optional filters).
 * Query: category, style, q, id (single template + previewHtml)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (id) {
    const template = getMarketplaceTemplate(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({
      template,
      previewHtml: buildMarketplacePreviewHtml(template),
    });
  }

  const category = (searchParams.get("category") || "all") as
    | MarketplaceCategory
    | "all";
  const style = (searchParams.get("style") || "all") as
    | MarketplaceStyleVariation
    | "all";
  const query = searchParams.get("q") || undefined;

  const templates = listMarketplaceTemplates({ category, style, query });

  return NextResponse.json({
    templates,
    count: templates.length,
    categories: MARKETPLACE_CATEGORIES,
    styles: MARKETPLACE_STYLE_VARIATIONS,
  });
}

const recommendSchema = z.object({
  industry: z.string().trim().optional(),
  businessGoal: z.string().trim().optional(),
  audience: z.string().trim().optional(),
  prompt: z.string().trim().optional(),
  preferredStyle: z.string().trim().optional(),
  limit: z.number().int().min(1).max(12).optional(),
});

/**
 * POST — recommend templates from industry + goal + audience.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = recommendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid recommend request" },
      { status: 400 },
    );
  }

  const result = recommendMarketplaceTemplates(parsed.data);
  return NextResponse.json(result);
}
