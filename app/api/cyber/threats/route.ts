import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listThreats, createThreat, listIocs, createIoc } from "@/lib/cyber/threats";
import { logCyberAudit } from "@/lib/cyber/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const type = new URL(request.url).searchParams.get("type");
  if (type === "iocs") {
    const threatId = new URL(request.url).searchParams.get("threatId") ?? undefined;
    const { data, error } = await listIocs(auth.supabase, auth.user!.id, threatId);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.iocs.list", error);
    return NextResponse.json({ iocs: data ?? [] });
  }
  const { data, error } = await listThreats(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.threats.list", error);
  return NextResponse.json({ threats: data ?? [] });
}

const threatSchema = z.object({ title: z.string().min(1), description: z.string().optional(), severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(), threatType: z.string().optional() });
const iocSchema = z.object({ iocType: z.enum(["ip", "domain", "hash", "url", "email", "signature"]), value: z.string().min(1), threatId: z.string().uuid().optional() });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const ioc = iocSchema.safeParse(body);
  if (ioc.success) {
    const { data, error } = await createIoc(auth.supabase, { user_id: auth.user!.id, ioc_type: ioc.data.iocType, value: ioc.data.value, threat_id: ioc.data.threatId ?? null });
    if (error) return databaseErrorResponse("cyber.iocs.create", error);
    await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "ioc", entity_id: data?.id });
    return NextResponse.json({ ioc: data });
  }

  const parsed = threatSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createThreat(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    description: parsed.data.description,
    severity: parsed.data.severity,
    threat_type: parsed.data.threatType,
  });
  if (error) return databaseErrorResponse("cyber.threats.create", error);
  await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "threat", entity_id: data?.id });
  return NextResponse.json({ threat: data });
}
