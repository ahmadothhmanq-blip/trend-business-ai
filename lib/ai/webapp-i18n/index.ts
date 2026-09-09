export type {
  WebAppEntityDictionary,
  WebAppEntityKey,
  WebAppI18nDictionary,
  WebAppI18nKey,
} from "@/lib/ai/webapp-i18n/keys";
export {
  WEBAPP_ENTITY_KEYS,
  WEBAPP_I18N_KEYS,
  webAppEntityMessageKey,
} from "@/lib/ai/webapp-i18n/keys";
export {
  buildWebAppI18nFiles,
  getWebAppI18nScaffoldPaths,
} from "@/lib/ai/webapp-i18n/emit-files";
export {
  findCrossLanguageMessageKeys,
  findMissingWebAppEntityTranslations,
  findWebAppSelectableLanguagePackIssues,
  detectWebAppUiDictionaryLanguage,
  getWebAppUiTranslationPack,
  getWebAppUiTranslationPackLanguages,
  hasCompleteWebAppUiTranslationPack,
  isCompleteWebAppEntityDictionary,
  isCompleteWebAppUiDictionary,
  WEBAPP_UI_LANGUAGE_PROBE_KEYS,
  WEBAPP_UI_TRANSLATION_PACKS,
} from "@/lib/ai/webapp-i18n/packs";
export {
  canUseWebAppUiPackForRequest,
  getWebAppLocaleMeta,
  interpolateMessage,
  isWebAppSupportedRtlLanguage,
  resolveWebAppLocale,
  resolveWebAppTextDirection,
  translateWebAppEntity,
  translateWebAppMessage,
  type ResolvedWebAppLocale,
  type WebAppLocaleMeta,
} from "@/lib/ai/webapp-i18n/resolve-locale";
export {
  localizeAppTemplateLabel,
  localizeAppTemplateRole,
  resolveAppScreenDisplayRef,
  resolveLocaleForAppModel,
} from "@/lib/ai/webapp-i18n/localize-template";
