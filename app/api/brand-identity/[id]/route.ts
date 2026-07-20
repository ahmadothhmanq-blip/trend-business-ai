import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { blueprintToModel, mergeModel, modelToBlueprint } from "@/lib/ai-core/brand-studio/model";
import type { BrandIdentityGeneration } from "@/types/brand-identity";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  is_favorite: z.boolean().optional(),
  brand_name: z.string().trim().min(1).max(120).optional(),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
    role: z.string(),
    usage: z.string().optional(),
  })).optional(),
  typography: z.object({
    primary: z.string(),
    secondary: z.string(),
    weight: z.string().optional(),
    headingStyle: z.string().optional(),
    bodyStyle: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  voiceTone: z.object({
    tone: z.string(),
    doExamples: z.array(z.string()).optional(),
    dontExamples: z.array(z.string()).optional(),
    tagline: z.string().optional(),
    elevatorPitch: z.string().optional(),
  }).optional(),
});
export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase.from("brand_identity_generations").select("*").eq("id", id).eq("user_id", auth.user!.id).single();
  if (error || !data) return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });
  return NextResponse.json({ generation: data as BrandIdentityGeneration });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });

  const { is_favorite, brand_name, colors, typography, voiceTone } = parsed.data;

  const { data: existing, error: existingError } = await auth.supabase
    .from("brand_identity_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });
  }

  let blueprintUpdate: Record<string, unknown> | undefined;
  if ((colors || typography || voiceTone) && existing.blueprint) {
    const gen = existing as BrandIdentityGeneration;
    let model = blueprintToModel(gen.blueprint!, gen);
    if (colors) {
      const normalized = colors.map((c) => ({ ...c, usage: c.usage ?? "" }));
      model = mergeModel(model, {
        colors: normalized,
        tokens: { ...model.tokens, primary: normalized[0]?.hex ?? model.tokens.primary },
      });
    }
    if (typography) {
      model = mergeModel(model, {
        typography: {
          ...model.typography,
          ...typography,
          weight: typography.weight ?? model.typography.weight,
          headingStyle: typography.headingStyle ?? model.typography.headingStyle,
          bodyStyle: typography.bodyStyle ?? model.typography.bodyStyle,
          notes: typography.notes ?? model.typography.notes,
        },
        tokens: {
          ...model.tokens,
          headingFont: typography.primary,
          bodyFont: typography.secondary,
        },
      });
    }
    if (voiceTone) {
      model = mergeModel(model, {
        voice: { ...model.voice, ...voiceTone },
        tokens: { ...model.tokens, voiceTone: voiceTone.tone, tagline: voiceTone.tagline ?? model.tokens.tagline },
      });
    }
    blueprintUpdate = modelToBlueprint(model, gen.prompt) as unknown as Record<string, unknown>;
  }

  const { data, error } = await auth.supabase
    .from("brand_identity_generations")
    .update({
      ...(typeof is_favorite === "boolean" ? { is_favorite } : {}),
      ...(brand_name ? { brand_name } : {}),
      ...(blueprintUpdate ? { blueprint: blueprintUpdate } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id).eq("user_id", auth.user!.id).select("*").single();
  if (error || !data) return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });

  if (typeof is_favorite === "boolean") {
    const sync = await syncFavorite(auth.supabase, auth.user!.id, "brand_identity_generation", id, is_favorite);
    if (sync.error) return databaseErrorResponse("brand-identity.syncFavorite", sync.error);
  }

  return NextResponse.json({ generation: data as BrandIdentityGeneration, message: "Updated." });
}

export async function POST(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: source, error: sourceError } = await auth.supabase.from("brand_identity_generations").select("*").eq("id", id).eq("user_id", auth.user!.id).single();
  if (sourceError || !source) return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });

  const { data, error } = await auth.supabase
    .from("brand_identity_generations")
    .insert({ user_id: auth.user!.id, brand_name: `${source.brand_name} (Copy)`, brand_type: source.brand_type, description: source.description, industry: source.industry, target_audience: source.target_audience, brand_personality: source.brand_personality, deliverables: source.deliverables, prompt: source.prompt, blueprint: source.blueprint, status: source.status, mode: "generate", is_favorite: false })
    .select("*").single();

  if (error || !data) return databaseErrorResponse("brand-identity.duplicate", error);
  return NextResponse.json({ generation: data as BrandIdentityGeneration, message: "Duplicated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "brand_identity_generation", id, false);
  const { data, error } = await auth.supabase.from("brand_identity_generations").delete().eq("id", id).eq("user_id", auth.user!.id).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });
  return NextResponse.json({ message: "Brand identity deleted." });
}
