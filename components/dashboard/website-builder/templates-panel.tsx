"use client";

import {
  VisualSkinCatalogPanel,
  type VisualSkinCatalogPanelProps,
} from "@/components/dashboard/website-builder/visual-skin-catalog-panel";
import { getVisualSkin } from "@/lib/website/visual-skin/registry";

/** @deprecated Use VisualSkinCatalogPanel — "templates" are visual skins only. */
export type WebsiteStructureTemplateChoice = {
  skinId: string;
  label: string;
};

export type TemplatesPanelProps = Omit<VisualSkinCatalogPanelProps, "onSelect"> & {
  onSelect?: (choice: WebsiteStructureTemplateChoice) => void;
};

export function TemplatesPanel({
  onSelect,
  ...props
}: TemplatesPanelProps) {
  return (
    <VisualSkinCatalogPanel
      {...props}
      onSelect={(skinId) => {
        onSelect?.({
          skinId,
          label: getVisualSkin(skinId)?.label ?? skinId,
        });
      }}
    />
  );
}

export function TemplatesRail(props?: TemplatesPanelProps) {
  return <TemplatesPanel {...props} compact />;
}
