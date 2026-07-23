import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listWorkflows, createWorkflow, updateWorkflow, defaultOnboardingWorkflow } from "@/lib/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().default(""),
  organizationId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
  useTemplate: z.boolean().default(false),
  steps: z
    .array(z.object({ id: z.string(), label: z.string(), type: z.string(), config: z.record(z.string(), z.unknown()).default({}) }))
    .optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  steps: z.array(z.object({ id: z.string(), label: z.string(), type: z.string(), config: z.record(z.string(), z.unknown()) })).optional(),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await listWorkflows(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ workflows: [] });
    return databaseErrorResponse("business-manager.workflows.list", error);
  }
  return NextResponse.json({ workflows: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const patchParsed = patchSchema.safeParse(body);
  if (patchParsed.success) {
    const patch: Record<string, unknown> = {};
    if (patchParsed.data.status) patch.status = patchParsed.data.status;
    if (patchParsed.data.steps) patch.steps = patchParsed.data.steps;
    const { data, error } = await updateWorkflow(
      auth.supabase,
      auth.user!.id,
      patchParsed.data.id,
      patch,
    );
    if (error) return databaseErrorResponse("business-manager.workflows.update", error);
    return NextResponse.json({ workflow: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await createWorkflow(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
    organization_id: parsed.data.organizationId ?? null,
    project_id: parsed.data.projectId ?? null,
    status: parsed.data.status,
    steps: parsed.data.useTemplate ? defaultOnboardingWorkflow() : (parsed.data.steps ?? []),
  });
  if (error) return databaseErrorResponse("business-manager.workflows.create", error);
  return NextResponse.json({ workflow: data });
}
