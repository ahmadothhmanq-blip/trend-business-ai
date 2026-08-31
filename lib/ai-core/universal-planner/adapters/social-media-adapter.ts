import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const socialMediaAdapter: UniversalPlannerAdapter = {
  serviceId: "social-media",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("social-media", blueprint, requirements, {
      platforms: ["facebook", "instagram", "linkedin", "x", "tiktok"],
      postingGoals: blueprint.intent.goals,
      brandIntegration: requirements.capabilities.assets.branding ?? false,
      schedulesRoute: "/api/social-media/schedules",
      postsRoute: "/api/social-media/posts",
    });
  },
};
