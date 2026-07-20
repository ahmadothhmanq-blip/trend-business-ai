import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { getPublicationForGeneration } from "@/lib/ai-core/publishing";
import {
  getDomainById,
  verifyWebsiteDomain,
} from "@/lib/ai-core/domains";
import { recordDeploymentEvent } from "@/lib/ai-core/deployment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const verifySchema = z.object({
  domainId: z.string().trim().min(1),
  simulate: z.boolean().optional(),
});

/**
 * POST — Verify custom domain DNS + mark SSL readiness.
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

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid verify request" },
      { status: 400 },
    );
  }

  const existing = await getDomainById(parsed.data.domainId, auth.supabase);
  if (
    !existing ||
    existing.userId !== auth.user!.id ||
    existing.generationId !== parsedId.id
  ) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  const publication = await getPublicationForGeneration({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: parsedId.id,
  });
  if (publication?.slug) {
    existing.slug = publication.slug;
    existing.publicationId = publication.id;
  }

  try {
    const domain = await verifyWebsiteDomain({
      domainId: parsed.data.domainId,
      userId: auth.user!.id,
      forceSimulate: parsed.data.simulate === true,
      client: auth.supabase,
    });

    if (domain.status === "active") {
      await recordDeploymentEvent(
        {
          userId: auth.user!.id,
          generationId: parsedId.id,
          kind: "domain_verified",
          message: `Domain verified: ${domain.hostname}`,
          url: `https://${domain.hostname}`,
        },
        auth.supabase,
      );
      if (domain.sslStatus === "active") {
        await recordDeploymentEvent(
          {
            userId: auth.user!.id,
            generationId: parsedId.id,
            kind: "ssl_ready",
            message: `SSL ready for ${domain.hostname}`,
            url: `https://${domain.hostname}`,
          },
          auth.supabase,
        );
      }
    }

    return NextResponse.json({ domain });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
