import type { TbdpFeedbackState } from "@/lib/design-platform/experience/core/types";

export type TbdpFeedbackDefinition = {
  id: TbdpFeedbackState;
  label: string;
  experience: {
    ariaLive: "off" | "polite" | "assertive";
    motionId: string;
  };
  componentHint?: string;
};

/** Official TBDP feedback experience catalog. */
export const TBDP_FEEDBACK_CATALOG: TbdpFeedbackDefinition[] = [
  { id: "loading", label: "Loading", experience: { ariaLive: "polite", motionId: "tooltip-fade" }, componentHint: "LoadingState" },
  { id: "skeleton", label: "Skeleton", experience: { ariaLive: "off", motionId: "tooltip-fade" }, componentHint: "Skeleton" },
  { id: "progress", label: "Progress", experience: { ariaLive: "polite", motionId: "tooltip-fade" } },
  { id: "success", label: "Success", experience: { ariaLive: "polite", motionId: "success-pulse" }, componentHint: "SuccessState" },
  { id: "warning", label: "Warning", experience: { ariaLive: "assertive", motionId: "error-shake" } },
  { id: "error", label: "Error", experience: { ariaLive: "assertive", motionId: "error-shake" }, componentHint: "ErrorState" },
  { id: "empty", label: "Empty", experience: { ariaLive: "polite", motionId: "fade-in" }, componentHint: "EmptyState" },
  { id: "offline", label: "Offline", experience: { ariaLive: "assertive", motionId: "error-shake" } },
  { id: "retry", label: "Retry", experience: { ariaLive: "polite", motionId: "hover-lift" } },
  { id: "saving", label: "Saving", experience: { ariaLive: "polite", motionId: "tooltip-fade" } },
  { id: "autosave", label: "Autosave", experience: { ariaLive: "off", motionId: "success-pulse" } },
  { id: "ai-processing", label: "AI Processing", experience: { ariaLive: "polite", motionId: "stagger-children" } },
  { id: "streaming", label: "Streaming", experience: { ariaLive: "polite", motionId: "stagger-children" } },
];

export const TBDP_FEEDBACK_COUNT = TBDP_FEEDBACK_CATALOG.length;

export function getFeedbackDefinition(
  id: TbdpFeedbackState,
): TbdpFeedbackDefinition | undefined {
  return TBDP_FEEDBACK_CATALOG.find((f) => f.id === id);
}
