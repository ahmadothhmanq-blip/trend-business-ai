/**
 * Unified Brand Identity Engine — merges plugins/brand-identity + lib/ai-core/brand-identity.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  brandInputToBrief,
  createBrandDesignerAdapter,
} from "@/lib/ai-core/adapters/brand-designer";
import { analyzeBrandIdentity } from "@/lib/ai-core/brand-identity/analyze";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import {
  applyQualityToModel,
  validateBrandOutput,
} from "@/lib/ai-core/brand-studio/quality";
import {
  brandOutputToModel,
  briefToModelHints,
  mergeModel,
} from "@/lib/ai-core/brand-studio/model";
import type { BrandIdentityModel } from "@/lib/ai-core/brand-studio/types";
import type {
  BrandIdentityPluginInput,
  BrandOutput,
  BrandProgressEvent,
} from "@/plugins/brand-identity/types";

export type BrandEngineResult = {
  output: BrandOutput;
  model: BrandIdentityModel;
  intelligence: BrandIdentityBrief;
  progressEvents: BrandProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export type BrandEngineOptions = {
  onProgress?: (event: string) => void;
  templateId?: string;
  partialDeliverables?: string[];
  existingModel?: BrandIdentityModel;
};

export class BrandIdentityEngine {
  async generate(
    input: BrandIdentityPluginInput,
    options: BrandEngineOptions = {},
  ): Promise<BrandEngineResult> {
    const started = Date.now();
    const progressEvents: string[] = [];
    const emit = (msg: string) => {
      progressEvents.push(msg);
      options.onProgress?.(msg);
    };

    const resolved = providerManager.resolve(getDefaultTextProvider());
    if (!resolved || !providerManager.isConfigured(resolved)) {
      throw new Error(
        "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
      );
    }

    emit("[idea] Analyzing brand requirements...");
    const intelligence = analyzeBrandIdentity({
      industryId: input.industry || null,
      theme: input.brandPersonality,
      preferredStyle: input.brandType,
    });
    emit(`[strategy] Intelligence preset: ${intelligence.presetId}`);

    const adapter = createBrandDesignerAdapter();
    const deliverables =
      options.partialDeliverables?.length
        ? options.partialDeliverables
        : input.deliverables;

    const result = await layerRunner.run(
      adapter,
      {
        brief: brandInputToBrief({
          ...input,
          deliverables,
          brandPersonality:
            input.brandPersonality || intelligence.strategy.brandPersonality,
        }),
      },
      {
        provider: resolved,
        onProgress: (msg) => emit(msg),
      },
    );

    const output = result.finalOutput ?? result.generation;
    const quality = validateBrandOutput(output);
    if (!quality.valid) {
      emit(`[quality] Validation issues: ${quality.issues.join("; ")}`);
    } else {
      emit(`[quality] Score ${quality.score}/100`);
    }

    let model = brandOutputToModel({
      output,
      input,
      analysis: {
        brandName: output.title,
        industry: input.industry,
        positioning: output.brandStrategy?.slice(0, 200) || intelligence.summary,
        targetAudience: input.targetAudience,
        competitors: [],
        differentiators: output.values,
        personality: input.brandPersonality,
        coreValues: output.values,
        emotionalAppeal: intelligence.reason,
      },
      plan: {
        mission: output.mission,
        vision: output.vision,
        values: output.values,
        voiceTone: output.voiceTone,
        colorPalette: output.colorPalette,
        typography: output.typography,
        deliverables,
        brandArchetype: intelligence.strategy.archetype,
      },
      templateId: options.templateId,
      presetId: intelligence.presetId,
    });

    const hints = briefToModelHints(intelligence);
    model = mergeModel(model, hints);
    if (options.existingModel) {
      model = mergeModel(options.existingModel, model);
    }
    model = applyQualityToModel(model);

    emit("[finalize] Brand identity compiled.");

    return {
      output,
      model,
      intelligence,
      progressEvents,
      usage: result.usage ?? emptyTokenUsage(),
      generationTimeMs: Date.now() - started,
      provider: result.provider,
    };
  }

  async regeneratePartial(
    input: BrandIdentityPluginInput,
    existing: BrandIdentityModel,
    deliverables: string[],
    options: BrandEngineOptions = {},
  ): Promise<BrandEngineResult> {
    return this.generate(
      { ...input, deliverables },
      { ...options, partialDeliverables: deliverables, existingModel: existing },
    );
  }
}

export const brandIdentityEngine = new BrandIdentityEngine();
