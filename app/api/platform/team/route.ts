import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import {
  ensurePersonalOrganization,
  requireOrgAdmin,
} from "@/lib/platform/organizations";
import type { OrgMember, TeamInvitation } from "@/types/platform";
import { NextResponse } from "next/server";
import { z } from "zod";

async function resolveOrganizationId(
  auth: Awaited<ReturnType<typeof requireUser>>,
  requestedOrgId: string | null,
): Promise<{ organizationId: string } | NextResponse> {
  if (requestedOrgId) {
    const admin = await requireOrgAdmin(auth.supabase, auth.user!.id, requestedOrgId);
    if (!admin.ok) {
      // Still allow members to read if they belong
      const { data } = await auth.supabase
        .from("org_members")
        .select("id")
        .eq("organization_id", requestedOrgId)
        .eq("user_id", auth.user!.id)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({ error: "Organization not found." }, { status: 404 });
      }
    }
    return { organizationId: requestedOrgId };
  }

  const profileName =
    (auth.user!.user_metadata?.full_name as string | undefined) ??
    auth.user!.email?.split("@")[0] ??
    "Personal Workspace";

  const ensured = await ensurePersonalOrganization(
    auth.supabase,
    auth.user!.id,
    `${profileName}'s Workspace`,
  );

  if (ensured.error || !ensured.organization) {
    return NextResponse.json(
      { error: ensured.error ?? "Unable to resolve organization" },
      { status: ensured.error?.includes("not ready") ? 503 : 500 },
    );
  }

  return { organizationId: ensured.organization.id };
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const resolved = await resolveOrganizationId(auth, searchParams.get("org"));
  if (resolved instanceof NextResponse) return resolved;

  const { organizationId } = resolved;

  const { data: members, error } = await auth.supabase
    .from("org_members")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ members: [], invitations: [], organizationId });
    return databaseErrorResponse("team.list", error);
  }

  const { data: invitations } = await auth.supabase
    .from("team_invitations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: organization } = await auth.supabase
    .from("organizations")
    .select("id, name, slug, plan")
    .eq("id", organizationId)
    .maybeSingle();

  return NextResponse.json({
    organizationId,
    organization,
    members: (members ?? []) as OrgMember[],
    invitations: (invitations ?? []) as TeamInvitation[],
  });
}

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
  organizationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rl = enforceMutationRateLimit(auth.user!.id);
  if (rl) return rl;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const resolved = await resolveOrganizationId(auth, parsed.data.organizationId ?? null);
  if (resolved instanceof NextResponse) return resolved;

  const { organizationId } = resolved;

  const admin = await requireOrgAdmin(auth.supabase, auth.user!.id, organizationId);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 403 });
  }

  if (parsed.data.email.toLowerCase() === auth.user!.email?.toLowerCase()) {
    return NextResponse.json({ error: "You cannot invite yourself." }, { status: 400 });
  }

  const { data: existingInvite } = await auth.supabase
    .from("team_invitations")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", parsed.data.email.toLowerCase())
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite) {
    return NextResponse.json({ error: "An invitation is already pending for this email." }, { status: 409 });
  }

  const { data, error } = await auth.supabase
    .from("team_invitations")
    .insert({
      organization_id: organizationId,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      invited_by: auth.user!.id,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ error: "Team tables not ready. Apply migration 021." }, { status: 503 });
    }
    return databaseErrorResponse("team.invite", error);
  }

  return NextResponse.json({
    invitation: data as TeamInvitation,
    organizationId,
    message: "Invitation created. Share it with your teammate — email delivery is not configured yet.",
  });
}
