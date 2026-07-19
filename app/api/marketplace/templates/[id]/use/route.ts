import { NextResponse } from "next/server";
import { useCreatorTemplate } from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST — Duplicate / use template into Website Builder (records analytics).
 */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const result = useCreatorTemplate(id);
  if (!result) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }
  return NextResponse.json({
    listing: result.listing,
    builderHref: result.builderHref,
    handoff: result.handoff,
  });
}
