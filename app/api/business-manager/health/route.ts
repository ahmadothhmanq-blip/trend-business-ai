import { buildBusinessManagerHealthReport } from "@/lib/business-manager/health";
import { NextResponse } from "next/server";

export async function GET() {
  const report = await buildBusinessManagerHealthReport();
  return NextResponse.json({ report });
}
