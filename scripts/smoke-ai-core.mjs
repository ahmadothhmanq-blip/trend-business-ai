/**
 * Smoke: AI Core Engine modules exist (through Phase 10 launch prep).
 * Usage: node scripts/smoke-ai-core.mjs
 */
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "lib/ai-core/index.ts",
  "lib/ai-core/adapter.ts",
  "lib/ai-core/registry.ts",
  "lib/ai-core/products.ts",
  "lib/ai-core/brief-builder.ts",
  "lib/ai-core/validations.ts",
  "lib/ai-core/runs/service.ts",
  "lib/ai-core/runtime/index.ts",
  "lib/ai-core/layers/types.ts",
  "lib/ai-core/layers/schemas.ts",
  "lib/ai-core/layers/runner.ts",
  "lib/ai-core/templates/types.ts",
  "lib/ai-core/templates/industries.ts",
  "lib/ai-core/templates/select.ts",
  "lib/ai-core/templates/apply.ts",
  "lib/ai-core/templates/index.ts",
  "lib/ai-core/design-system/types.ts",
  "lib/ai-core/design-system/presets.ts",
  "lib/ai-core/design-system/build.ts",
  "lib/ai-core/design-system/index.ts",
  "lib/ai-core/assets/types.ts",
  "lib/ai-core/assets/provider.ts",
  "lib/ai-core/assets/plan.ts",
  "lib/ai-core/assets/generate.ts",
  "lib/ai-core/assets/index.ts",
  "lib/ai-core/seo/types.ts",
  "lib/ai-core/seo/build.ts",
  "lib/ai-core/seo/check.ts",
  "lib/ai-core/seo/inject.ts",
  "lib/ai-core/seo/index.ts",
  "lib/ai-core/performance/types.ts",
  "lib/ai-core/performance/check.ts",
  "lib/ai-core/performance/index.ts",
  "lib/ai-core/quality/types.ts",
  "lib/ai-core/quality/report.ts",
  "lib/ai-core/quality/index.ts",
  "lib/ai-core/dashboard-runs.ts",
  "lib/constants/one-prompt-products.ts",
  "components/dashboard/one-prompt/index.ts",
  "components/dashboard/one-prompt/core-progress-stepper.tsx",
  "components/dashboard/one-prompt/one-prompt-experience.tsx",
  "components/marketing/one-prompt-product-section.tsx",
  "lib/production/readiness.ts",
  "lib/auth/ownership.ts",
  "lib/monitoring/errors.ts",
  "docs/PRODUCTION_LAUNCH.md",
  "docs/LAUNCH_CHECKLIST.md",
  "lib/ai-core/adapters/website-builder.ts",
  "lib/ai-core/adapters/webapp-builder.ts",
  "lib/ai-core/adapters/landing-page-builder.ts",
  "lib/ai-core/adapters/brand-designer.ts",
  "lib/ai-core/adapters/content-studio.ts",
  "lib/ai-core/adapters/video-studio.ts",
  "lib/ai-core/adapters/marketing-ai.ts",
  "lib/ai-core/adapters/derive-layers.ts",
  "app/api/ai-core/products/route.ts",
  "app/api/ai-core/industries/route.ts",
  "app/api/ai-core/design-presets/route.ts",
  "app/api/ai-core/runs/route.ts",
  "app/api/ai-core/runs/[id]/route.ts",
  "app/api/ai-core/runs/[id]/continue/route.ts",
  "supabase/migrations/033_ai_runs.sql",
  "docs/AI_CORE_ENGINE.md",
];

for (const rel of required) {
  await access(path.join(root, rel));
}

assert.ok(required.length >= 50);
console.log("smoke-ai-core: OK", { files: required.length });
