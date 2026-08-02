/**
 * TBGE dependency injection tokens.
 */

export const TBGE_TOKENS = {
  orchestrator: "tbge.orchestrator",
  assemblyEngine: "tbge.assemblyEngine",
  websiteAdapter: "tbge.adapters.website",
  masterPlanner: "tbge.masterPlanner",
  plannerLlmClient: "tbge.plannerLlmClient",
  componentComposer: "tbge.componentComposer",
} as const;

export type TbgeToken = (typeof TBGE_TOKENS)[keyof typeof TBGE_TOKENS];
