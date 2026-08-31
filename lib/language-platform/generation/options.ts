import type { SupportedLocale } from "@/lib/i18n/config";
import type { GlsServiceId } from "@/lib/language-platform/core/types";
import {
  getGlsWorldLanguageRegistry,
  type GlsWorldLanguage,
} from "@/lib/language-platform/registry/languages";

/** Value stored on generations / projects — matches `LocaleDefinition.aiLanguage` or a special token. */
export type GlsGenerationLanguageValue = string;

export type GlsGenerationLanguageOption = {
  /** Stored value — e.g. "English", "Arabic", "Simplified Chinese". */
  value: GlsGenerationLanguageValue;
  localeCode: SupportedLocale | "bilingual";
  nativeName: string;
  dir: "ltr" | "rtl";
  /** Not part of the world-language registry (e.g. Bilingual). */
  special?: boolean;
};

export type GlsGenerationLanguageSlug = string;

const SPECIAL_GENERATION_LANGUAGES: readonly GlsGenerationLanguageOption[] = [
  {
    value: "Bilingual",
    localeCode: "bilingual",
    nativeName: "Bilingual (Arabic + English)",
    dir: "ltr",
    special: true,
  },
] as const;

/** Services that expose the Bilingual output option. */
const BILINGUAL_SERVICE_IDS = new Set<GlsServiceId>([
  "website-builder",
  "landing-builder",
]);

/** Legacy stored values → canonical GLS generation language. */
const GENERATION_LANGUAGE_ALIASES: Record<string, GlsGenerationLanguageValue> = {
  chinese: "Simplified Chinese",
  "chinese (simplified)": "Simplified Chinese",
  "chinese (traditional)": "Traditional Chinese",
  en: "English",
  english: "English",
  ar: "Arabic",
  arabic: "Arabic",
  bilingual: "Bilingual",
  es: "Spanish",
  spanish: "Spanish",
  fr: "French",
  french: "French",
  de: "German",
  german: "German",
  it: "Italian",
  italian: "Italian",
  pt: "Portuguese",
  portuguese: "Portuguese",
  ja: "Japanese",
  japanese: "Japanese",
  ko: "Korean",
  korean: "Korean",
  hi: "Hindi",
  hindi: "Hindi",
  ru: "Russian",
  russian: "Russian",
  nl: "Dutch",
  dutch: "Dutch",
  sv: "Swedish",
  swedish: "Swedish",
  tr: "Turkish",
  turkish: "Turkish",
};

function worldLanguageToOption(lang: GlsWorldLanguage): GlsGenerationLanguageOption {
  return {
    value: lang.aiLanguage,
    localeCode: lang.code,
    nativeName: lang.nativeName,
    dir: lang.dir,
  };
}

let cachedWorldOptions: GlsGenerationLanguageOption[] | null = null;

/** All world languages from the GLS registry (30+). */
export function getGlsWorldGenerationLanguageOptions(): readonly GlsGenerationLanguageOption[] {
  if (!cachedWorldOptions) {
    cachedWorldOptions = getGlsWorldLanguageRegistry().map(worldLanguageToOption);
  }
  return cachedWorldOptions;
}

/** Special generation-only languages (not in the world registry). */
export function getGlsSpecialGenerationLanguageOptions(): readonly GlsGenerationLanguageOption[] {
  return SPECIAL_GENERATION_LANGUAGES;
}

/**
 * Generation language picker options for a service.
 * Website / landing builders include Bilingual; all others use world languages only.
 */
