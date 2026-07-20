/**
 * Brand Identity integration for App Builder (shared brand-identity helpers only).
 */

import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  AppBrandState,
  AppDesignTokens,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";

export type BrandKitInput = {
  brandIdentityId?: string | null;
  name: string;
  logoUrl?: string | null;
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  surface?: string;
  displayFont?: string;
  bodyFont?: string;
};

export function brandKitFromIdentityBrief(brand: BrandIdentityBrief): BrandKitInput {
  return {
    brandIdentityId: brand.id || undefined,
    name: brand.brandName,
    logoUrl: null,
    primary: brand.colors.primary,
    secondary: brand.colors.secondary,
    accent: brand.colors.accent,
    background: brand.colors.background,
    foreground: brand.colors.foreground,
    surface: brand.colors.surface,
    displayFont: brand.typography.headingFont,
    bodyFont: brand.typography.bodyFont,
  };
}

export function applyBrandKitToModel(
  model: StructuredAppModel,
  kit: BrandKitInput,
): StructuredAppModel {
  const tokens: AppDesignTokens = {
    ...model.brand.tokens,
    ...(kit.primary ? { primary: kit.primary } : {}),
    ...(kit.secondary ? { secondary: kit.secondary } : {}),
    ...(kit.accent ? { accent: kit.accent } : {}),
    ...(kit.background ? { background: kit.background } : {}),
    ...(kit.foreground ? { foreground: kit.foreground } : {}),
    ...(kit.surface ? { surface: kit.surface } : {}),
    ...(kit.displayFont ? { headingFont: kit.displayFont } : {}),
    ...(kit.bodyFont ? { bodyFont: kit.bodyFont } : {}),
  };

  const brand: AppBrandState = {
    businessName: kit.name || model.brand.businessName,
    logoUrl: kit.logoUrl !== undefined ? kit.logoUrl : model.brand.logoUrl,
    brandIdentityId:
      kit.brandIdentityId !== undefined
        ? kit.brandIdentityId
        : model.brand.brandIdentityId,
    tokens,
  };

  return {
    ...model,
    brand,
    settings: {
      ...model.settings,
      appName: kit.name || model.settings.appName,
    },
    updatedAt: new Date().toISOString(),
    version: model.version + 1,
  };
}

/** CSS variables string for preview / generated apps. */
export function brandTokensToCssVars(tokens: AppDesignTokens): string {
  return [
    `--app-primary: ${tokens.primary};`,
    `--app-secondary: ${tokens.secondary};`,
    `--app-accent: ${tokens.accent};`,
    `--app-bg: ${tokens.background};`,
    `--app-fg: ${tokens.foreground};`,
    `--app-surface: ${tokens.surface};`,
    `--app-success: ${tokens.success};`,
    `--app-warning: ${tokens.warning};`,
    `--app-danger: ${tokens.danger};`,
    `--app-font-heading: ${tokens.headingFont}, system-ui, sans-serif;`,
    `--app-font-body: ${tokens.bodyFont}, system-ui, sans-serif;`,
    `--app-radius: ${tokens.radius};`,
  ].join("\n");
}
