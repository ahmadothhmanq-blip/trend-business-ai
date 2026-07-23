import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { runCyberAssistant } from "@/lib/cyber/engine";
import type { CyberAssistantAction } from "@/types/cyber";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  action: z.enum([
    "analyze_posture",
    "explain_threat",
    "summarize_incident",
    "recommend_remediation",
    "generate_security_report",
    "risk_assessment",
    "compliance_recommendations",
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  try {
    const result = await runCyberAssistant(parsed.data.action as CyberAssistantAction, { text: parsed.data.text, context: parsed.data.context });
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
