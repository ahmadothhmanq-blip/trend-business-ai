import { getLocaleDefinition, normalizeLocale } from "@/lib/i18n/config";
import type { GlsLanguageContext } from "@/lib/language-platform/core/types";

/** Bridge to platform i18n (lib/i18n) — dashboard, settings, navigation. */
export function bridgePlatformLocale(locale?: string | null) {
  const code = normalizeLocale(locale);
  const def = getLocaleDefinition(code);
  return {
    locale: code,
    direction: def.dir,
    aiLanguage: def.aiLanguage,
    htmlLang: def.htmlLang,
    nativeName: def.nativeName,
  };
}

export function enrichPlatformContext(ctx: GlsLanguageContext) {
  const platform = bridgePlatformLocale(ctx.platform.locale);
  return { ...ctx, platform: { ...ctx.platform, ...platform } };
}
