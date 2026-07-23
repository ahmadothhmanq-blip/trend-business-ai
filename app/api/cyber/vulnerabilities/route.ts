import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listVulnerabilities, createVulnerability, listScans, createScan } from "@/lib/cyber/vulnerabilities";
import { logCyberAudit } from "@/lib/cyber/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const type = new URL(request.url).searchParams.get("type");
  if (type === "scans") {
    const { data, error } = await listScans(auth.supabase, auth.user!.id);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.scans.list", error);
    return NextResponse.json({ scans: data ?? [] });
  }
  const { data, error } = await listVulnerabilities(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.vulnerabilities.list", error);
  return NextResponse.json({ vulnerabilities: data ?? [] });
}

const vulnSchema = z.object({ title: z.string().min(1), cveId: z.string().optional(), severity: z.enum(["critical", "high", "medium", "low", "info"]).optional(), cvssScore: z.number().optional() });
const scanSchema = z.object({ name: z.string().min(1), target: z.string().min(1) });

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const scan = scanSchema.safeParse(body);
  if (scan.success) {
    const { data, error } = await createScan(auth.supabase, { user_id: auth.user!.id, name: scan.data.name, target: scan.data.target });
    if (error) return databaseErrorResponse("cyber.scans.create", error);
    await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "scan", entity_id: data?.id });
    return NextResponse.json({ scan: data });
  }

  const parsed = vulnSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createVulnerability(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    cve_id: parsed.data.cveId,
    severity: parsed.data.severity,
    cvss_score: parsed.data.cvssScore,
  });
  if (error) return databaseErrorResponse("cyber.vulnerabilities.create", error);
  await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "vulnerability", entity_id: data?.id });
  return NextResponse.json({ vulnerability: data });
}
