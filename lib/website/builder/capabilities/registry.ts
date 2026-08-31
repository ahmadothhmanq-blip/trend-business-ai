import type { CapabilityDetectionDefinition } from "@/lib/website/builder/capabilities/types";
import { CAPABILITY_DETECTION_DEFINITIONS } from "@/lib/website/builder/capabilities/detection-rules";

export type CapabilityConsumerRegistration = {
  id: string;
  label: string;
  module: string;
  description: string;
};

const analyzerRegistry: CapabilityDetectionDefinition[] = [
  ...CAPABILITY_DETECTION_DEFINITIONS,
];

const consumerRegistry: CapabilityConsumerRegistration[] = [];

/** Register an additional capability analyzer (extension point — no core edits). */
export function registerCapabilityAnalyzer(
  definition: CapabilityDetectionDefinition,
): void {
  const existing = analyzerRegistry.findIndex((item) => item.id === definition.id);
  if (existing >= 0) {
    analyzerRegistry[existing] = definition;
    return;
  }
  analyzerRegistry.push(definition);
}

export function getCapabilityAnalyzers(): CapabilityDetectionDefinition[] {
  return [...analyzerRegistry];
}

/** Register a capability consumer for dependency tracking and diagnostics. */
export function registerCapabilityConsumer(
  consumer: CapabilityConsumerRegistration,
): void {
  const existing = consumerRegistry.findIndex((item) => item.id === consumer.id);
  if (existing >= 0) {
    consumerRegistry[existing] = consumer;
    return;
  }
  consumerRegistry.push(consumer);
}

export function getCapabilityConsumers(): CapabilityConsumerRegistration[] {
  return [...consumerRegistry];
}
