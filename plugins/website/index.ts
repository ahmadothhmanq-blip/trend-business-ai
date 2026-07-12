import type { AIPlugin } from "@/lib/ai/engine";
import { analyzeWebsite } from "@/plugins/website/analyze";
import { exportWebsite } from "@/plugins/website/export";
import { generateWebsite } from "@/plugins/website/generate";
import { planWebsite } from "@/plugins/website/plan";
import { validateWebsite } from "@/plugins/website/validate";
import type {
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";

export const websitePlugin: AIPlugin<
  WebsiteGenerationInput,
  WebsiteProjectAnalysis,
  WebsitePlanResult,
  GeneratedWebsiteProject
> = {
  id: "website",
  name: "Website Builder",
  preferredProvider: "deepseek",
  analyze: analyzeWebsite,
  plan: planWebsite,
  generate: generateWebsite,
  validate: validateWebsite,
  export: exportWebsite,
};

export * from "@/plugins/website/types";
