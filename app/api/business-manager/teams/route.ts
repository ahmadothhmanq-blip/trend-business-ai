import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listTeams, createTeam, listRoles, createRole } from "@/lib/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const teamSchema = z.object({
  organizationId: z.string().uuid(),
  departmentId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1),
  description: z.string().default(""),
});

const roleSchema = z.object({
  organizationId: z.string().uuid(),
  teamId: z.string().uuid().nullable().optional(),
  memberName: z.string().trim().min(1),
  memberEmail: z.string().email().optional().or(z.literal("")),
  roleType: z.enum(["owner", "admin", "manager", "member"]).default("member"),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId") ?? undefined;
  const type = searchParams.get("type");

  if (type === "roles") {
    const { data, error } = await listRoles(auth.supabase, auth.user!.id, { organizationId });
    if (error) {
      if (/relation/i.test(error.message ?? "")) return NextResponse.json({ roles: [] });
      return databaseErrorResponse("business-manager.roles.list", error);
    }
    return NextResponse.json({ roles: data ?? [] });
  }

  const { data, error } = await listTeams(auth.supabase, auth.user!.id, { organizationId });
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ teams: [] });
    return databaseErrorResponse("business-manager.teams.list", error);
  }
  return NextResponse.json({ teams: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const roleParsed = roleSchema.safeParse(body);
  if (roleParsed.success) {
    const { data, error } = await createRole(auth.supabase, {
      user_id: auth.user!.id,
      organization_id: roleParsed.data.organizationId,
      team_id: roleParsed.data.teamId ?? null,
      member_name: roleParsed.data.memberName,
      member_email: roleParsed.data.memberEmail ?? "",
      role_type: roleParsed.data.roleType,
    });
    if (error) return databaseErrorResponse("business-manager.roles.create", error);
    return NextResponse.json({ role: data });
  }

  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await createTeam(auth.supabase, {
    user_id: auth.user!.id,
    organization_id: parsed.data.organizationId,
    department_id: parsed.data.departmentId ?? null,
    name: parsed.data.name,
    description: parsed.data.description,
  });
  if (error) return databaseErrorResponse("business-manager.teams.create", error);
  return NextResponse.json({ team: data });
}
