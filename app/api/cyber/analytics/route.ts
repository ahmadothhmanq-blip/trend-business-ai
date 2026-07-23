import { requireUser } from "@/lib/api/helpers";
import { getCyberAnalytics } from "@/lib/cyber/analytics";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { summary } = await getCyberAnalytics(auth.supabase, auth.user!.id);
  return NextResponse.json({ summary });
}
