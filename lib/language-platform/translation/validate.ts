import type {
  GlsTranslationContract,
  GlsTranslationMessages,
  GlsTranslationNamespace,
  GlsTranslationValidationResult,
} from "@/lib/language-platform/translation/types";

/** Official GLS translation namespaces mapped to platform locale JSON roots. */
export const GLS_TRANSLATION_NAMESPACE_ROOTS: Record<GlsTranslationNamespace, string> = {
  common: "common",
  nav: "nav",
  dashboard: "dashboard",
  settings: "settings",
  builder: "products.websiteBuilder",
  editor: "products.contentStudio",
  marketplace: "marketing",
  documentation: "pages",
  products: "products",
  workspaces: "workspaces",
  errors: "errors",
  seo: "seoContent",
};

export function flattenTranslationMessages(
  messages: GlsTranslationMessages,
  prefix = "",
): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      flat[path] = value;
    } else if (value && typeof value === "object") {
      Object.assign(flat, flattenTranslationMessages(value as GlsTranslationMessages, path));
    }
  }
  return flat;
}

export function validateTranslationContract(
  contract: GlsTranslationContract,
  messages: GlsTranslationMessages,
): GlsTranslationValidationResult {
  const flat = flattenTranslationMessages(messages);
  const root = GLS_TRANSLATION_NAMESPACE_ROOTS[contract.namespace];
  const prefix = root ? `${root}.` : "";

  const missingKeys: string[] = [];
  const emptyValues: string[] = [];

  for (const key of Object.keys(contract.keys)) {
    const fullKey = `${prefix}${key}`;
    if (!(fullKey in flat) && !(key in flat)) {
      missingKeys.push(key);
    } else {
      const value = flat[fullKey] ?? flat[key];
      if (!value?.trim()) emptyValues.push(key);
    }
  }

  const contractKeySet = new Set(Object.keys(contract.keys));
  const extraKeys = Object.keys(flat).filter((k) => {
    const short = k.replace(prefix, "");
    return !contractKeySet.has(short) && !contractKeySet.has(k);
  });

  return {
    valid: missingKeys.length === 0 && emptyValues.length === 0,
    namespace: contract.namespace,
    locale: contract.locale,
    missingKeys,
    extraKeys: extraKeys.slice(0, 20),
    emptyValues,
  };
}

export function detectMissingTranslationKeys(
  base: GlsTranslationMessages,
  target: GlsTranslationMessages,
): string[] {
  const baseFlat = flattenTranslationMessages(base);
  const targetFlat = flattenTranslationMessages(target);
  return Object.keys(baseFlat).filter((key) => !(key in targetFlat));
}
