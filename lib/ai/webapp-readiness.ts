/**
 * Trust readiness gate — fail delivery when auth/schema contracts are still fake
 * or incomplete. Complements validateWebAppProject path checks.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  findAuthContractIssues,
  findWebAppTypeScriptContractIssues,
} from "@/lib/ai/webapp-harden";
import { normalizePath } from "@/lib/ai/webapp-harden-shared";
import {
  crudRouteHasInputValidation,
  crudRouteHasMassAssignmentRisk,
} from "@/lib/ai/webapp-domain-scaffold";
import {
  previewHtmlHasUnsafeVectors,
  sanitizeAppPreviewHtml,
} from "@/lib/webapp/sanitize-app-preview-html";
import { EN_WEBAPP_MESSAGES } from "@/lib/ai/webapp-i18n/dictionaries/en";
import {
  canUseWebAppUiPackForRequest,
  detectWebAppUiDictionaryLanguage,
  findCrossLanguageMessageKeys,
  findMissingWebAppEntityTranslations,
  findWebAppSelectableLanguagePackIssues,
  getWebAppI18nScaffoldPaths,
  getWebAppLocaleMeta,
  hasCompleteWebAppUiTranslationPack,
  isWebAppSupportedRtlLanguage,
  resolveWebAppTextDirection,
  WEBAPP_ENTITY_KEYS,
} from "@/lib/ai/webapp-i18n";
import {
  getGlsGenerationLanguageValues,
  normalizeGlsGenerationLanguage,
} from "@/lib/language-platform/generation/options";

export type WebAppReadinessFlags = {
  requiresAuth?: boolean;
  requiresDatabase?: boolean;
};

/** English UI phrases that must never appear as string literals in generated UI. */
const BANNED_HARDCODED_UI_PHRASES = [
  EN_WEBAPP_MESSAGES["auth.signIn"],
  EN_WEBAPP_MESSAGES["auth.signInSubtitle"],
  EN_WEBAPP_MESSAGES["auth.createAccount"],
  EN_WEBAPP_MESSAGES["auth.createAccountSubtitle"],
  EN_WEBAPP_MESSAGES["dashboard.overviewSubtitle"],
  EN_WEBAPP_MESSAGES["dashboard.emptyHint"],
  EN_WEBAPP_MESSAGES["crud.recordsSubtitle"],
  EN_WEBAPP_MESSAGES["crud.newRecord"],
  EN_WEBAPP_MESSAGES["crud.empty"],
  EN_WEBAPP_MESSAGES["auth.noAccount"],
  EN_WEBAPP_MESSAGES["auth.alreadyRegistered"],
  EN_WEBAPP_MESSAGES["meta.description"],
] as const;

const UI_SOURCE_PATH =
  /^(app\/.*\.(tsx|jsx)|components\/.*\.(tsx|jsx)|hooks\/.*\.(ts|tsx)|middleware\.ts)$/;

function hasQuotedLiteral(content: string, phrase: string): boolean {
  if (!phrase || phrase.length < 3) return false;
  return (
    content.includes(`"${phrase}"`) ||
    content.includes(`'${phrase}'`) ||
    content.includes(`\`${phrase}\``) ||
    content.includes(`>${phrase}<`)
  );
}

