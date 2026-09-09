import {
  getWebAppUiTranslationPack,
  hasCompleteWebAppUiTranslationPack,
} from "@/lib/ai/webapp-i18n/packs";
import type {
  WebAppEntityDictionary,
  WebAppI18nDictionary,
} from "@/lib/ai/webapp-i18n/keys";
import {
  isGlsGenerationLanguage,
  normalizeGlsGenerationLanguage,
  resolveGlsGenerationLanguageOption,
  PRIMARY_SITE_LANGUAGE,
} from "@/lib/language-platform/generation/options";

export type ResolvedWebAppLocale = {
  language: string;
  localeCode: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
  nativeName: string;
  messages: WebAppI18nDictionary;
  entities: WebAppEntityDictionary;
  defaultMessages: WebAppI18nDictionary;
  defaultEntities: WebAppEntityDictionary;
  /** True when the requested language had no complete pack and English was used. */
  fellBackToDefault: boolean;
};

export type WebAppLocaleMeta = {
  language: string;
  localeCode: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
  nativeName: string;
};

function isExplicitEnglishGenerationRequest(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (/^(en|english)$/i.test(trimmed)) return true;
  if (!isGlsGenerationLanguage(trimmed)) return false;
  return normalizeGlsGenerationLanguage(trimmed) === PRIMARY_SITE_LANGUAGE;
}

/**
 * Whether the request may use its normalized language's UI pack.
 * Unknown / unsupported languages (including unsupported RTL) must not
 * silently inherit English pack metadata as if English was selected.
 */
export function canUseWebAppUiPackForRequest(language?: string | null): boolean {
  const raw = (language ?? "").trim();
  if (!raw) return true;
  const normalized = normalizeGlsGenerationLanguage(raw);
  if (!hasCompleteWebAppUiTranslationPack(normalized)) return false;
  if (normalized === PRIMARY_SITE_LANGUAGE) {
    return isExplicitEnglishGenerationRequest(raw);
  }
  return true;
}

/**
 * Locale chrome (lang/dir/code) for a supported UI pack language only.
 * Unsupported languages return null — callers must fall back completely.
 *
 * RTL is applied only when the language both (1) has a complete UI pack and
 * (2) is registered as RTL in GLS.
 */
export function getWebAppLocaleMeta(language?: string | null): WebAppLocaleMeta | null {
  const normalized = normalizeGlsGenerationLanguage(language);
  if (!hasCompleteWebAppUiTranslationPack(normalized)) return null;
  const option = resolveGlsGenerationLanguageOption(normalized);
  const localeCode = String(
    option.localeCode === "bilingual" ? "en" : option.localeCode,
  );
  return {
    language: normalized,
    localeCode,
    htmlLang: localeCode,
    dir: resolveWebAppTextDirection(normalized),
    nativeName: option.nativeName,
  };
}

/**
 * Text direction for generated apps.
 * Returns "rtl" only for fully supported UI-pack languages that are RTL.
 * Everything else (including unsupported RTL world languages) is "ltr".
 */
export function resolveWebAppTextDirection(
  language?: string | null,
): "ltr" | "rtl" {
  const normalized = normalizeGlsGenerationLanguage(language);
  if (!hasCompleteWebAppUiTranslationPack(normalized)) return "ltr";
  const option = resolveGlsGenerationLanguageOption(normalized);
  return option.dir === "rtl" ? "rtl" : "ltr";
}

/** True when language has a complete pack and resolves to RTL. */
export function isWebAppSupportedRtlLanguage(language?: string | null): boolean {
  return resolveWebAppTextDirection(language) === "rtl";
}

/**
 * Resolve generation language → locale metadata + message packs.
 *
 * Single-language contract: the declared language, htmlLang, dir, and active
 * UI dictionary always belong to the same pack. Unsupported languages
 * (including unsupported RTL languages) fall back completely to English LTR.
 */
export function resolveWebAppLocale(language?: string | null): ResolvedWebAppLocale {
  const englishPack = getWebAppUiTranslationPack(PRIMARY_SITE_LANGUAGE)!;
  const englishMeta = getWebAppLocaleMeta(PRIMARY_SITE_LANGUAGE)!;

  if (canUseWebAppUiPackForRequest(language)) {
    const requested = normalizeGlsGenerationLanguage(language);
    const pack = getWebAppUiTranslationPack(requested)!;
    const meta = getWebAppLocaleMeta(requested)!;
    return {
      ...meta,
      messages: pack.messages,
      entities: pack.entities,
      defaultMessages: englishPack.messages,
      defaultEntities: englishPack.entities,
      fellBackToDefault: false,
    };
  }

  return {
    ...englishMeta,
    messages: englishPack.messages,
    entities: englishPack.entities,
    defaultMessages: englishPack.messages,
    defaultEntities: englishPack.entities,
    fellBackToDefault: true,
  };
}

export function interpolateMessage(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? `{${key}}` : String(value);
  });
}

/** Host-side translate used when baking localized literals is required. */
export function translateWebAppMessage(
  locale: ResolvedWebAppLocale,
  key: keyof WebAppI18nDictionary,
  params?: Record<string, string | number>,
): string {
  const raw =
    locale.messages[key] ??
    locale.defaultMessages[key] ??
    locale.defaultMessages["meta.appFallbackName"];
  return interpolateMessage(raw, params);
}

export function translateWebAppEntity(
  locale: ResolvedWebAppLocale,
  entity: string,
): string {
  const key = `entity.${entity}` as keyof WebAppI18nDictionary;
  return (
    locale.messages[key] ??
    locale.entities[entity as keyof typeof locale.entities] ??
    locale.defaultMessages[key] ??
    locale.defaultEntities[entity as keyof typeof locale.defaultEntities] ??
    entity
  );
}
