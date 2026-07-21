import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { PLATFORM_ADAPTERS } from "@/lib/social-media/platforms";
import { SAFE_ACCOUNT_SELECT, toPublicAccount } from "@/lib/social-media/accounts";
import { CONNECTABLE_PLATFORMS } from "@/lib/social-media/oauth";
import type { SocialAccountPublic } from "@/types/social-media";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  platform: z.enum(["facebook", "instagram", "whatsapp", "messenger", "linkedin", "x", "tiktok"]),
  accountName: z.string().trim().min(1),
  accountHandle: z.string().trim().default(""),
  connectionStatus: z.enum(["connected", "disconnected", "expired", "error"]).default("disconnected"),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("social_accounts")
    .select(SAFE_ACCOUNT_SELECT)
    .eq("user_id", auth.user!.id)
    .order("platform");

  if (error) {
    if (/relation/i.test(error.message ?? "")) {
      return NextResponse.json({ accounts: [], adapters: Object.values(PLATFORM_ADAPTERS), connectable: CONNECTABLE_PLATFORMS });
    }
    return databaseErrorResponse("social-media.accounts.list", error);
  }

  return NextResponse.json({
    accounts: (data ?? []).map((row) => toPublicAccount(row as Record<string, unknown>)) as SocialAccountPublic[],
    adapters: Object.values(PLATFORM_ADAPTERS),
    connectable: CONNECTABLE_PLATFORMS,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("social_accounts")
    .insert({
      user_id: auth.user!.id,
      platform: parsed.data.platform,
      account_name: parsed.data.accountName,
      account_handle: parsed.data.accountHandle,
      status: parsed.data.connectionStatus,
      connection_status: parsed.data.connectionStatus,
      encrypted_token: "",
      access_token_encrypted: "",
      refresh_token_encrypted: "",
    })
    .select(SAFE_ACCOUNT_SELECT)
    .single();

  if (error) return databaseErrorResponse("social-media.accounts.insert", error);
  return NextResponse.json({ account: toPublicAccount(data as Record<string, unknown>) });
}
