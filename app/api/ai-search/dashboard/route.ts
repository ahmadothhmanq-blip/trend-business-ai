import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import { buildAiSearchDashboardPayload } from "@/lib/ai-search/recommendations";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const dashboard = buildAiSearchDashboardPayload();
  return NextResponse.json({ dashboard });
}
