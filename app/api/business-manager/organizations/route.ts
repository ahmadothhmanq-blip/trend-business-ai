import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import {
  listOrganizations,
  createOrganization,
  listDepartments,
  createDepartment,
  generateBusinessPlan,
} from "@/lib/business-manager";
import type { Organization } from "@/types/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().default(""),
  industry: z.string().default(""),
  brief: z.string().optional(),
  generate: z.boolean().default(false),
});

const deptSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(1),
  description: z.string().default(""),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await listOrganizations(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ organizations: [] });
    return databaseErrorResponse("business-manager.organizations.list", error);
  }
  return NextResponse.json({ organizations: data as Organization[] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const deptParsed = deptSchema.safeParse(body);
  if (deptParsed.success) {
    const { data, error } = await createDepartment(auth.supabase, {
      user_id: auth.user!.id,
      organization_id: deptParsed.data.organizationId,
      name: deptParsed.data.name,
      description: deptParsed.data.description,
    });
    if (error) return databaseErrorResponse("business-manager.departments.create", error);
    return NextResponse.json({ department: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  let metadata: Record<string, unknown> = {};
  if (parsed.data.generate && parsed.data.brief) {
    const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "workspace");
    if (rateLimited) return rateLimited;
    const plan = await generateBusinessPlan({ brief: parsed.data.brief, industry: parsed.data.industry });
    metadata = { generatedPlan: plan };
  }

  const { data, error } = await createOrganization(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
    industry: parsed.data.industry,
    metadata,
  });
  if (error) return databaseErrorResponse("business-manager.organizations.create", error);
  return NextResponse.json({ organization: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<{ action?: string; organizationId?: string }>(request);
  if (body instanceof NextResponse) return body;

  if (body.action === "list-departments" && body.organizationId) {
    const { data, error } = await listDepartments(auth.supabase, auth.user!.id, body.organizationId);
    if (error) return databaseErrorResponse("business-manager.departments.list", error);
    return NextResponse.json({ departments: data ?? [] });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
