import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getLiveAnalytics } from "@/lib/social-media/analytics";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { live, error } = await getLiveAnalytics(auth.supabase, auth.user!.id);

  if (error) {
    if (/relation/i.test(error.message ?? "")) {
      return NextResponse.json({
        live: {
          totalImpressions: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalClicks: 0,
          avgEngagementRate: 0,
          recordCount: 0,
          byPlatform: {},
          recent: [],
        },
      });
    }
    return databaseErrorResponse("social-media.analytics.live", error);
  }

  return NextResponse.json({ live });
}
