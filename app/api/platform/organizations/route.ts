import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { ensurePersonalOrganization } from "@/lib/platform/organizations";
import type { Organization } from "@/types/platform";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: memberships, error } = await auth.supabase
    .from("org_members")
    .select("role, organization_id, organizations(*)")
    .eq("user_id", auth.user!.id);

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ organizations: [] });
    return databaseErrorResponse("organizations.list", error);
  }

  const organizations = (memberships ?? []).flatMap((row) => {
    const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    if (!org) return [];
    return [{ ...(org as Organization), role: row.role as string }];
  });

  return NextResponse.json({ organizations });
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rl = enforceMutationRateLimit(auth.user!.id);
  if (rl) return rl;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const result = await ensurePersonalOrganization(
    auth.supabase,
    auth.user!.id,
    parsed.data.name,
  );

  if (result.error || !result.organization) {
    return NextResponse.json(
      { error: result.error ?? "Failed to create organization" },
      { status: result.error?.includes("not ready") ? 503 : 500 },
    );
  }

  return NextResponse.json({
    organization: result.organization,
    created: result.created,
    message: result.created ? "Organization created." : "Organization already exists.",
  });
}
