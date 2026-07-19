import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import {
  getCreatorMarketplaceCatalog,
  getOrCreateCreatorProfile,
} from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

/**
 * GET — Current user's creator profile + their listings.
 */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const meta = auth.user!.user_metadata ?? {};
  const profile = getOrCreateCreatorProfile({
    userId: auth.user!.id,
    displayName:
      (meta.full_name as string | undefined) ||
      auth.user!.email?.split("@")[0] ||
      "Creator",
    email: auth.user!.email,
  });

  const catalog = getCreatorMarketplaceCatalog(
    { creatorId: profile.id, sort: "newest" },
    auth.user!.id,
  );

  return NextResponse.json({
    profile,
    listings: catalog.listings,
    count: catalog.count,
  });
}
