import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listAssets, createAsset } from "@/lib/cyber/assets";
import { logCyberAudit } from "@/lib/cyber/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listAssets(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("cyber.assets.list", error);
  return NextResponse.json({ assets: data ?? [] });
}

const schema = z.object({
  name: z.string().min(1),
  assetType: z.enum(["device", "server", "application", "cloud", "network", "other"]).default("server"),
  hostname: z.string().optional(),
  ipAddress: z.string().optional(),
  owner: z.string().optional(),
  environment: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createAsset(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    asset_type: parsed.data.assetType,
    hostname: parsed.data.hostname,
    ip_address: parsed.data.ipAddress,
    owner: parsed.data.owner,
    environment: parsed.data.environment,
  });
  if (error) return databaseErrorResponse("cyber.assets.create", error);
  await logCyberAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "asset", entity_id: data?.id });
  return NextResponse.json({ asset: data });
}
