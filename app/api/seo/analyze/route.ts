import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import {
  analyzeSeo,
  enrichSeoAnalysisWithAi,
  seoAnalyzeBodySchema,
} from "@/lib/seo/analyzer";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = seoAnalyzeBodySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { useAi, ...input } = parsed.data;
  let result = analyzeSeo(input);

  if (useAi) {
    const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
    if (rateLimited) return rateLimited;
    result = await enrichSeoAnalysisWithAi(result, input);
  }

  return NextResponse.json({ analysis: result });
}
