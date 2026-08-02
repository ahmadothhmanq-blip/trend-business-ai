/**
 * TBGE default DI bootstrap (Sprint 2).
 */

import { resolveTbgeProductAdapter } from "@/lib/tbge/adapters/registry";
import { websiteBuilderTbgeAdapter } from "@/lib/tbge/adapters/website-adapter";
import { defaultAssemblyEngine } from "@/lib/tbge/assembly/engine";
import { defaultComponentComposer } from "@/lib/tbge/composer/runtime";
import { createTbgeContainer, registerTbgeDefaults } from "@/lib/tbge/di/container";
import { TBGE_TOKENS } from "@/lib/tbge/di/tokens";
import { createTbgeOrchestrator } from "@/lib/tbge/kernel/orchestrator";
import {
  createMasterPlanner,
  createUnconfiguredPlannerLlmClient,
} from "@/lib/tbge/planning/master-planner";
import type { PlannerLlmClient } from "@/lib/tbge/planning/types";

let defaultContainer: ReturnType<typeof createTbgeContainer> | null = null;

export function getDefaultTbgeContainer() {
  if (!defaultContainer) {
    defaultContainer = createTbgeContainer();
    registerTbgeDefaults(defaultContainer, [
      {
        token: TBGE_TOKENS.assemblyEngine,
        factory: () => defaultAssemblyEngine,
        singleton: true,
      },
      {
        token: TBGE_TOKENS.websiteAdapter,
        factory: () => websiteBuilderTbgeAdapter,
        singleton: true,
      },
      {
        token: TBGE_TOKENS.componentComposer,
        factory: () => defaultComponentComposer,
        singleton: true,
      },
      {
        token: TBGE_TOKENS.plannerLlmClient,
        factory: () => createUnconfiguredPlannerLlmClient(),
        singleton: true,
      },
      {
        token: TBGE_TOKENS.masterPlanner,
        factory: () =>
          createMasterPlanner({
            llmClient: defaultContainer!.resolve<PlannerLlmClient>(
              TBGE_TOKENS.plannerLlmClient,
            ),
          }),
        singleton: true,
      },
      {
        token: TBGE_TOKENS.orchestrator,
        factory: () =>
          createTbgeOrchestrator({
            assemblyEngine: defaultContainer!.resolve(TBGE_TOKENS.assemblyEngine),
            masterPlanner: defaultContainer!.resolve(TBGE_TOKENS.masterPlanner),
            resolveAdapter: resolveTbgeProductAdapter,
          }),
        singleton: true,
      },
    ]);
  }
  return defaultContainer;
}

export function resetDefaultTbgeContainer(): void {
  defaultContainer = null;
}
