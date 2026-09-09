"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readSseStream } from "@/lib/api/sse-client";
import { composeAppPlan } from "@/lib/ai-core/app-copilot/composer";
import { estimateAppCopilotCost } from "@/lib/ai-core/app-copilot/cost-tier";
import {
  routeAppCommand,
  appCapabilityRequiresAi,
} from "@/lib/ai-core/app-copilot/router";
import type { AppCopilotSelectionContext } from "@/lib/ai-core/app-copilot/types";
import type { CopilotChatTurn } from "@/lib/ai-core/copilot-kernel/types";
import { APP_COPILOT_UNDO_MAX_DEPTH } from "@/lib/ai-core/app-copilot/types";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebAppGeneration } from "@/types/webapp";
import { useTranslation } from "@/lib/i18n/client";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { formatWebappBuilderApiError } from "@/lib/webapp/builder/client-api-error";

export type AppCopilotUndoSnapshot = {
  model: StructuredAppModel;
  files: GeneratedProjectFile[];
  generation: WebAppGeneration;
  revision: number;
};

type UseAppCopilotCommandOptions = {
  generationId: string | null;
  expectedRevision?: number;
  applyAi?: boolean;
  selectionContext?: AppCopilotSelectionContext | null;
  useClassifier?: boolean;
  onApplied?: (payload: {
    model: StructuredAppModel;
    files: GeneratedProjectFile[];
    generation: WebAppGeneration;
    previewVersion: string;
    revision: number;
  }) => void;
  onBeforeMutation?: () => AppCopilotUndoSnapshot | null;
};

function shouldUseStream(command: string, applyAi: boolean): boolean {
  const match = routeAppCommand(command);
  const plan = composeAppPlan(match);
  return (
    plan.tier === "ai-continue" &&
    applyAi &&
    appCapabilityRequiresAi(match.uri)
  );
}

function createCopilotSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useAppCopilotCommand(options: UseAppCopilotCommandOptions) {
  const { t } = useTranslation();
  const p = useProductT("webappBuilder");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamMessage, setStreamMessage] = useState<string | null>(null);
  const [thread, setThread] = useState<CopilotChatTurn[]>([]);
  const [sessionId] = useState(() => createCopilotSessionId());
  const [undoStack, setUndoStack] = useState<AppCopilotUndoSnapshot[]>([]);
  const beforeMutationRef = useRef(options.onBeforeMutation);

  useEffect(() => {
    beforeMutationRef.current = options.onBeforeMutation;
  }, [options.onBeforeMutation]);

  const phase5Body = useCallback(
    () => ({
      sessionId,
      useMemory: true,
    }),
    [sessionId],
  );

  const pushUndoSnapshot = useCallback((snapshot: AppCopilotUndoSnapshot) => {
    setUndoStack((stack) =>
      [snapshot, ...stack].slice(0, APP_COPILOT_UNDO_MAX_DEPTH),
    );
  }, []);

  const submit = useCallback(
    async (command: string) => {
      const trimmed = command.trim();
      if (!trimmed || !options.generationId) return null;

      const undoSnapshot = beforeMutationRef.current?.() ?? null;
      const applyAi = options.applyAi ?? true;
      const useStream = shouldUseStream(trimmed, applyAi);

      setLoading(true);
      setError(null);
      setStreamMessage(null);

      try {
        let body: {
          ok: true;
          mutated: boolean;
          summary: string;
          model?: StructuredAppModel;
          generation?: WebAppGeneration;
          files?: GeneratedProjectFile[];
          previewVersion: string;
          revision: number;
          thread?: CopilotChatTurn[];
        };

        if (useStream) {
          const res = await fetch(
            `/api/webapp-builder/${options.generationId}/copilot/stream`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                command: trimmed,
                expectedRevision: options.expectedRevision,
                applyAi,
                selectionContext: options.selectionContext ?? undefined,
                useClassifier: options.useClassifier ?? true,
                ...phase5Body(),
              }),
            },
          );
          if (!res.ok) {
            const json = (await res.json().catch(() => ({}))) as {
              error?: string;
              code?: string;
            };
            throw new Error(
              formatWebappBuilderApiError({
                status: res.status,
                code: json.code,
                message: json.error || "App Copilot stream failed.",
                t,
                p,
              }),
            );
          }
          let result: typeof body | null = null;
          await readSseStream(res, {
            onProgress: (message) => setStreamMessage(message),
            onComplete: async (payload) => {
              if (payload.ok === true) result = payload as typeof body;
            },
            onError: (message) => {
              throw new Error(message);
            },
          });
          if (!result) {
            throw new Error(
              formatWebappBuilderApiError({
                message: "App Copilot stream ended without a result.",
                t,
                p,
              }),
            );
          }
          body = result;
        } else {
          const res = await fetch(
            `/api/webapp-builder/${options.generationId}/copilot/commands`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                command: trimmed,
                expectedRevision: options.expectedRevision,
                applyAi,
                selectionContext: options.selectionContext ?? undefined,
                useClassifier: options.useClassifier ?? false,
                ...phase5Body(),
              }),
            },
          );
          const json = (await res.json()) as typeof body & {
            error?: string;
            code?: string;
          };
          if (!res.ok || !json.ok) {
            throw new Error(
              formatWebappBuilderApiError({
                status: res.status,
                code: json.code,
                message: json.error || "App Copilot command failed.",
                t,
                p,
              }),
            );
          }
          body = json;
        }

        if (body.mutated && undoSnapshot) pushUndoSnapshot(undoSnapshot);
        if (body.thread?.length) setThread(body.thread);
        if (body.mutated && body.model && body.generation && options.onApplied) {
          options.onApplied({
            model: body.model,
            files: body.files ?? undoSnapshot?.files ?? [],
            generation: body.generation,
            previewVersion: body.previewVersion,
            revision: body.revision,
          });
        }
        return body;
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : undefined;
        const message = formatWebappBuilderApiError({
          message: rawMessage,
          t,
          p,
        });
        setError(message);
        return null;
      } finally {
        setLoading(false);
        setStreamMessage(null);
      }
    },
    [options, pushUndoSnapshot, phase5Body, t, p],
  );

  const undo = useCallback(async () => {
    if (!options.generationId || undoStack.length === 0) return null;
    const [snapshot, ...rest] = undoStack;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/webapp-builder/${options.generationId}/copilot/undo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            snapshot: { model: snapshot!.model, files: snapshot!.files },
            expectedRevision: options.expectedRevision,
          }),
        },
      );
      const body = (await res.json()) as {
        ok: boolean;
        error?: string;
        code?: string;
        model?: StructuredAppModel;
        generation?: WebAppGeneration;
        files?: GeneratedProjectFile[];
        previewVersion?: string;
        revision?: number;
      };
      if (!res.ok || !body.ok) {
        throw new Error(
          formatWebappBuilderApiError({
            status: res.status,
            code: body.code,
            message: body.error || "App Copilot undo failed.",
            t,
            p,
          }),
        );
      }
      setUndoStack(rest);
      if (body.model && body.generation && options.onApplied) {
        options.onApplied({
          model: body.model,
          files: body.files ?? snapshot!.files,
          generation: body.generation,
          previewVersion: body.previewVersion ?? body.generation.updated_at,
          revision: body.revision ?? 0,
        });
      }
      return body;
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : undefined;
      setError(
        formatWebappBuilderApiError({
          message: rawMessage,
          t,
          p,
        }),
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [options, undoStack, t, p]);

  const previewCostHint = useCallback((command: string) => {
    const match = routeAppCommand(command);
    const plan = composeAppPlan(match);
    return estimateAppCopilotCost(match, plan);
  }, []);

  return {
    loading,
    error,
    streamMessage,
    thread,
    sessionId,
    undoStack,
    canUndo: undoStack.length > 0,
    submit,
    undo,
    previewCostHint,
    clearError: () => setError(null),
  };
}
