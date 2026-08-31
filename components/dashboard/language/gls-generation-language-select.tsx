"use client";

import { useMemo, useState } from "react";
import { dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { useTranslation } from "@/lib/i18n/client";
import type { GlsServiceId } from "@/lib/language-platform/core/types";
import {
  getGlsGenerationLanguageOptions,
  glsGenerationLanguageToSlug,
  GLS_GENERATION_LANGUAGE_I18N_NS,
  normalizeGlsGenerationLanguage,
} from "@/lib/language-platform/generation/options";
import { persistGlsGenerationLanguage } from "@/lib/language-platform/generation/service";
import {
  defaultGcriCountryForLanguage,
  getGcriCountriesForLanguage,
} from "@/lib/language-platform/gcri/resolve";
import {
  getInitialGcriCountry,
  persistGcriCountry,
} from "@/lib/language-platform/gcri/service";
import { cn } from "@/lib/utils";

type GlsGenerationLanguageSelectProps = {
  serviceId: GlsServiceId;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
};

export function formatGlsGenerationLanguageLabel(
  value: string,
  t: (key: string) => string,
  nativeName: string,
): string {
  const key = `${GLS_GENERATION_LANGUAGE_I18N_NS}.${glsGenerationLanguageToSlug(value)}`;
  const translated = t(key);
  return translated === key ? nativeName : translated;
}

export function GlsGenerationLanguageSelect({
  serviceId,
  value,
  onChange,
  className,
  id,
}: GlsGenerationLanguageSelectProps) {
  const { t } = useTranslation();
  const options = getGlsGenerationLanguageOptions(serviceId);
  const normalized = normalizeGlsGenerationLanguage(value);
  const countryOptions = useMemo(
    () => getGcriCountriesForLanguage(normalized),
    [normalized],
  );
  const [country, setCountry] = useState(() => getInitialGcriCountry(normalized));
  const selectedCountry = countryOptions.some((row) => row.countryCode === country)
    ? country
    : defaultGcriCountryForLanguage(normalized);

  return (
    <div className="space-y-2">
      <select
        id={id}
        value={normalized}
        onChange={(event) => {
          const nextLanguage = event.target.value;
          persistGlsGenerationLanguage(nextLanguage);
          const nextCountries = getGcriCountriesForLanguage(nextLanguage);
          const nextCountry = nextCountries.some((row) => row.countryCode === selectedCountry)
            ? selectedCountry
            : defaultGcriCountryForLanguage(nextLanguage);
          persistGcriCountry(nextCountry);
          setCountry(nextCountry);
          onChange(nextLanguage);
        }}
        className={cn(dashboardSelectClass, className)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-luxury-black">
            {formatGlsGenerationLanguageLabel(option.value, t, option.nativeName)}
          </option>
        ))}
      </select>
      <select
        value={selectedCountry}
        onChange={(event) => {
          persistGcriCountry(event.target.value);
          setCountry(event.target.value);
        }}
        className={cn(dashboardSelectClass, className)}
        aria-label={
          countryOptions.find((row) => row.countryCode === selectedCountry)?.countryName ??
          selectedCountry
        }
      >
        {countryOptions.map((option) => (
          <option key={option.countryCode} value={option.countryCode} className="bg-luxury-black">
            {option.countryName}
          </option>
        ))}
      </select>
    </div>
  );
}
