import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { runBiAssistant } from "@/lib/bi";
import type { BiAssistantAction } from "@/types/bi";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  action: z.enum([
    "analyze_performance",
    "explain_kpi",
    "detect_trends",
    "detect_anomalies",
    "forecast_revenue",
    "generate_executive_report",
    "natural_language_query",
  ]),
  text: z.string().trim().min(1),
  context: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "workspace");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });

  try {
    const result = await runBiAssistant(parsed.data.action as BiAssistantAction, {
      text: parsed.data.text,
      context: parsed.data.context,
    });
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
