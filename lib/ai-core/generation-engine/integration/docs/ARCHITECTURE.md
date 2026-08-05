# Integration Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    lib/website/orchestrator.ts                       │
│                         generateWebsite()                            │
├─────────────────────────────────────────────────────────────────────┤
│  TBDP Wiring ──► Master Plan Integration ──► Route (TBGE / Legacy)  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────┐                         ┌───────────────────┐
│   TBGE Path       │                         │   Legacy Path     │
│ lockedSpec        │                         │ masterWebsitePlan │
│ (no TBGE planner) │                         │ on brief metadata │
└─────────┬─────────┘                         └─────────┬─────────┘
          │                                             │
          ▼                                             ▼
┌───────────────────┐                         ┌───────────────────┐
│ Content Provider  │                         │ layerRunner.run() │
│ (copy only)       │                         │ + adapter         │
└─────────┬─────────┘                         └─────────┬─────────┘
          │                                             │
          └──────────────────┬──────────────────────────┘
                             ▼
                    Generated Website
                    + TBDP settings
                    + GLS settings
                    + Master Plan settings
```

## Authority Rules

| Domain | Authority |
|--------|-----------|
| Pages, sections, navigation | Master Plan |
| Business features, SEO, content strategy | Master Plan |
| Design, components, colors, typography | TBDP |
| Language, locale, RTL, formatting | GLS |
| Copy, titles, descriptions, FAQs | Content Provider (LLM) |

## Provider Independence

Builder uses `ContentProvider` interface — never references DeepSeek, OpenAI, Gemini, Claude, or Grok directly.
