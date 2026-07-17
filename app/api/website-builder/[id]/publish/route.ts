import { requireUser, parseUuidParam } from "@/lib/api/helpers";
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

/**
 * Publish actions for a website generation:
 * - prepare → status prepared (draft snapshot)
 * - publish → prepared→published + public /w/[slug]
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
      message: "Publication prepared. Click Publish to make the public URL live.",
    });
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
    message: "Website published. Public URL is live.",
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
