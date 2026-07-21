import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getAnalyticsSummary, recordAnalytics } from "@/lib/social-media/analytics";
import { NextResponse } from "next/server";
import { z } from "zod";

const recordSchema = z.object({
  postId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  platform: z.string().min(1),
  impressions: z.number().int().min(0).default(0),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId") ?? undefined;
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const platform = searchParams.get("platform") ?? undefined;

  const { rows, summary, error } = await getAnalyticsSummary(auth.supabase, auth.user!.id, {
    postId,
    campaignId,
    platform,
  });

  if (error) {
    if (/relation/i.test(error.message ?? "")) {
      return NextResponse.json({ analytics: [], summary: { totalImpressions: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalClicks: 0, avgEngagementRate: 0, recordCount: 0 } });
    }
    return databaseErrorResponse("social-media.analytics.list", error);
  }

  return NextResponse.json({ analytics: rows, summary });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = recordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await recordAnalytics(auth.supabase, {
    userId: auth.user!.id,
    ...parsed.data,
  });

  if (error) return databaseErrorResponse("social-media.analytics.insert", error);
  return NextResponse.json({ record: data });
}
