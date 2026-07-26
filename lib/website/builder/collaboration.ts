/**
 * Website Builder — enterprise collaboration helpers.
 */

import type { BuilderGenerationMember, BuilderMemberRole } from "@/lib/website/builder/enterprise";

export const BUILDER_INVITATION_TTL_DAYS = 7;

export type BuilderMemberStatus = "pending" | "accepted" | "revoked" | "expired";

export type BuilderGenerationMemberRecord = BuilderGenerationMember & {
  status: BuilderMemberStatus;
  invitationToken?: string;
  expiresAt?: string;
  acceptedAt?: string;
};

export function createInvitationExpiry(): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + BUILDER_INVITATION_TTL_DAYS);
  return expires.toISOString();
}

export function isInvitationExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function mapCollaborationMember(
  row: Record<string, unknown>,
): BuilderGenerationMemberRecord {
  return {
    id: String(row.id),
    generationId: String(row.generation_id),
    userId: row.user_id ? String(row.user_id) : "",
    email: row.email ? String(row.email) : undefined,
    role: (row.role as BuilderMemberRole) || "editor",
    status: (row.status as BuilderMemberStatus) || "pending",
    invitationToken: row.invitation_token
      ? String(row.invitation_token)
      : undefined,
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    acceptedAt: row.accepted_at ? String(row.accepted_at) : undefined,
    emailDeliveryStatus: row.email_delivery_status
      ? (row.email_delivery_status as BuilderGenerationMember["emailDeliveryStatus"])
      : undefined,
    emailSentAt: row.email_sent_at ? String(row.email_sent_at) : undefined,
    emailLastError: row.email_last_error ? String(row.email_last_error) : undefined,
    emailResendCount:
      typeof row.email_resend_count === "number"
        ? row.email_resend_count
        : undefined,
    createdAt: String(row.created_at),
  };
}

export function validateMemberRole(role: string): role is BuilderMemberRole {
  return role === "owner" || role === "editor" || role === "viewer";
}
