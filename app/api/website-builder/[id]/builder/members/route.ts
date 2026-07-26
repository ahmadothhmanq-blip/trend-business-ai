import { NextResponse } from "next/server";
import { z } from "zod";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiNotFoundError,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { assertBuilderAccess } from "@/lib/website/builder/access";
import {
  createInvitationExpiry,
  mapCollaborationMember,
  normalizeInviteEmail,
} from "@/lib/website/builder/collaboration";
import { deliverBuilderInvitationEmail } from "@/lib/website/builder/invitation-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const inviteSchema = z.object({
  email: z.string().trim().email().max(320),
  role: z.enum(["editor", "viewer"]).default("editor"),
});

const MEMBER_SELECT =
  "id, generation_id, user_id, email, role, status, invitation_token, expires_at, accepted_at, email_sent_at, email_message_id, email_delivery_status, email_last_error, email_resend_count, created_at";

function createInvitationToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}${Math.random().toString(36).slice(2, 12)}`;
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const access = await assertBuilderAccess(
    auth.supabase!,
    auth.user!.id,
    parsedId.id,
    "manage",
  );
  if (!access) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  const { data, error } = await auth.supabase!
    .from("website_generation_members")
    .select(MEMBER_SELECT)
    .eq("generation_id", parsedId.id)
    .neq("status", "revoked")
    .order("created_at", { ascending: true });

  if (error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }

  return NextResponse.json({
    members: (data ?? []).map((row) =>
      mapCollaborationMember(row as Record<string, unknown>),
    ),
  });
}

export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

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

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const email = normalizeInviteEmail(parsed.data.email);
  if (auth.user!.email && email === normalizeInviteEmail(auth.user!.email)) {
    return apiValidationError("You cannot invite yourself.");
  }

  const { data: generation } = await auth.supabase!
    .from("website_generations")
    .select("project_name")
    .eq("id", parsedId.id)
    .maybeSingle();

  const token = createInvitationToken();
  const expiresAt = createInvitationExpiry();

  const { data, error } = await auth.supabase!
    .from("website_generation_members")
    .insert({
      generation_id: parsedId.id,
      email,
      role: parsed.data.role,
      status: "pending",
      invitation_token: token,
      expires_at: expiresAt,
      invited_by: auth.user!.id,
    })
    .select(MEMBER_SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      return apiValidationError("This collaborator is already invited.");
    }
    return serverErrorResponse("website-builder-members", error);
  }

  const member = mapCollaborationMember(data as Record<string, unknown>);
  const inviterName =
    (auth.user!.user_metadata?.full_name as string | undefined) ||
    auth.user!.email?.split("@")[0] ||
    "A teammate";

  const emailStatus = await deliverBuilderInvitationEmail({
    supabase: auth.supabase!,
    memberId: member.id,
    email,
    role: parsed.data.role,
    token,
    expiresAt,
    inviterName,
    projectName: generation?.project_name || "Website project",
  });

  const { data: refreshed } = await auth.supabase!
    .from("website_generation_members")
    .select(MEMBER_SELECT)
    .eq("id", member.id)
    .single();

  return NextResponse.json({
    member: mapCollaborationMember(
      (refreshed ?? data) as Record<string, unknown>,
    ),
    emailDeliveryStatus: emailStatus,
  });
}
