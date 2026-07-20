import { buildImageDesignHealthReport } from "@/lib/ai-core/image-design-platform/health";
import { NextResponse } from "next/server";

export async function GET() {
  const report = buildImageDesignHealthReport();
  return NextResponse.json(report, {
    status: report.status === "healthy" ? 200 : 503,
  });
}
