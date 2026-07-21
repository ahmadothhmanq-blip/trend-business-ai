import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceMutationRateLimitAsync(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { data: existing } = await auth.supabase
    .from("social_accounts")
    .select("id")
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const { error } = await auth.supabase
    .from("social_accounts")
    .update({
      status: "revoked",
      connection_status: "disconnected",
      access_token_encrypted: "",
      refresh_token_encrypted: "",
      encrypted_token: "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id);

  if (error) return databaseErrorResponse("social-media.accounts.disconnect", error);
  return NextResponse.json({ message: "Account disconnected." });
}
