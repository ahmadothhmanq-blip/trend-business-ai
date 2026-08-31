import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { beginAiUsage } from "@/lib/api/rate-limit";
import {
  analyzeSeo,
  enrichSeoAnalysisWithAi,
  seoAnalyzeBodySchema,
} from "@/lib/seo/analyzer";
import { getRequestAiLanguage } from "@/lib/i18n/api";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = seoAnalyzeBodySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { useAi, language, country, ...input } = parsed.data;
  let result = analyzeSeo(input);

  if (useAi) {
    const usage = await beginAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
    if (!usage.ok) return usage.response;
    const creditLease = usage.lease;
    const aiLanguage = getRequestAiLanguage(request, language, country);
    result = await enrichSeoAnalysisWithAi(result, input, aiLanguage);
    await creditLease.settle(auth.supabase);
  }

  return NextResponse.json({ analysis: result });
}
