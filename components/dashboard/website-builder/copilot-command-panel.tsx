"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, MessageSquare, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import {
  useCopilotCommand,
  type CopilotCommandControl,
  type CopilotUndoSnapshot,
} from "@/components/dashboard/website-builder/hooks/use-copilot-command";
import type { CopilotSelectionContext } from "@/lib/ai-core/website-copilot/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type CopilotCommandPanelProps = {
  generationId: string | null;
  disabled?: boolean;
  expectedRevision?: number;
  selectionContext?: CopilotSelectionContext | null;
  getUndoSnapshot?: () => CopilotUndoSnapshot | null;
  onApplied?: (payload: {
    project: GeneratedWebsiteProject;
    generation: WebsiteGeneration;
    previewVersion: string;
    revision: number;
  }) => void;
  /** Shared Copilot control from parent (unifies AI Builder + docked panel). */
  control?: CopilotCommandControl;
};

const PHASE1_CHIPS = [
  "Change the primary color to #2563eb",
  "Make the design more modern",
  "Add a testimonials section",
  "Regenerate only the hero section",
  "Rewrite the homepage copy",
] as const;

const PHASE2_CHIPS = [
  "Add an About page",
  "Replace all images with fresh photos",
  "Improve SEO for this site",
  "Add a new service to the catalog",
  "Add a blog post to CMS",
] as const;

type CopilotCommandPanelViewProps = CopilotCommandPanelProps & {
  control: CopilotCommandControl;
};

export function CopilotCommandPanelView({
  generationId,
  disabled,
  selectionContext,
  control,
}: CopilotCommandPanelViewProps) {
  const { wb } = useBuilderLocale();
  const [open, setOpen] = useState(true);
  const [chatView, setChatView] = useState(false);
  const [command, setCommand] = useState("");
  const {
    loading,
    error,
    streamMessage,
    history,
    thread,
    canUndo,
    submit,
    undo,
    previewCostHint,
    clearError,
  } = control;

  const costHint = command.trim() ? previewCostHint(command) : null;

  const selectionLabel =
    selectionContext?.componentExportName ||
    selectionContext?.nodeLabel ||
    selectionContext?.sectionKind;

  const handleSubmit = async () => {
    if (!command.trim() || loading || disabled) return;
    clearError();
    const result = await submit(command);
    if (result?.ok) {
      setCommand("");
    }
  };

  return (
    <DashboardPanel className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-start"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{wb("builder.copilot.title")}</h3>
            <p className="text-xs text-white/50">{wb("builder.copilot.subtitle")}</p>
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
          {selectionLabel ? (
            <div className="flex items-center gap-2 rounded-xl border border-premium-gold/25 bg-premium-gold/8 px-3 py-2 text-xs text-premium-gold-light">
              <span className="font-medium">Selection:</span>
              <span>{selectionLabel}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
              {chatView ? wb("builder.copilot.conversationView") : wb("builder.copilot.quickEdits")}
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
              {chatView ? "Command view" : "Chat view"}
            </button>
          </div>

          {chatView ? (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-3">
              {thread.length === 0 ? (
                <p className="text-xs text-white/45">
                  Start a conversation — your session history appears here.
                </p>
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
                      {turn.role === "user" ? "You" : "Copilot"}
                    </p>
                    <p>{turn.content}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {PHASE1_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled={disabled || loading || !generationId}
                      onClick={() => setCommand(chip)}
                      className={cn(
                        "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition hover:border-premium-gold/30 hover:text-white",
                        (disabled || loading || !generationId) && "opacity-50",
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
                  Site management
                </p>
                <div className="flex flex-wrap gap-2">
                  {PHASE2_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled={disabled || loading || !generationId}
                      onClick={() => setCommand(chip)}
                      className={cn(
                        "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition hover:border-premium-gold/30 hover:text-white",
                        (disabled || loading || !generationId) && "opacity-50",
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={wb("builder.copilot.placeholderLong")}
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
              <span>{costHint.label}</span>
              {costHint.costTier === "ai-standard" ? (
                <span className="font-medium">{costHint.creditCost} credit</span>
              ) : null}
            </div>
          ) : null}

          {streamMessage ? (
            <p className="text-xs text-white/50" role="status">
              {streamMessage}
            </p>
          ) : null}

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

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
                  {streamMessage || "Running command…"}
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {wb("builder.copilot.runCommand")}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || loading || !canUndo}
              onClick={() => void undo()}
              className="h-11 rounded-2xl border-white/15 bg-white/[0.03] px-4 text-white/70"
              title={wb("builder.copilot.undoTitle")}
            >
              <Undo2 className="size-4" />
            </Button>
          </div>

          {history.length > 0 && !chatView && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                Recent commands
              </p>
              <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-xs",
                      entry.error
                        ? "border-red-500/30 bg-red-500/5 text-red-300"
                        : "border-white/8 bg-white/[0.02] text-white/70",
                    )}
                  >
                    <p className="font-medium text-white/85">{entry.command}</p>
                    <p className="mt-1 text-white/55">{entry.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </DashboardPanel>
  );
}

function CopilotCommandPanelWithHook({
  generationId,
  disabled,
  expectedRevision,
  selectionContext,
  getUndoSnapshot,
  onApplied,
}: Omit<CopilotCommandPanelProps, "control">) {
  const control = useCopilotCommand({
    generationId,
    expectedRevision,
    selectionContext,
    useClassifier: true,
    onBeforeMutation: getUndoSnapshot ?? undefined,
    onApplied,
  });

  return (
    <CopilotCommandPanelView
      generationId={generationId}
      disabled={disabled}
      expectedRevision={expectedRevision}
      selectionContext={selectionContext}
      getUndoSnapshot={getUndoSnapshot}
      onApplied={onApplied}
      control={control}
    />
  );
}

export function CopilotCommandPanel(props: CopilotCommandPanelProps) {
  if (props.control) {
    return <CopilotCommandPanelView {...props} control={props.control} />;
  }
  return <CopilotCommandPanelWithHook {...props} />;
}
