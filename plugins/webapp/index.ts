import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { analyzeWebApp } from "@/plugins/webapp/analyze";
import { planWebApp } from "@/plugins/webapp/plan";
import { generateWebApp } from "@/plugins/webapp/generate";
import { validateWebApp } from "@/plugins/webapp/validate";
import { exportWebApp } from "@/plugins/webapp/export";
import type {
  WebAppAnalysis,
  WebAppPlanResult,
  WebAppOutput,
  WebAppPluginInput,
} from "@/plugins/webapp/types";

export const webappPlugin: AIPlugin<
  WebAppPluginInput,
  WebAppAnalysis,
  WebAppPlanResult,
  WebAppOutput
> = {
  id: "webapp",
  name: "Web App Builder",
  preferredProvider: getActiveProvider(),
  analyze: analyzeWebApp,
  plan: planWebApp,
  generate: generateWebApp,
  validate: validateWebApp,
  export: exportWebApp,
};

export * from "@/plugins/webapp/types";
