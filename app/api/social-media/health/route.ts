import { buildSocialMediaHealthReport } from "@/lib/social-media/health";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await buildSocialMediaHealthReport();
  return NextResponse.json(report, {
    status: report.status === "healthy" ? 200 : 503,
  });
}
