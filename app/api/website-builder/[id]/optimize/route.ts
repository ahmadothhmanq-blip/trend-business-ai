import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { generateWebsite } from "@/lib/website-generator";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import {
  asSupabaseMaybeSingleClient,
  asSupabaseSingleClient,
} from "@/lib/api/supabase-query";
import { loadWebsiteParentContext } from "@/plugins/website/iteration";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
import type { WebsiteGeneration } from "@/types/database";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** Long Website Builder optimize / continue generations. */
export const maxDuration = 800;

type RouteContext = { params: Promise<{ id: string }> };

const optimizeBodySchema = z.object({
  instruction: z.string().trim().max(4000).optional(),
});

/**
 * POST /api/website-builder/[id]/optimize
 * Improve with AI — runs Website Optimizer Engine on a saved generation.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(
    auth.supabase,
    auth.user!.id,
    "website-builder",
  );
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = optimizeBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { data: existing, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !existing) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const generation = existing as WebsiteGeneration;
  const blueprint = generation.blueprint as unknown as {
    prompt?: string;
    description?: string;
    settings?: Record<string, string>;
  };

  const instruction =
    parsed.data.instruction?.trim() ||
    "[optimize] Improve headlines, CTA buttons, service descriptions, layout structure, and brand consistency. Fix conversion and mobile UX issues.";

  const settings = await providerManager.loadUserSettings(
    asSupabaseSingleClient(auth.supabase),
    auth.user!.id,
  );
  const parentContext = await loadWebsiteParentContext(
    asSupabaseMaybeSingleClient(auth.supabase),
    auth.user!.id,
    id,
  );

  try {
    const project = await generateWebsite({
      prompt:
        generation.business_description ||
        blueprint.description ||
        blueprint.prompt ||
        "Optimize this website for quality and conversions.",
      projectType: generation.website_type || "Business website",
      projectKind: "website",
      language: "en",
      theme: "modern",
      features: [],
      mode: "continue",
      parentGenerationId: id,
      continueInstruction: instruction,
      optimizeWithAi: true,
      ...parentContext,
      userId: auth.user!.id,
      preferredProvider: settings?.default_provider as AIProviderName | undefined,
      autoFallback: settings?.auto_fallback ?? true,
    });

    const saved = await persistWebsiteGeneration({
      supabase: auth.supabase,
      userId: auth.user!.id,
      project,
      projectKind: project.projectKind ?? "website",
      input: {
        prompt: generation.business_description || instruction,
        language: "en",
        theme: "modern",
        features: [],
        productId: "website-builder",
        projectId: generation.project_id ?? undefined,
        mode: "continue",
        parentGenerationId: id,
        continueInstruction: instruction,
      },
    });

    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: 500 });
    }

    return NextResponse.json({
      project: saved.project,
      generation: saved.generation,
      optimizationReport: saved.project.optimizationReport ?? null,
      conversionReport: saved.project.conversionReport ?? null,
      seoPerformanceReport: saved.project.seoPerformanceReport ?? null,
      message: "Website optimized with AI and saved as a new version.",
    });
  } catch (err) {
    return serverErrorResponse(
      "website-builder.optimize",
      err,
      "Unable to optimize website.",
    );
  }
}
