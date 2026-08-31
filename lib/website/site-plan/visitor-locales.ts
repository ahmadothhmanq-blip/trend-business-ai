import type { SitePlan } from "@/lib/website/site-plan/types";
import {
  normalizeGlsGenerationLanguage,
  PRIMARY_SITE_LANGUAGE,
} from "@/lib/language-platform/generation/options";
import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

export type VisitorLocaleConfig = {
  enabled: boolean;
  /** Primary visitor locale — always English at `/w/{slug}`. */
  primaryLocale: string;
  /** Content generation language (may differ from primary URL locale). */
  contentLocale?: string;
  /** Additional visitor locales under `/w/{slug}/{code}`. */
  alternates: string[];
  hreflang: Array<{ locale: string; href: string }>;
};

/** Build visitor locale config when multi-language capability is requested. */
export function buildVisitorLocaleConfig(params: {
  enabled?: boolean;
  /** Language the site content was generated in — added to alternates when not English. */
  contentLanguage?: string;
  extraLocales?: string[];
}): VisitorLocaleConfig {
  const enabled = Boolean(params.enabled);
  const primary = PRIMARY_SITE_LANGUAGE;
  const content = normalizeGlsGenerationLanguage(
    params.contentLanguage ?? primary,
  );

  let alternates: string[] = [];
  if (enabled) {
    alternates = params.extraLocales?.length
      ? params.extraLocales.filter((l) => l !== primary)
      : [];

    if (content !== primary && !alternates.includes(content)) {
      alternates = [content, ...alternates.filter((l) => l !== content)];
    }
  }

  return {
    enabled,
    primaryLocale: primary,
    contentLocale: content !== primary ? content : undefined,
    alternates,
    hreflang: [],
  };
}

function localeToHreflang(language: string): string {
  const resolved = resolveLocaleFromLanguage(language);
  return resolved.htmlLang || language.toLowerCase().slice(0, 2);
}

function localePathSuffix(language: string, primaryLanguage: string): string {
  if (language === primaryLanguage) return "";
  return `/${localeToHreflang(language)}`;
}

/** Absolute hreflang URLs for a published /w/{slug} site. */
export function buildPublishedHreflangEntries(params: {
  publicBaseUrl: string;
  config: VisitorLocaleConfig;
}): Array<{ locale: string; href: string }> {
  const { config } = params;
  if (!config.enabled) return [];

  const base = params.publicBaseUrl.replace(/\/$/, "");
  const locales = [config.primaryLocale, ...config.alternates];
  const entries = locales.map((language) => ({
    locale: localeToHreflang(language),
    href: `${base}${localePathSuffix(language, config.primaryLocale)}`,
  }));

  entries.push({ locale: "x-default", href: base });
  return entries;
}

export function resolveVisitorLocaleConfigFromProject(
  project: GeneratedWebsiteProject | null | undefined,
): VisitorLocaleConfig | null {
  if (!project) return null;
  if (project.sitePlan?.visitorLocales?.enabled) {
    return {
      ...project.sitePlan.visitorLocales,
      primaryLocale: PRIMARY_SITE_LANGUAGE,
    };
  }
  if (project.settings?.visitorLocales === "enabled") {
    return buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: project.sitePlan?.language ?? project.language,
    });
  }
  return null;
}

export function applyVisitorLocalesToSitePlan(
  plan: SitePlan,
  config: VisitorLocaleConfig,
): SitePlan {
  if (!config.enabled) return plan;
  const caps = new Set(plan.capabilities);
  caps.add("multi-language");
  return {
    ...plan,
    capabilities: [...caps],
    visitorLocales: {
      ...config,
      primaryLocale: PRIMARY_SITE_LANGUAGE,
    },
  };
}
