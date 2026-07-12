import type { GenerationProgressEvent, ProgressTracker } from "@/lib/ai/types";

export function createProgressTracker(
  initialEvents: GenerationProgressEvent[] = [],
): ProgressTracker {
  const events = [...initialEvents];

  return {
    emit(event) {
      events.push(event);
    },
    getEvents() {
      return [...events];
    },
  };
}
