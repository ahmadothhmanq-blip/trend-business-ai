"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { StudioChatPlan, StudioChatState } from "@/lib/webapp/studio-chat/engine";
import { useAppCopilotCommand } from "@/components/dashboard/webapp-builder/hooks/use-app-copilot-command";
import type { AppCopilotUndoSnapshot } from "@/components/dashboard/webapp-builder/hooks/use-app-copilot-command";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WebAppGeneration } from "@/types/webapp";

type AppStudioChatProps = {
  language?: string;
  mode: "build" | "edit";
  generationId?: string | null;
  expectedRevision?: number;
  seedVertical?: "crm" | "booking" | "ecommerce" | "healthcare" | "finance" | "" | null;
  onBeforeMutation?: () => AppCopilotUndoSnapshot | null;
  onApplied?: (payload: {
    model: StructuredAppModel;
    files: GeneratedProjectFile[];
    generation: WebAppGeneration;
    previewVersion: string;
    revision: number;
  }) => void;
  onBuildApproved?: (plan: StudioChatPlan, compiledPrompt: string) => void;
  className?: string;
};

function compilePromptFromPlan(plan: StudioChatPlan, transcript: string): string {
  return [
    plan.summary,
    "",
    `Vertical: ${plan.vertical}`,
    `Screens: ${plan.screens.join(", ")}`,
    `Features: ${plan.features.join(", ")}`,
    "",
    "Conversation:",
    transcript.slice(-1800),
  ].join("\n");
}

export function AppStudioChat({
  language,
  mode,
  generationId,
  expectedRevision,
  seedVertical,
  onBeforeMutation,
  onApplied,
  onBuildApproved,
  className,
}: AppStudioChatProps) {
  const p = useProductT("webappBuilder");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StudioChatState | null>(null);
  const [plan, setPlan] = useState<StudioChatPlan | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const copilot = useAppCopilotCommand({
    generationId: mode === "edit" ? generationId ?? null : null,
    expectedRevision,
    onBeforeMutation,
    onApplied,
  });

  useEffect(() => {
    if (mode !== "build") return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/webapp-builder/studio-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bootstrap: true,
            language,
            seedVertical: seedVertical || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        if (!cancelled) {
          setState(data.state);
          setPlan(data.plan ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : p("studioChat.errors.failed"));
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, language, seedVertical, p]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state?.turns.length, copilot.thread.length]);

  const turns =
    mode === "edit"
      ? copilot.thread.map((t) => ({
          id: t.id,
          role: t.role,
          content: t.content,
        }))
      : (state?.turns ?? []).map((t) => ({
          id: t.id,
          role: t.role,
          content: t.content,
        }));

  async function sendBuild() {
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/webapp-builder/studio-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setState(data.state);
      setPlan(data.plan ?? null);
      if (data.shouldBuild && data.plan && onBuildApproved) {
        const transcript = (data.state.turns as Array<{ role: string; content: string }>)
          .map((t) => `${t.role}: ${t.content}`)
          .join("\n");
        onBuildApproved(data.plan, compilePromptFromPlan(data.plan, transcript));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : p("studioChat.errors.failed"));
    } finally {
      setBusy(false);
    }
  }

  async function sendEdit() {
    const message = input.trim();
    if (!message || copilot.loading) return;
    setInput("");
    await copilot.submit(message);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "edit") await sendEdit();
    else await sendBuild();
  }

  const loading = mode === "edit" ? copilot.loading : busy;
  const displayError = mode === "edit" ? copilot.error : error;

  return (
    <DashboardCard className={cn("border-white/10", className)}>
      <DashboardCardHeader>
        <DashboardCardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-premium-gold-light" />
          {mode === "edit" ? p("studioChat.editTitle") : p("studioChat.buildTitle")}
        </DashboardCardTitle>
        <DashboardCardDescription>
          {mode === "edit" ? p("studioChat.editSubtitle") : p("studioChat.buildSubtitle")}
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
          {turns.length === 0 ? (
            <p className="text-xs text-white/45">{p("studioChat.empty")}</p>
          ) : (
            turns.map((turn) => (
              <div
                key={turn.id}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  turn.role === "user"
                    ? "ms-8 bg-premium-gold/15 text-white"
                    : "me-8 bg-white/5 text-white/85",
                )}
              >
                <p className="mb-1 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                  {turn.role === "user" ? p("studioChat.you") : p("studioChat.assistant")}
                </p>
                {turn.content}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {mode === "build" && plan ? (
          <div className="rounded-xl border border-premium-gold/25 bg-premium-gold/10 px-3 py-2 text-xs text-white/80">
            <p className="font-semibold text-premium-gold-light">{plan.title}</p>
            <p className="mt-1 whitespace-pre-wrap text-white/70">{plan.summary}</p>
          </div>
        ) : null}

        {displayError ? (
          <p className="text-xs text-red-300">{displayError}</p>
        ) : null}
        {mode === "edit" && copilot.streamMessage ? (
          <p className="text-xs text-white/50">{copilot.streamMessage}</p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "edit"
                ? p("studioChat.editPlaceholder")
                : p("studioChat.buildPlaceholder")
            }
            className={cn(dashboardInputClass, "min-h-[88px]")}
            disabled={loading}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-gold gap-2 rounded-xl font-bold text-luxury-black"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {mode === "edit" ? p("studioChat.sendEdit") : p("studioChat.send")}
            </Button>
            {mode === "edit" ? (
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-xl border-white/15"
                disabled={!copilot.canUndo || loading}
                onClick={() => void copilot.undo()}
              >
                <Undo2 className="h-4 w-4" />
                {p("copilot.undoTitle")}
              </Button>
            ) : null}
          </div>
        </form>
      </DashboardCardContent>
    </DashboardCard>
  );
}
