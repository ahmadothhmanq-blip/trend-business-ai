export type {
  DesignCriticSeverity,
  DesignCriticArea,
  DesignCriticFinding,
  DesignCriticReport,
} from "@/lib/ai-core/design-critic/types";

export { analyzeDesignCritic } from "@/lib/ai-core/design-critic/analyze";

export {
  runDesignCritic,
  mergeDesignCriticIntoOptimizerReport,
  type RunDesignCriticParams,
} from "@/lib/ai-core/design-critic/engine";
