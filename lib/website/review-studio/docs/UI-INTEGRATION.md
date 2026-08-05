# Review Studio UI Integration

## User Flow

```
Website Generated
    ↓ (auto-opens)
Website Review tab
    ↓
Review Dashboard (scores, strengths, weaknesses)
    ↓
Improvements tab → select → Apply
    ↓
Version created + Compare view
    ↓
Publish tab (unchanged)
```

## Integration Points

| Layer | File |
|-------|------|
| Panel UI | `components/dashboard/website-builder/review-studio-panel.tsx` |
| Builder tab | `components/dashboard/website-builder-tool.tsx` |
| Tab type | `components/dashboard/website-builder/tool/types.ts` |
| API GET | `app/api/website-builder/[id]/review/route.ts` |
| API apply | `app/api/website-builder/[id]/review/apply/route.ts` |
| API rollback | `app/api/website-builder/[id]/review/rollback/route.ts` |
| Service | `lib/website/platform/services/review-service.ts` |

## Screens

1. **Dashboard** — 9 quality scores, strengths, weaknesses, estimated gains
2. **Improvements** — selectable list with priority, impact, time, risk, Apply
3. **Versions** — v1 → v2 → v3 with rollback
4. **Compare** — before/after score differences
5. **Reports** — executive, technical, developer, benchmark dialogs

## Backward Compatibility

- New `review` output tab — existing tabs unchanged
- Auto-opens Review after generation (was preview)
- No builder/template/generation flow redesign
- Deterministic improvements only in Phase 1 UI (targeted-regen disabled without executor)

## i18n

English keys under `products.websiteBuilder.reviewStudio` in `locales/en.json`.
