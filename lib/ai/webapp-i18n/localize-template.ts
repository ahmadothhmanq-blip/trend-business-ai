/**
 * Resolve App Builder template labels through the UI dictionary.
 * Templates store structural English keys; display must never ship those
 * raw when a generation language pack exists.
 */

import {
  WEBAPP_ENTITY_KEYS,
  type WebAppEntityKey,
  type WebAppI18nKey,
} from "@/lib/ai/webapp-i18n/keys";
import {
  resolveWebAppLocale,
  translateWebAppEntity,
  translateWebAppMessage,
  type ResolvedWebAppLocale,
} from "@/lib/ai/webapp-i18n/resolve-locale";

const ENTITY_SET = new Set<string>(WEBAPP_ENTITY_KEYS);

const CHROME_LABEL_KEYS: Record<string, WebAppI18nKey> = {
  login: "auth.signIn",
  signin: "auth.signIn",
  "sign in": "auth.signIn",
  dashboard: "nav.dashboard",
  overview: "nav.overview",
  home: "home.getStarted",
  admin: "role.admin",
};

function singularizeLabel(raw: string): string {
  const trimmed = raw.trim();
  if (/ies$/i.test(trimmed)) return `${trimmed.slice(0, -3)}y`;
  if (/ses$/i.test(trimmed)) return trimmed.slice(0, -2);
  if (/s$/i.test(trimmed) && !/ss$/i.test(trimmed)) return trimmed.slice(0, -1);
  return trimmed;
}

function matchEntityKey(raw: string): WebAppEntityKey | null {
  const trimmed = raw.trim();
  if (ENTITY_SET.has(trimmed)) return trimmed as WebAppEntityKey;
  const compact = trimmed.replace(/[\s_-]+/g, "");
  if (ENTITY_SET.has(compact)) return compact as WebAppEntityKey;
  const singular = singularizeLabel(compact);
  if (ENTITY_SET.has(singular)) return singular as WebAppEntityKey;
  // Contacts → Contact, Bookings → Booking
  const titled = singular.charAt(0).toUpperCase() + singular.slice(1);
  if (ENTITY_SET.has(titled)) return titled as WebAppEntityKey;
  return null;
}

/** Localize a template nav/screen/entity label for the active generation language. */
export function localizeAppTemplateLabel(
  locale: ResolvedWebAppLocale,
  raw: string,
): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return translateWebAppMessage(locale, "nav.overview");

  const entity = matchEntityKey(trimmed);
  if (entity) return translateWebAppEntity(locale, entity);

  const chromeKey = CHROME_LABEL_KEYS[trimmed.toLowerCase()];
  if (chromeKey) return translateWebAppMessage(locale, chromeKey);

  // Non-English generations must not surface leftover English template chrome.
  if (locale.language !== "English" && /^[\x00-\x7F]+$/.test(trimmed)) {
    return translateWebAppMessage(locale, "nav.overview");
  }
  return trimmed;
}

export function localizeAppTemplateRole(
  locale: ResolvedWebAppLocale,
  raw: string,
): string {
  const key = raw.trim().toLowerCase();
  const roleKey = `role.${key}` as WebAppI18nKey;
  if (
    roleKey === "role.admin" ||
    roleKey === "role.manager" ||
    roleKey === "role.employee" ||
    roleKey === "role.user"
  ) {
    return translateWebAppMessage(locale, roleKey);
  }
  if (locale.language !== "English" && /^[\x00-\x7F]+$/.test(raw.trim())) {
    return translateWebAppMessage(locale, "role.user");
  }
  return raw.trim();
}

/** Prefer data-binding entity, then screen name, for display + codegen keys. */
export function resolveAppScreenDisplayRef(screen: {
  name: string;
  dataBindings?: string[];
}): { kind: "entity" | "message"; key: string } {
  for (const binding of screen.dataBindings ?? []) {
    const entity = matchEntityKey(binding);
    if (entity) return { kind: "entity", key: entity };
  }
  const fromName = matchEntityKey(screen.name);
  if (fromName) return { kind: "entity", key: fromName };
  const chromeKey = CHROME_LABEL_KEYS[screen.name.trim().toLowerCase()];
  if (chromeKey) return { kind: "message", key: chromeKey };
  return { kind: "message", key: "nav.overview" };
}

export function resolveLocaleForAppModel(language?: string | null): ResolvedWebAppLocale {
  return resolveWebAppLocale(language);
}
