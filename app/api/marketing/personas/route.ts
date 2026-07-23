import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { listPersonas, createPersona } from "@/lib/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  title: z.string().default(""),
  summary: z.string().default(""),
  campaignId: z.string().uuid().nullable().optional(),
  painPoints: z.array(z.string()).default([]),
  behaviors: z.array(z.string()).default([]),
  motivations: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const campaignId = new URL(request.url).searchParams.get("campaignId") ?? undefined;
  const { data, error } = await listPersonas(auth.supabase, auth.user!.id, campaignId);

  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ personas: [] });
    return databaseErrorResponse("marketing.personas.list", error);
  }

  return NextResponse.json({ personas: data ?? [] });
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

  const { data, error } = await createPersona(auth.supabase, {
    user_id: auth.user!.id,
    campaign_id: parsed.data.campaignId ?? null,
    name: parsed.data.name,
    title: parsed.data.title,
    summary: parsed.data.summary,
    pain_points: parsed.data.painPoints,
    behaviors: parsed.data.behaviors,
    motivations: parsed.data.motivations,
    buying_triggers: [],
    demographics: {},
  });

  if (error) return databaseErrorResponse("marketing.personas.insert", error);
  return NextResponse.json({ persona: data });
}
