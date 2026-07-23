import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listIncidents, createIncident, updateIncident, listCases, createCase } from "@/lib/cyber/incidents";
import { logCyberAudit } from "@/lib/cyber/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const type = new URL(request.url).searchParams.get("type");
  if (type === "cases") {
    const { data, error } = await listCases(auth.supabase, auth.user!.id);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.cases.list", error);
    return NextResponse.json({ cases: data ?? [] });
  }
  const { data, error } = await listIncidents(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.incidents.list", error);
  return NextResponse.json({ incidents: data ?? [] });
}

const incidentSchema = z.object({ title: z.string().min(1), description: z.string().optional(), severity: z.enum(["critical", "high", "medium", "low", "info"]).optional() });
const caseSchema = z.object({ title: z.string().min(1), incidentId: z.string().uuid().optional() });
const updateSchema = z.object({ action: z.literal("update"), id: z.string().uuid(), status: z.enum(["open", "investigating", "contained", "resolved", "closed"]) });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const upd = updateSchema.safeParse(body);
  if (upd.success) {
    const { data, error } = await updateIncident(auth.supabase, auth.user!.id, upd.data.id, { status: upd.data.status });
    if (error) return databaseErrorResponse("cyber.incidents.update", error);
    return NextResponse.json({ incident: data });
  }

  const c = caseSchema.safeParse(body);
  if (c.success) {
    const { data, error } = await createCase(auth.supabase, { user_id: auth.user!.id, title: c.data.title, incident_id: c.data.incidentId ?? null });
    if (error) return databaseErrorResponse("cyber.cases.create", error);
    await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "case", entity_id: data?.id });
    return NextResponse.json({ case: data });
  }

  const parsed = incidentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createIncident(auth.supabase, { user_id: auth.user!.id, title: parsed.data.title, description: parsed.data.description, severity: parsed.data.severity });
  if (error) return databaseErrorResponse("cyber.incidents.create", error);
  await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "incident", entity_id: data?.id });
  return NextResponse.json({ incident: data });
}
