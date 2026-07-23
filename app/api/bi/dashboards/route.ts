import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listDashboards, createDashboard, listWidgets, createWidget, ensureDefaultDashboard } from "@/lib/bi/dashboards";
import { logBiAudit } from "@/lib/bi/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const dashboardId = new URL(request.url).searchParams.get("dashboardId");
  if (dashboardId) {
    const { data, error } = await listWidgets(auth.supabase, auth.user!.id, dashboardId);
    if (error) return databaseErrorResponse("bi.widgets.list", error);
    return NextResponse.json({ widgets: data ?? [] });
  }
  const { data, error } = await listDashboards(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ dashboards: [] });
    return databaseErrorResponse("bi.dashboards.list", error);
  }
  return NextResponse.json({ dashboards: data ?? [] });
}

const createDashboardSchema = z.object({ name: z.string().min(1), description: z.string().optional() });
const createWidgetSchema = z.object({
  dashboardId: z.string().uuid(),
  title: z.string().min(1),
  widgetType: z.enum(["kpi", "line", "bar", "table", "trend"]),
  metricKey: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const init = body as { action?: string };
  if (init.action === "ensure-default") {
    const { dashboardId } = await ensureDefaultDashboard(auth.supabase, auth.user!.id);
    await logBiAudit(auth.supabase, { user_id: auth.user!.id, action: "ensure_default", entity_type: "dashboard", entity_id: dashboardId });
    return NextResponse.json({ dashboardId });
  }

  const widget = createWidgetSchema.safeParse(body);
  if (widget.success) {
    const { data, error } = await createWidget(auth.supabase, {
      user_id: auth.user!.id,
      dashboard_id: widget.data.dashboardId,
      title: widget.data.title,
      widget_type: widget.data.widgetType,
      metric_key: widget.data.metricKey ?? "",
    });
    if (error) return databaseErrorResponse("bi.widgets.create", error);
    await logBiAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "widget", entity_id: data?.id });
    return NextResponse.json({ widget: data });
  }

  const parsed = createDashboardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createDashboard(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
  });
  if (error) return databaseErrorResponse("bi.dashboards.create", error);
  await logBiAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "dashboard", entity_id: data?.id });
  return NextResponse.json({ dashboard: data });
}
