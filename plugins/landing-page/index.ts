import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { analyzeLandingPage } from "@/plugins/landing-page/analyze";
import { planLandingPage } from "@/plugins/landing-page/plan";
import { generateLandingPage } from "@/plugins/landing-page/generate";
import { validateLandingPage } from "@/plugins/landing-page/validate";
import { exportLandingPage } from "@/plugins/landing-page/export";
import type {
  LPAnalysis,
  LPPlanResult,
  LPOutput,
  LandingPagePluginInput,
} from "@/plugins/landing-page/types";

export const landingPagePlugin: AIPlugin<
  LandingPagePluginInput,
  LPAnalysis,
  LPPlanResult,
  LPOutput
> = {
  id: "landing-page",
  name: "Landing Page Builder",
  preferredProvider: getActiveProvider(),
  analyze: analyzeLandingPage,
  plan: planLandingPage,
  generate: generateLandingPage,
  validate: validateLandingPage,
  export: exportLandingPage,
};

export * from "@/plugins/landing-page/types";
