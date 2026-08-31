import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiOutputLanguageDirective } from "@/lib/ai/prompts/language-directive.server";
import { websiteAnalyzePrompt } from "@/lib/ai/prompts/website";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import { getGcriContext, runWithGcriContext } from "@/lib/language-platform/gcri/context.server";
import { GCRI_CATALOG } from "@/lib/language-platform/gcri/catalog";
import { buildGcriDirective } from "@/lib/language-platform/gcri/directive";
import {
  assertGcriCurrencyMatchesCountry,
  defaultGcriCountryForLanguage,
  getGcriCountriesForLanguage,
  resolveGcriCountry,
  resolveGcriProfile,
} from "@/lib/language-platform/gcri/resolve";
import { GCRI_COUNTRY_COOKIE, GCRI_COUNTRY_HEADER } from "@/lib/language-platform/gcri/service";

describe("GCRI catalog integrity", () => {
  it("never assigns another country's currency to the same country", () => {
    for (const profile of GCRI_CATALOG) {
      assert.equal(assertGcriCurrencyMatchesCountry(profile), true, profile.countryCode);
    }
  });

  it("defaults Arabic to Saudi Arabia / SAR", () => {
    const profile = resolveGcriProfile({ language: "Arabic" });
    assert.equal(profile.countryCode, "SA");
    assert.equal(profile.currencyCode, "SAR");
    assert.match(profile.languageVariant, /Saudi/i);
    assert.equal(profile.measurementSystem, "metric");
  });

  it("defaults English to United States / USD", () => {
    const profile = resolveGcriProfile({ language: "English" });
    assert.equal(profile.countryCode, "US");
    assert.equal(profile.currencyCode, "USD");
    assert.equal(profile.languageVariant, "American English");
    assert.equal(profile.measurementSystem, "imperial");
    assert.equal(profile.dateFormat, "MM/dd/yyyy");
  });

  it("resolves French + Canada to Canadian French / CAD", () => {
    const profile = resolveGcriProfile({ language: "French", country: "CA" });
    assert.equal(profile.countryCode, "CA");
    assert.equal(profile.currencyCode, "CAD");
    assert.equal(profile.languageVariant, "Canadian French");
    assert.notEqual(profile.currencyCode, "EUR");
    assert.notEqual(profile.currencyCode, "USD");
    assert.match(profile.culturalNotes, /Canadian French|courriel/i);
  });

  it("does not mix France French into Canadian French", () => {
    const france = resolveGcriProfile({ language: "French", country: "FR" });
    const canada = resolveGcriProfile({ language: "French", country: "CA" });
    assert.equal(france.currencyCode, "EUR");
    assert.equal(canada.currencyCode, "CAD");
    assert.notEqual(france.languageVariant, canada.languageVariant);
  });

  it("rejects a country that does not belong to the selected language", () => {
    const country = resolveGcriCountry({ language: "Japanese", country: "SA" });
    assert.equal(country, "JP");
  });

  it("defaults French to France / EUR", () => {
    const profile = resolveGcriProfile({ language: "French" });
    assert.equal(profile.countryCode, "FR");
    assert.equal(profile.currencyCode, "EUR");
  });

  it("keeps CAD for English Canada and French Canada", () => {
    const en = resolveGcriProfile({ language: "English", country: "CA" });
    const fr = resolveGcriProfile({ language: "French", country: "CA" });
    assert.equal(en.currencyCode, "CAD");
    assert.equal(fr.currencyCode, "CAD");
    assert.equal(en.languageVariant, "Canadian English");
    assert.equal(fr.languageVariant, "Canadian French");
  });

  it("lists Saudi Arabia among Arabic markets", () => {
    const arabic = getGcriCountriesForLanguage("Arabic").map((row) => row.countryCode);
    assert.ok(arabic.includes("SA"));
    assert.ok(arabic.includes("AE"));
    assert.equal(defaultGcriCountryForLanguage("Arabic"), "SA");
  });
});

describe("GCRI request pipeline", () => {
  it("binds GCRI from the country cookie without using tba_locale", () => {
    const language = resolveRequestLanguage(
      new Request("https://example.test/api/generate", {
        headers: {
          cookie: "tba_locale=ar; tba_generation_country=CA; tba_generation_language=French",
        },
      }),
    );
    assert.equal(language, "French");
    const ctx = getGcriContext();
    assert.equal(ctx?.countryCode, "CA");
    assert.equal(ctx?.currencyCode, "CAD");
    assert.equal(ctx?.languageVariant, "Canadian French");
  });

  it("does not take country from the UI locale cookie", () => {
    const request = new Request("https://example.test/api/generate", {
      headers: { cookie: "tba_locale=ar" },
    });
    const language = resolveRequestLanguage(request, "English");
    assert.equal(language, "English");
    const profile = resolveGcriCountry({
      language,
      cookie: null,
    });
    assert.equal(profile, "US");
  });

  it("prefers the GCRI country cookie over the language default", () => {
    const country = resolveGcriCountry({
      language: "French",
      cookie: "CA",
    });
    assert.equal(country, "CA");
  });

  it("prefers the GCRI header over the cookie", () => {
    const country = resolveGcriCountry({
      language: "English",
      header: "GB",
      cookie: "US",
    });
    assert.equal(country, "GB");
    assert.equal(GCRI_COUNTRY_COOKIE, "tba_generation_country");
    assert.equal(GCRI_COUNTRY_HEADER, "x-tba-generation-country");
  });
});

describe("GCRI prompt injection", () => {
  it("includes Saudi regional context for Arabic + SA", () => {
    const profile = resolveGcriProfile({ language: "Arabic", country: "SA" });
    const block = buildGcriDirective(profile);
    assert.match(block, /Saudi Arabia/);
    assert.match(block, /Currency: SAR/);
    assert.match(block, /Saudi Arabic/i);
    assert.doesNotMatch(block, /Currency: USD/);
    const prompt = aiOutputLanguageDirective("Arabic", "website", "SA");
    assert.match(prompt, /Currency: SAR/);
    assert.match(prompt, /Saudi Arabia/);
    assert.doesNotMatch(prompt, /Currency: USD/);
  });

  it("includes US regional context for English + US", () => {
    const prompt = aiOutputLanguageDirective("English", "marketing", "US");
    assert.match(prompt, /United States/);
    assert.match(prompt, /Currency: USD/);
    assert.match(prompt, /American English/);
    assert.doesNotMatch(prompt, /Currency: EUR/);
    assert.doesNotMatch(prompt, /Currency: SAR/);
  });

  it("includes Canadian French context when country is CA", () => {
    const prompt = runWithGcriContext(
      resolveGcriProfile({ language: "French", country: "CA" }),
      () => websiteAnalyzePrompt({
        prompt: "Cabinet de conseil",
        projectType: "business",
        projectKind: "website",
        language: "French",
        theme: "modern",
        features: [],
      }),
    );
    assert.match(prompt, /Canada/);
    assert.match(prompt, /Currency: CAD/);
    assert.match(prompt, /Canadian French/);
    assert.doesNotMatch(prompt, /Currency: EUR/);
    assert.match(prompt, /Do NOT mix regional terminology/i);
    assert.match(prompt, /Do NOT copy platform UI locale/i);
  });
});
