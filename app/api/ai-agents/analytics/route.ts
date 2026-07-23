import { requireUser } from "@/lib/api/helpers";
import { getAgentAnalytics } from "@/lib/agents/analytics";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { summary } = await getAgentAnalytics(auth.supabase, auth.user!.id);
  return NextResponse.json({ summary });
}
