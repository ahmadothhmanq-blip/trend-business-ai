import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { PublishedSeoJson } from "@/lib/website/published-seo";
import { applyCmsToPublishHtml } from "@/lib/website/cms-inject";
import {
  buildStaticPreviewHtml,
  extractStaticPreviewHtml,
  sanitizePreviewHtml,
} from "@/lib/website/build-static-preview.server";
import { previewInputFromGeneration } from "@/lib/website/live-preview";
import {
  applyHtmlDirAttribute,
  applyHtmlLangAttribute,
  applySeoToPublicHtml,
  buildPublicRobotsTxt,
  buildPublicSitemapXml,
  hardenPublicSiteHtml,
} from "@/lib/website/public-site";
import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";
import {
  normalizeGlsGenerationLanguage,
  PRIMARY_SITE_LANGUAGE,
} from "@/lib/language-platform/generation/options";
import { buildHreflangLinkTags } from "@/lib/website/growth/hreflang-tags";
import {
  buildPublishedLanguageSwitcherHtml,
  injectLanguageSwitcherIntoHtml,
} from "@/lib/website/growth/language-switcher";
import {
  buildVisitorLocaleConfig,
  resolveVisitorLocaleConfigFromProject,
  type VisitorLocaleConfig,
} from "@/lib/website/site-plan/visitor-locales";
import {
  buildVisitorLocaleHtmlVariants,
  buildVisitorLocaleHtmlVariantsAsync,
  localizeHtmlForVisitorLocale,
} from "@/lib/website/visitor-locale/locale-content";
import { translateHtmlForLanguage } from "@/lib/website/visitor-locale/llm-translate";
import type { CmsEntry } from "@/lib/ai-core/website-management/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

function isGeneratedWebsiteProject(
  value: unknown,
): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

function resolveContentLanguage(
  visitorLocales: VisitorLocaleConfig | null | undefined,
  blueprint: GeneratedWebsiteProject | null,
): string {
  return (
    visitorLocales?.contentLocale ??
    blueprint?.sitePlan?.language ??
    blueprint?.language ??
    PRIMARY_SITE_LANGUAGE
  );
}

function isEnglishContentLanguage(language: string): boolean {
  return normalizeGlsGenerationLanguage(language) === PRIMARY_SITE_LANGUAGE;
}

function buildPrimaryHtmlWithSwitcher(params: {
  html: string;
  publicUrl: string;
  visitorLocales: VisitorLocaleConfig;
  localeCode: string;
  dir: "ltr" | "rtl";
}): string {
  const localized = applyHtmlDirAttribute(
    applyHtmlLangAttribute(params.html, params.localeCode),
    params.dir,
  );
  const switcher = buildPublishedLanguageSwitcherHtml({
    publicBaseUrl: params.publicUrl.replace(/\/$/, ""),
    config: params.visitorLocales,
    currentLocale: params.localeCode,
  });
  return injectLanguageSwitcherIntoHtml(localized, switcher);
}

export function resolveProductionPublishHtml(
  generation: WebsiteGeneration,
  publicUrl: string,
  cmsEntries: CmsEntry[] = [],
): {
  html: string;
  robotsTxt: string;
  sitemapXml: string;
  seoPackage: CoreSeoPackage | null;
  visitorLocaleHtml?: Record<string, string>;
  visitorLocales?: VisitorLocaleConfig | null;
} {
  const input = previewInputFromGeneration(generation);
  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;
  const seoPackage = blueprint?.seoPackage ?? null;
  const visitorLocales =
    resolveVisitorLocaleConfigFromProject(blueprint) ??
    (blueprint?.settings?.visitorLocales === "enabled"
      ? buildVisitorLocaleConfig({
          enabled: true,
          contentLanguage: blueprint?.language,
        })
      : null);
  const hreflangLinkTags =
    visitorLocales?.enabled
      ? buildHreflangLinkTags(visitorLocales, publicUrl)
      : [];

  let html: string;
  if (blueprint?.files?.length) {
    html = extractStaticPreviewHtml(blueprint.files, input);
  } else {
    html = buildStaticPreviewHtml(input);
  }

  const withSeo = applySeoToPublicHtml({
    html: sanitizePreviewHtml(html),
    seoPackage,
    publicUrl,
    fallbackTitle: input.title || generation.project_name,
    fallbackDescription:
      input.description || generation.business_description || undefined,
    hreflangLinkTags,
  });

  const withCms = applyCmsToPublishHtml(withSeo, cmsEntries);

  const withLang = applyHtmlLangAttribute(withCms, "en");
  const switcher =
    visitorLocales?.enabled
      ? buildPublishedLanguageSwitcherHtml({
          publicBaseUrl: publicUrl.replace(/\/$/, ""),
          config: visitorLocales,
          currentLocale: "en",
        })
      : "";

  const primaryHtml = hardenPublicSiteHtml(
    injectLanguageSwitcherIntoHtml(withLang, switcher),
  );
  const visitorLocaleHtml =
    visitorLocales?.enabled
      ? Object.fromEntries(
          Object.entries(
            buildVisitorLocaleHtmlVariants({
              primaryHtml,
              config: visitorLocales,
              publicBaseUrl: publicUrl,
            }),
          ).map(([locale, localeHtml]) => [
            locale,
            hardenPublicSiteHtml(localeHtml),
          ]),
        )
      : undefined;

  return {
    html: primaryHtml,
    robotsTxt: buildPublicRobotsTxt(publicUrl),
    sitemapXml: buildPublicSitemapXml({ publicUrl, seoPackage }),
    seoPackage,
    visitorLocaleHtml,
    visitorLocales,
  };
}

