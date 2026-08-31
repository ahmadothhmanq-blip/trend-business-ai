/** Global Country & Regional Intelligence (GCRI) — extends GLS generation. */

export type GcriMeasurementSystem = "metric" | "imperial";
export type GcriHourCycle = "h12" | "h23";

export type GcriNumberFormat = {
  decimal: string;
  group: string;
  example: string;
};

export type GcriProfile = {
  countryCode: string;
  countryName: string;
  region: string;
  subregion: string;
  language: string;
  languageVariant: string;
  locale: string;
  currencyCode: string;
  currencyName: string;
  dateFormat: string;
  timeFormat: string;
  hourCycle: GcriHourCycle;
  measurementSystem: GcriMeasurementSystem;
  numberFormat: GcriNumberFormat;
  timezone: string;
  culturalNotes: string;
  marketingStyle: string;
  ctaStyle: string;
  businessStyle: string;
  seoLocale: string;
};

export type GcriCountryOption = {
  countryCode: string;
  countryName: string;
  region: string;
};

export type GcriResolveInput = {
  language?: string | null;
  country?: string | null;
  header?: string | null;
  cookie?: string | null;
};
