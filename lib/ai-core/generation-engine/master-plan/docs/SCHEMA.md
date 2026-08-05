# Master Plan Schema

## Versioning

Every Master Plan includes:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID |
| `version` | `number` | Incrementing plan version |
| `createdAt` | `string` | ISO 8601 timestamp |
| `schemaVersion` | `"1.0.0"` | Schema version |
| `providerIndependent` | `true` | Always true |

## Domains

### Project
```ts
{ id, name, productId, sourcePromptHash }
```

### Business
```ts
{ name, industry, industryId, businessType, offer?, confidence }
```

### Brand
```ts
{ style, tone, voice }
```

### Localization
```ts
{ language, country?, strategy, direction, htmlLang, localeCode }
```

### Architecture
```ts
pages: MasterPlanPage[]
navigation: MasterPlanNavigationItem[]
sections: MasterPlanSection[]
componentsNeeded: MasterPlanComponent[]
businessFeatures: Tbge2RequirementId[]
```

### Strategies
```ts
seoStrategy: { priority, targetKeywords, structuredData, hreflang, sitemap, localizedSlugs }
contentStrategy: { tone, voice, blockCount, llmOwnedFields, forbiddenLlmFields }
mediaStrategy: { heroImage, gallery, teamPhotos, productImages, imageStyle, altTextRequired }
ctaStrategy: { primary, secondary?, placement, conversionGoal }
trustStrategy: { testimonials, trustBadges, stats, team, caseStudies, certifications }
legalPages: { id, kind, path, required }[]
performanceTargets: { lighthousePerformance, lighthouseSeo, lighthouseAccessibility, fcp, lcp }
accessibilityTargets: { wcagLevel, keyboardNavigation, screenReaderOptimized, colorContrastRatio, reducedMotionSupport }
futureExpansion: { phases, supportedProviders }
```

## LLM-Owned Fields

```
headlines, subheadlines, body copy, descriptions, titles, texts,
meta descriptions, faqs, marketing copy, cta labels
```

## Forbidden LLM Fields

```
pages, sections, navigation, components, business features,
website architecture, industry, language, conversion strategy
```
