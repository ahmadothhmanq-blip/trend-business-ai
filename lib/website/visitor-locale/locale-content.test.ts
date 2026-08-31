import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildVisitorLocaleConfig,
} from "@/lib/website/site-plan/visitor-locales";
import {
  buildVisitorLocaleHtmlVariants,
  localizeHtmlForVisitorLocale,
} from "@/lib/website/visitor-locale/locale-content";
import { translateVisiblePhrases } from "@/lib/website/visitor-locale/phrase-dictionary";
import { buildPublishedLanguageSwitcherHtml } from "@/lib/website/growth/language-switcher";
import {
  buildPublishedSeoJson,
  resolveProductionPublishHtml,
  resolveProductionPublishHtmlAsync,
} from "@/lib/website/public-site.server";
import type { WebsiteGeneration } from "@/types/database";

const BASE_HTML = `<!DOCTYPE html><html lang="en"><head><title>Demo</title></head><body><nav><a>Home</a><a>Contact</a></nav><h1>Welcome</h1></body></html>`;

describe("visitor locale content", () => {
  it("translates visible nav phrases for Arabic", () => {
    const html = translateVisiblePhrases(BASE_HTML, "Arabic");
    assert.ok(html.includes("الرئيسية"));
    assert.ok(html.includes("اتصل بنا"));
    assert.ok(!html.includes(">Home<"));
  });

  it("builds distinct HTML per locale with markers and dir", () => {
    const config = buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: "English",
      extraLocales: ["Arabic", "French"],
    });
    const variants = buildVisitorLocaleHtmlVariants({
      primaryHtml: BASE_HTML,
      config,
      publicBaseUrl: "https://example.com/w/demo",
    });
    assert.ok(variants.ar);
    assert.ok(variants.fr);
    assert.ok(variants.ar.includes('<!-- tb-locale:ar -->'));
    assert.ok(variants.fr.includes('<!-- tb-locale:fr -->'));
    assert.ok(variants.ar.includes('dir="rtl"'));
    assert.notEqual(variants.ar, variants.fr);
  });

  it("keeps content locale HTML when target matches generation language", () => {
    const config = buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: "Arabic",
      extraLocales: ["Arabic"],
    });
    const localized = localizeHtmlForVisitorLocale({
      html: "<html><body><h1>مرحبا</h1></body></html>",
      targetLanguage: "Arabic",
      localeCode: "ar",
      publicBaseUrl: "https://example.com/w/demo",
      config,
    });
    assert.ok(localized.includes("مرحبا"));
    assert.ok(localized.includes('lang="ar"'));
  });
});

describe("language switcher a11y + RTL", () => {
  it("positions switcher for RTL locale and exposes menubar roles", () => {
    const config = buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: "English",
      extraLocales: ["Arabic"],
    });
    const html = buildPublishedLanguageSwitcherHtml({
      publicBaseUrl: "https://example.com/w/demo",
      config,
      currentLocale: "ar",
    });
    assert.ok(html.includes('dir="rtl"'));
    assert.ok(html.includes('left:16px'));
    assert.ok(html.includes('role="menubar"'));
    assert.ok(html.includes('hreflang="ar"'));
  });
});

describe("publish pipeline — generate → locales → publish snapshot", () => {
  it("stores visitor locale HTML in published seo json", () => {
    const generation = {
      id: "gen-1",
      project_name: "Demo Cafe",
      business_description: "Coffee shop",
      blueprint: {
        projectKind: "website",
        title: "Demo Cafe",
        description: "Coffee shop",
        pages: [],
        sections: [],
        colorPalette: [],
        typography: [],
        components: [],
        content: [],
        seo: [],
        roadmap: [],
        files: [],
        settings: { visitorLocales: "enabled" },
        sitePlan: {
          language: "English",
          capabilities: ["multi-language"],
          visitorLocales: buildVisitorLocaleConfig({
            enabled: true,
            contentLanguage: "English",
            extraLocales: ["Arabic"],
          }),
        },
      },
    } as unknown as WebsiteGeneration;

    const produced = resolveProductionPublishHtml(
      generation,
      "https://example.com/w/demo-cafe",
    );
    const seoJson = buildPublishedSeoJson(produced);
    assert.ok(seoJson?.visitorLocaleHtml?.ar);
    assert.ok(seoJson.visitorLocaleHtml.ar.includes("الرئيسية"));
  });

  it("keeps Arabic source on /ar and translates primary to English when content is Arabic", async () => {
    const generation = {
      id: "gen-ar",
      project_name: "ذهبي موبايل",
      business_description: "متجر جوالات",
      blueprint: {
        projectKind: "website",
        title: "ذهبي موبايل",
        description: "متجر جوالات",
        language: "Arabic",
        pages: [],
        sections: [],
        colorPalette: [],
        typography: [],
        components: [],
        content: [],
        seo: [],
        roadmap: [],
        files: [],
        settings: { visitorLocales: "enabled" },
        sitePlan: {
          language: "Arabic",
          capabilities: ["multi-language"],
          visitorLocales: buildVisitorLocaleConfig({
            enabled: true,
            contentLanguage: "Arabic",
            extraLocales: ["Arabic"],
          }),
        },
      },
    } as unknown as WebsiteGeneration;

    const produced = await resolveProductionPublishHtmlAsync(
      generation,
      "https://example.com/w/gold-mobile",
    );
    const seoJson = buildPublishedSeoJson(produced);

    assert.ok(produced.html.includes('lang="en"'));
    assert.ok(produced.html.includes('dir="ltr"'));
    assert.ok(seoJson?.visitorLocaleHtml?.ar);
    assert.ok(seoJson.visitorLocaleHtml.ar.includes("ذهبي موبايل"));
    assert.ok(seoJson.visitorLocaleHtml.ar.includes('lang="ar"'));
    assert.notEqual(produced.html, seoJson.visitorLocaleHtml.ar);
  });
});
