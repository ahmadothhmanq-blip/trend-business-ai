"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, MessageSquare, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import {
  useAppCopilotCommand,
  type AppCopilotUndoSnapshot,
} from "@/components/dashboard/webapp-builder/hooks/use-app-copilot-command";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebAppGeneration } from "@/types/webapp";
import { useProductT } from "@/lib/i18n/use-scoped-t";

type AppCopilotCommandPanelProps = {
  generationId: string | null;
  disabled?: boolean;
  expectedRevision?: number;
  getUndoSnapshot?: () => AppCopilotUndoSnapshot | null;
  onApplied?: (payload: {
    model: StructuredAppModel;
    files: GeneratedProjectFile[];
    generation: WebAppGeneration;
    previewVersion: string;
    revision: number;
  }) => void;
};

const COPILOT_EXAMPLE_KEYS = [
  "changeColor",
  "addProduct",
  "addDashboard",
  "addBooking",
  "redesign",
] as const;

export function AppCopilotCommandPanel({
  generationId,
  disabled,
  expectedRevision,
  getUndoSnapshot,
  onApplied,
}: AppCopilotCommandPanelProps) {
  const p = useProductT("webappBuilder");
  const [open, setOpen] = useState(true);
  const [chatView, setChatView] = useState(false);
  const [command, setCommand] = useState("");
  const {
    loading,
    error,
    streamMessage,
    thread,
    canUndo,
    submit,
    undo,
    previewCostHint,
    clearError,
  } = useAppCopilotCommand({
    generationId,
    expectedRevision,
    useClassifier: true,
    onBeforeMutation: getUndoSnapshot ?? undefined,
    onApplied,
  });

  const costHint = command.trim() ? previewCostHint(command) : null;
  const costLabel =
    costHint?.costTier === "ai-standard" ? p("copilot.costAi") : p("copilot.costFree");

  const handleSubmit = async () => {
    if (!command.trim() || loading || disabled) return;
    clearError();
    const result = await submit(command);
    if (result?.ok) setCommand("");
  };

  return (
    <DashboardPanel className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{p("copilot.title")}</h3>
            <p className="text-xs text-white/50">{p("copilot.subtitle")}</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="size-5 text-white/40" />
        ) : (
          <ChevronDown className="size-5 text-white/40" />
        )}
      </button>

      {open && (
        <div className="mt-5 space-y-4 border-t border-white/[0.06] pt-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
              {chatView ? p("copilot.conversation") : p("copilot.quickCommands")}
            </p>
            <button
              type="button"
              onClick={() => setChatView((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
                chatView
                  ? "border-premium-gold/40 bg-premium-gold/10 text-premium-gold-light"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white/80",
              )}
            >
              <MessageSquare className="size-3" />
              {chatView ? p("copilot.commandView") : p("copilot.chatView")}
            </button>
          </div>

          {chatView ? (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-3">
              {thread.length === 0 ? (
                <p className="text-xs text-white/45">{p("copilot.emptyThread")}</p>
              ) : (
                thread.map((turn) => (
                  <div
                    key={turn.id}
                    className={cn(
                      "rounded-xl px-3 py-2 text-xs",
                      turn.role === "user"
                        ? "ml-4 border border-white/10 bg-white/[0.04] text-white/80"
                        : "mr-4 border border-premium-gold/20 bg-premium-gold/8 text-white/75",
                    )}
                  >
                    <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-white/35">
                      {turn.role === "user" ? p("copilot.you") : p("copilot.assistant")}
                    </p>
                    <p>{turn.content}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {COPILOT_EXAMPLE_KEYS.map((key) => {
                const label = p(`copilot.examples.${key}.label`);
                const exampleCommand = p(`copilot.examples.${key}.command`);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled || loading || !generationId}
                    onClick={() => setCommand(exampleCommand)}
                    className={cn(
                      "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition hover:border-premium-gold/30 hover:text-white",
                      (disabled || loading || !generationId) && "opacity-50",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={p("copilot.placeholder")}
            disabled={disabled || loading || !generationId}
            rows={3}
            className="resize-none rounded-2xl border-white/10 bg-black/30 text-sm text-white placeholder:text-white/35"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />

          {costHint ? (
            <div
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2 text-xs",
                costHint.costTier === "ai-standard"
                  ? "border-amber-500/30 bg-amber-500/8 text-amber-200"
                  : "border-white/10 bg-white/[0.03] text-white/60",
              )}
            >
              <span>{costLabel}</span>
              {costHint.costTier === "ai-standard" ? (
                <span className="font-medium">
                  {p("copilot.creditSingular", { count: costHint.creditCost })}
                </span>
              ) : null}
            </div>
          ) : null}

          {streamMessage ? (
            <p className="text-xs text-white/50">{streamMessage}</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              disabled={disabled || loading || !generationId || !command.trim()}
              onClick={() => void handleSubmit()}
              className="btn-ghost-gold h-11 flex-1 rounded-2xl"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {streamMessage || p("copilot.runningCommand")}
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {p("copilot.runCommand")}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || loading || !canUndo}
              onClick={() => void undo()}
              className="h-11 rounded-2xl border-white/15 bg-white/[0.03] px-4 text-white/70"
              title={p("copilot.undoTitle")}
            >
              <Undo2 className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}
