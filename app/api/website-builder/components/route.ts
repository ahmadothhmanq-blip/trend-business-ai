import { NextResponse } from "next/server";
import {
  COMPONENT_INDUSTRY_PACKS,
  COMPONENT_MARKETPLACE_CATEGORIES,
  COMPONENT_STYLE_VARIANTS,
  listMarketplaceComponents,
  getMarketplaceComponent,
  buildComponentPreviewHtml,
} from "@/lib/ai-core/component-marketplace";
import type {
  ComponentIndustryPack,
  ComponentMarketplaceCategory,
  ComponentStyleVariant,
} from "@/lib/ai-core/component-marketplace";

export const dynamic = "force-dynamic";

/**
 * GET — Component Marketplace / Library catalog for Website Builder Visual Editor.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (id) {
    const component = getMarketplaceComponent(id);
    if (!component) {
      return NextResponse.json({ error: "Component not found." }, { status: 404 });
    }
    return NextResponse.json({
      component,
      previewHtml: buildComponentPreviewHtml(component),
    });
  }

  const category = (searchParams.get("category") || "all") as
    | ComponentMarketplaceCategory
    | "all";
  const industry = (searchParams.get("industry") || "all") as
    | ComponentIndustryPack
    | "all";
  const style = (searchParams.get("style") || "all") as
    | ComponentStyleVariant
    | "all";
  const query = searchParams.get("q") || undefined;

  const components = listMarketplaceComponents({
    category,
    industry,
    style,
    query,
  });

  return NextResponse.json({
    components,
    count: components.length,
    categories: COMPONENT_MARKETPLACE_CATEGORIES,
    industries: COMPONENT_INDUSTRY_PACKS,
    styles: COMPONENT_STYLE_VARIANTS,
  });
}
