"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { useTranslation } from "@/lib/i18n/client";
import { GlsGenerationLanguageSelect } from "@/components/dashboard/language/gls-generation-language-select";
import {
  getInitialGlsGenerationLanguage,
  glsGenerationLanguagePayload,
} from "@/lib/language-platform/generation/service";
import type { BusinessAssistantAction } from "@/types/business-manager";

const ACTION_KEYS: BusinessAssistantAction[] = [
  "analyze",
  "improve",
  "summarize",
  "recommend",
];

export function AssistantPanel() {
  const wt = useWorkspaceT("businessManager");
  const { t, locale } = useTranslation();
  const actions = useMemo(
    () =>
      ACTION_KEYS.map((key) => ({
        key,
        label: wt(`assistant.actions.${key}`),
      })),
    [wt],
  );
  const [text, setText] = useState("");
  const [action, setAction] = useState<BusinessAssistantAction>("analyze");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(() =>
    getInitialGlsGenerationLanguage({ fallback: "ui-locale", uiLocale: locale }),
  );

  const run = async () => {
    if (!text.trim()) return toast.error(wt("assistant.contextRequired"));
    setLoading(true);
    try {
      const res = await fetch("/api/business-manager/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text, ...glsGenerationLanguagePayload(language) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setResult(data.result);
      toast.success(wt("assistant.analysisComplete"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase text-white/40">{wt("assistant.title")}</p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={wt("assistant.contextPlaceholder")}
          rows={6}
          className="border-white/10 bg-white/5 text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setAction(key)}
              className={`rounded-lg px-3 py-1.5 text-xs ${action === key ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 max-w-md">
          <label className="mb-1.5 block text-xs font-medium text-white/60">{t("common.language")}</label>
          <GlsGenerationLanguageSelect serviceId="business-manager" value={language} onChange={setLanguage} />
        </div>
        <Button className="mt-3 w-full" onClick={() => void run()} disabled={loading}>
          <Sparkles className="mr-2 size-4" />
          {loading ? wt("assistant.running") : wt("assistant.runAction")}
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase text-white/40">{wt("assistant.results")}</p>
        {result ? (
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-sm text-white/70">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-white/30">{wt("assistant.emptyResults")}</p>
        )}
      </div>
    </div>
  );
}
