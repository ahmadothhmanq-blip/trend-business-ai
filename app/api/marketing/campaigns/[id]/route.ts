import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse, notFoundResponse } from "@/lib/api/errors";
import { getCampaign, updateCampaign } from "@/lib/marketing";
import type { MarketingCampaign } from "@/types/marketing";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  objective: z.string().optional(),
  status: z.enum(["draft", "planned", "active", "paused", "completed", "archived"]).optional(),
  budget: z.number().nullable().optional(),
  channels: z.array(z.record(z.string(), z.unknown())).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  strategy: z.record(z.string(), z.unknown()).optional(),
  timeline: z.array(z.record(z.string(), z.unknown())).optional(),
  kpis: z.array(z.record(z.string(), z.unknown())).optional(),
  is_favorite: z.boolean().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await getCampaign(auth.supabase, auth.user!.id, idParsed.id);
  if (error || !data) return notFoundResponse("Campaign not found.");
  return NextResponse.json({ campaign: data as MarketingCampaign });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  const input = parsed.data;
  if (input.name !== undefined) patch.name = input.name;
  if (input.objective !== undefined) patch.objective = input.objective;
  if (input.status !== undefined) patch.status = input.status;
  if (input.budget !== undefined) patch.budget = input.budget;
  if (input.channels !== undefined) patch.channels = input.channels;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.strategy !== undefined) patch.strategy = input.strategy;
  if (input.timeline !== undefined) patch.timeline = input.timeline;
  if (input.kpis !== undefined) patch.kpis = input.kpis;
  if (input.is_favorite !== undefined) patch.is_favorite = input.is_favorite;

  const { data, error } = await updateCampaign(auth.supabase, auth.user!.id, idParsed.id, patch);
  if (error || !data) return databaseErrorResponse("marketing.campaigns.update", error);
  return NextResponse.json({ campaign: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { error } = await auth.supabase
    .from("marketing_campaigns")
    .delete()
    .eq("id", idParsed.id)
    .eq("user_id", auth.user!.id);

  if (error) return databaseErrorResponse("marketing.campaigns.delete", error);
  return NextResponse.json({ message: "Campaign deleted." });
}
