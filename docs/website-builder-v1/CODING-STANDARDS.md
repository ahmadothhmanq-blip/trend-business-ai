# Coding Standards

Conventions for Website Builder and Template V2 code.

## File organization

```
lib/website/template-v2/
  flagship/{package-id}/     # React components per flagship
  tbdp/profiles/{package-id}/ # Design profiles
  tokens/                    # Token emitters
  preview/                   # Preview compiler
  generation/                # V2 generation bridge
  inject/                    # Pipeline injection

lib/ai-core/image-engine/    # Image Engine (template-agnostic)
lib/website/image-management/ # User image operations
lib/website/v1-baseline/     # Freeze manifest + golden refs
```

## Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Package ID | kebab-case | `hotel-resort-premium` |
| CSS prefix | 2-letter package prefix | `hr-`, `mp-`, `ec-` |
| V2 components | `{Package}{Section}` PascalCase | `HotelResortPremiumHero` |
| Data attributes | `data-v2-*` | `data-v2-component` |
| Semantic slots | lowercase single word | `hero`, `gallery` |

## Component rules

1. **Use slot images** — `resolveSlotImage("hero")`, never hardcoded URLs
2. **Use design tokens** — CSS variables from `lib/design-tokens.ts`, not magic colors
3. **Client directive** — `"use client"` only when hooks/events required
4. **Props with defaults** — All text props have sensible defaults for preview
5. **Accessibility** — `aria-label` on nav, alt text on images, semantic HTML

## TypeScript

- Strict mode enabled project-wide
- Prefer `type` over `interface` for props (match existing flagship code)
- Server-only modules use `import "server-only"` where appropriate
- Path alias `@/` for all internal imports

## Tests

| Area | Test location | Runner |
|------|---------------|--------|
| V1 baseline | `lib/website/v1-baseline/regression.test.ts` | `npm run test:website-builder-v1` |
| Registry | `lib/website/builder/validate-template-registry.test.ts` | tsx --test |
| Image Engine | `lib/ai-core/image-engine/image-engine.test.ts` | tsx --test |
| V2 bridge | `lib/website/template-v2/generation/v2-generation-bridge.test.ts` | tsx --test |

Add tests for new behavior; do not add trivial assertion-only tests.

## CSS

- Package-scoped class prefixes prevent cross-template bleed
- Global CSS builders: `build{Package}GlobalCss()` in flagship index files
- Use CSS custom properties for all colors, fonts, spacing
- Grain/texture overlays via pseudo-elements, not background images where possible

## Scripts

- QA scripts in `scripts/` with `.mts` or `.mjs` extension
- Use `spawnSync` with explicit exit codes
- JSON QA output to `scripts/benchmark-results/flagship-qa/`
- Preview HTML to `scripts/benchmark-results/flagship-previews/`

## Git and CI

- Do not commit `scripts/benchmark-results/` transient runs unless updating golden
- Golden canonical copies live in `lib/website/v1-baseline/golden/previews/`
- PRs touching frozen paths trigger `website-builder-v1.yml`

## Deprecation policy

- Mark deprecated modules with `@deprecated` JSDoc and re-export shim
- Keep shims for one major version before removal
- `template-images.ts` is deprecated — use `resolveSlotImage()` instead

## Review checklist

- [ ] `npm run type-check` passes
- [ ] `npm run test:website-builder-v1` passes
- [ ] No hardcoded image URLs in template components
- [ ] Frozen paths unchanged or version bumped
- [ ] Golden updated if visual output changed
- [ ] Documentation updated if architecture changed