/** Production publish HTML with async LLM locale variants. */
export async function resolveProductionPublishHtmlAsync(
  generation: WebsiteGeneration,
  publicUrl: string,
  cmsEntries: CmsEntry[] = [],
): Promise<ReturnType<typeof resolveProductionPublishHtml>> {
  const sync = resolveProductionPublishHtml(generation, publicUrl, cmsEntries);
  if (!sync.visitorLocales?.enabled) return sync;

  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;
  const contentLanguage = resolveContentLanguage(sync.visitorLocales, blueprint);
  const publicBaseUrl = publicUrl.replace(/\/$/, "");

  if (isEnglishContentLanguage(contentLanguage)) {
    const visitorLocaleHtml = await buildVisitorLocaleHtmlVariantsAsync({
      primaryHtml: sync.html,
      config: sync.visitorLocales,
      publicBaseUrl,
      sourceLanguage: contentLanguage,
    });
    return {
      ...sync,
      visitorLocaleHtml: Object.fromEntries(
        Object.entries(visitorLocaleHtml).map(([locale, localeHtml]) => [
          locale,
          hardenPublicSiteHtml(localeHtml),
        ]),
      ),
    };
  }

  // Generated in Arabic (or other non-English): `/w/slug` = English, `/w/slug/{code}` = source content.
  const contentLocaleMeta = resolveLocaleFromLanguage(contentLanguage);
  const contentLocaleCode = contentLocaleMeta.htmlLang.slice(0, 2);
  const htmlWithoutSwitcher = sync.html.replace(
    /<!-- tb-language-switcher -->[\s\S]*?<\/nav>\s*/i,
    "",
  );

  const translatedPrimary = await translateHtmlForLanguage({
    html: htmlWithoutSwitcher,
    targetLanguage: PRIMARY_SITE_LANGUAGE,
    sourceLanguage: contentLanguage,
  });
  const primaryHtml = hardenPublicSiteHtml(
    buildPrimaryHtmlWithSwitcher({
      html: translatedPrimary,
      publicUrl,
      visitorLocales: sync.visitorLocales,
      localeCode: "en",
      dir: "ltr",
    }),
  );

  const visitorLocaleHtml = await buildVisitorLocaleHtmlVariantsAsync({
    primaryHtml,
    config: sync.visitorLocales,
    publicBaseUrl,
    sourceLanguage: contentLanguage,
  });
  if (contentLocaleCode && contentLocaleCode !== "en") {
    visitorLocaleHtml[contentLocaleCode] = localizeHtmlForVisitorLocale({
      html: htmlWithoutSwitcher,
      targetLanguage: contentLanguage,
      localeCode: contentLocaleCode,
      publicBaseUrl,
      config: sync.visitorLocales,
      usePhraseTranslation: false,
    });
  }

  return {
    ...sync,
    html: primaryHtml,
    visitorLocaleHtml: Object.fromEntries(
      Object.entries(visitorLocaleHtml).map(([locale, localeHtml]) => [
        locale,
        hardenPublicSiteHtml(localeHtml),
      ]),
    ),
  };
}

/** Merge SEO package with visitor locale snapshots for DB storage. */
export function buildPublishedSeoJson(
  produced: ReturnType<typeof resolveProductionPublishHtml>,
): PublishedSeoJson | null {
  if (
    !produced.seoPackage &&
    !produced.visitorLocaleHtml &&
    !produced.visitorLocales
  ) {
    return null;
  }

  const base = produced.seoPackage ?? {
    metadata: {
      title: "",
      description: "",
      keywords: [],
      canonicalPath: "/",
      robots: "index,follow",
    },
    openGraph: {
      title: "",
      description: "",
      type: "website" as const,
      siteName: "",
      locale: "en_US",
      imageAlt: "",
    },
    keywords: [],
    structuredData: [],
    sitemap: [{ path: "/", priority: 1, changefreq: "weekly" as const }],
    readiness: { passed: true, score: 0, issues: [] },
    generatedAt: new Date().toISOString(),
  };

  return {
    ...base,
    ...(produced.visitorLocaleHtml
      ? { visitorLocaleHtml: produced.visitorLocaleHtml }
      : {}),
    ...(produced.visitorLocales
      ? { visitorLocales: produced.visitorLocales }
      : {}),
  };
}
