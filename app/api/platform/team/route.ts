import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import type { OrgMember, TeamInvitation } from "@/types/platform";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org");

  const membersQuery = orgId
    ? auth.supabase.from("org_members").select("*").eq("organization_id", orgId)
    : auth.supabase.from("org_members").select("*").eq("user_id", auth.user!.id);

  const { data: members, error } = await membersQuery;
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ members: [], invitations: [] });
    return databaseErrorResponse("team.list", error);
  }

  let invitations: TeamInvitation[] = [];
  if (orgId) {
    const { data } = await auth.supabase.from("team_invitations").select("*").eq("organization_id", orgId).eq("status", "pending");
    invitations = (data ?? []) as TeamInvitation[];
  }

  return NextResponse.json({ members: members as OrgMember[], invitations });
}

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
  organizationId: z.string().uuid("Organization ID required"),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rl = enforceMutationRateLimit(auth.user!.id);
  if (rl) return rl;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { email, role, organizationId } = parsed.data;

  const { data, error } = await auth.supabase.from("team_invitations").insert({
    organization_id: organizationId, email, role, invited_by: auth.user!.id,
  }).select("*").single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ error: "Team tables not ready. Apply migration 021." }, { status: 503 });
    return databaseErrorResponse("team.invite", error);
  }

  return NextResponse.json({ invitation: data as TeamInvitation, message: "Invitation sent." });
}
