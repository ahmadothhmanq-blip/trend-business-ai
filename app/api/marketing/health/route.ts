import { buildMarketingHealthReport } from "@/lib/marketing/health";
import { NextResponse } from "next/server";

export async function GET() {
  const report = await buildMarketingHealthReport();
  return NextResponse.json({ report });
}
