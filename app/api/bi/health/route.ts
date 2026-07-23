import { buildBiHealthReport } from "@/lib/bi/health";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ report: await buildBiHealthReport() });
}
