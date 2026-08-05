import type {
  TbdpBuilderBridgeInput,
  TbdpBuilderLifecyclePhase,
  TbdpLifecycleEvent,
} from "@/lib/design-platform/integration/core/types";
import {
  createBuilderLifecycleEvent,
  enrichBuilderInput,
  isTbdpEnrichmentEnabled,
} from "@/lib/design-platform/integration/bridges/builder-bridge";
import { TBDP_INTEGRATION_VERSION } from "@/lib/design-platform/integration/constants";
import { resolveAiWebsiteDesign } from "@/lib/design-platform/integration/bridges/ai-bridge";
import { resolveTemplateBridge } from "@/lib/design-platform/integration/bridges/template-bridge";

export type TbdpLifecycleHandler = (event: TbdpLifecycleEvent) => void;

/**
 * Official TBDP ↔ Website Builder lifecycle coordinator.
 * All hooks are additive — builder behavior unchanged when handlers are omitted.
 */
export class TbdpBuilderLifecycle {
  private handlers: TbdpLifecycleHandler[] = [];

  onEvent(handler: TbdpLifecycleHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  private emit(event: TbdpLifecycleEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  preGeneration(input: TbdpBuilderBridgeInput): ReturnType<typeof enrichBuilderInput> {
    if (!isTbdpEnrichmentEnabled(input)) {
      return {
        enrichment: { tbdpIntegrationVersion: TBDP_INTEGRATION_VERSION },
      };
    }
    const result = enrichBuilderInput(input);
    this.emit(createBuilderLifecycleEvent("pre-generation", input));
    return result;
  }

  templateSelected(input: TbdpBuilderBridgeInput & { templateId: string }) {
    const bridge = resolveTemplateBridge({
      templateId: input.templateId,
      sectorId: input.sectorId,
      industryId: input.industryId,
      language: input.language,
    });
    this.emit({
      phase: "template-selected",
      timestamp: new Date().toISOString(),
      designContext: bridge.designContext,
    });
    return bridge;
  }

  postApply(input: TbdpBuilderBridgeInput) {
    this.emit(createBuilderLifecycleEvent("post-apply", input));
  }

  preview(input: TbdpBuilderBridgeInput) {
    this.emit(createBuilderLifecycleEvent("preview", input));
  }

  aiGenerate(input: Parameters<typeof resolveAiWebsiteDesign>[0]) {
    return resolveAiWebsiteDesign(input);
  }
}

export const tbdpBuilderLifecycle = new TbdpBuilderLifecycle();

export function runTbdpLifecyclePhase(
  phase: TbdpBuilderLifecyclePhase,
  input: TbdpBuilderBridgeInput,
): TbdpLifecycleEvent {
  return createBuilderLifecycleEvent(phase, input);
}
