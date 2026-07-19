import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import {
  buildUseTemplateHref,
  getCreatorMarketplaceListingDetail,
} from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — Listing detail + live preview HTML.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireUser();
  const detail = getCreatorMarketplaceListingDetail(id, auth.user?.id ?? null);
  if (!detail) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }
  return NextResponse.json({
    ...detail,
    builderHref: buildUseTemplateHref(detail.listing),
  });
}
