/**
 * Website Builder — shared Website Copilot client (commands + stream).
 * Used by useCopilotCommand hook and AI Builder panel for unified routing.
 */

import { readSseStream } from "@/lib/api/sse-client";
import { composePlan } from "@/lib/ai-core/website-copilot/composer";
import {
  routeCommand,
  capabilityRequiresAi,
} from "@/lib/ai-core/website-copilot/router";
import type { CopilotSelectionContext } from "@/lib/ai-core/website-copilot/types";
import type { CopilotChatTurn } from "@/lib/ai-core/copilot-kernel/types";

export type CopilotCommandApiSuccess = {
  ok: true;
  capability: string;
  tier: "local" | "ai-continue" | "advisory";
  mutated: boolean;
  revision: number;
  aiRunId: string | null;
  fromIdempotency: boolean;
  summary: string;
  project?: import("@/plugins/website/types").GeneratedWebsiteProject;
  generation?: import("@/types/database").WebsiteGeneration;
  previewVersion: string;
  warnings?: string[];
  examples?: string[];
  costHint?: {
    costTier: "free" | "ai-standard";
    creditCost: number;
    capability: string;
    label: string;
  };
  classifierUsed?: boolean;
  splitCommands?: string[];
  thread?: CopilotChatTurn[];
  memoryTurnCount?: number;
  review?: {
    score: number;
    grade: string;
    summary: string;
    recommendations: string[];
  };
  crossProductSplit?: {
    websiteCommand?: string;
    appCommand?: string;
    linkedGenerationId?: string;
  };
};

export type SubmitWebsiteCopilotParams = {
  generationId: string;
  command: string;
  expectedRevision?: number;
  applyAi?: boolean;
  selectionContext?: CopilotSelectionContext | null;
  useClassifier?: boolean;
  sessionId: string;
  useMemory?: boolean;
  /** When true, always use the Copilot SSE stream (AI Builder actions). */
  forceStream?: boolean;
  onStreamProgress?: (message: string) => void;
};

export function shouldUseCopilotStream(
  command: string,
  applyAi: boolean,
  forceStream?: boolean,
): boolean {
  if (forceStream) return true;
  const match = routeCommand(command);
  const plan = composePlan(match);
  return (
    plan.tier === "ai-continue" && applyAi && capabilityRequiresAi(match.uri)
  );
}

export async function submitWebsiteCopilotCommand(
  params: SubmitWebsiteCopilotParams,
): Promise<CopilotCommandApiSuccess> {
  const trimmed = params.command.trim();
  if (!trimmed) {
    throw new Error("Command is required.");
  }

  const applyAi = params.applyAi ?? true;
  const useStream = shouldUseCopilotStream(trimmed, applyAi, params.forceStream);
  const phase5Body = {
    sessionId: params.sessionId,
    useMemory: params.useMemory ?? true,
  };

  if (useStream) {
    const res = await fetch(
      `/api/website-builder/${params.generationId}/copilot/stream`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: trimmed,
          expectedRevision: params.expectedRevision,
          applyAi,
          selectionContext: params.selectionContext ?? undefined,
          useClassifier: params.useClassifier ?? true,
          ...phase5Body,
        }),
      },
    );

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || "Copilot stream failed.");
    }

    let result: CopilotCommandApiSuccess | null = null;

    const sseResult = await readSseStream<CopilotCommandApiSuccess>(res, {
      onProgress: (message) => params.onStreamProgress?.(message),
      onComplete: async (payload) => {
        if (payload.ok === true) {
          result = payload;
        }
      },
      onError: (message) => {
        throw new Error(message);
      },
    });

    if (!result && sseResult.error) {
      throw new Error(sseResult.error);
    }
    if (!result) {
      throw new Error("Copilot stream ended without a result.");
    }
    return result;
  }

  const res = await fetch(
    `/api/website-builder/${params.generationId}/copilot/commands`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: trimmed,
        expectedRevision: params.expectedRevision,
        applyAi,
        selectionContext: params.selectionContext ?? undefined,
        useClassifier: params.useClassifier ?? false,
        ...phase5Body,
      }),
    },
  );

  const json = (await res.json()) as CopilotCommandApiSuccess & { error?: string };
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Copilot command failed.");
  }
  return json;
}
