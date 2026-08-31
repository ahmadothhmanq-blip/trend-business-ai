import { NextResponse } from "next/server";
import { apiValidationError } from "@/lib/i18n/api-errors";
import { z } from "zod";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { beginAiUsage } from "@/lib/api/rate-limit";
import {
  analyzeAeo,
  enrichAeoWithAi,
  aeoAnalyzeBodySchema,
} from "@/lib/ai-search/aeo";
import {
  analyzeGeo,
  enrichGeoWithAi,
  geoAnalyzeBodySchema,
} from "@/lib/ai-search/geo";
import { validateSchema, schemaValidateBodySchema } from "@/lib/ai-search/schema-validator";
import {
  optimizeContent,
  enrichContentOptimizeWithAi,
  contentOptimizeBodySchema,
} from "@/lib/ai-search/content-optimizer";
import { getRequestAiLanguage } from "@/lib/i18n/api";

const analyzeBodySchema = z.discriminatedUnion("mode", [
  aeoAnalyzeBodySchema.extend({ mode: z.literal("aeo") }),
  geoAnalyzeBodySchema.extend({ mode: z.literal("geo") }),
  schemaValidateBodySchema.extend({ mode: z.literal("schema") }),
  contentOptimizeBodySchema.extend({ mode: z.literal("optimize") }),
]);

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = analyzeBodySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const data = parsed.data;

  if (data.mode === "aeo") {
    const { mode: _ignoredMode, useAi, language, country, ...input } = data;
    void _ignoredMode;
    let result = analyzeAeo(input);
    if (useAi) {
      const usage = await beginAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
      if (!usage.ok) return usage.response;
      try {
        const aiLanguage = getRequestAiLanguage(request, language, country);
        result = await enrichAeoWithAi(result, input, aiLanguage);
        await usage.lease.settle(auth.supabase);
      } catch (error) {
        await usage.lease.release(auth.supabase);
        throw error;
      }
    }
    return NextResponse.json({ mode: "aeo", result });
  }

  if (data.mode === "geo") {
    const { mode: _ignoredMode, useAi, language, country, ...input } = data;
    void _ignoredMode;
    let result = analyzeGeo(input);
    if (useAi) {
      const usage = await beginAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
      if (!usage.ok) return usage.response;
      try {
        const aiLanguage = getRequestAiLanguage(request, language, country);
        result = await enrichGeoWithAi(result, input, aiLanguage);
        await usage.lease.settle(auth.supabase);
      } catch (error) {
        await usage.lease.release(auth.supabase);
        throw error;
      }
    }
    return NextResponse.json({ mode: "geo", result });
  }

  if (data.mode === "schema") {
    const { mode: _ignoredMode, ...input } = data;
    void _ignoredMode;
    const result = validateSchema(input);
    return NextResponse.json({ mode: "schema", result });
  }

  const { mode: _ignoredMode, useAi, language, country, ...input } = data;
  void _ignoredMode;
  let result = optimizeContent(input);
  if (useAi) {
    const usage = await beginAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
    if (!usage.ok) return usage.response;
    try {
      const aiLanguage = getRequestAiLanguage(request, language, country);
      result = await enrichContentOptimizeWithAi(result, input, aiLanguage);
      await usage.lease.settle(auth.supabase);
    } catch (error) {
      await usage.lease.release(auth.supabase);
      throw error;
    }
  }
  return NextResponse.json({ mode: "optimize", result });
}
