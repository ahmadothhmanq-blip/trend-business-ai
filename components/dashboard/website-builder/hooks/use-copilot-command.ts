"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { composePlan } from "@/lib/ai-core/website-copilot/composer";
import { estimateCopilotCost } from "@/lib/ai-core/website-copilot/cost-tier";
import { routeCommand } from "@/lib/ai-core/website-copilot/router";
import type { CopilotSelectionContext } from "@/lib/ai-core/website-copilot/types";
import type { CopilotChatTurn } from "@/lib/ai-core/copilot-kernel/types";
import { COPILOT_UNDO_MAX_DEPTH } from "@/lib/ai-core/website-copilot/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { submitWebsiteCopilotCommand } from "@/lib/website/builder/copilot-client";
import type { CopilotCommandApiSuccess } from "@/lib/website/builder/copilot-client";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";
import { useTranslation } from "@/lib/i18n/client";
import { formatWebsiteBuilderApiError } from "@/lib/website/builder/client-api-error";
import {
  createCopilotSessionId,
  persistCopilotSessionId,
  readCopilotSessionId,
  resolveCopilotSessionId,
} from "@/lib/website/builder/copilot-session";

export type CopilotCommandLogEntry = {
  id: string;
  command: string;
  summary: string;
  capability: string;
  tier: string;
  mutated: boolean;
  at: string;
  error?: string;
};

export type CopilotUndoSnapshot = {
  project: GeneratedWebsiteProject;
  generation: WebsiteGeneration;
  revision: number;
};

export type { CopilotCommandApiSuccess };

export type CopilotSubmitOptions = {
  forceStream?: boolean;
};

export type CopilotCommandControl = {
  loading: boolean;
  error: string | null;
  streamMessage: string | null;
  history: CopilotCommandLogEntry[];
  thread: CopilotChatTurn[];
  sessionId: string;
  canUndo: boolean;
  submit: (
    command: string,
    options?: CopilotSubmitOptions,
  ) => Promise<CopilotCommandApiSuccess | null>;
  undo: () => Promise<CopilotCommandApiSuccess | null>;
  previewCostHint: (command: string) => ReturnType<typeof estimateCopilotCost>;
  clearError: () => void;
};

type UseCopilotCommandOptions = {
  generationId: string | null;
  expectedRevision?: number;
  applyAi?: boolean;
  selectionContext?: CopilotSelectionContext | null;
  useClassifier?: boolean;
  onApplied?: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
    previewVersion: string;
    revision: number;
  }) => void;
  onBeforeMutation?: () => CopilotUndoSnapshot | null;
  onStreamProgress?: (message: string) => void;
};

const MAX_HISTORY = 20;

