"use client";

import type { MarketplaceTemplate } from "@/lib/ai-core/template-marketplace";
import { TemplatesPanel, TemplatesRail } from "@/components/dashboard/website-builder/templates-panel";

export type TemplateUsePayload = {
  templateId: string;
  marketplaceTemplateId: string;
  industry: string;
  style: string;
  designPreset: string;
  components: string[];
  designSystem: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    displayFont: string;
    bodyFont: string;
  };
  name: string;
  description: string;
  tagline: string;
  features: string[];
  layoutType: string;
};

/** @deprecated Marketplace templates removed — kept for generation handoff compatibility. */
export function buildTemplateUsePayload(
  tpl: MarketplaceTemplate,
): TemplateUsePayload {
  return {
    templateId: tpl.premiumTemplateId,
    marketplaceTemplateId: tpl.id,
    industry: tpl.industry,
    style: tpl.style,
    designPreset: tpl.designPreset,
    components: tpl.previewSections.map((s) => s.key),
    designSystem: {
      primary: tpl.colorSystem.primary,
      secondary: tpl.colorSystem.secondary,
      accent: tpl.colorSystem.accent,
      background: tpl.colorSystem.background,
      foreground: tpl.colorSystem.foreground,
      displayFont: tpl.typography.display,
      bodyFont: tpl.typography.body,
    },
    name: tpl.name,
    description: tpl.description,
    tagline: tpl.tagline,
    features: tpl.features,
    layoutType: tpl.layoutType,
  };
}

export function TemplateSelectionPanel(_props: {
  selectedMarketplaceId?: string | null;
  disabled?: boolean;
  activeGenerationId?: string | null;
  onUseTemplate?: (payload: TemplateUsePayload) => void | Promise<void>;
  onCatalogLoaded?: (templates: MarketplaceTemplate[]) => void;
}) {
  return <TemplatesPanel />;
}

export function TemplateSelectionRail(_props: {
  templates: MarketplaceTemplate[];
  selectedMarketplaceId?: string | null;
  disabled?: boolean;
  onOpenDetails?: (tpl: MarketplaceTemplate) => void;
}) {
  return <TemplatesRail />;
}
