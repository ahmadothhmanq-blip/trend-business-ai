# GLS — Backward Compatibility

## Principles

1. **Additive only** — GLS does not modify existing language resolution paths
2. **Bridge pattern** — wraps `lib/i18n`, `website-output-locale`, TBDP `language-bridge`
3. **No template redesign** — templates remain language-neutral; no package changes required
4. **No builder redesign** — existing generation pipeline unchanged
5. **Opt-in consumption** — products adopt GLS via `resolveGlsLanguageContext()` when ready

## Existing Systems Preserved

| System | Path | GLS Relationship |
|--------|------|------------------|
| Dashboard i18n | `lib/i18n/` | Platform bridge |
| Website locale | `lib/i18n/website-output-locale.ts` | Website bridge |
| TBDP language | `lib/design-platform/integration/language-bridge.ts` | TBDP bridge |
| Content fallbacks | `lib/ai-core/content/content-language.ts` | Unchanged |
| AI directives | `lib/ai-core/website-builder/language-directive.ts` | Parallel; GLS AI resolver available |

## TBDP Typography Mapping

GLS expands typography to 11 script families. TBDP receives compatible profile via `tbdpProfileId`:

| GLS Profile | TBDP Profile |
|-------------|--------------|
| latin-ltr | latin-ltr |
| latin-rtl | latin-rtl |
| arabic-ltr | arabic-ltr |
| arabic-rtl | arabic-rtl |
| cjk-ltr, cyrillic-ltr, indic-ltr, etc. | latin-ltr (fallback) |
| hebrew-rtl | latin-rtl (fallback) |

## Migration Path

Phase 1 (current): GLS platform built, tested, documented — no wiring changes  
Phase 2 (future): Wire `resolveGlsLanguageContext()` at builder lifecycle boundaries  
Phase 3 (future): Replace ad-hoc language resolution with GLS context store
