import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { runCrmAssistant } from "@/lib/crm";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import { aiOutputLanguageDirective } from "@/lib/ai/prompts/language-directive.server";
import type { CRMAssistantAction } from "@/types/crm";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  action: z.enum([
    "analyze_customer",
    "score_lead",
    "suggest_next_action",
    "summarize_history",
    "generate_sales_email",
    "improve_deal_strategy",
  ]),
  text: z.string().trim().min(1),
  context: z.string().optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "workspace");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  try {
    const language = resolveRequestLanguage(request, parsed.data.language, parsed.data.country);
    const result = await runCrmAssistant(parsed.data.action as CRMAssistantAction, {
      text: parsed.data.text,
      context: [parsed.data.context, aiOutputLanguageDirective(language).trim()]
        .filter(Boolean)
        .join("\n") || undefined,
    });
    await creditLease.settle(auth.supabase);
    return NextResponse.json({ result });
  } catch (e) {
    await creditLease.release(auth.supabase);
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, e instanceof Error ? e.message : undefined);
  }
}
