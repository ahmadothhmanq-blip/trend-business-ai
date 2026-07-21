import { requireUser } from "@/lib/api/helpers";
import { SOCIAL_TEMPLATES } from "@/lib/social-media/templates";
import { PLATFORM_ADAPTERS, SOCIAL_MEDIA_DIMENSIONS } from "@/lib/social-media/platforms";
import { NextResponse } from "next/server";

const CATEGORIES = [
  "Product promotion",
  "Sales campaign",
  "Brand awareness",
  "Educational posts",
  "Restaurant",
  "E-commerce",
  "Real estate",
  "Personal brand",
] as const;

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const platform = searchParams.get("platform");

  let templates = SOCIAL_TEMPLATES;
  if (category) templates = templates.filter((t) => t.category === category);
  if (platform) templates = templates.filter((t) => t.platform === platform);

  return NextResponse.json({
    templates,
    categories: CATEGORIES,
    platforms: Object.values(PLATFORM_ADAPTERS),
    dimensions: SOCIAL_MEDIA_DIMENSIONS,
    total: templates.length,
  });
}
