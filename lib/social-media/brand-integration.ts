/**
 * Read-only Brand Studio integration for Social Media Manager.
 */

import { blueprintToModel } from "@/lib/ai-core/brand-studio/model";
import type { BrandIdentityBlueprint } from "@/types/brand-identity";
import type { SocialBrandContext } from "@/types/social-media";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchSocialBrandContext(
  supabase: SupabaseClient,
  userId: string,
  brandIdentityId: string,
): Promise<SocialBrandContext | null> {
  const { data, error } = await supabase
    .from("brand_identity_generations")
    .select("brand_name, blueprint")
    .eq("id", brandIdentityId)
    .eq("user_id", userId)
    .single();

  if (error || !data?.blueprint) return null;

  const blueprint = data.blueprint as BrandIdentityBlueprint;
  const model = blueprint.model ?? blueprintToModel(blueprint);
  const tokens = model.tokens;

  return {
    brandName: data.brand_name as string,
    primaryColor: tokens.primary,
    secondaryColor: tokens.secondary,
    accentColor: tokens.accent,
    headingFont: tokens.headingFont,
    bodyFont: tokens.bodyFont,
    voiceTone: model.voice.tone || tokens.voiceTone,
    tagline: model.voice.tagline || tokens.tagline || "",
  };
}

export function brandContextToPrompt(ctx: SocialBrandContext): string {
  return [
    `Brand: ${ctx.brandName}`,
    `Voice tone: ${ctx.voiceTone}`,
    ctx.tagline ? `Tagline: ${ctx.tagline}` : "",
    `Colors: primary ${ctx.primaryColor}, secondary ${ctx.secondaryColor}, accent ${ctx.accentColor}`,
    `Fonts: heading ${ctx.headingFont}, body ${ctx.bodyFont}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function listUserBrands(supabase: SupabaseClient, userId: string, limit = 20) {
  const { data } = await supabase
    .from("brand_identity_generations")
    .select("id, brand_name, industry, status, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
