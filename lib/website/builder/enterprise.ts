/**
 * Website Builder — enterprise foundation (Phase 8).
 */

export type BuilderMemberRole = "owner" | "editor" | "viewer";

export type BuilderGenerationMember = {
  id: string;
  generationId: string;
  userId: string;
  email?: string;
  role: BuilderMemberRole;
  status?: "pending" | "accepted" | "revoked" | "expired";
  invitationToken?: string;
  expiresAt?: string;
  acceptedAt?: string;
  emailDeliveryStatus?: "pending" | "sent" | "failed" | "skipped";
  emailSentAt?: string;
  emailLastError?: string;
  emailResendCount?: number;
  createdAt: string;
};

export const BUILDER_ROLE_PERMISSIONS: Record<
  BuilderMemberRole,
  {
    edit: boolean;
    publish: boolean;
    manage: boolean;
    invite: boolean;
  }
> = {
  owner: { edit: true, publish: true, manage: true, invite: true },
  editor: { edit: true, publish: false, manage: true, invite: false },
  viewer: { edit: false, publish: false, manage: false, invite: false },
};

export function builderRoleCan(
  role: BuilderMemberRole,
  action: keyof (typeof BUILDER_ROLE_PERMISSIONS)["owner"],
): boolean {
  return BUILDER_ROLE_PERMISSIONS[role][action];
}

export const ENTERPRISE_CAPABILITIES = [
  {
    id: "teams",
    label: "Team access",
    description: "Invite collaborators to a website generation",
  },
  {
    id: "roles",
    label: "Roles & permissions",
    description: "Owner, editor, and viewer access levels",
  },
  {
    id: "marketplace",
    label: "Template marketplace",
    description: "Browse and apply premium templates",
  },
  {
    id: "plugins",
    label: "Plugin architecture",
    description: "Website plugin pipeline (generate, plan, validate)",
  },
  {
    id: "api",
    label: "Public API",
    description: "Design platform, marketplace, and builder APIs",
  },
  {
    id: "white-label",
    label: "White label",
    description: "Custom branding via organization settings (foundation)",
  },
] as const;
