import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generationLanguageFromStoredProject,
  getDefaultGlsGenerationLanguage,
  getGlsAvailableGenerationLanguages,
  glsGenerationLanguagePayload,
  glsServiceIdForWorkspaceType,
  parseGlsGenerationLanguageCookie,
  resolveGlsGenerationLanguage,
  resolveGlsServiceId,
  validateGlsGenerationLanguage,
  GLS_GENERATION_LANGUAGE_COOKIE,
} from "@/lib/language-platform/generation/service";

describe("GLS generation language service", () => {
  it("lists world languages for every service and Bilingual only for site builders", () => {
    const website = getGlsAvailableGenerationLanguages("website-builder");
    const image = getGlsAvailableGenerationLanguages("image-generator");
    const agents = getGlsAvailableGenerationLanguages("ai-agents");

    assert.ok(website.includes("Bilingual"));
    assert.ok(!image.includes("Bilingual"));
    assert.ok(!agents.includes("Bilingual"));
    assert.ok(image.includes("Arabic"));
    assert.ok(image.includes("Japanese"));
  });

  it("maps workspace types onto GLS service ids", () => {
    assert.equal(glsServiceIdForWorkspaceType("marketing"), "marketing-ai");
    assert.equal(glsServiceIdForWorkspaceType("manager"), "business-manager");
    assert.equal(glsServiceIdForWorkspaceType("social"), "social-media");
    assert.equal(glsServiceIdForWorkspaceType("brand"), "brand-designer");
    assert.equal(glsServiceIdForWorkspaceType("unknown"), "content-studio");
    assert.equal(resolveGlsServiceId("video-studio"), "video-studio");
    assert.equal(resolveGlsServiceId("future-product"), "content-studio");
  });

  it("prefers explicit language over persisted GLS and UI locale", () => {
    assert.equal(
      resolveGlsGenerationLanguage({
        explicit: "Arabic",
        cookie: "French",
        uiLocale: "en",
      }),
      "Arabic",
    );
    assert.equal(
      resolveGlsGenerationLanguage({
        explicit: "zh-CN",
        uiLocale: "ar",
      }),
      "Simplified Chinese",
    );
  });

  it("uses persisted GLS independently from the UI locale", () => {
    assert.equal(
      resolveGlsGenerationLanguage({
        cookie: "Japanese",
        uiLocale: "ar",
      }),
      "Japanese",
    );
    assert.equal(
      resolveGlsGenerationLanguage({
        header: "German",
        cookie: "Japanese",
        uiLocale: "en",
      }),
      "German",
    );
  });

  it("falls back to UI locale when no generation language is stored", () => {
    assert.equal(
      resolveGlsGenerationLanguage({ uiLocale: "ar" }),
      "Arabic",
    );
    assert.equal(
      resolveGlsGenerationLanguage({ uiLocale: "ja" }),
      "Japanese",
    );
    assert.equal(resolveGlsGenerationLanguage({}), "English");
  });

  it("falls back to English for stored projects with no generation language", () => {
    assert.equal(generationLanguageFromStoredProject(undefined), "English");
    assert.equal(generationLanguageFromStoredProject(""), "English");
    assert.equal(generationLanguageFromStoredProject("Arabic"), "Arabic");
  });

  it("validates, defaults, and builds a stable API payload", () => {
    assert.equal(validateGlsGenerationLanguage("French"), true);
    assert.equal(validateGlsGenerationLanguage("not-a-language"), false);
    assert.equal(getDefaultGlsGenerationLanguage("website-builder"), "English");
    assert.deepEqual(glsGenerationLanguagePayload("arabic"), {
      language: "Arabic",
      country: "SA",
    });
  });

  it("parses the GLS cookie without reading the UI locale cookie", () => {
    const header = `tba_locale=ar; ${GLS_GENERATION_LANGUAGE_COOKIE}=${encodeURIComponent("Simplified Chinese")}`;
    assert.equal(parseGlsGenerationLanguageCookie(header), "Simplified Chinese");
  });
});
