import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import { buildSeoHealthReport } from "@/lib/seo/health";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  return NextResponse.json({ report: buildSeoHealthReport() });
}
