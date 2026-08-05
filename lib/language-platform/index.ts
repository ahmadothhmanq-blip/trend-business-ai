/**
 * Global Language System (GLS)
 *
 * Official centralized language architecture for Trend Business AI.
 * Isolated, backward compatible, framework agnostic.
 *
 * @see lib/language-platform/docs/ARCHITECTURE.md
 */

export {
  GLS_PACKAGE_ID,
  GLS_SPEC_VERSION,
  GLS_PHASE,
  GLS_PROJECT_SETTING_CONTEXT_HASH,
  GLS_PROJECT_SETTING_PLATFORM_VERSION,
} from "@/lib/language-platform/constants";

export * from "@/lib/language-platform/core/types";
export { resolveGlsLanguageContext } from "@/lib/language-platform/context/resolve-context";
export {
  GLS_LANGUAGE_LIFECYCLE,
  getLifecyclePhase,
  contextToSettingsPatch,
} from "@/lib/language-platform/lifecycle";
export {
  getGlsWorldLanguageRegistry,
  resolveGlsWorldLanguage,
  resolveScriptFamilyFromLocale,
} from "@/lib/language-platform/registry/languages";
export { GLS_SERVICE_REGISTRY, getGlsServiceDefinition } from "@/lib/language-platform/registry/services";
export { GLS_TYPOGRAPHY_PROFILES } from "@/lib/language-platform/typography/profiles";
export {
  resolveTypographyProfile,
  resolveTypographyProfileId,
  resolveTypographyFallbackChain,
} from "@/lib/language-platform/typography/resolve";
export {
  resolveDirectionAdaptations,
  resolveDocumentDirection,
  emitDirectionCssVariables,
} from "@/lib/language-platform/direction/resolve";
export {
  resolveLocaleFormatting,
  formatGlsNumber,
  formatGlsCurrency,
  formatGlsDate,
  pluralizeGls,
} from "@/lib/language-platform/locale/resolve";
export { resolveAiLanguage, buildAiLanguageDirective } from "@/lib/language-platform/ai/resolve";
export { resolveSeoLocalization, buildHreflangAlternates } from "@/lib/language-platform/seo/resolve";
export * from "@/lib/language-platform/translation/types";
export {
  GLS_TRANSLATION_NAMESPACE_ROOTS,
  flattenTranslationMessages,
  validateTranslationContract,
  detectMissingTranslationKeys,
} from "@/lib/language-platform/translation/validate";
export { bridgePlatformLocale, enrichPlatformContext } from "@/lib/language-platform/bridges/platform-bridge";
export { bridgeToTbdpLanguageContext, glsToTbdpTypographyProfile } from "@/lib/language-platform/bridges/tbdp-bridge";
export { bridgeWebsiteLocale, enrichWebsiteContext, resolveGlsWebsiteLocale } from "@/lib/language-platform/bridges/website-bridge";
export {
  validateGlsLanguageResolverInput,
  validateGlsLanguageContext,
} from "@/lib/language-platform/validation/validate";
