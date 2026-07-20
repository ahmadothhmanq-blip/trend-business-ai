import { buildBrandStudioHealthReport } from "@/lib/ai-core/brand-studio/health";
import { NextResponse } from "next/server";

export async function GET() {
  const report = buildBrandStudioHealthReport();
  return NextResponse.json(report, {
    status: report.status === "healthy" ? 200 : 503,
  });
}
