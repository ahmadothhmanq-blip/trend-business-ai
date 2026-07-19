import { NextResponse } from "next/server";
import {
  listSmartTemplates,
  loadSmartTemplatesFromDatabase,
} from "@/lib/website/smart-templates";

export const dynamic = "force-dynamic";

/**
 * List Smart Template Engine catalog for Website Builder.
 * Public read — templates are not user-owned.
 */
export async function GET() {
  try {
    const templates = await loadSmartTemplatesFromDatabase();
    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        category: t.category,
        description: t.description,
        industryId: t.industryId,
        layoutStyle: t.layoutStyle,
        designPreset: t.designPreset,
        sections: t.sections,
        colorPalette: t.colorPalette,
        typography: t.typography,
        ctaStyle: t.ctaStyle,
        navigation: t.navigation,
        footer: t.footer,
        requiredPages: t.requiredPages,
        requiredFeatures: t.requiredFeatures,
        contentTone: t.contentTone,
      })),
      count: templates.length,
      source: templates.length ? "catalog" : "empty",
    });
  } catch {
    const fallback = listSmartTemplates();
    return NextResponse.json({
      templates: fallback,
      count: fallback.length,
      source: "fallback",
    });
  }
}