function parseGeneratedEntityDictionary(
  content: string,
): Record<string, string> {
  const entities: Record<string, string> = {};
  const entityBlock = content.match(
    /export const entities\s*=\s*\{([\s\S]*?)\}\s*as const/,
  );
  const messageBlock = content.match(
    /export const messages\s*=\s*\{([\s\S]*?)\}\s*as const/,
  );
  const block = entityBlock?.[1] ?? "";
  for (const match of block.matchAll(
    /["']([A-Za-z][A-Za-z0-9]*)["']\s*:\s*["']([^"']*)["']/g,
  )) {
    entities[match[1]!] = match[2]!;
  }
  const messages = messageBlock?.[1] ?? "";
  for (const match of messages.matchAll(
    /["']entity\.([A-Za-z][A-Za-z0-9]*)["']\s*:\s*["']([^"']*)["']/g,
  )) {
    if (!entities[match[1]!]) entities[match[1]!] = match[2]!;
  }
  return entities;
}

function collectReferencedEntities(files: GeneratedProjectFile[]): string[] {
  const found = new Set<string>();
  for (const file of files) {
    const path = normalizePath(file.path);
    if (!UI_SOURCE_PATH.test(path) && !path.startsWith("lib/i18n/")) continue;
    for (const match of file.content.matchAll(
      /\bENTITY\s*=\s*["']([A-Za-z][A-Za-z0-9]*)["']/g,
    )) {
      found.add(match[1]!);
    }
    for (const match of file.content.matchAll(
      /entity\s*:\s*["']([A-Za-z][A-Za-z0-9]*)["']/g,
    )) {
      found.add(match[1]!);
    }
    for (const match of file.content.matchAll(
      /\bte\(\s*["']([A-Za-z][A-Za-z0-9]*)["']\s*\)/g,
    )) {
      found.add(match[1]!);
    }
    for (const match of file.content.matchAll(
      /\bt\(\s*["']entity\.([A-Za-z][A-Za-z0-9]*)["']/g,
    )) {
      found.add(match[1]!);
    }
  }
  return [...found];
}

/**
 * Fail readiness when the generated entity catalog is incomplete or a
 * referenced entity has no translation.
 */
export function findWebAppEntityTranslationReadinessIssues(
  files: GeneratedProjectFile[],
): string[] {
  const issues: string[] = [];
  const messagesFile = fileByPath(files, "lib/i18n/messages.ts");
  if (!messagesFile) {
    issues.push("Missing i18n file: lib/i18n/messages.ts");
    return issues;
  }

  const entities = parseGeneratedEntityDictionary(messagesFile.content);
  const missingCatalog = findMissingWebAppEntityTranslations(
    entities,
    WEBAPP_ENTITY_KEYS,
  );
  for (const entity of missingCatalog) {
    issues.push(
      `lib/i18n/messages.ts: missing entity translation for ${JSON.stringify(entity)}.`,
    );
  }

  const tModule = fileByPath(files, "lib/i18n/t.ts");
  if (
    tModule &&
    !/function te\(/.test(tModule.content) &&
    !/export function te\(/.test(tModule.content)
  ) {
    issues.push('lib/i18n/t.ts: entity translator te() must resolve through t("entity.*").');
  } else if (
    tModule &&
    !/t\(`entity\.\$\{entity\}`\)/.test(tModule.content) &&
    !/t\("entity\./.test(tModule.content)
  ) {
    issues.push(
      'lib/i18n/t.ts: te() must resolve entity labels through t("entity.*").',
    );
  }

  for (const entity of collectReferencedEntities(files)) {
    const value = entities[entity];
    if (typeof value !== "string" || value.trim().length === 0) {
      issues.push(
        `Missing entity translation for referenced entity ${JSON.stringify(entity)}.`,
      );
    }
  }

  for (const file of files) {
    const path = normalizePath(file.path);
    if (!UI_SOURCE_PATH.test(path)) continue;
    if (path.startsWith("lib/i18n/")) continue;
    // Hardcoded English entity labels in JSX/text (not keys / constants).
    for (const entity of WEBAPP_ENTITY_KEYS) {
      if (
        hasQuotedLiteral(file.content, entity) &&
        !new RegExp(
          `ENTITY\\s*=\\s*["']${entity}["']|entity\\s*:\\s*["']${entity}["']`,
        ).test(file.content)
      ) {
        // Only flag when used as visible copy patterns like >Contact< or title strings
        // that are not the machine id assignment above.
        if (
          file.content.includes(`>${entity}<`) ||
          file.content.includes(`"${entity} records"`) ||
          file.content.includes(`'${entity} records'`)
        ) {
          issues.push(
            `${path}: hardcoded entity label ${JSON.stringify(entity)} — use te()/t("entity.*").`,
          );
        }
      }
    }
  }

  return issues;
}

function parseGeneratedMessageDictionary(
  content: string,
): Record<string, string> {
  const messages: Record<string, string> = {};
  const messageBlock = content.match(
    /export const messages\s*=\s*\{([\s\S]*?)\}\s*as const/,
  );
  const block = messageBlock?.[1] ?? "";
  for (const match of block.matchAll(
    /["']([^"']+)["']\s*:\s*["']([^"']*)["']/g,
  )) {
    messages[match[1]!] = match[2]!;
  }
  return messages;
}

function parseGeneratedLocaleConfig(content: string): {
  language: string | null;
  localeCode: string | null;
  htmlLang: string | null;
  dir: string | null;
} {
  return {
    language: content.match(/language:\s*["']([^"']+)["']/)?.[1] ?? null,
    localeCode: content.match(/localeCode:\s*["']([^"']+)["']/)?.[1] ?? null,
    htmlLang: content.match(/htmlLang:\s*["']([^"']+)["']/)?.[1] ?? null,
    dir: content.match(/dir:\s*["']([^"']+)["']/)?.[1] ?? null,
  };
}

/**
 * Fail readiness when lang/locale/metadata and active UI strings are not a
 * single consistent language (mixed-language apps).
 */
export function findWebAppMixedLanguageReadinessIssues(
  files: GeneratedProjectFile[],
): string[] {
  const issues: string[] = [];
  const configFile = fileByPath(files, "lib/i18n/config.ts");
  const messagesFile = fileByPath(files, "lib/i18n/messages.ts");
  if (!configFile || !messagesFile) return issues;

  const config = parseGeneratedLocaleConfig(configFile.content);
  const language = config.language
    ? normalizeGlsGenerationLanguage(config.language)
    : null;

  if (!language) {
    issues.push("lib/i18n/config.ts: missing generation language.");
    return issues;
  }

  if (!hasCompleteWebAppUiTranslationPack(language)) {
    issues.push(
      `lib/i18n/config.ts: generation language ${JSON.stringify(language)} is unsupported — refuse mixed fallback chrome.`,
    );
    return issues;
  }

  const expected = getWebAppLocaleMeta(language);
  if (!expected) {
    issues.push(
      `lib/i18n/config.ts: unable to resolve locale metadata for ${JSON.stringify(language)}.`,
    );
    return issues;
  }

  if (config.htmlLang && config.htmlLang !== expected.htmlLang) {
    issues.push(
      `lib/i18n/config.ts: htmlLang ${JSON.stringify(config.htmlLang)} does not match UI language ${JSON.stringify(language)} (expected ${JSON.stringify(expected.htmlLang)}).`,
    );
  }
  if (config.dir && config.dir !== expected.dir) {
    issues.push(
      `lib/i18n/config.ts: dir ${JSON.stringify(config.dir)} does not match UI language ${JSON.stringify(language)} (expected ${JSON.stringify(expected.dir)}).`,
    );
  }
  if (config.localeCode && config.localeCode !== expected.localeCode) {
    issues.push(
      `lib/i18n/config.ts: localeCode ${JSON.stringify(config.localeCode)} does not match UI language ${JSON.stringify(language)} (expected ${JSON.stringify(expected.localeCode)}).`,
    );
  }

  const activeMessages = parseGeneratedMessageDictionary(messagesFile.content);
  const fingerprint = detectWebAppUiDictionaryLanguage(activeMessages);
  if (fingerprint && fingerprint !== language) {
    issues.push(
      `Mixed-language UI detected: config language is ${JSON.stringify(language)} but active messages match ${JSON.stringify(fingerprint)}.`,
    );
  }

  const crossKeys = findCrossLanguageMessageKeys(language, activeMessages);
  if (crossKeys.length > 0) {
    issues.push(
      `Mixed-language UI strings in lib/i18n/messages.ts for keys: ${crossKeys.slice(0, 8).join(", ")}${crossKeys.length > 8 ? ", …" : ""}.`,
    );
  }

  // English apps must not ship Arabic-script UI copy in page sources.
  if (language === "English") {
    const arabicScript = /[\u0600-\u06FF]/;
    for (const file of files) {
      const path = normalizePath(file.path);
      if (!UI_SOURCE_PATH.test(path) || path.startsWith("lib/i18n/")) continue;
      if (arabicScript.test(file.content)) {
        issues.push(
          `${path}: Arabic-script UI copy found in an English-language app (mixed language).`,
        );
      }
    }
  }

  return issues;
}

/**
 * Fail readiness on any RTL/LTR mismatch between language, htmlLang, dir,
 * and active messages. RTL is only valid for fully supported RTL packs.
 */
export function findWebAppRtlLtrReadinessIssues(
  files: GeneratedProjectFile[],
): string[] {
  const issues: string[] = [];
  const configFile = fileByPath(files, "lib/i18n/config.ts");
  const messagesFile = fileByPath(files, "lib/i18n/messages.ts");
  if (!configFile) return issues;

  const config = parseGeneratedLocaleConfig(configFile.content);
  const language = config.language
    ? normalizeGlsGenerationLanguage(config.language)
    : null;

  if (!language) {
    issues.push("lib/i18n/config.ts: missing generation language for RTL/LTR checks.");
    return issues;
  }

  const expectedDir = resolveWebAppTextDirection(language);
  const supportedRtl = isWebAppSupportedRtlLanguage(language);

  if (config.dir === "rtl" && !supportedRtl) {
    issues.push(
      `RTL/LTR mismatch: dir="rtl" is only allowed for fully supported RTL languages; ${JSON.stringify(language)} is not supported RTL.`,
    );
  }

  if (config.dir && config.dir !== expectedDir) {
    issues.push(
      `RTL/LTR mismatch: dir ${JSON.stringify(config.dir)} does not match expected ${JSON.stringify(expectedDir)} for language ${JSON.stringify(language)}.`,
    );
  }

  if (language === "English" && config.dir === "rtl") {
    issues.push(
      'RTL/LTR mismatch: English UI must use dir="ltr".',
    );
  }

  if (supportedRtl && config.dir === "ltr") {
    issues.push(
      `RTL/LTR mismatch: supported RTL language ${JSON.stringify(language)} must use dir="rtl".`,
    );
  }

  const expected = getWebAppLocaleMeta(language);
  if (expected) {
    if (config.htmlLang && config.htmlLang !== expected.htmlLang) {
      issues.push(
        `RTL/LTR mismatch: htmlLang ${JSON.stringify(config.htmlLang)} is inconsistent with language ${JSON.stringify(language)} (expected ${JSON.stringify(expected.htmlLang)}).`,
      );
    }
    if (config.localeCode && config.localeCode !== expected.localeCode) {
      issues.push(
        `RTL/LTR mismatch: localeCode ${JSON.stringify(config.localeCode)} is inconsistent with language ${JSON.stringify(language)} (expected ${JSON.stringify(expected.localeCode)}).`,
      );
    }
  }

  if (messagesFile) {
    const activeMessages = parseGeneratedMessageDictionary(messagesFile.content);
    const fingerprint = detectWebAppUiDictionaryLanguage(activeMessages);
    if (fingerprint) {
      const messageDir = resolveWebAppTextDirection(fingerprint);
      if (config.dir && config.dir !== messageDir) {
        issues.push(
          `RTL/LTR mismatch: dir=${JSON.stringify(config.dir)} but active messages match ${JSON.stringify(fingerprint)} (${messageDir}).`,
        );
      }
      if (fingerprint !== language && (config.dir === "rtl" || messageDir === "rtl")) {
        issues.push(
          `RTL/LTR mismatch: config language ${JSON.stringify(language)} does not match message pack ${JSON.stringify(fingerprint)} under RTL/LTR rules.`,
        );
      }
    }
  }

  const layoutFile = fileByPath(files, "app/layout.tsx");
  if (layoutFile) {
    if (/dir\s*=\s*["']rtl["']/.test(layoutFile.content) && !supportedRtl) {
      issues.push(
        'app/layout.tsx: hardcoded dir="rtl" is not allowed unless the UI language is a fully supported RTL pack.',
      );
    }
    if (/dir\s*=\s*["']ltr["']/.test(layoutFile.content) && supportedRtl) {
      issues.push(
        `app/layout.tsx: hardcoded dir="ltr" conflicts with supported RTL language ${JSON.stringify(language)}.`,
      );
    }
    if (
      !/dir=\{locale\.dir\}/.test(layoutFile.content) &&
      !/dir\s*=\s*\{locale\.dir\}/.test(layoutFile.content)
    ) {
      // Only flag when layout exists but does not bind locale.dir (literal dirs caught above).
      if (!/dir\s*=/.test(layoutFile.content)) {
        issues.push(
          "app/layout.tsx: missing dir binding — must use dir={locale.dir} for RTL/LTR consistency.",
        );
      }
    }
  }

  return issues;
}

/**
 * Fail readiness when generated apps still hardcode English UI copy
 * instead of using the i18n dictionary + t(), or when a selectable
 * App Builder language lacks a complete UI translation pack.
 */
export function findWebAppI18nReadinessIssues(
  files: GeneratedProjectFile[],
): string[] {
  const issues: string[] = [];
  const paths = new Set(files.map((file) => normalizePath(file.path)));

  issues.push(
    ...findWebAppSelectableLanguagePackIssues(
      getGlsGenerationLanguageValues("app-builder"),
    ),
  );

  for (const required of getWebAppI18nScaffoldPaths()) {
    if (!paths.has(required)) {
      issues.push(`Missing i18n file: ${required}`);
    }
  }

  const tModule = fileByPath(files, "lib/i18n/t.ts");
  if (tModule && !/defaultMessages/.test(tModule.content)) {
    issues.push(
      "lib/i18n/t.ts: translator must fall back to defaultMessages for missing keys.",
    );
  }

  const configFile = fileByPath(files, "lib/i18n/config.ts");
  if (configFile) {
    const languageMatch = configFile.content.match(
      /language:\s*["']([^"']+)["']/,
    );
    const rawLanguage = languageMatch?.[1]?.trim() || null;
    if (rawLanguage && !canUseWebAppUiPackForRequest(rawLanguage)) {
      issues.push(
        `lib/i18n/config.ts: generation language ${JSON.stringify(rawLanguage)} has no complete UI translation pack.`,
      );
    }
  }

  issues.push(...findWebAppEntityTranslationReadinessIssues(files));
  issues.push(...findWebAppMixedLanguageReadinessIssues(files));
  issues.push(...findWebAppRtlLtrReadinessIssues(files));

  const uiFiles = files.filter((file) =>
    UI_SOURCE_PATH.test(normalizePath(file.path)),
  );

  for (const file of uiFiles) {
    const path = normalizePath(file.path);
    if (path.startsWith("lib/i18n/")) continue;

    for (const phrase of BANNED_HARDCODED_UI_PHRASES) {
      if (hasQuotedLiteral(file.content, phrase)) {
        issues.push(
          `${path}: hardcoded UI string ${JSON.stringify(phrase)} — use t()/te() from @/lib/i18n.`,
        );
      }
    }

    if (
      (path.startsWith("app/login/") ||
        path.startsWith("app/signup/") ||
        path.startsWith("app/dashboard/")) &&
      !/@\/lib\/i18n/.test(file.content) &&
      /\breturn\s*\(/.test(file.content)
    ) {
      issues.push(`${path}: UI page must import translations from @/lib/i18n.`);
    }
  }

  const layoutFile = fileByPath(files, "app/layout.tsx");
  if (layoutFile) {
    const hasLang = /lang=\{locale\.htmlLang\}/.test(layoutFile.content);
    const hasDir = /dir=\{locale\.dir\}/.test(layoutFile.content);
    if (!hasLang || !hasDir) {
      issues.push(
        "app/layout.tsx: root layout must set lang={locale.htmlLang} and dir={locale.dir} from @/lib/i18n.",
      );
    }
  }

  return issues;
}

function fileByPath(
  files: GeneratedProjectFile[],
  path: string,
): GeneratedProjectFile | undefined {
  return files.find((file) => normalizePath(file.path) === path);
}

function isFakeLoginRoute(content: string): boolean {
  const setsCookie = /jar\.set\s*\(\s*\{[^}]*name:\s*["']session["']/.test(content);
  const verifies = /verifyPassword/.test(content);
  const looksUpUser = /db\.user\.findUnique/.test(content);
  return setsCookie && (!verifies || !looksUpUser);
}

function schemaHasUserRole(content: string): boolean {
  const userModel = content.match(/model\s+User\s*\{[^}]*\}/);
  return Boolean(userModel && /\brole\b/.test(userModel[0]));
}

function schemaBusinessModelsHaveOwnerId(content: string): boolean {
  const models = [...content.matchAll(/model\s+(\w+)\s*\{([^}]*)\}/g)];
  const business = models.filter(
    (match) => match[1] !== "User" && match[1] !== "Session",
  );
  if (business.length === 0) return true;
  return business.every((match) => /\bownerId\b/.test(match[2]));
}

function middlewareHasVerifiedSession(content: string): boolean {
  return (
    /verifySessionCookie/.test(content) &&
    /async\s+function\s+middleware/.test(content) &&
    (/Forbidden/.test(content) || /403/.test(content)) &&
    (/STAFF_ROLES/.test(content) || /\brole\b/.test(content)) &&
    !/session_role\?\.(?:value|get)/.test(content) &&
    !/cookies\.get\(\s*["']session_role["']\s*\)/.test(content)
  );
}

function crudRouteHasRbac(content: string): boolean {
  const usesSessionRole =
    /isStaffRole\s*\(\s*session\.role\s*\)/.test(content) ||
    /requireRole\s*\(/.test(content) ||
    /session\.role/.test(content);
  const scopesOwner =
    /ownerId:\s*session\.userId/.test(content) ||
    /existing\.ownerId\s*!==\s*session\.userId/.test(content);
  const deniesForbidden = /Forbidden/.test(content) || /status:\s*403/.test(content);
  return usesSessionRole && scopesOwner && deniesForbidden;
}

function isEntityCrudApiPath(path: string): boolean {
  return (
    /^app\/api\/[^/]+\/route\.(ts|js)$/.test(path) &&
    !path.startsWith("app/api/auth/")
  );
}

/**
 * Static trust checks for generated apps before they are treated as deliverable.
 */
export function findWebAppReadinessIssues(
  files: GeneratedProjectFile[],
  flags: WebAppReadinessFlags = {},
): string[] {
  const issues: string[] = [];
  const paths = new Set(files.map((file) => normalizePath(file.path)));
  const requiresAuth = Boolean(flags.requiresAuth) || paths.has("app/login/page.tsx");
  const requiresDatabase =
    Boolean(flags.requiresDatabase) ||
    paths.has("prisma/schema.prisma") ||
    requiresAuth;

  if (requiresAuth) {
    for (const required of [
      "lib/password.ts",
      "lib/session-cookie.ts",
      "lib/auth.ts",
      "lib/db.ts",
      "app/api/auth/login/route.ts",
      "app/api/auth/signup/route.ts",
      "app/api/auth/logout/route.ts",
      "app/login/page.tsx",
      "app/signup/page.tsx",
      "middleware.ts",
      "prisma/schema.prisma",
    ]) {
      if (!paths.has(required)) {
        issues.push(`Missing trust-critical file: ${required}`);
      }
    }

    const login = fileByPath(files, "app/api/auth/login/route.ts");
    if (login && isFakeLoginRoute(login.content)) {
      issues.push(
        "app/api/auth/login/route.ts: login must verify passwordHash against User (reject any-password cookie sessions).",
      );
    }
    if (login && !/signSessionCookie/.test(login.content)) {
      issues.push(
        "app/api/auth/login/route.ts: login must issue a signed session cookie via signSessionCookie.",
      );
    }

    const signup = fileByPath(files, "app/api/auth/signup/route.ts");
    if (signup && !/hashPassword/.test(signup.content)) {
      issues.push(
        "app/api/auth/signup/route.ts: signup must hash passwords with hashPassword.",
      );
    }
    if (signup && !/\brole\b/.test(signup.content)) {
      issues.push(
        "app/api/auth/signup/route.ts: signup must assign a User.role (first user admin).",
      );
    }
    if (signup && !/signSessionCookie/.test(signup.content)) {
      issues.push(
        "app/api/auth/signup/route.ts: signup must issue a signed session cookie via signSessionCookie.",
      );
    }

    const password = fileByPath(files, "lib/password.ts");
    if (
      password &&
      (!/hashPassword/.test(password.content) || !/verifyPassword/.test(password.content))
    ) {
      issues.push(
        "lib/password.ts: must export hashPassword and verifyPassword (scrypt).",
      );
    }

    const sessionCookie = fileByPath(files, "lib/session-cookie.ts");
    if (
      sessionCookie &&
      (!/signSessionCookie/.test(sessionCookie.content) ||
        !/verifySessionCookie/.test(sessionCookie.content))
    ) {
      issues.push(
        "lib/session-cookie.ts: must export signSessionCookie and verifySessionCookie.",
      );
    }

    const auth = fileByPath(files, "lib/auth.ts");
    if (auth && !/verifySessionCookie/.test(auth.content)) {
      issues.push(
        "lib/auth.ts: getSession must verify the signed session cookie before DB lookup.",
      );
    }

    const schema = fileByPath(files, "prisma/schema.prisma");
    if (schema) {
      if (!/\bpasswordHash\b/.test(schema.content)) {
        issues.push("prisma/schema.prisma: User must include passwordHash.");
      }
      if (!/\bmodel\s+Session\b/.test(schema.content)) {
        issues.push("prisma/schema.prisma: Session model is required for DB-backed auth.");
      }
      if (!schemaHasUserRole(schema.content)) {
        issues.push("prisma/schema.prisma: User must include role for RBAC.");
      }
      if (!schemaBusinessModelsHaveOwnerId(schema.content)) {
        issues.push(
          "prisma/schema.prisma: business models must include ownerId for ownership checks.",
        );
      }
    }

    const middleware = fileByPath(files, "middleware.ts");
    if (middleware && !middlewareHasVerifiedSession(middleware.content)) {
      issues.push(
        "middleware.ts: must verify signed session cookies (verifySessionCookie) and deny forged/expired/invalid sessions on protected pages and APIs.",
      );
    }

    const entityApis = files.filter((file) =>
      isEntityCrudApiPath(normalizePath(file.path)),
    );
    if (entityApis.length === 0 && requiresDatabase) {
      issues.push(
        "Missing trust-critical RBAC CRUD API under app/api/{entity}/route.ts.",
      );
    }
    for (const api of entityApis) {
      const path = normalizePath(api.path);
      if (!crudRouteHasRbac(api.content)) {
        issues.push(
          `${path}: CRUD API must enforce session.role (isStaffRole/requireRole) and ownerId ownership (403 Forbidden).`,
        );
      }
      if (
        !crudRouteHasInputValidation(api.content) ||
        crudRouteHasMassAssignmentRisk(api.content)
      ) {
        issues.push(
          `${path}: CRUD API must validate bodies with Zod .strict() allowlists and must not mass-assign request bodies into Prisma.`,
        );
      }
    }

    issues.push(...findAuthContractIssues(files));
  }

  if (requiresDatabase) {
    if (!paths.has("lib/db.ts")) {
      issues.push("Missing trust-critical file: lib/db.ts");
    }
    if (!paths.has("prisma/schema.prisma")) {
      issues.push("Missing trust-critical file: prisma/schema.prisma");
    }
  }

  for (const previewPath of ["preview/index.html", "public/preview.html"]) {
    const preview = fileByPath(files, previewPath);
    if (!preview?.content?.includes("<html")) continue;
    const sanitized = sanitizeAppPreviewHtml(preview.content);
    if (previewHtmlHasUnsafeVectors(sanitized)) {
      issues.push(
        `${previewPath}: preview HTML remains unsafe after sanitization (scripts/handlers/javascript: URLs).`,
      );
    }
    if (previewHtmlHasUnsafeVectors(preview.content)) {
      issues.push(
        `${previewPath}: preview HTML must be sanitized — scripts, event handlers, and javascript: URLs are not allowed.`,
      );
    }
  }

  issues.push(...findWebAppTypeScriptContractIssues(files));
  issues.push(...findWebAppI18nReadinessIssues(files));

  return [...new Set(issues)];
}

export function assertWebAppReady(
  files: GeneratedProjectFile[],
  flags: WebAppReadinessFlags = {},
): { ready: boolean; issues: string[] } {
  const issues = findWebAppReadinessIssues(files, flags);
  return { ready: issues.length === 0, issues };
}
