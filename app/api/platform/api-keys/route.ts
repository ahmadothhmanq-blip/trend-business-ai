import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import type { ApiKey } from "@/types/platform";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";

function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const raw = randomBytes(30).toString("base64url");
  const fullKey = `tbai_${raw}`;
  const prefix = fullKey.slice(0, 12);
  const hash = createHash("sha256").update(fullKey).digest("hex");
  return { fullKey, prefix, hash };
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  scopes: z.array(z.string()).default(["read"]),
  expiresInDays: z.number().int().min(0).max(365).optional(),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, last_used_at, expires_at, is_active, created_at")
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ keys: [] });
    return databaseErrorResponse("api-keys.list", error);
  }

  return NextResponse.json({ keys: data as Partial<ApiKey>[] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rl = enforceMutationRateLimit(auth.user!.id);
  if (rl) return rl;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { fullKey, prefix, hash } = generateApiKey();
  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 86400000).toISOString()
    : null;

  const { data, error } = await auth.supabase.from("api_keys").insert({
    user_id: auth.user!.id,
    name: parsed.data.name,
    key_prefix: prefix,
    key_hash: hash,
    scopes: parsed.data.scopes,
    expires_at: expiresAt,
  }).select("id, name, key_prefix, scopes, expires_at, is_active, created_at").single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ error: "API Keys table not ready. Apply migration 021." }, { status: 503 });
    return databaseErrorResponse("api-keys.create", error);
  }

  return NextResponse.json({ key: data, fullKey, message: "API key created. Copy it now — it won't be shown again." });
}
