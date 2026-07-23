import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { runMarketingAssistant } from "@/lib/marketing";
import type { MarketingAssistantAction } from "@/types/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  action: z.enum([
    "improve_campaign",
    "rewrite_copy",
    "generate_ideas",
    "analyze_campaign",
    "suggest_improvements",
  ]),
  text: z.string().trim().min(1),
  campaignContext: z.string().optional(),
  instruction: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "workspace");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const result = await runMarketingAssistant(parsed.data.action as MarketingAssistantAction, {
      text: parsed.data.text,
      campaignContext: parsed.data.campaignContext,
      instruction: parsed.data.instruction,
    });
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Action failed" },
      { status: 500 },
    );
  }
}
