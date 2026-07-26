import { NextResponse } from "next/server";
import { z } from "zod";
import {
  API_ERROR_CODES,
  apiNotFoundError,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { assertBuilderAccess } from "@/lib/website/builder/access";
import {
  mapCollaborationMember,
} from "@/lib/website/builder/collaboration";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; memberId: string }> };

const updateSchema = z.object({
  role: z.enum(["editor", "viewer"]),
});

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId, memberId: rawMemberId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;
  const parsedMemberId = parseUuidParam(rawMemberId, "member id");
  if (parsedMemberId instanceof NextResponse) return parsedMemberId;

  const access = await assertBuilderAccess(
    auth.supabase!,
    auth.user!.id,
    parsedId.id,
    "invite",
  );
  if (!access) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { data, error } = await auth.supabase!
    .from("website_generation_members")
    .update({ role: parsed.data.role })
    .eq("id", parsedMemberId.id)
    .eq("generation_id", parsedId.id)
    .neq("role", "owner")
    .select(
      "id, generation_id, user_id, email, role, status, invitation_token, expires_at, accepted_at, created_at",
    )
    .single();

  if (error || !data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Member not found.");
  }

  return NextResponse.json({
    member: mapCollaborationMember(data as Record<string, unknown>),
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId, memberId: rawMemberId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;
  const parsedMemberId = parseUuidParam(rawMemberId, "member id");
  if (parsedMemberId instanceof NextResponse) return parsedMemberId;

  const access = await assertBuilderAccess(
    auth.supabase!,
    auth.user!.id,
    parsedId.id,
    "invite",
  );
  if (!access) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  const { data, error } = await auth.supabase!
    .from("website_generation_members")
    .update({ status: "revoked" })
    .eq("id", parsedMemberId.id)
    .eq("generation_id", parsedId.id)
    .neq("role", "owner")
    .select("id")
    .maybeSingle();

  if (error) {
    return serverErrorResponse("website-builder-members-delete", error);
  }
  if (!data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Member not found.");
  }

  return NextResponse.json({ ok: true });
}
