import { requireUser } from "@/lib/api/helpers";
import { getAllIntegrationBridges } from "@/lib/business-manager";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const bridges = await getAllIntegrationBridges(auth.supabase, auth.user!.id);
  return NextResponse.json({ bridges, readOnly: true });
}
