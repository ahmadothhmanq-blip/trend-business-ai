/** Official translation contract types — namespace-based, no hardcoded strings. */

export type GlsTranslationNamespace =
  | "common"
  | "nav"
  | "dashboard"
  | "settings"
  | "builder"
  | "editor"
  | "marketplace"
  | "documentation"
  | "products"
  | "workspaces"
  | "errors"
  | "seo";

export type GlsTranslationContract = {
  namespace: GlsTranslationNamespace;
  keys: Record<string, string>;
  locale: string;
  version: string;
};

export type GlsTranslationValidationResult = {
  valid: boolean;
  namespace: string;
  locale: string;
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
};

export type GlsTranslationMessages = Record<string, unknown>;