export function useCopilotCommand(
  options: UseCopilotCommandOptions,
): CopilotCommandControl {
  const {
    generationId,
    expectedRevision,
    applyAi,
    selectionContext,
    useClassifier,
    onApplied,
    onBeforeMutation,
    onStreamProgress,
  } = options;

  const { wb } = useBuilderLocale();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamMessage, setStreamMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<CopilotCommandLogEntry[]>([]);
  const [thread, setThread] = useState<CopilotChatTurn[]>([]);
  const [sessionId, setSessionId] = useState(() =>
    generationId ? resolveCopilotSessionId(generationId) : createCopilotSessionId(),
  );
  const [undoStack, setUndoStack] = useState<CopilotUndoSnapshot[]>([]);
  const beforeMutationRef = useRef(onBeforeMutation);

  useEffect(() => {
    if (!generationId) return;
    const existing = readCopilotSessionId(generationId);
    if (existing) {
      setSessionId(existing);
      return;
    }
    const created = createCopilotSessionId();
    persistCopilotSessionId(generationId, created);
    setSessionId(created);
  }, [generationId]);

  useEffect(() => {
    beforeMutationRef.current = onBeforeMutation;
  }, [onBeforeMutation]);

  const pushUndoSnapshot = useCallback((snapshot: CopilotUndoSnapshot) => {
    setUndoStack((stack) =>
      [snapshot, ...stack].slice(0, COPILOT_UNDO_MAX_DEPTH),
    );
  }, []);

  const submit = useCallback(
    async (command: string, submitOptions?: CopilotSubmitOptions) => {
      const trimmed = command.trim();
      if (!trimmed || !generationId) {
        return null;
      }

      const undoSnapshot = beforeMutationRef.current?.() ?? null;

      setLoading(true);
      setError(null);
      setStreamMessage(null);

      try {
        const body = await submitWebsiteCopilotCommand({
          generationId,
          command: trimmed,
          expectedRevision,
          applyAi: applyAi ?? true,
          selectionContext: selectionContext ?? undefined,
          useClassifier: useClassifier ?? true,
          sessionId,
          forceStream: submitOptions?.forceStream,
          onStreamProgress: (message) => {
            setStreamMessage(message);
            onStreamProgress?.(message);
          },
        });

        const entry: CopilotCommandLogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          command: trimmed,
          summary: body.summary,
          capability: body.capability,
          tier: body.tier,
          mutated: body.mutated,
          at: new Date().toISOString(),
        };

        setHistory((items) => [entry, ...items].slice(0, MAX_HISTORY));

        if (body.thread?.length) {
          setThread(body.thread);
        }

        if (body.mutated && undoSnapshot) {
          pushUndoSnapshot(undoSnapshot);
        }

        if (body.mutated && body.project && body.generation && onApplied) {
          onApplied({
            project: body.project,
            generation: body.generation,
            previewVersion: body.previewVersion,
            revision: body.revision,
          });
        }

        return body;
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : undefined;
        const message = formatWebsiteBuilderApiError({
          message: rawMessage,
          t,
          wb,
        });
        setError(message);
        setHistory((items) =>
          [
            {
              id: `${Date.now()}-err`,
              command: trimmed,
              summary: message,
              capability: "website.advisory.unknown",
              tier: "advisory",
              mutated: false,
              at: new Date().toISOString(),
              error: message,
            },
            ...items,
          ].slice(0, MAX_HISTORY),
        );
        return null;
      } finally {
        setLoading(false);
        setStreamMessage(null);
      }
    },
    [
      generationId,
      expectedRevision,
      applyAi,
      selectionContext,
      useClassifier,
      onApplied,
      onStreamProgress,
      pushUndoSnapshot,
      sessionId,
      t,
      wb,
    ],
  );

  const undo = useCallback(async () => {
    if (!generationId || undoStack.length === 0) {
      return null;
    }

    const [snapshot, ...rest] = undoStack;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/website-builder/${generationId}/copilot/undo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            snapshot: { project: snapshot!.project },
            expectedRevision,
          }),
        },
      );

      const body = (await res.json()) as CopilotCommandApiSuccess & {
        error?: string;
      };

      if (!res.ok || !body.ok) {
        throw new Error(
          formatWebsiteBuilderApiError({
            status: res.status,
            message: body.error,
            t,
            wb,
          }),
        );
      }

      setUndoStack(rest);

      if (body.project && body.generation && onApplied) {
        onApplied({
          project: body.project,
          generation: body.generation,
          previewVersion: body.previewVersion,
          revision: body.revision,
        });
      }

      return body;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : formatWebsiteBuilderApiError({ t, wb });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [generationId, expectedRevision, onApplied, undoStack, t, wb]);

  const previewCostHint = useCallback((command: string) => {
    const match = routeCommand(command);
    const plan = composePlan(match);
    return estimateCopilotCost(match, plan);
  }, []);

  return {
    loading,
    error,
    streamMessage,
    history,
    thread,
    sessionId,
    canUndo: undoStack.length > 0,
    submit,
    undo,
    previewCostHint,
    clearError: () => setError(null),
  };
}
