import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import {
  applyBrandKit,
  blueprintToModel,
  mergeModel,
  modelToBlueprint,
  saveBrandAssets,
  saveBrandKit,
} from "@/lib/ai-core/brand-studio";
import type { BrandApplyTarget } from "@/lib/ai-core/brand-studio/types";
import type { BrandIdentityGeneration } from "@/types/brand-identity";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const postSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  applyTo: z
    .enum(["website-builder", "app-builder", "video-studio"])
    .optional(),
  modelPatch: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: kits, error } = await auth.supabase
    .from("brand_kits")
    .select("*, brand_kit_versions(id, version, change_summary, created_at)")
    .eq("generation_id", id)
    .eq("user_id", auth.user!.id)
    .order("version", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ kits: [], assets: [], message: "Apply migration 048." });
    }
    return databaseErrorResponse("brand-identity.kit.list", error);
  }

  const { data: assets } = await auth.supabase
    .from("brand_assets")
    .select("*")
    .eq("generation_id", id)
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ kits: kits ?? [], assets: assets ?? [] });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = postSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: gen, error: genError } = await auth.supabase
    .from("brand_identity_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (genError || !gen?.blueprint) {
    return NextResponse.json({ error: "Brand identity not found" }, { status: 404 });
  }

  const generation = gen as BrandIdentityGeneration;
  let model = blueprintToModel(generation.blueprint!, generation);
  if (parsed.data.modelPatch) {
    model = mergeModel(model, parsed.data.modelPatch as Partial<typeof model>);
  }

  const { kit, error: kitError } = await saveBrandKit({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: id,
    model,
    name: parsed.data.name,
  });

  if (kitError || !kit) {
    return NextResponse.json({ error: kitError ?? "Failed to save kit" }, { status: 503 });
  }

  const { assets, error: assetError } = await saveBrandAssets({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: id,
    kitId: kit.id,
    model,
  });

  const blueprint = modelToBlueprint(model, generation.prompt);
  await auth.supabase
    .from("brand_identity_generations")
    .update({
      blueprint: blueprint as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const applyPayload = parsed.data.applyTo
    ? applyBrandKit(model, parsed.data.applyTo as BrandApplyTarget)
    : null;

  return NextResponse.json({
    kit,
    assets: assets ?? [],
    apply: applyPayload,
    shareUrl: kit.share_token ? `/brand/share/${kit.share_token}` : null,
    message: assetError ? `Kit saved with warning: ${assetError}` : "Brand kit created.",
  });
}
