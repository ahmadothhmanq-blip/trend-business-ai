import { requireUser } from "@/lib/api/helpers";
import {
  listDesignTemplates,
  recommendDesignTemplates,
} from "@/lib/ai-core/image-design-platform/templates";
import { listCanvasTemplatesV2 } from "@/lib/ai-core/image-design-platform/templates-v2";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as
    | "social-media"
    | "advertising"
    | "product"
    | "business"
    | "presentation"
    | null;
  const prompt = searchParams.get("prompt") ?? "";
  const imageType = searchParams.get("imageType") ?? undefined;

  const templates = listDesignTemplates(category ?? undefined);
  const recommended =
    prompt || imageType
      ? recommendDesignTemplates({ prompt, imageType })
      : templates.filter((t) => t.recommended);

  return NextResponse.json({
    templates,
    recommended,
    canvasTemplates: listCanvasTemplatesV2(category ? mapCategory(category) : undefined),
  });
}

function mapCategory(
  c: "social-media" | "advertising" | "product" | "business" | "presentation",
) {
  const map: Record<string, import("@/lib/ai-core/image-design-platform/templates-v2").CanvasTemplateCategory> = {
    "social-media": "social-media",
    advertising: "ads",
    product: "product-marketing",
    business: "business-documents",
    presentation: "presentations",
  };
  return map[c];
}
