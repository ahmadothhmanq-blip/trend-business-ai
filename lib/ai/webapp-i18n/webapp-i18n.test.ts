import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import {
  buildWebAppI18nFiles,
  findMissingWebAppEntityTranslations,
  findWebAppSelectableLanguagePackIssues,
  getWebAppUiTranslationPackLanguages,
  hasCompleteWebAppUiTranslationPack,
  isCompleteWebAppEntityDictionary,
  isCompleteWebAppUiDictionary,
  isWebAppSupportedRtlLanguage,
  resolveWebAppLocale,
  resolveWebAppTextDirection,
  translateWebAppEntity,
  translateWebAppMessage,
  WEBAPP_ENTITY_KEYS,
  WEBAPP_I18N_KEYS,
  WEBAPP_UI_TRANSLATION_PACKS,
} from "@/lib/ai/webapp-i18n";
import {
  assertWebAppReady,
  findWebAppEntityTranslationReadinessIssues,
  findWebAppI18nReadinessIssues,
  findWebAppMixedLanguageReadinessIssues,
  findWebAppRtlLtrReadinessIssues,
} from "@/lib/ai/webapp-readiness";
import {
  getGlsGenerationLanguageOptions,
  getGlsGenerationLanguageValues,
  getGlsWorldGenerationLanguageOptions,
  resolveGlsGenerationLanguageOption,
} from "@/lib/language-platform/generation/options";

