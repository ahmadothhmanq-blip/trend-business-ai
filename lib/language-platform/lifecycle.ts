import type { GlsLanguageContext, GlsLanguageLayer } from "@/lib/language-platform/core/types";

export type GlsLifecyclePhase = {
  layer: GlsLanguageLayer;
  label: string;
  description: string;
  resolves: Array<keyof GlsLanguageContext>;
};

/** Official language lifecycle — Platform → Generation → Template → Content → Preview → Export */
export const GLS_LANGUAGE_LIFECYCLE: readonly GlsLifecyclePhase[] = [
  {
    layer: "platform",
    label: "Platform Language",
    description: "Dashboard, settings, navigation, builder, editor, marketplace, documentation",
    resolves: ["platform"],
  },
  {
    layer: "generation",
    label: "Generation Language",
    description: "AI generation for website, app, landing, video, logo, brand, marketing, content",
    resolves: ["generation", "ai"],
  },
  {
    layer: "website",
    label: "Website Language",
    description: "Generated website language, RTL/LTR, typography, locale",
    resolves: ["website", "typography", "direction", "locale", "seo"],
  },
  {
    layer: "template",
    label: "Template Language",
    description: "Language-neutral templates — no hardcoded copy",
    resolves: ["template"],
  },
  {
    layer: "content",
    label: "Content Language",
    description: "LLM-authored or localized content packs",
    resolves: ["content"],
  },
  {
    layer: "preview",
    label: "Preview",
    description: "Preview inherits website + template + content context",
    resolves: ["website", "direction", "typography"],
  },
  {
    layer: "export",
    label: "Export",
    description: "Export inherits full context with locale metadata",
    resolves: ["website", "locale", "seo", "direction"],
  },
  {
    layer: "service",
    label: "Service Language",
    description: "Per-product independent language selection",
    resolves: ["service"],
  },
] as const;

export function getLifecyclePhase(layer: GlsLanguageLayer): GlsLifecyclePhase | undefined {
  return GLS_LANGUAGE_LIFECYCLE.find((p) => p.layer === layer);
}

export function contextToSettingsPatch(ctx: GlsLanguageContext): Record<string, string> {
  return {
    glsContextHash: ctx.meta.contextHash,
    glsPlatformVersion: ctx.meta.platformVersion,
    glsWebsiteLanguage: ctx.website.language,
    glsLocaleCode: ctx.website.localeCode,
    glsDirection: ctx.direction.direction,
    glsTypographyProfile: ctx.typography.profileId,
    glsTbdpTypographyProfile: ctx.typography.tbdpProfileId,
  };
}
