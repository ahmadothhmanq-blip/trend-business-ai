import { requireUser } from "@/lib/api/helpers";
import {
  listDesignTemplates,
  recommendDesignTemplates,
} from "@/lib/ai-core/image-design-platform/templates";
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

  return NextResponse.json({ templates, recommended });
}
