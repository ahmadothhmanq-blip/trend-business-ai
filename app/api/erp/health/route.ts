import { buildErpHealthReport } from "@/lib/erp/health";
import { NextResponse } from "next/server";

export async function GET() {
  const report = await buildErpHealthReport();
  return NextResponse.json({ report });
}
