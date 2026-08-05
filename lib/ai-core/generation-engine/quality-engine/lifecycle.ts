import type { AwqePipelineStage } from "@/lib/ai-core/generation-engine/quality-engine/types";

export type AwqeLifecyclePhase = {
  stage: AwqePipelineStage;
  label: string;
  description: string;
};

export const AWQE_QUALITY_LIFECYCLE: readonly AwqeLifecyclePhase[] = [
  { stage: "evaluate", label: "Evaluate", description: "Business, conversion, content, UX, accessibility, SEO, trust, visual hierarchy" },
  { stage: "recommend", label: "Recommend", description: "Generate actionable quality recommendations" },
  { stage: "improve", label: "Improve", description: "Hero, section ordering, CTA, trust, testimonials, FAQ, pricing, footer" },
  { stage: "optimize", label: "Optimize", description: "SEO, conversion, accessibility, performance optimization" },
  { stage: "score", label: "Score", description: "Compute overall and dimension quality scores" },
  { stage: "build_spec", label: "Build Specification", description: "Produce world-class Website Specification" },
  { stage: "validate", label: "Validate", description: "Validate specification completeness" },
] as const;

export function getAwqeLifecyclePhase(stage: AwqePipelineStage): AwqeLifecyclePhase | undefined {
  return AWQE_QUALITY_LIFECYCLE.find((p) => p.stage === stage);
}
