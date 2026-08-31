import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import { getGcriContext } from "@/lib/language-platform/gcri/context.server";

function requestWith(headers: Record<string, string>): Request {
  return new Request("https://example.test/api/generate", { headers });
}

describe("GLS AI request language pipeline", () => {
  it("prefers explicit body language over GLS cookie and UI locale", () => {
    const language = resolveRequestLanguage(
      requestWith({
        cookie: "tba_locale=ar; tba_generation_language=French",
      }),
      "Japanese",
    );
    assert.equal(language, "Japanese");
  });

  it("uses persisted generation language independently of the UI locale", () => {
    const language = resolveRequestLanguage(
      requestWith({
        cookie: "tba_locale=ar; tba_generation_language=German",
      }),
    );
    assert.equal(language, "German");
  });

  it("falls back to the UI locale when no generation language is stored", () => {
    const fromCookie = resolveRequestLanguage(
      requestWith({ cookie: "tba_locale=ar" }),
    );
    const fromHeader = resolveRequestLanguage(
      requestWith({ "x-tba-locale": "ja" }),
    );
    assert.equal(fromCookie, "Arabic");
    assert.equal(fromHeader, "Japanese");
  });

  it("reads the dedicated GLS header before the UI locale", () => {
    const language = resolveRequestLanguage(
      requestWith({
        "x-tba-locale": "ar",
        "x-tba-generation-language": "Portuguese",
      }),
    );
    assert.equal(language, "Portuguese");
  });

  it("does not let tba_locale override an explicit generation country", () => {
    const language = resolveRequestLanguage(
      requestWith({
        cookie: "tba_locale=ar; tba_generation_language=French; tba_generation_country=CA",
      }),
      undefined,
      "CA",
    );
    assert.equal(language, "French");
    assert.equal(getGcriContext()?.countryCode, "CA");
    assert.equal(getGcriContext()?.currencyCode, "CAD");
  });
});
