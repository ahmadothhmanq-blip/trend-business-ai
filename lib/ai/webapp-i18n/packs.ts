/**
 * UI translation packs for generated App Builder apps.
 * Selectable generation languages are derived only from complete packs.
 */

import {
  AR_WEBAPP_ENTITIES,
  AR_WEBAPP_MESSAGES,
} from "@/lib/ai/webapp-i18n/dictionaries/ar";
import {
  EN_WEBAPP_ENTITIES,
  EN_WEBAPP_MESSAGES,
} from "@/lib/ai/webapp-i18n/dictionaries/en";
import worldPacksJson from "@/lib/ai/webapp-i18n/dictionaries/world-packs.json";
import {
  WEBAPP_ENTITY_KEYS,
  WEBAPP_I18N_KEYS,
  type WebAppEntityDictionary,
  type WebAppI18nDictionary,
} from "@/lib/ai/webapp-i18n/keys";

export type WebAppUiTranslationPack = {
  messages: WebAppI18nDictionary;
  entities: WebAppEntityDictionary;
};

type WorldPackJson = {
  messages: Record<string, string>;
  entities: Record<string, string>;
};

function asUiPack(pack: WorldPackJson): WebAppUiTranslationPack {
  return {
    messages: pack.messages as WebAppI18nDictionary,
    entities: pack.entities as WebAppEntityDictionary,
  };
}

const WORLD_UI_TRANSLATION_PACKS: Record<string, WebAppUiTranslationPack> =
  Object.fromEntries(
    Object.entries(worldPacksJson as Record<string, WorldPackJson>).map(
      ([language, pack]) => [language, asUiPack(pack)],
    ),
  );

/** Registered generation-language → UI pack map (canonical GLS values). */
export const WEBAPP_UI_TRANSLATION_PACKS: Record<string, WebAppUiTranslationPack> =
  {
    English: { messages: EN_WEBAPP_MESSAGES, entities: EN_WEBAPP_ENTITIES },
    Arabic: { messages: AR_WEBAPP_MESSAGES, entities: AR_WEBAPP_ENTITIES },
    ...WORLD_UI_TRANSLATION_PACKS,
  };

/** True when every required UI message key exists and is non-empty. */
export function isCompleteWebAppUiDictionary(
  messages: Partial<Record<string, string>> | null | undefined,
): boolean {
  if (!messages) return false;
  return WEBAPP_I18N_KEYS.every((key) => {
    const value = messages[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/** True when every known entity has a non-empty display translation. */
export function isCompleteWebAppEntityDictionary(
  entities: Partial<Record<string, string>> | null | undefined,
): boolean {
  if (!entities) return false;
  return WEBAPP_ENTITY_KEYS.every((key) => {
    const value = entities[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function hasCompleteWebAppUiTranslationPack(
  language?: string | null,
): boolean {
  const raw = (language ?? "").trim();
  if (!raw) return false;
  const pack = WEBAPP_UI_TRANSLATION_PACKS[raw];
  return Boolean(
    pack &&
      isCompleteWebAppUiDictionary(pack.messages) &&
      isCompleteWebAppEntityDictionary(pack.entities),
  );
}

/**
 * Canonical GLS language values that currently ship a complete UI dictionary.
 * The App Builder language selector must be built from this list only.
 */
export function getWebAppUiTranslationPackLanguages(): readonly string[] {
  return Object.keys(WEBAPP_UI_TRANSLATION_PACKS).filter((language) =>
    hasCompleteWebAppUiTranslationPack(language),
  );
}

export function getWebAppUiTranslationPack(
  language?: string | null,
): WebAppUiTranslationPack | null {
  const raw = (language ?? "").trim();
  if (!raw) return null;
  const pack = WEBAPP_UI_TRANSLATION_PACKS[raw];
  if (
    !pack ||
    !isCompleteWebAppUiDictionary(pack.messages) ||
    !isCompleteWebAppEntityDictionary(pack.entities)
  ) {
    return null;
  }
  return pack;
}

/**
 * Host integrity: every language exposed in the App Builder selector must have
 * a complete UI dictionary. Returns human-readable readiness issues.
 */
export function findWebAppSelectableLanguagePackIssues(
  selectableLanguages: readonly string[],
): string[] {
  const issues: string[] = [];
  for (const language of selectableLanguages) {
    if (!hasCompleteWebAppUiTranslationPack(language)) {
      issues.push(
        `Selectable generation language ${JSON.stringify(language)} has no complete UI translation pack.`,
      );
    }
  }
  return issues;
}

/** Missing entity keys for a dictionary (empty / absent translations). */
export function findMissingWebAppEntityTranslations(
  entities: Partial<Record<string, string>> | null | undefined,
  required: readonly string[] = WEBAPP_ENTITY_KEYS,
): string[] {
  if (!entities) return [...required];
  return required.filter((key) => {
    const value = entities[key];
    return typeof value !== "string" || value.trim().length === 0;
  });
}

/** Probe keys used to fingerprint which UI pack an active dictionary matches. */
export const WEBAPP_UI_LANGUAGE_PROBE_KEYS = [
  "auth.signIn",
  "auth.createAccount",
  "auth.signInSubtitle",
  "nav.overview",
  "crud.newRecord",
  "dashboard.emptyHint",
  "entity.Contact",
  "entity.Deal",
] as const;

/**
 * Score how well `messages` matches each complete UI pack.
 * Returns the best-matching language, or null when no probe keys match.
 */
export function detectWebAppUiDictionaryLanguage(
  messages: Partial<Record<string, string>> | null | undefined,
): string | null {
  if (!messages) return null;
  let bestLanguage: string | null = null;
  let bestScore = 0;

  for (const language of getWebAppUiTranslationPackLanguages()) {
    const pack = WEBAPP_UI_TRANSLATION_PACKS[language];
    if (!pack) continue;
    let score = 0;
    for (const key of WEBAPP_UI_LANGUAGE_PROBE_KEYS) {
      if (messages[key] && messages[key] === pack.messages[key]) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLanguage = language;
    }
  }

  return bestScore > 0 ? bestLanguage : null;
}

/**
 * Keys whose active value matches another pack while differing from the
 * declared language pack — evidence of mixed-language UI strings.
 */
export function findCrossLanguageMessageKeys(
  declaredLanguage: string,
  messages: Partial<Record<string, string>> | null | undefined,
): string[] {
  if (!messages) return [];
  const declared = getWebAppUiTranslationPack(declaredLanguage);
  if (!declared) return [];

  const mixed: string[] = [];
  for (const key of WEBAPP_I18N_KEYS) {
    const active = messages[key];
    if (typeof active !== "string" || !active.trim()) continue;
    const expected = declared.messages[key];
    if (active === expected) continue;

    for (const otherLanguage of getWebAppUiTranslationPackLanguages()) {
      if (otherLanguage === declaredLanguage) continue;
      const other = WEBAPP_UI_TRANSLATION_PACKS[otherLanguage];
      if (!other) continue;
      if (active === other.messages[key] && other.messages[key] !== expected) {
        mixed.push(key);
        break;
      }
    }
  }
  return mixed;
}
