import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { prepareWebsitePublication } from "@/lib/website/publish";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Prepare a safe hosted-URL publication (architecture ready).
 * Does not go live until WEBSITE_PUBLISH_ENABLED=true and public /w/[slug] route is enabled.
 */
export async function POST(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const prepared = await prepareWebsitePublication({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generation: data as WebsiteGeneration,
  });

  if (!prepared.ok) {
    return NextResponse.json({ error: prepared.error }, { status: prepared.status });
  }

  return NextResponse.json({
    publication: prepared.publication,
    publishEnabled: prepared.publishEnabled,
    htmlBytes: prepared.htmlBytes,
    architecture: {
      delivery: "static-html-sandbox",
      publicRoute: "/w/[slug]",
      noNpmInstall: true,
      liveGate: "WEBSITE_PUBLISH_ENABLED",
    },
    message: prepared.publishEnabled
      ? "Publication prepared. Public hosting gate is enabled — wire /w/[slug] to go live."
      : "Publication prepared. Hosted URL is ready in architecture; public go-live stays gated until WEBSITE_PUBLISH_ENABLED=true.",
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
    if (
      error.code === "42P01" ||
      error.message?.toLowerCase().includes("relation") ||
      error.message?.toLowerCase().includes("does not exist")
    ) {
      return NextResponse.json({ publication: null, publishEnabled: false });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    publication: data,
    publishEnabled: process.env.WEBSITE_PUBLISH_ENABLED === "true",
  });
}
