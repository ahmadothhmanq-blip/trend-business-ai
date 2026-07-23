import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import {
  listProjects,
  createProject,
  generateBusinessPlan,
} from "@/lib/business-manager";
import type { BusinessProject } from "@/types/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().default(""),
  status: z.enum(["draft", "active", "on_hold", "completed", "archived"]).default("draft"),
  organizationId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  ownerName: z.string().default(""),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  brief: z.string().optional(),
  generate: z.boolean().default(false),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const organizationId = searchParams.get("organizationId") ?? undefined;

  const { data, error } = await listProjects(auth.supabase, auth.user!.id, {
    status,
    organizationId,
  });
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ projects: [] });
    return databaseErrorResponse("business-manager.projects.list", error);
  }
  return NextResponse.json({ projects: data as BusinessProject[] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  let metadata: Record<string, unknown> = {};
  if (parsed.data.generate && parsed.data.brief) {
    const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "workspace");
    if (rateLimited) return rateLimited;
    const plan = await generateBusinessPlan({ brief: parsed.data.brief });
    metadata = { generatedPlan: plan };
  }

  const { data, error } = await createProject(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
    status: parsed.data.status,
    organization_id: parsed.data.organizationId ?? null,
    team_id: parsed.data.teamId ?? null,
    owner_name: parsed.data.ownerName,
    start_date: parsed.data.startDate ?? null,
    end_date: parsed.data.endDate ?? null,
    metadata,
  });
  if (error) return databaseErrorResponse("business-manager.projects.create", error);
  return NextResponse.json({ project: data });
}
