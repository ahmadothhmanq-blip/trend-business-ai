import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getMarketingAnalytics, recordMarketingAnalytics } from "@/lib/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const recordSchema = z.object({
  campaignId: z.string().uuid().optional(),
  channel: z.string().min(1),
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  conversions: z.number().int().min(0).default(0),
  leads: z.number().int().min(0).default(0),
  revenue: z.number().min(0).default(0),
  spend: z.number().min(0).default(0),
  engagementRate: z.number().min(0).default(0),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const channel = searchParams.get("channel") ?? undefined;

  const { rows, summary, error } = await getMarketingAnalytics(auth.supabase, auth.user!.id, {
    campaignId,
    channel,
  });

  if (error) {
    if (/relation/i.test(error.message ?? "")) {
      return NextResponse.json({
        analytics: [],
        summary: {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalLeads: 0,
          totalRevenue: 0,
          totalSpend: 0,
          avgRoi: 0,
          avgEngagementRate: 0,
          recordCount: 0,
          byChannel: {},
        },
      });
    }
    return databaseErrorResponse("marketing.analytics.list", error);
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

  const { data, error } = await recordMarketingAnalytics(auth.supabase, {
    userId: auth.user!.id,
    ...parsed.data,
  });

  if (error) return databaseErrorResponse("marketing.analytics.insert", error);
  return NextResponse.json({ record: data });
}
