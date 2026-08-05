# Website Builder v1

Production baseline frozen **2026-08-05**. Version **1.0.0**.

Website Builder v1 is the completed production architecture for AI-generated websites. It combines Template Architecture V2, ten flagship industry templates, a centralized Image Engine, and a validated generation pipeline.

## What is frozen

| Surface | Location |
|---------|----------|
| 10 flagship templates | `templates/website/{package-id}/` |
| Image Engine | `lib/ai-core/image-engine/` |
| V2 architecture | `lib/website/template-v2/` |
| Generation pipeline | `plugins/website/`, `lib/website/template-v2/generation/` |
| Template registry | `lib/website/builder/template-package-index.ts` |
| Design tokens | `lib/website/template-v2/tokens/` |

See [BASELINE.md](./BASELINE.md) for the full freeze policy and golden reference workflow.

## Flagship templates (10)

| Package ID | Industry | Min score |
|------------|----------|-----------|
| `saas-enterprise` | SaaS / Enterprise | 95 |
| `corporate-business` | Corporate advisory | 95 |
| `restaurant-premium` | Fine dining | 95 |
| `ecommerce-premium` | Curated commerce | 95 |
| `medical-premium` | Healthcare | 95 |
| `real-estate-premium` | Luxury real estate | 95 |
| `creative-agency-premium` | Creative agency | 95 |
| `education-premium` | Education | 95 |
| `finance-premium` | Finance / wealth | 95 |
| `hotel-resort-premium` | Hotel & resort | 95 |

## Commands

```bash
# Full validation (build, tests, generation, golden compare)
npm run qa:website-builder

# Skip production build (faster local run)
npm run qa:website-builder -- --skip-build

# Compare live outputs against golden baseline only
npm run qa:website-builder:golden

# Update golden after intentional approved changes
npm run qa:website-builder:update-golden

# V1 regression tests only
npm run test:website-builder-v1
```

## CI

Pull requests touching Website Builder paths trigger `.github/workflows/website-builder-v1.yml`, which verifies:

- TypeScript
- Template registry
- Generation pipeline (V2 bridge)
- Image Engine + image validation
- Responsive rendering scores
- Marketplace QA (≥95/100)
- Visual regression (preview HTML hashes)
- Production build

## Documentation index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | V2 architecture overview |
| [TEMPLATE-SYSTEM.md](./TEMPLATE-SYSTEM.md) | Template packages, TBDP, registry |
| [IMAGE-ENGINE.md](./IMAGE-ENGINE.md) | Semantic slots, profiles, validation |
| [GENERATION-PIPELINE.md](./GENERATION-PIPELINE.md) | End-to-end generation flow |
| [BUILDER-ARCHITECTURE.md](./BUILDER-ARCHITECTURE.md) | Dashboard builder, preview, export |
| [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md) | How to extend without breaking v1 |
| [CODING-STANDARDS.md](./CODING-STANDARDS.md) | Conventions for Website Builder code |
| [BASELINE.md](./BASELINE.md) | Freeze policy and golden references |
