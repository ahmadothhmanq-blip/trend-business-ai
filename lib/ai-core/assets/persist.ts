import { createAdminClient } from "@/lib/supabase/admin";
import type { CoreAssetItem } from "@/lib/ai-core/layers/types";
import type { ImageGenerationSettings } from "@/lib/ai-core/assets/settings";
import type { CoreAssetPlanItem } from "@/lib/ai-core/assets/types";

/**
 * Persist image prompts / generated images / image assets (soft-fail).
 * Uses service role when available so Website Builder can write during generation.
 */
export async function persistImageGenerationRecords(params: {
  userId?: string;
  websiteGenerationId?: string;
  aiRunId?: string;
  settings: ImageGenerationSettings;
  planned: CoreAssetPlanItem[];
  items: CoreAssetItem[];
  provider?: string;
  model?: string;
}): Promise<void> {
  if (!params.userId) return;
  const admin = createAdminClient();
  if (!admin) return;

  try {
    for (const planned of params.planned) {
      const generated = params.items.find((i) => i.id === planned.id);

      const { data: promptRow, error: promptError } = await admin
        .from("image_prompts")
        .insert({
          user_id: params.userId,
          website_generation_id: params.websiteGenerationId ?? null,
          ai_run_id: params.aiRunId ?? null,
          role: planned.role,
          kind: planned.kind,
          prompt: planned.prompt,
          style: params.settings.style,
          aspect_ratio: params.settings.aspectRatio,
          quality: params.settings.quality,
          source: "ai-image-engine",
          metadata: {
            name: planned.name,
            alt: planned.alt,
            purpose: planned.metadata?.purpose,
            section: planned.metadata?.section,
            style: planned.metadata?.style ?? params.settings.style,
            prompt: planned.prompt,
            provider: planned.metadata?.provider,
          },
        })
        .select("id")
        .single();

      if (promptError || !promptRow?.id) continue;

      const { data: imageRow } = await admin
        .from("generated_images")
        .insert({
          user_id: params.userId,
          prompt_id: promptRow.id,
          website_generation_id: params.websiteGenerationId ?? null,
          ai_run_id: params.aiRunId ?? null,
          provider:
            generated?.status === "generated"
              ? params.provider ?? "unknown"
              : "fallback-svg",
          model: params.model ?? null,
          status: generated?.status ?? "fallback",
          mime_type: generated?.mimeType ?? null,
          storage_path: generated?.storagePath ?? null,
          public_url: generated?.url ?? null,
          metadata: {
            assetId: planned.id,
            purpose: planned.metadata?.purpose,
            section: planned.metadata?.section,
            style: planned.metadata?.style ?? params.settings.style,
            prompt: planned.prompt,
            provider:
              generated?.status === "generated"
                ? params.provider ?? "unknown"
                : "fallback-svg",
          },
        })
        .select("id")
        .single();

      await admin.from("image_assets").insert({
        user_id: params.userId,
        generated_image_id: imageRow?.id ?? null,
        prompt_id: promptRow.id,
        website_generation_id: params.websiteGenerationId ?? null,
        ai_run_id: params.aiRunId ?? null,
        asset_key: planned.id,
        role: planned.role,
        name: planned.name,
        alt: planned.alt,
        public_url: generated?.url ?? null,
        storage_path: generated?.storagePath ?? null,
        status: generated?.status ?? "fallback",
        metadata: {
          kind: planned.kind,
          purpose: planned.metadata?.purpose,
          section: planned.metadata?.section,
          style: planned.metadata?.style ?? params.settings.style,
          prompt: planned.prompt,
          provider:
            generated?.status === "generated"
              ? params.provider ?? "unknown"
              : "fallback-svg",
        },
      });
    }
  } catch (error) {
    console.error("AI Real Images: persist failed", error);
  }
}
