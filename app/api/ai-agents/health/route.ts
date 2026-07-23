import { requireUser } from "@/lib/api/helpers";
import { buildAgentsHealthReport } from "@/lib/agents/health";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const report = await buildAgentsHealthReport();
  return NextResponse.json(report);
}
