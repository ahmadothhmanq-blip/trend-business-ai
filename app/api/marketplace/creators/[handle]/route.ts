import { NextResponse } from "next/server";
import { getPublicCreatorProfile } from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ handle: string }> };

/**
 * GET — Public creator profile by handle or id.
 */
export async function GET(_request: Request, { params }: Params) {
  const { handle } = await params;
  const result = getPublicCreatorProfile(handle);
  if (!result) {
    return NextResponse.json({ error: "Creator not found." }, { status: 404 });
  }
  return NextResponse.json(result);
}
