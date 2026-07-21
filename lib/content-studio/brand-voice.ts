/**
 * Brand voice extraction from Brand Studio generations (read-only).
 */

import { blueprintToModel } from "@/lib/ai-core/brand-studio/model";
import type { BrandIdentityBlueprint } from "@/types/brand-identity";
import type { BrandVoiceContext } from "@/types/content";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchBrandVoiceContext(
  supabase: SupabaseClient,
  userId: string,
  brandIdentityId: string,
): Promise<BrandVoiceContext | null> {
  const { data, error } = await supabase
    .from("brand_identity_generations")
    .select("brand_name, blueprint")
    .eq("id", brandIdentityId)
    .eq("user_id", userId)
    .single();

  if (error || !data?.blueprint) return null;

  const blueprint = data.blueprint as BrandIdentityBlueprint;
  const model = blueprint.model ?? blueprintToModel(blueprint);
  const voice = model.voice;

  const vocabulary = [
    model.positioning.tagline,
    model.positioning.elevatorPitch,
    model.positioning.valueProposition,
    ...voice.doExamples,
  ].filter(Boolean) as string[];

  return {
    brandName: data.brand_name as string,
    tone: voice.tone || model.tokens.voiceTone || "Professional",
    tagline: voice.tagline || model.positioning.tagline || "",
    elevatorPitch: voice.elevatorPitch || model.positioning.elevatorPitch || "",
    doExamples: voice.doExamples ?? [],
    dontExamples: voice.dontExamples ?? [],
    vocabulary,
    writingStyle: model.typography?.bodyStyle || model.typography?.headingStyle || "Standard",
  };
}

export function brandVoiceToPromptContext(voice: BrandVoiceContext): string {
  return [
    `Brand: ${voice.brandName}`,
    `Tone: ${voice.tone}`,
    voice.tagline ? `Tagline: ${voice.tagline}` : "",
    voice.elevatorPitch ? `Elevator pitch: ${voice.elevatorPitch}` : "",
    voice.doExamples.length
      ? `Do use language like:\n${voice.doExamples.map((e) => `- ${e}`).join("\n")}`
      : "",
    voice.dontExamples.length
      ? `Avoid language like:\n${voice.dontExamples.map((e) => `- ${e}`).join("\n")}`
      : "",
    voice.vocabulary.length
      ? `Brand vocabulary: ${voice.vocabulary.slice(0, 8).join(", ")}`
      : "",
    `Writing style: ${voice.writingStyle}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function listUserBrandIdentities(
  supabase: SupabaseClient,
  userId: string,
  limit = 20,
) {
  const { data } = await supabase
    .from("brand_identity_generations")
    .select("id, brand_name, industry, status, created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
