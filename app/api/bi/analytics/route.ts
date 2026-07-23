import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getBiAnalytics } from "@/lib/bi/analytics";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { summary, error } = await getBiAnalytics(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) {
      return NextResponse.json({
        summary: {
          metrics: { revenue: 0, expenses: 0, profit: 0, conversionRate: 0, pipelineValue: 0, customerGrowth: 0, inventoryValue: 0, marketingRoi: 0, byPeriod: {} },
          integrations: {},
          kpiCount: 0,
          dashboardCount: 0,
          reportCount: 0,
        },
      });
    }
    return databaseErrorResponse("bi.analytics", error);
  }
  return NextResponse.json({ summary });
}