describe("webapp generated-app i18n", () => {
  it("resolves Arabic locale with RTL", () => {
    const locale = resolveWebAppLocale("Arabic");
    assert.equal(locale.language, "Arabic");
    assert.equal(locale.dir, "rtl");
    assert.equal(locale.htmlLang, "ar");
    assert.equal(
      translateWebAppMessage(locale, "auth.signIn"),
      "تسجيل الدخول",
    );
    assert.equal(translateWebAppEntity(locale, "Contact"), "جهة اتصال");
    assert.equal(translateWebAppEntity(locale, "Deal"), "صفقة");
    assert.equal(translateWebAppEntity(locale, "Subscription"), "اشتراك");
  });

  it("ships a complete entity catalog in every UI pack", () => {
    const languages = getWebAppUiTranslationPackLanguages();
    assert.ok(languages.length >= 31);
    for (const language of languages) {
      const pack = WEBAPP_UI_TRANSLATION_PACKS[language]!;
      assert.equal(isCompleteWebAppEntityDictionary(pack.entities), true);
      assert.deepEqual(findMissingWebAppEntityTranslations(pack.entities), []);
      for (const entity of WEBAPP_ENTITY_KEYS) {
        assert.equal(
          pack.messages[`entity.${entity}`].trim().length > 0,
          true,
          `${language} entity.${entity}`,
        );
        assert.equal(pack.entities[entity], pack.messages[`entity.${entity}`]);
      }
    }
  });

  it("falls back completely to English for unsupported languages (no mixed chrome)", () => {
    const locale = resolveWebAppLocale("Klingon");
    assert.equal(locale.fellBackToDefault, true);
    assert.equal(locale.language, "English");
    assert.equal(locale.htmlLang, "en");
    assert.equal(locale.dir, "ltr");
    assert.equal(locale.localeCode, "en");
    assert.equal(
      translateWebAppMessage(locale, "auth.signIn"),
      "Sign in",
    );
    assert.equal(locale.messages["auth.signIn"], locale.defaultMessages["auth.signIn"]);
  });

  it("resolves Spanish with native UI pack (parity with site languages)", () => {
    const locale = resolveWebAppLocale("Spanish");
    assert.equal(locale.fellBackToDefault, false);
    assert.equal(locale.language, "Spanish");
    assert.equal(locale.htmlLang, "es");
    assert.equal(locale.dir, "ltr");
    assert.equal(translateWebAppMessage(locale, "auth.signIn"), "Iniciar sesión");
  });

  it("applies RTL for fully supported RTL languages including Persian and Urdu", () => {
    assert.equal(isWebAppSupportedRtlLanguage("Arabic"), true);
    assert.equal(isWebAppSupportedRtlLanguage("English"), false);
    assert.equal(isWebAppSupportedRtlLanguage("Persian"), true);
    assert.equal(isWebAppSupportedRtlLanguage("Urdu"), true);

    assert.equal(resolveWebAppTextDirection("Arabic"), "rtl");
    assert.equal(resolveWebAppTextDirection("English"), "ltr");
    assert.equal(resolveWebAppTextDirection("Persian"), "rtl");
    assert.equal(resolveWebAppTextDirection("Urdu"), "rtl");

    assert.equal(resolveGlsGenerationLanguageOption("Persian").dir, "rtl");

    for (const rtlLang of ["Persian", "Urdu"] as const) {
      const locale = resolveWebAppLocale(rtlLang);
      assert.equal(locale.fellBackToDefault, false, rtlLang);
      assert.equal(locale.language, rtlLang, rtlLang);
      assert.equal(locale.dir, "rtl", rtlLang);
      assert.notEqual(
        translateWebAppMessage(locale, "auth.signIn"),
        "Sign in",
        rtlLang,
      );
    }

    const arabicFiles = buildWebAppI18nFiles("Arabic");
    const arConfig = arabicFiles.find((file) => file.path === "lib/i18n/config.ts")!.content;
    assert.match(arConfig, /dir: "rtl"/);
    assert.match(arConfig, /htmlLang: "ar"/);

    const persianFiles = buildWebAppI18nFiles("Persian");
    const faConfig = persianFiles.find((file) => file.path === "lib/i18n/config.ts")!.content;
    assert.match(faConfig, /language: "Persian"/);
    assert.match(faConfig, /dir: "rtl"/);
    assert.match(faConfig, /htmlLang: "fa"/);
  });

  it("fails readiness on RTL/LTR mismatches", () => {
    const arabic = buildWebAppScaffold({
      projectName: "CRM",
      language: "Arabic",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Contact"],
    });
    assert.deepEqual(findWebAppRtlLtrReadinessIssues(arabic), []);

    const arabicWithLtr = arabic.map((file) =>
      file.path === "lib/i18n/config.ts"
        ? {
            ...file,
            content: file.content.replace(/dir:\s*["']rtl["']/, 'dir: "ltr"'),
          }
        : file,
    );
    const ltrIssues = findWebAppRtlLtrReadinessIssues(arabicWithLtr);
    assert.ok(
      ltrIssues.some((issue) => issue.includes("RTL/LTR mismatch")),
      ltrIssues.join("\n"),
    );

    const english = buildWebAppScaffold({
      projectName: "CRM",
      language: "English",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Contact"],
    });
    const englishWithRtl = english.map((file) =>
      file.path === "lib/i18n/config.ts"
        ? {
            ...file,
            content: file.content.replace(/dir:\s*["']ltr["']/, 'dir: "rtl"'),
          }
        : file,
    );
    const rtlIssues = findWebAppRtlLtrReadinessIssues(englishWithRtl);
    assert.ok(
      rtlIssues.some((issue) => issue.includes("RTL/LTR mismatch")),
      rtlIssues.join("\n"),
    );

    const englishMessages = buildWebAppI18nFiles("English").find(
      (file) => file.path === "lib/i18n/messages.ts",
    )!;
    const rtlChromeEnglishMessages = arabic.map((file) =>
      file.path === "lib/i18n/messages.ts" ? englishMessages : file,
    );
    const mixedDirIssues = findWebAppRtlLtrReadinessIssues(rtlChromeEnglishMessages);
    assert.ok(
      mixedDirIssues.some((issue) => issue.includes("RTL/LTR mismatch")),
      mixedDirIssues.join("\n"),
    );
  });

  it("exposes only complete UI translation packs as selectable App Builder languages", () => {
    const packs = getWebAppUiTranslationPackLanguages();
    const world = getGlsWorldGenerationLanguageOptions();
    assert.equal(packs.length, world.length);
    for (const language of packs) {
      assert.equal(hasCompleteWebAppUiTranslationPack(language), true);
      assert.equal(
        isCompleteWebAppUiDictionary(WEBAPP_UI_TRANSLATION_PACKS[language]!.messages),
        true,
      );
      assert.equal(
        WEBAPP_I18N_KEYS.every(
          (key) => WEBAPP_UI_TRANSLATION_PACKS[language]!.messages[key].trim().length > 0,
        ),
        true,
      );
    }
    assert.equal(hasCompleteWebAppUiTranslationPack("Spanish"), true);
    assert.equal(hasCompleteWebAppUiTranslationPack("French"), true);
    assert.equal(hasCompleteWebAppUiTranslationPack("Japanese"), true);

    const appBuilder = getGlsGenerationLanguageValues("app-builder");
    assert.deepEqual([...appBuilder].sort(), [...packs].sort());
    assert.ok(appBuilder.includes("Spanish"));
    assert.ok(appBuilder.includes("Japanese"));
    assert.ok(
      getGlsGenerationLanguageOptions("app-builder").every((opt) =>
        hasCompleteWebAppUiTranslationPack(opt.value),
      ),
    );

    assert.ok(getGlsGenerationLanguageValues("video-studio").includes("Japanese"));
  });

  it("fails readiness when a selectable language lacks a complete dictionary", () => {
    const integrity = findWebAppSelectableLanguagePackIssues([
      "English",
      "Arabic",
      "NotARealLanguage",
    ]);
    assert.ok(
      integrity.some((issue) => issue.includes("NotARealLanguage")),
      integrity.join("\n"),
    );

    const scaffold = buildWebAppScaffold({
      projectName: "Clinic",
      language: "English",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item"],
    });
    const withUnsupported = scaffold.map((file) =>
      file.path === "lib/i18n/config.ts"
        ? {
            ...file,
            content: file.content.replace(
              /language:\s*["']English["']/,
              'language: "NotARealLanguage"',
            ),
          }
        : file,
    );
    const issues = findWebAppI18nReadinessIssues(withUnsupported);
    assert.ok(
      issues.some((issue) =>
        issue.includes("NotARealLanguage") && issue.includes("complete UI translation pack"),
      ),
      issues.join("\n"),
    );
  });

  it("fails readiness when mixed-language output is detected", () => {
    const arabic = buildWebAppScaffold({
      projectName: "CRM",
      language: "Arabic",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Contact"],
    });
    const englishMessages = buildWebAppI18nFiles("English").find(
      (file) => file.path === "lib/i18n/messages.ts",
    )!;
    const mixed = arabic.map((file) =>
      file.path === "lib/i18n/messages.ts" ? englishMessages : file,
    );

    const issues = findWebAppMixedLanguageReadinessIssues(mixed);
    assert.ok(
      issues.some((issue) => issue.includes("Mixed-language")),
      issues.join("\n"),
    );

    const mismatchedChrome = arabic.map((file) =>
      file.path === "lib/i18n/config.ts"
        ? {
            ...file,
            content: file.content
              .replace(/htmlLang:\s*["'][^"']+["']/, 'htmlLang: "en"')
              .replace(/dir:\s*["'][^"']+["']/, 'dir: "ltr"'),
          }
        : file,
    );
    const chromeIssues = findWebAppMixedLanguageReadinessIssues(mismatchedChrome);
    assert.ok(
      chromeIssues.some((issue) => issue.includes("htmlLang")),
      chromeIssues.join("\n"),
    );
  });

  it("emits consistent single-language i18n for supported and unsupported inputs", () => {
    const arabic = buildWebAppI18nFiles("Arabic");
    const arConfig = arabic.find((file) => file.path === "lib/i18n/config.ts")!.content;
    assert.match(arConfig, /language: "Arabic"/);
    assert.match(arConfig, /htmlLang: "ar"/);
    assert.match(arConfig, /dir: "rtl"/);

    const spanish = buildWebAppI18nFiles("Spanish");
    const esConfig = spanish.find((file) => file.path === "lib/i18n/config.ts")!.content;
    assert.match(esConfig, /language: "Spanish"/);
    assert.match(esConfig, /htmlLang: "es"/);
    assert.match(esConfig, /dir: "ltr"/);
    const esMessages = spanish.find((file) => file.path === "lib/i18n/messages.ts")!.content;
    assert.match(esMessages, /"auth\.signIn": "Iniciar sesión"/);

    const unsupported = buildWebAppI18nFiles("Klingon");
    const fallbackConfig = unsupported.find((file) => file.path === "lib/i18n/config.ts")!.content;
    assert.match(fallbackConfig, /language: "English"/);
    assert.match(fallbackConfig, /htmlLang: "en"/);
    assert.match(fallbackConfig, /dir: "ltr"/);
  });

  it("emits i18n modules with default fallback translator", () => {
    const files = buildWebAppI18nFiles("Arabic");
    const paths = new Set(files.map((file) => file.path));
    for (const required of [
      "lib/i18n/config.ts",
      "lib/i18n/default-messages.ts",
      "lib/i18n/messages.ts",
      "lib/i18n/t.ts",
      "lib/i18n/index.ts",
    ]) {
      assert.equal(paths.has(required), true, required);
    }
    const config = files.find((file) => file.path === "lib/i18n/config.ts")!.content;
    assert.match(config, /dir: "rtl"/);
    assert.match(config, /htmlLang: "ar"/);
    const tModule = files.find((file) => file.path === "lib/i18n/t.ts")!.content;
    assert.match(tModule, /defaultMessages/);
    assert.match(tModule, /active \?\? fallback/);
    assert.match(tModule, /t\(`entity\.\$\{entity\}`\)/);
    const messages = files.find((file) => file.path === "lib/i18n/messages.ts")!.content;
    assert.match(messages, /"entity\.Contact": "جهة اتصال"/);
    assert.match(messages, /"Contact": "جهة اتصال"/);
  });

  it("scaffolds Arabic CRM entities with localized names via te()/t()", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "CRM",
      language: "Arabic",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Contact", "Deal", "Company", "Subscription"],
    });
    const hardened = hardenGeneratedWebApp(scaffold);
    const contactPage = hardened.find(
      (file) => file.path === "app/dashboard/contacts/page.tsx",
    )!;
    assert.match(contactPage.content, /te\(ENTITY\)/);
    assert.doesNotMatch(contactPage.content, />Contact<|>Deal</);

    const dash = hardened.find((file) => file.path === "app/dashboard/page.tsx")!;
    assert.match(dash.content, /te\(link\.entity\)/);
    assert.doesNotMatch(dash.content, /"label":\s*"Contact"/);

    const messages = hardened.find((file) => file.path === "lib/i18n/messages.ts")!;
    assert.match(messages.content, /جهة اتصال/);
    assert.match(messages.content, /صفقة/);
    assert.match(messages.content, /اشتراك/);

    assert.deepEqual(findWebAppEntityTranslationReadinessIssues(hardened), []);
    assert.deepEqual(findWebAppI18nReadinessIssues(hardened), []);
  });

  it("fails readiness when an entity translation is missing", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "CRM",
      language: "English",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Contact"],
    });
    const broken = scaffold.map((file) => {
      if (file.path !== "lib/i18n/messages.ts") return file;
      return {
        ...file,
        content: file.content
          .replace(/^\s*"entity\.Contact":\s*"[^"]*",?\r?\n/gm, "")
          .replace(/^\s*"Contact":\s*"[^"]*",?\r?\n/gm, ""),
      };
    });
    const issues = findWebAppEntityTranslationReadinessIssues(broken);
    assert.ok(
      issues.some((issue) => issue.includes("Contact")),
      issues.join("\n"),
    );
  });

  it("scaffolds Arabic apps with t()/te() and no hardcoded English UI literals", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "عيادة الحجوزات",
      language: "Arabic",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Booking", "Service"],
    });
    const hardened = hardenGeneratedWebApp(scaffold);
    const login = hardened.find((file) => file.path === "app/login/page.tsx")!;
    assert.match(login.content, /t\("auth\.signIn"\)/);
    assert.doesNotMatch(login.content, /"Sign in"|'Sign in'|>Sign in</);
    assert.match(login.content, /className/);
    assert.match(login.content, /setEmail/);

    const layout = hardened.find((file) => file.path === "app/layout.tsx")!;
    assert.match(layout.content, /lang=\{locale\.htmlLang\}/);
    assert.match(layout.content, /dir=\{locale\.dir\}/);

    const messages = hardened.find((file) => file.path === "lib/i18n/messages.ts")!;
    assert.match(messages.content, /تسجيل الدخول/);

    const i18nIssues = findWebAppI18nReadinessIssues(hardened);
    assert.deepEqual(i18nIssues, []);

    const ready = assertWebAppReady(hardened, {
      requiresAuth: true,
      requiresDatabase: true,
    });
    assert.equal(ready.ready, true, ready.issues.join("\n"));
  });

  it("fails readiness when UI hardcodes English copy", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Clinic",
      language: "English",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item"],
    });
    const broken = scaffold.map((file) =>
      file.path === "app/login/page.tsx"
        ? {
            ...file,
            content: `"use client";
export default function LoginPage() {
  return <h1>Sign in</h1>;
}
`,
          }
        : file,
    );
    const issues = findWebAppI18nReadinessIssues(broken);
    assert.ok(
      issues.some((issue) => issue.includes("hardcoded UI string")),
      issues.join("\n"),
    );
  });
});
