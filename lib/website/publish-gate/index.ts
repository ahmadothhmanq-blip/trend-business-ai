export { evaluatePublishGates, type PublishGateResult } from "@/lib/website/publish-gates";
export { evaluateUnifiedPublishGates } from "@/lib/ai-core/quality-platform/publish";
export { isPublishGateEnabled } from "@/lib/website/generation-flags";
export type {
  PublishGateCheck,
  PublishGateCheckId,
  PublishGateSeverity,
} from "@/lib/website/publish-gate/types";

import type { WebsiteGeneration } from "@/types/database";
import { evaluateUnifiedPublishGates } from "@/lib/ai-core/quality-platform/publish";
import { isPublishGateEnabled } from "@/lib/website/generation-flags";

/** When WB_PUBLISH_GATE=1, returns false if blockers exist. */
export function canPublishGeneration(generation: WebsiteGeneration): boolean {
  const result = evaluateUnifiedPublishGates(generation);
  if (!isPublishGateEnabled()) return true;
  return result.publishReady;
}
