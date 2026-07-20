import { requireUser } from "@/lib/api/helpers";
import {
  listBrandTemplates,
  recommendTemplates,
} from "@/lib/ai-core/brand-studio/templates";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as "industry" | "style" | null;
  const industry = searchParams.get("industry") ?? undefined;
  const style = searchParams.get("style") ?? undefined;
  const prompt = searchParams.get("prompt") ?? "";
  const brandType = searchParams.get("brandType") ?? undefined;

  const templates = listBrandTemplates({
    category: category ?? undefined,
    industry,
    style,
  });

  const recommended = prompt || industry || brandType
    ? recommendTemplates({ prompt, industry, brandType })
    : templates.filter((t) => t.recommended);

  return NextResponse.json({ templates, recommended });
}
