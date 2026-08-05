# Global Language System (GLS)

Official centralized language architecture for Trend Business AI.

## Quick Start

```ts
import { resolveGlsLanguageContext, bridgeToTbdpLanguageContext } from "@/lib/language-platform";

const ctx = resolveGlsLanguageContext({
  platformLocale: "en",
  websiteLanguage: "Arabic",
  serviceId: "website-builder",
});

const { tbdp, aligned } = bridgeToTbdpLanguageContext(ctx);
```

## Verification

```bash
npm run test:language-platform
npm run verify:language-platform
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Language Lifecycle](./docs/LIFECYCLE.md)
- [Context Flow](./docs/CONTEXT-FLOW.md)
- [Typography](./docs/TYPOGRAPHY.md)
- [RTL/LTR](./docs/RTL.md)
- [Locale Engine](./docs/LOCALE.md)
- [Translation Contracts](./docs/TRANSLATION-CONTRACTS.md)
- [Backward Compatibility](./docs/BACKWARD-COMPATIBILITY.md)
