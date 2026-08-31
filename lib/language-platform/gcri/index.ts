export type { GcriProfile, GcriCountryOption, GcriResolveInput } from "@/lib/language-platform/gcri/types";
export { GCRI_CATALOG, GCRI_DEFAULT_COUNTRY_BY_LANGUAGE } from "@/lib/language-platform/gcri/catalog";
export {
  assertGcriCurrencyMatchesCountry,
  defaultGcriCountryForLanguage,
  getGcriCountriesForLanguage,
  isGcriCountryCode,
  listGcriCountryCodes,
  resolveGcriCountry,
  resolveGcriProfile,
} from "@/lib/language-platform/gcri/resolve";
export {
  GCRI_COUNTRY_COOKIE,
  GCRI_COUNTRY_HEADER,
  GCRI_COUNTRY_STORAGE_KEY,
  gcriPayload,
  getInitialGcriCountry,
  parseGcriCountryCookie,
  persistGcriCountry,
  readPersistedGcriCountry,
  resolveRequestGcri,
} from "@/lib/language-platform/gcri/service";
export { buildGcriDirective } from "@/lib/language-platform/gcri/directive";
export {
  bindGcriContext,
  getGcriContext,
  runWithGcriContext,
} from "@/lib/language-platform/gcri/context.server";
