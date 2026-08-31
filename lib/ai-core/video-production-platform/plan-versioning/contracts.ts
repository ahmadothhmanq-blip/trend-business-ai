import type { VideoPlanStatus } from "@/lib/ai-core/video-production-platform/domain/contracts";

export type PlanVersion = {
  id: string;
  projectId: string;
  version: number;
  status: VideoPlanStatus;
  isActive: boolean;
  createdAt: string;
  sourcePrompt: string | null;
  sourceHash: string | null;
};

export type ActivatePlanResult = {
  projectId: string;
  planId: string;
  version: number;
  reused: boolean;
  previousPlanId: string | null;
};
