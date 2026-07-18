"use client";

import { useEffect, useMemo, useState } from "react";
import {
  resolveStepFromEvents,
  simulatedStepAt,
  stepIndex,
  type CoreUxStepId,
} from "@/components/dashboard/one-prompt/steps";

/**
 * Derive current UX step from LayerRunner events, falling back to a timed
 * simulation while generation is active (JSON-only product APIs).
 */
export function useCoreProgress(params: {
  events: string[];
  active: boolean;
  complete?: boolean;
}): CoreUxStepId {
  const { events, active, complete } = params;
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active || complete) return;
    setElapsedMs(0);
    const started = Date.now();
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - started);
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, complete]);

  return useMemo(() => {
    if (complete) return "ready";
    const fromEvents = resolveStepFromEvents(events);
    const hasLayerTags = events.some((e) => /^\[[a-z]+\]/i.test(e));
    if (hasLayerTags) return fromEvents;
    if (active) {
      const simulated = simulatedStepAt(elapsedMs, true);
      // Prefer the further-ahead of event-based vs simulated when events are plain strings
      return stepIndex(simulated) > stepIndex(fromEvents) ? simulated : fromEvents;
    }
    return fromEvents;
  }, [events, active, complete, elapsedMs]);
}
