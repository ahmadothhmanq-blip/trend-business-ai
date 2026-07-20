import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import type { WebsiteGeneration } from "@/types/database";
import {
  getPublicationForGeneration,
  runPublishingAction,
} from "@/lib/ai-core/publishing";
import { buildDeploymentDashboard } from "@/lib/ai-core/deployment";
import { recordDeploymentEvent } from "@/lib/ai-core/deployment";
import { normalizeSubdomainHandle } from "@/lib/ai-core/domains";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function userHandleFromAuth(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string | null {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.username === "string" && meta.username) ||
    (typeof meta.full_name === "string" && meta.full_name.split(" ")[0]) ||
    null;
  return normalizeSubdomainHandle(
    fromMeta || user.email?.split("@")[0] || null,
  );
}

/**
 * GET — Deployment dashboard (publish status, domains, history, SSL).
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const { data: generation, error } = await auth.supabase
    .from("website_generations")
    .select("id, project_name, user_id")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!generation) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const publication = await getPublicationForGeneration({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: parsedId.id,
  });

  const handle = userHandleFromAuth(auth.user!);
  const dashboard = await buildDeploymentDashboard({
    generationId: parsedId.id,
    projectName: generation.project_name,
    publication,
    userId: auth.user!.id,
    userHandle: handle,
    hasAnalytics: true,
    hasSeoAgent: true,
    client: auth.supabase,
  });

  return NextResponse.json({ dashboard });
}

const actionSchema = z.object({
  action: z.enum([
    "prepare",
    "publish",
    "unpublish",
    "archive",
    "republish",
  ]),
});

/**
 * POST — Publish / prepare / unpublish / archive via Publishing Engine.
 * Delegates to existing lib/website/publish (quality gates remain on /publish).
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid action" },
      { status: 400 },
    );
  }

  const { data: existing, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const generation = existing as WebsiteGeneration;
  const handle = userHandleFromAuth(auth.user!);

  const result = await runPublishingAction({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generation,
    action: parsed.data.action,
    userHandle: handle,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  const kindByAction = {
    prepare: "prepared",
    publish: "published",
    republish: "republished",
    unpublish: "unpublished",
    archive: "archived",
  } as const;

  await recordDeploymentEvent(
    {
      userId: auth.user!.id,
      generationId: parsedId.id,
      kind: kindByAction[parsed.data.action],
      message: `Deployment action: ${parsed.data.action}`,
      url: result.publication.planned_public_url,
    },
    auth.supabase,
  );

  const dashboard = await buildDeploymentDashboard({
    generationId: parsedId.id,
    projectName: generation.project_name,
    publication: result.publication,
    userId: auth.user!.id,
    userHandle: handle,
    hasAnalytics: true,
    hasSeoAgent: true,
    client: auth.supabase,
  });

  return NextResponse.json({
    success: true,
    publication: result.publication,
    dashboard,
    publicUrl:
      "publicUrl" in result ? result.publicUrl : result.publication.planned_public_url,
  });
}
