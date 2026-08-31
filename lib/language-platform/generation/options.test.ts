import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getGlsGenerationLanguageOptions,
  getGlsGenerationLanguageValues,
  getGlsWorldGenerationLanguageOptions,
  glsGenerationLanguageToSlug,
  isGlsGenerationLanguage,
  normalizeGlsGenerationLanguage,
  resolveGlsGenerationLanguageOption,
} from "@/lib/language-platform/generation/options";

describe("GLS generation language options", () => {
  it("exposes all world languages from the registry", () => {
    const world = getGlsWorldGenerationLanguageOptions();
    assert.ok(world.length >= 30);
    assert.ok(world.some((o) => o.value === "Japanese" && o.localeCode === "ja"));
    assert.ok(world.some((o) => o.value === "Arabic" && o.dir === "rtl"));
  });

  it("includes Bilingual for website-builder only", () => {
    const website = getGlsGenerationLanguageValues("website-builder");
    const video = getGlsGenerationLanguageValues("video-studio");

    assert.ok(website.includes("Bilingual"));
    assert.ok(website.includes("English"));
    assert.ok(!video.includes("Bilingual"));
    assert.equal(website.length, getGlsWorldGenerationLanguageOptions().length + 1);
  });

  it("orders website-builder with English, Arabic, Bilingual first", () => {
    const opts = getGlsGenerationLanguageOptions("website-builder");
    assert.equal(opts[0]?.value, "English");
    assert.equal(opts[1]?.value, "Arabic");
    assert.equal(opts[2]?.value, "Bilingual");
  });

  it("normalizes legacy aliases including Chinese", () => {
    assert.equal(normalizeGlsGenerationLanguage("Chinese"), "Simplified Chinese");
    assert.equal(normalizeGlsGenerationLanguage("arabic"), "Arabic");
    assert.equal(normalizeGlsGenerationLanguage("bilingual"), "Bilingual");
    assert.equal(normalizeGlsGenerationLanguage(""), "English");
    assert.equal(normalizeGlsGenerationLanguage("unknown-lang-xyz"), "English");
  });

  it("validates known generation languages", () => {
    assert.equal(isGlsGenerationLanguage("French"), true);
    assert.equal(isGlsGenerationLanguage("Bilingual"), true);
    assert.equal(isGlsGenerationLanguage("Chinese"), true);
    assert.equal(isGlsGenerationLanguage("not-a-language"), false);
  });

  it("resolves option metadata for RTL languages", () => {
    const fa = resolveGlsGenerationLanguageOption("Persian");
    assert.equal(fa.dir, "rtl");
    assert.equal(fa.localeCode, "fa");
  });

  it("slugifies values for i18n keys", () => {
    assert.equal(glsGenerationLanguageToSlug("Simplified Chinese"), "simplified_chinese");
    assert.equal(glsGenerationLanguageToSlug("Bilingual"), "bilingual");
  });
});
