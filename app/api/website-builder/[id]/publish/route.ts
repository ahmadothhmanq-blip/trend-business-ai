import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { evaluatePublishGates } from "@/lib/website/publish-gates";
import {
  isWebsitePublishEnabled,
  prepareWebsitePublication,
  publishWebsitePublication,
  unpublishWebsitePublication,
  type PublishAction,
} from "@/lib/website/publish";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  action: z.enum(["prepare", "publish", "unpublish"]).default("publish"),
  force: z.boolean().optional(),
});

async function loadOwnedGeneration(
  auth: Awaited<ReturnType<typeof requireUser>>,
  id: string,
) {
  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as WebsiteGeneration;
}

async function readPublishBody(request: Request) {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function qualityPayload(gates: ReturnType<typeof evaluatePublishGates>) {
  return {
    conversionReady: gates.conversionChecklist?.conversionReady ?? null,
    score: gates.scores.overall,
    goal: gates.conversionChecklist?.goal ?? null,
    publishReady: gates.publishReady,
    scores: gates.scores,
    blockers: gates.blockers,
    warnings: gates.warnings,
    opportunities: gates.opportunities,
    improvementActions: gates.finalChecklist?.topActions ?? [],
    designScore: gates.scores.design,
    uxScore: gates.scores.ux,
    seoScore: gates.scores.seo,
    conversionScore: gates.scores.conversion,
    performanceScore: gates.scores.performance,
    mobileScore: gates.seoChecklist?.mobileScore ?? null,
    overallTechnicalScore: gates.seoChecklist?.overallScore ?? null,
    suggestedTitle: gates.seoChecklist?.suggestedTitle ?? null,
    suggestedDescription: gates.seoChecklist?.suggestedDescription ?? null,
    primaryKeyword: gates.seoChecklist?.primaryKeyword ?? null,
  };
}

/**
 * Publish actions for a website generation:
 * - prepare → status prepared (draft snapshot)
 * - publish → prepared→published + public /w/[slug] (blocked when critical issues exist)
 * - unpublish → remove from public access
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rawBody = await readPublishBody(request);
  if (rawBody === null) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid publish request" },
      { status: 400 },
    );
  }

  const action = parsed.data.action as PublishAction;
  const force = parsed.data.force === true;

  if (action === "unpublish") {
    const result = await unpublishWebsitePublication({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      publication: result.publication,
      publishEnabled: isWebsitePublishEnabled(),
      message: "Website unpublished. Public URL no longer serves this version.",
    });
  }

  const generation = await loadOwnedGeneration(auth, id);
  if (!generation) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const gates = evaluatePublishGates(generation);

  if (action === "prepare") {
    const prepared = await prepareWebsitePublication({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generation,
    });
    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: prepared.status });
    }
    return NextResponse.json({
      publication: prepared.publication,
      publishEnabled: prepared.publishEnabled,
      htmlBytes: prepared.htmlBytes,
      publicPath: prepared.publication.public_path,
      plannedPublicUrl: prepared.publication.planned_public_url,
      managementQuality: gates.managementQuality,
      conversionChecklist: gates.conversionChecklist,
      seoPerformanceChecklist: gates.seoChecklist,
      finalQualityChecklist: gates.finalChecklist,
      qualityRecommendations: qualityPayload(gates),
      message: gates.publishReady
        ? "Publication prepared. Quality gates passed — click Publish when ready."
        : "Publication prepared. Resolve blockers before publishing.",
    });
  }

  if (!force && !gates.publishReady) {
    return NextResponse.json(
      {
        error: "Publishing blocked until critical quality issues are resolved.",
        qualityRecommendations: qualityPayload(gates),
        blockers: gates.blockers,
      },
      { status: 422 },
    );
  }

  const published = await publishWebsitePublication({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generation,
  });

  if (!published.ok) {
    return NextResponse.json({ error: published.error }, { status: published.status });
  }

  return NextResponse.json({
    publication: published.publication,
    publishEnabled: published.publishEnabled,
    htmlBytes: published.htmlBytes,
    publicUrl: published.publicUrl,
    publicPath: published.publication.public_path,
    conversionChecklist: gates.conversionChecklist,
    seoPerformanceChecklist: gates.seoChecklist,
    finalQualityChecklist: gates.finalChecklist,
    qualityRecommendations: qualityPayload(gates),
    message: gates.publishReady
      ? "Website published. Public URL is live and search-engine ready."
      : force
        ? "Website published with force override. Review remaining recommendations."
        : "Website published.",
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("website_publications")
    .select("*")
    .eq("generation_id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    if (isMissingTableMessage(error.message)) {
      return NextResponse.json({
        publication: null,
        publishEnabled: isWebsitePublishEnabled(),
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    publication: data,
    publishEnabled: isWebsitePublishEnabled(),
    publicUrl:
      data?.status === "published"
        ? data.planned_public_url || data.public_path
        : null,
  });
}

function isMissingTableMessage(message?: string) {
  const msg = message?.toLowerCase() ?? "";
  return msg.includes("relation") || msg.includes("does not exist");
}
