import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import {
  generateCampaign,
  generatedCampaignToRow,
  createCampaign,
  listCampaigns,
} from "@/lib/marketing";
import type { MarketingCampaign } from "@/types/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1).optional(),
  objective: z.string().trim().default(""),
  status: z.enum(["draft", "planned", "active", "paused", "completed", "archived"]).default("draft"),
  budget: z.number().nullable().optional(),
  channels: z.array(z.object({ type: z.enum(["email", "social", "ads", "content", "seo"]), label: z.string(), enabled: z.boolean() })).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  brief: z.string().trim().min(3).optional(),
  generate: z.boolean().default(false),
  tone: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const favorite = searchParams.get("favorite") === "true";

  const { data, error } = await listCampaigns(auth.supabase, auth.user!.id, { status, favorite });

  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ campaigns: [] });
    return databaseErrorResponse("marketing.campaigns.list", error);
  }

  return NextResponse.json({ campaigns: data as MarketingCampaign[] });
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

  if (parsed.data.generate && parsed.data.brief) {
    const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "workspace");
    if (rateLimited) return rateLimited;

    const generated = await generateCampaign({
      brief: parsed.data.brief,
      objective: parsed.data.objective,
      budget: parsed.data.budget ?? undefined,
      tone: parsed.data.tone,
    });

    const { data, error } = await createCampaign(
      auth.supabase,
      generatedCampaignToRow(auth.user!.id, generated, parsed.data.brief) as Parameters<typeof createCampaign>[1],
    );
    if (error) return databaseErrorResponse("marketing.campaigns.insert", error);
    return NextResponse.json({ campaign: data, generated });
  }

  const { data, error } = await createCampaign(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name ?? "Untitled Campaign",
    objective: parsed.data.objective,
    status: parsed.data.status,
    budget: parsed.data.budget ?? null,
    channels: parsed.data.channels ?? [],
    start_date: parsed.data.startDate ?? null,
    end_date: parsed.data.endDate ?? null,
  });

  if (error) return databaseErrorResponse("marketing.campaigns.insert", error);
  return NextResponse.json({ campaign: data });
}
