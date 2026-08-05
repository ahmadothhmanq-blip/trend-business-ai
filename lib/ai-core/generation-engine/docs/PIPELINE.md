# TBGE2 — Pipeline

## Flow

```
User Prompt
    ↓
Intent Analyzer        → category, goal, confidence
    ↓
Business Analyzer      → industry, audience, language, brand style, goals
    ↓
Requirements Analyzer  → booking, payments, CRM, blog, gallery, etc.
    ↓
Website Planner        → type, page count, navigation, CTAs, conversion
    ↓
Page Planner           → Home, About, Services, Pricing, FAQ, Blog, Contact
    ↓
Section Planner        → Hero, Features, Testimonials, Gallery, CTA, Footer
    ↓
Content Planner        → blocks, tone, length, SEO, localization
    ↓
LLM Request Builder    → structured prompt + JSON schema
    ↓
Structured Output      → JSON only (optional LLM refinement)
    ↓
Validation             → pages, sections, business logic, required fields
```

## Entry Point

```ts
import { runTbge2PlanningPipeline } from "@/lib/ai-core/generation-engine";

const result = await runTbge2PlanningPipeline(
  { userPrompt: "Modern restaurant with online booking" },
  { skipLlm: true },  // Phase 1: deterministic planning only
);
```

## LLM Boundary

The only LLM touchpoint is `Tbge2LlmClient.complete()`:

```ts
type Tbge2LlmClient = {
  complete(request: Tbge2LlmRequest): Promise<Tbge2LlmResponse>;
};
```

`Tbge2LlmRequest.userPrompt` contains structured planning JSON — never the raw user prompt.

## Provider Independence

| Provider | Status |
|----------|--------|
| DeepSeek | Current default via adapter |
| OpenAI | Compatible via Tbge2LlmClient |
| Gemini | Compatible via Tbge2LlmClient |
| Claude | Compatible via Tbge2LlmClient |

No provider-specific logic exists inside TBGE2.
