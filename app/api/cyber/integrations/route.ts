import { requireUser } from "@/lib/api/helpers";
import { collectCyberIntegrations } from "@/lib/cyber/integrations";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const snapshot = await collectCyberIntegrations(auth.supabase, auth.user!.id);
  return NextResponse.json({ snapshot, readOnly: true });
}
