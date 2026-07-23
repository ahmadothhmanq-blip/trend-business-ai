import { buildCrmHealthReport } from "@/lib/crm/health";
import { NextResponse } from "next/server";

export async function GET() {
  const report = await buildCrmHealthReport();
  return NextResponse.json({ report });
}
