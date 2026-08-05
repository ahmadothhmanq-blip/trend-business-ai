# GLS — Translation Contracts

## Principles

1. **No hardcoded strings** in product code — use namespace keys
2. **Namespace-based** — `common`, `nav`, `builder`, `products`, etc.
3. **Contract validation** — required keys declared per namespace/locale
4. **Missing-key detection** — compare base locale against target

## Contract Shape

```ts
type GlsTranslationContract = {
  namespace: GlsTranslationNamespace;
  keys: Record<string, string>;  // key → default English value
  locale: string;
  version: string;
};
```

## Validation

```ts
import { validateTranslationContract, detectMissingTranslationKeys } from "@/lib/language-platform";

const result = validateTranslationContract(contract, messages);
// result.missingKeys, result.emptyValues

const missing = detectMissingTranslationKeys(enMessages, arMessages);
```

## Namespace Roots

Maps GLS namespaces to `locales/en.json` paths:

| Namespace | JSON Root |
|-----------|-----------|
| common | `common` |
| builder | `products.websiteBuilder` |
| workspaces | `workspaces` |
| seo | `seoContent` |

Platform translations remain in `locales/*.json` — GLS provides contracts and validation only.
