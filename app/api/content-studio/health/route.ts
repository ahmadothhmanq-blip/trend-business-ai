import { buildContentStudioHealthReport } from "@/lib/content-studio/health";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET — Content Studio production health (no user prompts or secrets exposed).
 */
export async function GET() {
  const report = await buildContentStudioHealthReport();
  return NextResponse.json(report, {
    status: report.status === "healthy" ? 200 : 503,
  });
}
