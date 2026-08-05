# AWQE Architecture

## Pipeline

```
Master Plan (read-only)
    ↓
Evaluate (9 dimensions)
    ↓
Recommend
    ↓
Improve (hero, sections, CTA, trust, FAQ, footer)
    ↓
Optimize (SEO, conversion, accessibility, performance)
    ↓
Score
    ↓
Website Specification
    ↓
Validate
```

## Responsibilities

| Phase | Module |
|-------|--------|
| Evaluate | Business, conversion, content, UX, accessibility, SEO, trust, visual hierarchy, performance |
| Improve | Hero quality, section ordering, CTA placement, trust blocks, testimonials, FAQ, pricing order, footer |
| Optimize | SEO titles, heading hierarchy, internal links, schema, conversion, WCAG, image strategy |
| Score | Overall + 7 dimension scores |
| Report | Strengths, weaknesses, recommendations, applied improvements |

## Isolation

- Does NOT modify Master Plan
- Does NOT modify TBDP, GLS, templates, or builder
- No AI provider logic
- Deterministic only
