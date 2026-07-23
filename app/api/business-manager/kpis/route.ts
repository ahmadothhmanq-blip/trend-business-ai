import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listKpis, createKpi, updateKpi } from "@/lib/business-manager";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().default("general"),
  targetValue: z.number().default(100),
  currentValue: z.number().default(0),
  unit: z.string().default("%"),
  organizationId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  currentValue: z.number().optional(),
  targetValue: z.number().optional(),
  name: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const organizationId = new URL(request.url).searchParams.get("organizationId") ?? undefined;
  const { data, error } = await listKpis(auth.supabase, auth.user!.id, { organizationId });
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ kpis: [] });
    return databaseErrorResponse("business-manager.kpis.list", error);
  }
  return NextResponse.json({ kpis: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const patchParsed = patchSchema.safeParse(body);
  if (patchParsed.success) {
    const patch: Record<string, unknown> = {};
    if (patchParsed.data.currentValue !== undefined) patch.current_value = patchParsed.data.currentValue;
    if (patchParsed.data.targetValue !== undefined) patch.target_value = patchParsed.data.targetValue;
    if (patchParsed.data.name) patch.name = patchParsed.data.name;
    const { data, error } = await updateKpi(auth.supabase, auth.user!.id, patchParsed.data.id, patch);
    if (error) return databaseErrorResponse("business-manager.kpis.update", error);
    return NextResponse.json({ kpi: data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await createKpi(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    category: parsed.data.category,
    target_value: parsed.data.targetValue,
    current_value: parsed.data.currentValue,
    unit: parsed.data.unit,
    organization_id: parsed.data.organizationId ?? null,
    project_id: parsed.data.projectId ?? null,
  });
  if (error) return databaseErrorResponse("business-manager.kpis.create", error);
  return NextResponse.json({ kpi: data });
}
