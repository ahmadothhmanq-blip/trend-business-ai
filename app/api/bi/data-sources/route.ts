import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listDataSources, createDataSource } from "@/lib/bi/data-sources";
import { collectIntegratedMetrics } from "@/lib/bi/integrations";
import { logBiAudit } from "@/lib/bi/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  sourceType: z.enum(["crm", "erp", "marketing", "social", "business_manager", "website", "billing", "custom"]),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listDataSources(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ dataSources: [] });
    return databaseErrorResponse("bi.data-sources.list", error);
  }
  return NextResponse.json({ dataSources: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const syncBody = body as { action?: string };
  if (syncBody.action === "sync-all") {
    const snapshot = await collectIntegratedMetrics(auth.supabase, auth.user!.id);
    await logBiAudit(auth.supabase, { user_id: auth.user!.id, action: "sync", entity_type: "data_source" });
    return NextResponse.json({ snapshot, syncedAt: new Date().toISOString() });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createDataSource(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    source_type: parsed.data.sourceType,
    connection_config: { readOnly: true },
  });
  if (error) return databaseErrorResponse("bi.data-sources.create", error);
  await logBiAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "data_source", entity_id: data?.id });
  return NextResponse.json({ dataSource: data });
}
