import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import type { Webhook } from "@/types/platform";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  url: z.string().url("Valid URL required"),
  events: z.array(z.string()).min(1, "Select at least one event"),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase.from("webhooks").select("*").eq("user_id", auth.user!.id).order("created_at", { ascending: false });
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ webhooks: [] });
    return databaseErrorResponse("webhooks.list", error);
  }
  return NextResponse.json({ webhooks: data as Webhook[] });
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

  const { data, error } = await auth.supabase.from("webhooks").insert({
    user_id: auth.user!.id, url: parsed.data.url, events: parsed.data.events,
  }).select("*").single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ error: "Webhooks table not ready. Apply migration 021." }, { status: 503 });
    return databaseErrorResponse("webhooks.create", error);
  }
  return NextResponse.json({ webhook: data as Webhook, message: "Webhook created." });
}
