import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiOutputLanguageDirective } from "@/lib/ai/prompts/language-directive.server";
import {
  businessIdeasUserPrompt,
  marketAnalysisUserPrompt,
  reportsUserPrompt,
} from "@/lib/ai/prompts/legacy-services";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import { getGcriContext, runWithGcriContext } from "@/lib/language-platform/gcri/context.server";
import { resolveGcriProfile } from "@/lib/language-platform/gcri/resolve";
import { buildBusinessPlanPrompt } from "@/lib/business-manager/prompts";
import { buildPostActionPrompt, buildPostGenerationPrompt } from "@/lib/social-media/prompts";
import { buildImageToVideoBrief } from "@/lib/ai-core/video-production-platform/image-to-video";
import { ideaInputSchema } from "@/lib/validations/ideas";
import { reportInputSchema } from "@/lib/validations/reports";
import { marketInputSchema } from "@/lib/validations/market-analysis";
import { aiCoreRunCreateSchema } from "@/lib/ai-core/validations";
import { seoAnalyzeBodySchema } from "@/lib/seo/analyzer";

function requestWith(headers: Record<string, string>): Request {
  return new Request("https://example.test/api/generate", { headers });
}

describe("GCRI remaining-route coverage", () => {
  it("accepts country on previously uncovered request schemas", () => {
    assert.equal(ideaInputSchema.parse({
      interests: "ops software",
      skills: "sales",
      budget: "50k",
      country: "SA",
      language: "Arabic",
    }).country, "SA");
    assert.equal(reportInputSchema.parse({
      topic: "Market entry",
      reportType: "Strategic Analysis",
      timeframe: "12 months",
      country: "US",
    }).country, "US");
    assert.equal(marketInputSchema.parse({
      industry: "SaaS",
      region: "Quebec",
      targetAudience: "Operators",
      language: "French",
      country: "CA",
    }).country, "CA");
    assert.equal(aiCoreRunCreateSchema.parse({
      productId: "website-builder",
      prompt: "Build a consulting site",
      language: "French",
      country: "CA",
    }).country, "CA");
    assert.equal(seoAnalyzeBodySchema.parse({
      title: "Home",
      useAi: true,
      language: "Arabic",
      country: "SA",
    }).country, "SA");
  });

  it("binds Arabic + Saudi Arabia even when tba_locale is English", () => {
    const language = resolveRequestLanguage(
      requestWith({ cookie: "tba_locale=en" }),
      "Arabic",
      "SA",
    );
    assert.equal(language, "Arabic");
    const ctx = getGcriContext();
    assert.equal(ctx?.countryCode, "SA");
    assert.equal(ctx?.currencyCode, "SAR");
    assert.match(aiOutputLanguageDirective(language, "business"), /Currency: SAR/);
    assert.doesNotMatch(aiOutputLanguageDirective(language, "business", "SA"), /Currency: USD/);
  });

  it("binds English + United States even when tba_locale is Arabic", () => {
    const language = resolveRequestLanguage(
      requestWith({ cookie: "tba_locale=ar" }),
      "English",
      "US",
    );
    assert.equal(language, "English");
    const ctx = getGcriContext();
    assert.equal(ctx?.countryCode, "US");
    assert.equal(ctx?.currencyCode, "USD");
    assert.match(aiOutputLanguageDirective(language, "marketing", "US"), /Currency: USD/);
    assert.doesNotMatch(aiOutputLanguageDirective(language, "marketing", "US"), /Currency: SAR/);
  });

  it("binds French + Canada even when tba_locale is Arabic", () => {
    const language = resolveRequestLanguage(
      requestWith({ cookie: "tba_locale=ar; tba_generation_language=English" }),
      "French",
      "CA",
    );
    assert.equal(language, "French");
    const ctx = getGcriContext();
    assert.equal(ctx?.countryCode, "CA");
    assert.equal(ctx?.currencyCode, "CAD");
    assert.equal(ctx?.languageVariant, "Canadian French");
    assert.match(aiOutputLanguageDirective(language, "social", "CA"), /Currency: CAD/);
    assert.doesNotMatch(aiOutputLanguageDirective(language, "social", "CA"), /Currency: EUR/);
  });

  it("injects GCRI into social, ideas, reports, market, and business-plan prompts", () => {
    const profile = resolveGcriProfile({ language: "French", country: "CA" });
    runWithGcriContext(profile, () => {
      const social = buildPostGenerationPrompt({
        platform: "linkedin",
        topic: "Cabinet de conseil",
        tone: "Professional",
        language: "French",
      });
      assert.match(social.system, /Canada/);
      assert.match(social.system, /Currency: CAD/);

      const action = buildPostActionPrompt({
        action: "rewrite",
        text: "Bonjour",
        platform: "linkedin",
        language: "French",
      });
      assert.match(action.system, /Currency: CAD/);

      assert.match(
        businessIdeasUserPrompt({
          interests: "logistics",
          skills: "ops",
          budget: "100k",
          language: "French",
        }),
        /Currency: CAD/,
      );
      assert.match(
        reportsUserPrompt({
          reportType: "Strategic Analysis",
          topic: "Expansion",
          timeframe: "2026",
          language: "French",
        }),
        /Canadian French/,
      );
      assert.match(
        marketAnalysisUserPrompt({
          industry: "SaaS",
          region: "Quebec",
          targetAudience: "Operators",
          language: "French",
        }),
        /CAD/,
      );
      assert.match(
        buildBusinessPlanPrompt({ brief: "Scale a consulting firm", language: "French" }),
        /Do NOT copy platform UI locale/,
      );
    });
  });

  it("passes resolved language into image-to-video plugin input", () => {
    const brief = buildImageToVideoBrief({
      imageUrl: "https://example.test/product.png",
      prompt: "Orbit the product on a studio table",
      language: "Arabic",
    });
    assert.equal(brief.pluginInput.language, "Arabic");
  });
});
