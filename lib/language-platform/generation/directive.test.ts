import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGlsOutputDirective,
  type GlsOutputSurface,
} from "@/lib/language-platform/generation/directive";

const LANGUAGES = [
  "Arabic",
  "English",
  "German",
  "Spanish",
  "French",
  "Japanese",
] as const;

const SURFACES: GlsOutputSurface[] = [
  "generic",
  "website",
  "app",
  "landing",
  "video",
  "content",
  "marketing",
  "image",
  "brand",
  "logo",
  "business",
  "agent",
  "social",
];

describe("GLS complete-output directive", () => {
  for (const language of LANGUAGES) {
    it(`requires native ${language} generation with no mix or post-translate`, () => {
      const directive = buildGlsOutputDirective(language);
      assert.match(directive, new RegExp(language));
      assert.match(directive, /natively/i);
      assert.match(directive, /translate afterward/i);
      assert.match(directive, /Do NOT mix languages|Do not mix other languages/i);
      assert.match(directive, /JSON object keys stay in English/i);
      assert.doesNotMatch(directive, /Respond entirely in/);
    });
  }

  it("returns empty when language is missing", () => {
    assert.equal(buildGlsOutputDirective(undefined), "");
    assert.equal(buildGlsOutputDirective("  "), "");
  });

  it("enumerates website artifacts", () => {
    const d = buildGlsOutputDirective("German", "website");
    for (const term of [
      "navigation",
      "buttons",
      "forms",
      "CTA",
      "blog content",
      "SEO title",
      "SEO description",
      "metadata",
    ]) {
      assert.match(d, new RegExp(term, "i"));
    }
  });

  it("enumerates video artifacts", () => {
    const d = buildGlsOutputDirective("Arabic", "video");
    for (const term of [
      "script",
      "voice-over",
      "captions",
      "subtitles",
      "on-screen text",
      "titles",
      "visual prompts",
    ]) {
      assert.match(d, new RegExp(term, "i"));
    }
  });

  it("enumerates content studio artifacts", () => {
    const d = buildGlsOutputDirective("Spanish", "content");
    for (const term of [
      "article",
      "headlines",
      "meta title",
      "meta description",
      "CTA",
    ]) {
      assert.match(d, new RegExp(term, "i"));
    }
  });

  it("enumerates marketing artifacts", () => {
    const d = buildGlsOutputDirective("French", "marketing");
    for (const term of ["ads", "campaigns", "email", "social posts", "headlines", "descriptions"]) {
      assert.match(d, new RegExp(term, "i"));
    }
  });

  it("enumerates brand and image artifacts", () => {
    const brand = buildGlsOutputDirective("Japanese", "brand");
    assert.match(brand, /slogan/i);
    assert.match(brand, /brand description/i);
    const image = buildGlsOutputDirective("German", "image");
    assert.match(image, /embedded SVG|on-image text/i);
    assert.match(image, /generated prompts/i);
  });

  it("enumerates business and agent artifacts", () => {
    const business = buildGlsOutputDirective("Arabic", "business");
    assert.match(business, /reports/i);
    assert.match(business, /recommendations/i);
    const agent = buildGlsOutputDirective("Spanish", "agent");
    assert.match(agent, /conversation/i);
    assert.match(agent, /generated actions/i);
    assert.match(agent, /reports/i);
  });

  it("covers every product surface for every verification language", () => {
    for (const language of LANGUAGES) {
      for (const surface of SURFACES) {
        const d = buildGlsOutputDirective(language, surface);
        assert.match(d, new RegExp(language === "English" ? "English" : language));
        assert.match(d, /natively/i);
      }
    }
  });
});
