import { CAPABILITY_ANALYZER_SET_VERSION } from "@/lib/website/builder/capabilities/constants";
import { CAPABILITY_DETECTION_DEFINITIONS } from "@/lib/website/builder/capabilities/detection-rules";
import { getCapabilityConsumers } from "@/lib/website/builder/capabilities/registry";
import { refreshCapabilities } from "@/lib/website/builder/capabilities/service";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

export type CapabilityDependencyReport = {
  generatedAt: string;
  analyzerSetVersion: string;
  producers: Array<{
    id: string;
    module: string;
    description: string;
  }>;
  consumers: Array<{
    id: string;
    label: string;
    module: string;
    description: string;
  }>;
  legacyParallelSystems: Array<{
    id: string;
    module: string;
    status: "bridged" | "intentional-separate" | "remaining-duplication";
    notes: string;
  }>;
  sampleActiveCapabilities?: string[];
};

export function getCapabilityDependencyReport(
  project?: GeneratedWebsiteProject,
): CapabilityDependencyReport {
  const service = project ? refreshCapabilities(project).service : null;

  return {
    generatedAt: new Date().toISOString(),
    analyzerSetVersion: CAPABILITY_ANALYZER_SET_VERSION,
    producers: [
      {
        id: "hybrid-analyzer",
        module: "lib/website/builder/capabilities/scoring.ts",
        description:
          "Blueprint + strategy → initial manifest → project signals → verified final manifest",
      },
      {
        id: "feature-seed",
        module: "lib/website/builder/capabilities/feature-bridge.ts",
        description: "Seeds initial manifest from user-selected legacy feature tokens",
      },
      {
        id: "v2-template-apply",
        module: "lib/website/template-v2/apply/apply-v2-template.ts",
        description: "Persists manifest after V2 template apply via refreshCapabilities",
      },
      {
        id: "generation-pipeline",
        module: "plugins/website/generate.ts",
        description: "Persists manifest after website generation completes",
      },
      {
        id: "planning-pipeline",
        module: "plugins/website/plan.ts",
        description: "Derives scaffold flags from manifest during planning",
      },
    ],
    consumers: getCapabilityConsumers(),
    legacyParallelSystems: [
      {
        id: "feature-registry",
        module: "lib/website/builder/feature-registry.ts",
        status: "bridged",
        notes:
          "User feature selection UI; capability flags now derived via flags-bridge from manifest",
      },
      {
        id: "project-capability-flags",
        module: "lib/ai/validator.ts",
        status: "bridged",
        notes:
          "ProjectCapabilityFlags retained for scaffold file requirements; values sourced from manifest",
      },
      {
        id: "industry-intelligence",
        module: "lib/ai-core/industry-intelligence/",
        status: "intentional-separate",
        notes:
          "Generation-time industry hints only; does not gate post-generation builder UI",
      },
      {
        id: "review-quality-regex",
        module: "lib/website/review-studio/analyze/website-analyzer.ts",
        status: "remaining-duplication",
        notes:
          "Content quality regex signals remain for scoring; capability scope now read from service",
      },
      {
        id: "wb-component-capabilities",
        module: "lib/website/component-library/capabilities.ts",
        status: "intentional-separate",
        notes: "UI primitive slot capabilities — different domain from website capabilities",
      },
    ],
    sampleActiveCapabilities: service?.getActiveCapabilities(),
  };
}

export function formatCapabilityDependencyReport(
  report: CapabilityDependencyReport,
): string {
  const lines: string[] = [
    "# Website Capability Dependency Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Analyzer set: ${report.analyzerSetVersion}`,
    "",
    "## Producers",
    ...report.producers.map(
      (producer) => `- **${producer.id}** (\`${producer.module}\`): ${producer.description}`,
    ),
    "",
    "## Consumers",
    ...report.consumers.map(
      (consumer) => `- **${consumer.label}** (\`${consumer.module}\`): ${consumer.description}`,
    ),
    "",
    "## Legacy / parallel systems",
    ...report.legacyParallelSystems.map(
      (item) =>
        `- **${item.id}** [${item.status}] (\`${item.module}\`): ${item.notes}`,
    ),
    "",
    `Detection rules registered: ${CAPABILITY_DETECTION_DEFINITIONS.length}`,
  ];

  if (report.sampleActiveCapabilities?.length) {
    lines.push(
      "",
      "## Sample active capabilities",
      report.sampleActiveCapabilities.map((id) => `- ${id}`).join("\n"),
    );
  }

  return lines.join("\n");
}
