import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  getGlsGenerationLanguageOptions,
  glsGenerationLanguageToSlug,
  GLS_GENERATION_LANGUAGE_I18N_NS,
} from "@/lib/language-platform/generation/options";

function readLocaleJson(locale: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(new URL(`../../../locales/${locale}.json`, import.meta.url), "utf8"),
  ) as Record<string, unknown>;
}

function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

describe("GLS generation language i18n keys", () => {
  it("en.json defines constants.gls.languages for all picker options", () => {
    const en = readLocaleJson("en");
    const options = getGlsGenerationLanguageOptions("website-builder");

    for (const option of options) {
      const key = `${GLS_GENERATION_LANGUAGE_I18N_NS}.${glsGenerationLanguageToSlug(option.value)}`;
      const label = getNested(en, key);
      assert.ok(
        typeof label === "string" && label.length > 0,
        `missing ${key}`,
      );
    }
  });

  it("ar.json defines Arabic labels for core languages", () => {
    const ar = readLocaleJson("ar");
    const core = ["english", "arabic", "french", "spanish", "bilingual"];
    for (const slug of core) {
      const key = `${GLS_GENERATION_LANGUAGE_I18N_NS}.${slug}`;
      const label = getNested(ar, key);
      assert.ok(
        typeof label === "string" && label.length > 0,
        `missing ${key}`,
      );
    }
  });
});
