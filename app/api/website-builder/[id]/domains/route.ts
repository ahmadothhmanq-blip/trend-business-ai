import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { getPublicationForGeneration } from "@/lib/ai-core/publishing";
import {
  addCustomDomain,
  listDomainsForGeneration,
  removeDomain,
  validateCustomHostname,
} from "@/lib/ai-core/domains";
import { recordDeploymentEvent } from "@/lib/ai-core/deployment";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function assertOwnedGeneration(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  generationId: string,
) {
  const { data, error } = await supabase
    .from("website_generations")
    .select("id")
    .eq("id", generationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    return {
      error: NextResponse.json({ error: error.message }, { status: 500 }),
    };
  }
  if (!data) {
    return {
      error: NextResponse.json({ error: "Website not found." }, { status: 404 }),
    };
  }
  return { error: null };
}

/**
 * GET — List domains for a website generation.
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const owned = await assertOwnedGeneration(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
  );
  if (owned.error) return owned.error;

  const domains = listDomainsForGeneration(parsedId.id);
  return NextResponse.json({ domains, count: domains.length });
}

const addSchema = z.object({
  hostname: z.string().trim().min(3).max(253),
});

/**
 * POST — Connect a custom domain (with DNS instructions).
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const owned = await assertOwnedGeneration(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
  );
  if (owned.error) return owned.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid domain" },
      { status: 400 },
    );
  }

  const validated = validateCustomHostname(parsed.data.hostname);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const publication = await getPublicationForGeneration({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: parsedId.id,
  });

  try {
    const domain = addCustomDomain({
      userId: auth.user!.id,
      generationId: parsedId.id,
      hostname: validated.hostname,
      publicationId: publication?.id,
      slug: publication?.slug,
    });

    recordDeploymentEvent({
      generationId: parsedId.id,
      kind: "domain_added",
      message: `Custom domain added: ${domain.hostname}`,
      url: `https://${domain.hostname}`,
    });

    return NextResponse.json({ domain }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add domain";
    const status = message.includes("already") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

const deleteSchema = z.object({
  domainId: z.string().trim().min(1),
});

/**
 * DELETE — Remove a custom domain connection.
 */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const owned = await assertOwnedGeneration(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
  );
  if (owned.error) return owned.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "domainId required" }, { status: 400 });
  }

  try {
    const domain = removeDomain({
      domainId: parsed.data.domainId,
      userId: auth.user!.id,
    });
    if (domain.generationId !== parsedId.id) {
      return NextResponse.json({ error: "Domain not found." }, { status: 404 });
    }
    recordDeploymentEvent({
      generationId: parsedId.id,
      kind: "domain_removed",
      message: `Domain removed: ${domain.hostname}`,
    });
    return NextResponse.json({ domain });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Remove failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
