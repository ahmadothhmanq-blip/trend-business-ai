import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { SocialCampaign } from "@/types/social-media";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().default(""),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).default("draft"),
  platforms: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goals: z.array(z.string()).default([]),
  brandIdentityId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const favorite = new URL(request.url).searchParams.get("favorite");

  let query = auth.supabase
    .from("social_campaigns")
    .select("*")
    .eq("user_id", auth.user!.id)
    .order("updated_at", { ascending: false });

  if (favorite === "true") query = query.eq("is_favorite", true);

  const { data, error } = await query;
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ campaigns: [] });
    return databaseErrorResponse("social-media.campaigns.list", error);
  }

  return NextResponse.json({ campaigns: data as SocialCampaign[] });
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

  const input = parsed.data;
  const { data, error } = await auth.supabase
    .from("social_campaigns")
    .insert({
      user_id: auth.user!.id,
      name: input.name,
      description: input.description,
      status: input.status,
      platforms: input.platforms,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      goals: input.goals,
      brand_identity_id: input.brandIdentityId ?? null,
    })
    .select("*")
    .single();

  if (error) return databaseErrorResponse("social-media.campaigns.insert", error);
  return NextResponse.json({ campaign: data as SocialCampaign });
}
