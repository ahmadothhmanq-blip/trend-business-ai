import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listAlerts, createAlert, updateAlertStatus, ingestEvent, listEvents } from "@/lib/cyber/monitoring";
import { logCyberAudit } from "@/lib/cyber/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const type = new URL(request.url).searchParams.get("type");
  if (type === "events") {
    const { data, error } = await listEvents(auth.supabase, auth.user!.id);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.events.list", error);
    return NextResponse.json({ events: data ?? [] });
  }
  const { data, error } = await listAlerts(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.alerts.list", error);
  return NextResponse.json({ alerts: data ?? [] });
}

const alertSchema = z.object({ title: z.string().min(1), severity: z.enum(["critical", "high", "medium", "low", "info"]).optional() });
const eventSchema = z.object({ message: z.string().min(1), severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(), eventType: z.string().optional() });
const statusSchema = z.object({ action: z.literal("update-status"), alertId: z.string().uuid(), status: z.enum(["open", "investigating", "resolved", "false_positive"]) });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const statusUpd = statusSchema.safeParse(body);
  if (statusUpd.success) {
    const { data, error } = await updateAlertStatus(auth.supabase, auth.user!.id, statusUpd.data.alertId, statusUpd.data.status);
    if (error) return databaseErrorResponse("cyber.alerts.update", error);
    return NextResponse.json({ alert: data });
  }

  const evt = eventSchema.safeParse(body);
  if (evt.success) {
    const { data, error } = await ingestEvent(auth.supabase, { user_id: auth.user!.id, message: evt.data.message, severity: evt.data.severity, event_type: evt.data.eventType });
    if (error) return databaseErrorResponse("cyber.events.ingest", error);
    return NextResponse.json({ event: data });
  }

  const parsed = alertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createAlert(auth.supabase, { user_id: auth.user!.id, title: parsed.data.title, severity: parsed.data.severity });
  if (error) return databaseErrorResponse("cyber.alerts.create", error);
  await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "alert", entity_id: data?.id });
  return NextResponse.json({ alert: data });
}
