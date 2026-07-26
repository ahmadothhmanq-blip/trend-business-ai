import { NextResponse } from "next/server";
import {
  API_ERROR_CODES,
  apiNotFoundError,
} from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { assertBuilderAccess } from "@/lib/website/builder/access";
import {
  createInvitationExpiry,
  isInvitationExpired,
  mapCollaborationMember,
} from "@/lib/website/builder/collaboration";
import { deliverBuilderInvitationEmail } from "@/lib/website/builder/invitation-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; memberId: string }> };

const MEMBER_SELECT =
  "id, generation_id, user_id, email, role, status, invitation_token, expires_at, accepted_at, email_sent_at, email_message_id, email_delivery_status, email_last_error, email_resend_count, created_at";

export async function POST(_request: Request, { params }: Params) {
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

  const { data: memberRow, error } = await auth.supabase!
    .from("website_generation_members")
    .select(MEMBER_SELECT)
    .eq("id", parsedMemberId.id)
    .eq("generation_id", parsedId.id)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    return serverErrorResponse("website-builder-members-resend", error);
  }
  if (!memberRow?.email || !memberRow.invitation_token) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Pending invitation not found.");
  }

  const member = mapCollaborationMember(memberRow as Record<string, unknown>);
  const expiresAt = isInvitationExpired(member.expiresAt)
    ? createInvitationExpiry()
    : member.expiresAt!;

  if (isInvitationExpired(member.expiresAt)) {
    await auth.supabase!
      .from("website_generation_members")
      .update({ expires_at: expiresAt, status: "pending" })
      .eq("id", member.id);
  }

  const { data: generation } = await auth.supabase!
    .from("website_generations")
    .select("project_name")
    .eq("id", parsedId.id)
    .maybeSingle();

  const inviterName =
    (auth.user!.user_metadata?.full_name as string | undefined) ||
    auth.user!.email?.split("@")[0] ||
    "A teammate";

  const emailStatus = await deliverBuilderInvitationEmail({
    supabase: auth.supabase!,
    memberId: member.id,
    email: member.email!,
    role: member.role === "owner" ? "editor" : member.role,
    token: member.invitationToken!,
    expiresAt,
    inviterName,
    projectName: generation?.project_name || "Website project",
    incrementResend: true,
  });

  const { data: refreshed } = await auth.supabase!
    .from("website_generation_members")
    .select(MEMBER_SELECT)
    .eq("id", member.id)
    .single();

  return NextResponse.json({
    member: mapCollaborationMember(
      (refreshed ?? memberRow) as Record<string, unknown>,
    ),
    emailDeliveryStatus: emailStatus,
  });
}
