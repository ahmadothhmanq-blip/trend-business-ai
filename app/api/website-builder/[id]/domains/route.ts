import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
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
      error: apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message),
    };
  }
  if (!data) {
    return {
      error: apiErrorResponse(API_ERROR_CODES.NOT_FOUND, 404, "Website not found."),
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

  const domains = await listDomainsForGeneration(parsedId.id, auth.supabase);
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
    return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400);
  }

  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const validated = validateCustomHostname(parsed.data.hostname);
  if (!validated.ok) {
    return apiValidationError(validated.error);
  }

  const publication = await getPublicationForGeneration({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: parsedId.id,
  });

  try {
    const domain = await addCustomDomain(
      {
        userId: auth.user!.id,
        generationId: parsedId.id,
        hostname: validated.hostname,
        publicationId: publication?.id,
        slug: publication?.slug,
      },
      auth.supabase,
    );

    await recordDeploymentEvent(
      {
        userId: auth.user!.id,
        generationId: parsedId.id,
        kind: "domain_added",
        message: `Custom domain added: ${domain.hostname}`,
        url: `https://${domain.hostname}`,
      },
      auth.supabase,
    );

    return NextResponse.json({ domain }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add domain";
    const status = message.includes("already") ? 409 : 400;
    const code = API_ERROR_CODES.INVALID_INPUT;
    return apiErrorResponse(code, status, message);
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
    return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400);
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError("domainId required");
  }

  try {
    const domain = await removeDomain(
      {
        domainId: parsed.data.domainId,
        userId: auth.user!.id,
      },
      auth.supabase,
    );
    if (domain.generationId !== parsedId.id) {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Domain not found.");
    }
    await recordDeploymentEvent(
      {
        userId: auth.user!.id,
        generationId: parsedId.id,
        kind: "domain_removed",
        message: `Domain removed: ${domain.hostname}`,
      },
      auth.supabase,
    );
    return NextResponse.json({ domain });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Remove failed";
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, message);
  }
}
