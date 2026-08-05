import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GLS_PHASE,
  GLS_SPEC_VERSION,
  GLS_SERVICE_REGISTRY,
  GLS_TYPOGRAPHY_PROFILES,
  buildAiLanguageDirective,
  bridgeToTbdpLanguageContext,
  detectMissingTranslationKeys,
  emitDirectionCssVariables,
  flattenTranslationMessages,
  getGlsWorldLanguageRegistry,
  resolveAiLanguage,
  resolveDirectionAdaptations,
  resolveGlsLanguageContext,
  resolveLocaleFormatting,
  resolveSeoLocalization,
  resolveTypographyProfile,
  validateGlsLanguageContext,
  validateTranslationContract,
} from "@/lib/language-platform";

describe("Global Language System (GLS)", () => {
  it("exports phase constants", () => {
    assert.equal(GLS_PHASE, "gls-1");
    assert.equal(GLS_SPEC_VERSION, "1.0.0");
  });

  it("registers all world languages from platform i18n", () => {
    const registry = getGlsWorldLanguageRegistry();
    assert.ok(registry.length >= 30);
    assert.ok(registry.some((l) => l.code === "ar" && l.dir === "rtl"));
    assert.ok(registry.some((l) => l.code === "ja" && l.scriptFamily === "cjk"));
  });

  it("registers all service products", () => {
    assert.equal(GLS_SERVICE_REGISTRY.length, 10);
    assert.ok(GLS_SERVICE_REGISTRY.every((s) => s.supportsIndependentLanguage));
  });

  it("resolves unified language context for English", () => {
    const ctx = resolveGlsLanguageContext({
      platformLocale: "en",
      websiteLanguage: "English",
    });
    assert.equal(ctx.website.direction, "ltr");
    assert.equal(ctx.typography.profileId, "latin-ltr");
    assert.equal(ctx.template.languageNeutral, true);
    assert.ok(ctx.meta.contextHash);
    assert.equal(validateGlsLanguageContext(ctx).valid, true);
  });

  it("resolves Arabic RTL with arabic typography profile", () => {
    const ctx = resolveGlsLanguageContext({ websiteLanguage: "Arabic" });
    assert.equal(ctx.website.direction, "rtl");
    assert.equal(ctx.typography.profileId, "arabic-rtl");
    assert.equal(ctx.typography.tbdpProfileId, "arabic-rtl");
    assert.equal(ctx.direction.adaptations.drawerSide, "right");
  });

  it("resolves CJK typography for Japanese", () => {
    const ctx = resolveGlsLanguageContext({
      platformLocale: "ja",
      websiteLanguage: "Japanese",
    });
    assert.equal(ctx.typography.scriptFamily, "cjk");
    assert.equal(ctx.typography.profileId, "cjk-ltr");
  });

  it("resolves AI language with structured output only", () => {
    const ai = resolveAiLanguage({ websiteLanguage: "Spanish" });
    assert.equal(ai.structuredOutputOnly, true);
    assert.equal(ai.usesLlmLocalization, true);
    assert.ok(buildAiLanguageDirective("Spanish").includes("Spanish"));
  });

  it("resolves locale formatting with currency and pluralization", () => {
    const locale = resolveLocaleFormatting("ar", { currencyCode: "SAR" });
    assert.equal(locale.currencyCode, "SAR");
    assert.ok(locale.pluralRules);
  });

  it("resolves SEO localization with hreflang", () => {
    const seo = resolveSeoLocalization({ localeCode: "ar", htmlLang: "ar" });
    assert.equal(seo.hreflang, "ar");
    assert.ok(seo.alternateLocales.length > 0);
  });

  it("emits direction CSS variables for RTL", () => {
    const css = emitDirectionCssVariables("rtl");
    assert.ok(css.includes("--gls-direction: rtl"));
    assert.ok(css.includes('[dir="rtl"]'));
  });

  it("bridges to TBDP language context without drift", () => {
    const ctx = resolveGlsLanguageContext({ websiteLanguage: "Arabic" });
    const bridge = bridgeToTbdpLanguageContext(ctx);
    assert.equal(bridge.aligned, true);
    assert.equal(bridge.tbdp.direction, "rtl");
  });

  it("validates translation contracts and detects missing keys", () => {
    const contract = {
      namespace: "common" as const,
      keys: { save: "Save", cancel: "Cancel" },
      locale: "en",
      version: "1.0.0",
    };
    const messages = { common: { save: "Save" } };
    const result = validateTranslationContract(contract, messages);
    assert.equal(result.valid, false);
    assert.ok(result.missingKeys.includes("cancel"));

    const missing = detectMissingTranslationKeys(
      { a: "1", b: { c: "2" } },
      { a: "1" },
    );
    assert.ok(missing.includes("b.c"));
  });

  it("exposes all typography profiles", () => {
    const ids = Object.keys(GLS_TYPOGRAPHY_PROFILES);
    assert.ok(ids.includes("latin-ltr"));
    assert.ok(ids.includes("arabic-rtl"));
    assert.ok(ids.includes("cjk-ltr"));
    assert.ok(ids.includes("hebrew-rtl"));
  });

  it("resolves typography fallback chain", () => {
    const profile = resolveTypographyProfile("arabic", "rtl");
    assert.equal(profile.id, "arabic-rtl");
    assert.equal(resolveDirectionAdaptations("rtl").carouselDirection, "rtl");
  });

  it("flattens nested translation messages", () => {
    const flat = flattenTranslationMessages({ common: { save: "Save" } });
    assert.equal(flat["common.save"], "Save");
  });
});
