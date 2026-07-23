import { requireUser } from "@/lib/api/helpers";
import { buildCyberHealthReport } from "@/lib/cyber/health";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  return NextResponse.json(await buildCyberHealthReport());
}