export function getGlsGenerationLanguageOptions(
  serviceId: GlsServiceId,
): readonly GlsGenerationLanguageOption[] {
  const world = getGlsWorldGenerationLanguageOptions();
  if (!BILINGUAL_SERVICE_IDS.has(serviceId)) {
    return world;
  }
  const bilingual = SPECIAL_GENERATION_LANGUAGES[0]!;
  const withoutEnglishArabicDupes = world.filter(
    (opt) => opt.value !== "Bilingual",
  );
  const english = withoutEnglishArabicDupes.find((o) => o.value === "English");
  const arabic = withoutEnglishArabicDupes.find((o) => o.value === "Arabic");
  const rest = withoutEnglishArabicDupes.filter(
    (o) => o.value !== "English" && o.value !== "Arabic",
  );
  return [
    ...(english ? [english] : []),
    ...(arabic ? [arabic] : []),
    bilingual,
    ...rest,
  ];
}

/** Stored values only — for `<select>` options and legacy constant arrays. */
export function getGlsGenerationLanguageValues(
  serviceId: GlsServiceId,
): readonly GlsGenerationLanguageValue[] {
  return getGlsGenerationLanguageOptions(serviceId).map((opt) => opt.value);
}

const valueIndex = new Map<string, GlsGenerationLanguageOption>();

function rebuildValueIndex(): void {
  valueIndex.clear();
  for (const opt of getGlsWorldGenerationLanguageOptions()) {
    valueIndex.set(opt.value.toLowerCase(), opt);
  }
  for (const opt of SPECIAL_GENERATION_LANGUAGES) {
    valueIndex.set(opt.value.toLowerCase(), opt);
  }
}

function getOptionByValue(value: string): GlsGenerationLanguageOption | undefined {
  if (valueIndex.size === 0) rebuildValueIndex();
  return valueIndex.get(value.toLowerCase());
}

/** Slug for i18n keys — `constants.gls.languages.{slug}`. */
export function glsGenerationLanguageToSlug(value: string): GlsGenerationLanguageSlug {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Default i18n namespace for generation language labels. */
export const GLS_GENERATION_LANGUAGE_I18N_NS = "constants.gls.languages";

/** Canonical primary language for visitor URLs, hreflang default, and platform fallbacks. */
export const PRIMARY_SITE_LANGUAGE: GlsGenerationLanguageValue = "English";

/**
 * Resolves legacy / alias values to a canonical generation language.
 * Falls back to English when unknown.
 */
export function normalizeGlsGenerationLanguage(
  value?: string | null,
): GlsGenerationLanguageValue {
  const raw = (value ?? "").trim();
  if (!raw) return PRIMARY_SITE_LANGUAGE;

  const alias = GENERATION_LANGUAGE_ALIASES[raw.toLowerCase()];
  if (alias) return alias;

  const direct = getOptionByValue(raw);
  if (direct) return direct.value;

  const registry = getGlsWorldLanguageRegistry();
  const byName = registry.find(
    (lang) =>
      lang.name.toLowerCase() === raw.toLowerCase() ||
      lang.nativeName.toLowerCase() === raw.toLowerCase() ||
      lang.code.toLowerCase() === raw.toLowerCase(),
  );
  if (byName) return byName.aiLanguage;

  return PRIMARY_SITE_LANGUAGE;
}

export function isGlsGenerationLanguage(value?: string | null): boolean {
  const raw = (value ?? "").trim();
  if (!raw) return false;

  const lower = raw.toLowerCase();
  if (GENERATION_LANGUAGE_ALIASES[lower]) return true;
  if (getOptionByValue(raw)) return true;

  const registry = getGlsWorldLanguageRegistry();
  return registry.some(
    (lang) =>
      lang.aiLanguage.toLowerCase() === lower ||
      lang.name.toLowerCase() === lower ||
      lang.nativeName.toLowerCase() === lower ||
      lang.code.toLowerCase() === lower,
  );
}

export function resolveGlsGenerationLanguageOption(
  value?: string | null,
): GlsGenerationLanguageOption {
  const normalized = normalizeGlsGenerationLanguage(value);
  return (
    getOptionByValue(normalized) ?? {
      value: PRIMARY_SITE_LANGUAGE,
      localeCode: "en",
      nativeName: "English",
      dir: "ltr",
    }
  );
}
