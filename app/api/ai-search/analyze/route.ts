import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid AI Search analyze payload" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.mode === "aeo") {
    const { mode: _mode, useAi, ...input } = data;
    let result = analyzeAeo(input);
    if (useAi) {
      const limited = await enforceAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
      if (limited) return limited;
      result = await enrichAeoWithAi(result, input);
    }
    return NextResponse.json({ mode: "aeo", result });
  }

  if (data.mode === "geo") {
    const { mode: _mode, useAi, ...input } = data;
    let result = analyzeGeo(input);
    if (useAi) {
      const limited = await enforceAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
      if (limited) return limited;
      result = await enrichGeoWithAi(result, input);
    }
    return NextResponse.json({ mode: "geo", result });
  }

  if (data.mode === "schema") {
    const { mode: _mode, ...input } = data;
    const result = validateSchema(input);
    return NextResponse.json({ mode: "schema", result });
  }

  const { mode: _mode, useAi, ...input } = data;
  let result = optimizeContent(input);
  if (useAi) {
    const limited = await enforceAiUsage(auth.supabase, auth.user!.id, "seo-analyzer");
    if (limited) return limited;
    result = await enrichContentOptimizeWithAi(result, input);
  }
  return NextResponse.json({ mode: "optimize", result });
}
