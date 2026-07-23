import { requireUser } from "@/lib/api/helpers";
import { collectIntegratedMetrics } from "@/lib/bi/integrations";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const integrations = await collectIntegratedMetrics(auth.supabase, auth.user!.id);
  return NextResponse.json({ integrations });
}
