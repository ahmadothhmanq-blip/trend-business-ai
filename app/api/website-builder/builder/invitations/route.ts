import { NextResponse } from "next/server";
import { z } from "zod";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiNotFoundError,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import {
  isInvitationExpired,
  mapCollaborationMember,
  normalizeInviteEmail,
} from "@/lib/website/builder/collaboration";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const acceptSchema = z.object({
  token: z.string().trim().min(16).max(128),
});

async function linkPendingInvitationsForUser(
  supabase: NonNullable<Awaited<ReturnType<typeof requireUser>>["supabase"]>,
  userId: string,
  email: string | undefined,
) {
  if (!email) return;
  const normalized = normalizeInviteEmail(email);
  const now = new Date().toISOString();

  await supabase
    .from("website_generation_members")
    .update({
      user_id: userId,
      status: "accepted",
      accepted_at: now,
    })
    .eq("email", normalized)
    .eq("status", "pending")
    .is("user_id", null)
    .gt("expires_at", now);
}

/**
 * GET — Pending invitations for the authenticated user.
 */
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const email = auth.user!.email;
  if (!email) {
    return NextResponse.json({ invitations: [] });
  }

  await linkPendingInvitationsForUser(auth.supabase!, auth.user!.id, email);

  const { data, error } = await auth.supabase!
    .from("website_generation_members")
    .select(
      "id, generation_id, user_id, email, role, status, invitation_token, expires_at, accepted_at, email_sent_at, email_message_id, email_delivery_status, email_last_error, email_resend_count, created_at",
    )
    .eq("status", "pending")
    .eq("email", normalizeInviteEmail(email))
    .order("created_at", { ascending: false });

  if (error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }

  const invitations = (data ?? [])
    .filter((row) => !isInvitationExpired(String(row.expires_at ?? "")))
    .map((row) => mapCollaborationMember(row as Record<string, unknown>));

  return NextResponse.json({ invitations });
}

/**
 * POST — Accept an invitation by token.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { data: invite, error } = await auth.supabase!
    .from("website_generation_members")
    .select(
      "id, generation_id, user_id, email, role, status, invitation_token, expires_at, accepted_at, email_sent_at, email_message_id, email_delivery_status, email_last_error, email_resend_count, created_at",
    )
    .eq("invitation_token", parsed.data.token)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    return serverErrorResponse("website-builder-invitations", error);
  }
  if (!invite) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Invitation not found.");
  }

  const record = mapCollaborationMember(invite as Record<string, unknown>);
  if (isInvitationExpired(record.expiresAt)) {
    await auth.supabase!
      .from("website_generation_members")
      .update({ status: "expired" })
      .eq("id", record.id);
    return apiValidationError("This invitation has expired.");
  }

  const userEmail = auth.user!.email;
  if (
    record.email &&
    userEmail &&
    normalizeInviteEmail(record.email) !== normalizeInviteEmail(userEmail)
  ) {
    return apiValidationError("This invitation was sent to a different email.");
  }

  const now = new Date().toISOString();
  const { data: accepted, error: updateError } = await auth.supabase!
    .from("website_generation_members")
    .update({
      user_id: auth.user!.id,
      status: "accepted",
      accepted_at: now,
      email: userEmail ? normalizeInviteEmail(userEmail) : record.email,
    })
    .eq("id", record.id)
    .eq("status", "pending")
    .select(
      "id, generation_id, user_id, email, role, status, invitation_token, expires_at, accepted_at, email_sent_at, email_message_id, email_delivery_status, email_last_error, email_resend_count, created_at",
    )
    .single();

  if (updateError) {
    return serverErrorResponse("website-builder-invitations-accept", updateError);
  }

  return NextResponse.json({
    member: mapCollaborationMember(accepted as Record<string, unknown>),
  });
}
