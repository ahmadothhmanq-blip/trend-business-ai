import { NextResponse } from "next/server";
import {
  searchVideoTemplates,
  templateCatalogStats,
  listMarketplaceIndustries,
  getVideoTemplate,
  VIDEO_PRESENTER_PERSONAS,
  VIDEO_LOCATIONS,
  VIDEO_CONTENT_TYPES,
} from "@/lib/ai-core/video-production-platform";

export const dynamic = "force-dynamic";

/**
 * GET — Template marketplace catalog (Video Studio only).
 * Query: q, industry, contentType, presenter, location, limit, offset, templateId
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId");

  if (templateId) {
    const template = getVideoTemplate(templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({ template });
  }

  const result = searchVideoTemplates({
    q: searchParams.get("q") || undefined,
    industry: searchParams.get("industry") || undefined,
    contentType: (searchParams.get("contentType") as never) || undefined,
    presenter: (searchParams.get("presenter") as never) || undefined,
    location: (searchParams.get("location") as never) || undefined,
    limit: Number(searchParams.get("limit") || 40),
    offset: Number(searchParams.get("offset") || 0),
  });

  return NextResponse.json({
    stats: templateCatalogStats(),
    filters: {
      presenters: VIDEO_PRESENTER_PERSONAS,
      locations: VIDEO_LOCATIONS,
      contentTypes: VIDEO_CONTENT_TYPES,
    },
    industries: listMarketplaceIndustries(),
    templates: result.templates,
    total: result.total,
  });
}
