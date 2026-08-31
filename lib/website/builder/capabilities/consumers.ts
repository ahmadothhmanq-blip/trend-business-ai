import { registerCapabilityConsumer } from "@/lib/website/builder/capabilities/registry";

const BUILTIN_CONSUMERS = [
  {
    id: "toolbar",
    label: "Builder Toolbar",
    module: "lib/website/builder/tools/resolve.ts",
    description: "Filters builder tool rail from active capabilities",
  },
  {
    id: "pages-generation",
    label: "Pages Generation",
    module: "plugins/website/plan.ts",
    description: "Derives scaffold flags and file plans from capability manifest",
  },
  {
    id: "section-generation",
    label: "Section Generation",
    module: "plugins/website/plan.ts",
    description: "Uses manifest-derived flags for section/file planning",
  },
  {
    id: "component-selection",
    label: "Component Selection",
    module: "lib/website/builder/blocks.ts",
    description: "Filters block catalog by active capabilities",
  },
  {
    id: "project-settings",
    label: "Project Settings",
    module: "plugins/website/generate.ts",
    description: "Persists manifest and legacy flags from SSOT",
  },
  {
    id: "business-panel",
    label: "Business Hub Panel",
    module: "components/dashboard/website-builder/business-hub-panel.tsx",
    description: "Shows business features matching active capabilities",
  },
  {
    id: "professional-panel",
    label: "Professional Panel",
    module: "components/dashboard/website-builder/professional-panel.tsx",
    description: "Shows professional features matching active capabilities",
  },
  {
    id: "ai-actions",
    label: "AI Builder Actions",
    module: "lib/website/builder/ai-builder.ts",
    description: "Filters AI actions by required capabilities",
  },
  {
    id: "website-review",
    label: "Website Review",
    module: "lib/website/review-studio/analyze/website-analyzer.ts",
    description: "Scopes review checks to active capabilities",
  },
  {
    id: "seo-validation",
    label: "SEO Validation",
    module: "lib/website/builder/publishing.ts",
    description: "SEO publish checks gated by seo capability",
  },
  {
    id: "publish-validation",
    label: "Publish Validation",
    module: "lib/website/builder/publishing.ts",
    description: "Publish checklist filtered by capabilities",
  },
  {
    id: "analytics",
    label: "Analytics",
    module: "lib/website/builder/business.ts",
    description: "Analytics workspace entry gated by analytics capability",
  },
] as const;

for (const consumer of BUILTIN_CONSUMERS) {
  registerCapabilityConsumer(consumer);
}
