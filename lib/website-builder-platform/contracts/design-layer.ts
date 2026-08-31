/**
 * Design Layer — layout, styling, motion, and component composition only.
 * Must never own business copy, images, SEO, CTAs, or navigation labels.
 */

import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type { DesignSystem } from "@/plugins/website/layers/types";

export const DESIGN_LAYER_VERSION = "1.0.0";

export type DesignTheme = {
  id: string;
  paletteId: string;
  typographyId: string;
  motionPreset: string;
  layoutId: string;
  spacingScale: string;
  borderRadius: string;
};

export type DesignComponentRef = {
  id: string;
  role: string;
  variantId?: string;
  region: string;
};

/**
 * Design-only payload — swappable without touching business identity.
 */
export type WebsiteDesignPack = {
  version: typeof DESIGN_LAYER_VERSION;
  templatePackageId: string;
  bundle: TemplateV2PackageBundle;
  blueprint: WebsiteBlueprint | null;
  designSystem?: DesignSystem | null;
  theme: DesignTheme;
  components: DesignComponentRef[];
  presentationHash: string;
};

export type DesignLayerInput = {
  templatePackageId: string;
  language?: string | null;
  industryHint?: string | null;
  seed?: string | null;
};
