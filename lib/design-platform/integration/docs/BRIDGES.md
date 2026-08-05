# Bridge Reference

## Builder Bridge

```ts
import { enrichBuilderInput } from "@/lib/design-platform/integration";

const { enrichment, designContext, projectSettingsPatch } = enrichBuilderInput({
  industryId: "medical",
  language: "English",
  templateId: "medical-premium",
});
```

Returns additive enrichment only — does not replace builder fields.

## AI Bridge

```ts
import { resolveAiWebsiteDesign } from "@/lib/design-platform/integration";

const design = resolveAiWebsiteDesign({
  prompt: "Restaurant website with reservations",
  goal: "conversion",
});
// design.componentIds — from sector DNA, never random
```

## Template Bridge

```ts
import { resolveTemplateBridge } from "@/lib/design-platform/integration";

const bridge = resolveTemplateBridge({
  templateId: "saas-enterprise",
  language: "Arabic",
});
// bridge.tbdpCssLayer — merge alongside V1/V2 output
```

## Language Bridge

```ts
import { resolveLanguageContext } from "@/lib/design-platform/integration";

const lang = resolveLanguageContext({
  websiteLanguage: "Arabic",
  generationLanguage: "Arabic",
  templateLanguage: "Arabic",
});
```

## Theme Resolver

```ts
import { resolveTheme } from "@/lib/design-platform/integration";

const theme = resolveTheme({
  sectorId: "finance",
  mode: "auto",
  brandThemeId: "acme-brand",
});
```
