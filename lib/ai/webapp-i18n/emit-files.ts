/**
 * Emit runtime i18n modules into generated App Builder projects.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  resolveWebAppLocale,
  type ResolvedWebAppLocale,
} from "@/lib/ai/webapp-i18n/resolve-locale";

function serializeTsStringRecord(record: Record<string, string>): string {
  const lines = Object.entries(record).map(
    ([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
  );
  return `{\n${lines.join("\n")}\n}`;
}

export function buildWebAppI18nFiles(
  language?: string | null,
): GeneratedProjectFile[] {
  const locale = resolveWebAppLocale(language);
  return [
    {
      path: "lib/i18n/config.ts",
      language: "typescript",
      content: buildConfigModule(locale),
    },
    {
      path: "lib/i18n/default-messages.ts",
      language: "typescript",
      content: `/** Default language dictionary (English). Used when active translations are missing. */
export const defaultMessages = ${serializeTsStringRecord(locale.defaultMessages)} as const;

export const defaultEntities = ${serializeTsStringRecord(locale.defaultEntities)} as const;
`,
    },
    {
      path: "lib/i18n/messages.ts",
      language: "typescript",
      content: `/** Active generation-language dictionary. Incomplete keys fall back to defaultMessages. */
export const messages = ${serializeTsStringRecord(locale.messages)} as const;

export const entities = ${serializeTsStringRecord(locale.entities)} as const;
`,
    },
    {
      path: "lib/i18n/t.ts",
      language: "typescript",
      content: buildTModule(),
    },
    {
      path: "lib/i18n/index.ts",
      language: "typescript",
      content: `export { locale } from "@/lib/i18n/config";
export { t, te, tr } from "@/lib/i18n/t";
export { messages } from "@/lib/i18n/messages";
export { defaultMessages } from "@/lib/i18n/default-messages";
`,
    },
  ];
}

function buildConfigModule(locale: ResolvedWebAppLocale): string {
  return `export const locale = {
  language: ${JSON.stringify(locale.language)},
  localeCode: ${JSON.stringify(locale.localeCode)},
  htmlLang: ${JSON.stringify(locale.htmlLang)},
  dir: ${JSON.stringify(locale.dir)} as "ltr" | "rtl",
  nativeName: ${JSON.stringify(locale.nativeName)},
  defaultLanguage: "English",
} as const;

export type AppLocale = typeof locale;
`;
}

function buildTModule(): string {
  return `import { defaultMessages } from "@/lib/i18n/default-messages";
import { messages } from "@/lib/i18n/messages";

type Params = Record<string, string | number>;

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\\{(\\w+)\\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? \`{\${key}}\` : String(value);
  });
}

/**
 * Translate a UI message key.
 * Missing active-language entries fall back to the default language (English),
 * never to a mixed/partial phrase.
 */
export function t(key: string, params?: Params): string {
  const active = (messages as Record<string, string>)[key];
  const fallback = (defaultMessages as Record<string, string>)[key];
  const raw = active ?? fallback ?? key;
  return interpolate(raw, params);
}

/** Translate an entity/table display label through t("entity.*"). */
export function te(entity: string): string {
  return t(\`entity.\${entity}\`);
}

/** Translate a role display label. */
export function tr(role: string): string {
  return t(\`role.\${role}\`);
}
`;
}

export function getWebAppI18nScaffoldPaths(): string[] {
  return buildWebAppI18nFiles("English").map((file) => file.path);
}
