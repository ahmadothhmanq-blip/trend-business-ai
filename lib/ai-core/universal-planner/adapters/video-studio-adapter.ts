import { buildSupportedServiceBlueprint } from "@/lib/ai-core/universal-planner/adapters/shared";
import type { UniversalPlannerAdapter } from "@/lib/ai-core/universal-planner/adapters/types";
import { UNIVERSAL_ADAPTER_VERSION } from "@/lib/ai-core/universal-planner/adapters/types";

export const videoStudioAdapter: UniversalPlannerAdapter = {
  serviceId: "video-studio",
  adapterVersion: UNIVERSAL_ADAPTER_VERSION,
  build({ blueprint, requirements }) {
    return buildSupportedServiceBlueprint("video-studio", blueprint, requirements, {
      videoRequired: requirements.capabilities.assets.video ?? true,
      storyboardFocus: blueprint.intent.requestedOutputs,
      editorRoutes: {
        editor: "/api/video-studio/projects/[id]/editor",
        scenes: "/api/video-studio/projects/[id]/scenes",
        publish: "/api/video-studio/projects/[id]/publish",
      },
    });
  },
};
