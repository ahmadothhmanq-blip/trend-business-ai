import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { ensureDefaultMetrics } from "@/lib/bi/metrics";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await auth.supabase.from("bi_metrics").select("*").eq("user_id", auth.user!.id).order("label");
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ metrics: [] });
    return databaseErrorResponse("bi.metrics.list", error);
  }
  return NextResponse.json({ metrics: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<{ action?: string }>(request);
  if (body instanceof NextResponse) return body;
  if (body.action === "ensure-default") {
    await ensureDefaultMetrics(auth.supabase, auth.user!.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
