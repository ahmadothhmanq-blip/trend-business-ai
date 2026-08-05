import { createHash } from "node:crypto";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/config";
import { resolveGlsWebsiteLocale } from "@/lib/language-platform/bridges/website-bridge";
import { GLS_PHASE, GLS_SPEC_VERSION } from "@/lib/language-platform/constants";
import type {
  GlsLanguageContext,
  GlsLanguageResolverInput,
} from "@/lib/language-platform/core/types";
import { resolveAiLanguage } from "@/lib/language-platform/ai/resolve";
import { resolveDirectionAdaptations, resolveDocumentDirection } from "@/lib/language-platform/direction/resolve";
import { resolveLocaleFormatting } from "@/lib/language-platform/locale/resolve";
import {
  resolveGlsWorldLanguage,
  resolveScriptFamilyFromLocale,
} from "@/lib/language-platform/registry/languages";
import { resolveSeoLocalization } from "@/lib/language-platform/seo/resolve";
import { resolveTypographyProfile } from "@/lib/language-platform/typography/resolve";

function hashContext(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

/**
 * Resolves the unified Global Language Context.
 * Platform → Generation → Template → Content → Preview → Export
 */
export function resolveGlsLanguageContext(
  input: GlsLanguageResolverInput = {},
): GlsLanguageContext {
  const platformLocale = normalizeLocale(input.platformLocale ?? DEFAULT_LOCALE);
  const platformWorld = resolveGlsWorldLanguage(platformLocale);

  const websiteLanguage = input.websiteLanguage ?? platformWorld.aiLanguage;
  const siteLocale = resolveGlsWebsiteLocale(websiteLanguage);
  const direction = resolveDocumentDirection(
    input.direction,
    siteLocale.dir as "ltr" | "rtl",
  );
  const scriptFamily = resolveScriptFamilyFromLocale(siteLocale.localeCode);
  const typography = resolveTypographyProfile(scriptFamily, direction);

  const ai = resolveAiLanguage({
    generationLanguage: input.generationLanguage ?? websiteLanguage,
    websiteLanguage,
    templateLanguage: input.templateLanguage ?? websiteLanguage,
    contentLanguage: input.contentLanguage ?? websiteLanguage,
    promptLanguage: input.generationLanguage ?? websiteLanguage,
  });

  const locale = resolveLocaleFormatting(siteLocale.localeCode, {
    timezone: input.timezone,
    currencyCode: input.currencyCode,
  });

  const seo = resolveSeoLocalization({
    localeCode: siteLocale.localeCode,
    htmlLang: siteLocale.htmlLang,
  });

  const contextHash = hashContext([
    platformLocale,
    websiteLanguage,
    direction,
    typography.id,
    GLS_SPEC_VERSION,
  ]);

  const ctx: GlsLanguageContext = {
    meta: {
      platformPhase: GLS_PHASE,
      platformVersion: GLS_SPEC_VERSION,
      resolvedAt: new Date().toISOString(),
      contextHash,
    },
    platform: {
      locale: platformLocale,
      direction: platformWorld.dir,
      aiLanguage: platformWorld.aiLanguage,
    },
    generation: {
      language: ai.outputLanguage,
      promptLanguage: ai.promptLanguage,
      outputLanguage: ai.outputLanguage,
    },
    website: {
      language: websiteLanguage,
      localeCode: siteLocale.localeCode,
      htmlLang: siteLocale.htmlLang,
      direction,
      rtl: direction === "rtl",
    },
    template: {
      language: ai.templateLanguage,
      languageNeutral: true,
    },
    content: {
      language: ai.contentLanguage,
      usesLlmLocalization: ai.usesLlmLocalization,
    },
    typography: {
      scriptFamily,
      profileId: typography.id,
      tbdpProfileId: typography.tbdpProfileId,
      fontHint: siteLocale.fontHint,
    },
    direction: {
      direction,
      adaptations: resolveDirectionAdaptations(direction),
    },
    locale,
    seo,
    ai,
  };

  if (input.serviceId) {
    ctx.service = {
      serviceId: input.serviceId,
      language: input.serviceLanguage ?? websiteLanguage,
    };
  }

  return ctx;
}
