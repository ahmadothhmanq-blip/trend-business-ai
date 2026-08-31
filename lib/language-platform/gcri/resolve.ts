import {
  GCRI_CATALOG,
  GCRI_DEFAULT_COUNTRY_BY_LANGUAGE,
} from "@/lib/language-platform/gcri/catalog";
import type {
  GcriCountryOption,
  GcriProfile,
  GcriResolveInput,
} from "@/lib/language-platform/gcri/types";
import { normalizeGlsGenerationLanguage } from "@/lib/language-platform/generation/options";

function normalizeCountryCode(value?: string | null): string | null {
  const raw = value?.trim().toUpperCase();
  if (!raw) return null;
  if (/^[A-Z]{2}$/.test(raw)) return raw;
  const byName = GCRI_CATALOG.find(
    (row) => row.countryName.toLowerCase() === value!.trim().toLowerCase(),
  );
  return byName?.countryCode ?? null;
}

function normalizeLanguage(value?: string | null): string {
  return normalizeGlsGenerationLanguage(value);
}

export function defaultGcriCountryForLanguage(language?: string | null): string {
  const normalized = normalizeLanguage(language);
  return GCRI_DEFAULT_COUNTRY_BY_LANGUAGE[normalized] ?? "US";
}

export function isGcriCountryCode(value?: string | null): boolean {
  const code = normalizeCountryCode(value);
  if (!code) return false;
  return GCRI_CATALOG.some((row) => row.countryCode === code);
}

export function getGcriCountriesForLanguage(language?: string | null): GcriCountryOption[] {
  const normalized = normalizeLanguage(language);
  const catalogLanguage = normalized === "Bilingual" ? "Arabic" : normalized;
  const rows = GCRI_CATALOG.filter((row) => row.language === catalogLanguage);
  const seen = new Set<string>();
  const options: GcriCountryOption[] = [];
  const source = rows.length
    ? rows
    : GCRI_CATALOG.filter((r) => r.language === "English");
  for (const row of source) {
    if (seen.has(row.countryCode)) continue;
    seen.add(row.countryCode);
    options.push({
      countryCode: row.countryCode,
      countryName: row.countryName,
      region: row.region,
    });
  }
  return options;
}

export function listGcriCountryCodes(): string[] {
  return [...new Set(GCRI_CATALOG.map((row) => row.countryCode))].sort();
}

/**
 * Resolve order (never uses platform UI locale):
 * 1. Explicit country
 * 2. Header / cookie
 * 3. Default country for the generation language
 */
export function resolveGcriCountry(input: GcriResolveInput): string {
  const language = normalizeLanguage(input.language);
  const allowed = new Set(
    getGcriCountriesForLanguage(language).map((row) => row.countryCode),
  );

  const candidates = [input.country, input.header, input.cookie];
  for (const candidate of candidates) {
    const code = normalizeCountryCode(candidate);
    if (code && allowed.has(code)) return code;
  }

  return defaultGcriCountryForLanguage(language);
}

export function resolveGcriProfile(input: {
  language?: string | null;
  country?: string | null;
}): GcriProfile {
  const language = normalizeLanguage(input.language);
  const country = resolveGcriCountry({ language, country: input.country });
  const exact = GCRI_CATALOG.find(
    (row) => row.countryCode === country && row.language === language,
  );
  if (exact) return exact;

  const byCountry = GCRI_CATALOG.find((row) => row.countryCode === country);
  if (byCountry) return byCountry;

  const fallbackCountry = defaultGcriCountryForLanguage(language);
  return (
    GCRI_CATALOG.find(
      (row) => row.countryCode === fallbackCountry && row.language === language,
    ) ??
    GCRI_CATALOG.find((row) => row.countryCode === "US" && row.language === "English")!
  );
}

export function assertGcriCurrencyMatchesCountry(profile: GcriProfile): boolean {
  const sameCountry = GCRI_CATALOG.filter((row) => row.countryCode === profile.countryCode);
  return sameCountry.every((row) => row.currencyCode === profile.currencyCode);
}
