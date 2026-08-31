"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerPersona } from "@/types/marketing";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { useTranslation } from "@/lib/i18n/client";
import { GlsGenerationLanguageSelect } from "@/components/dashboard/language/gls-generation-language-select";
import {
  getInitialGlsGenerationLanguage,
  glsGenerationLanguagePayload,
} from "@/lib/language-platform/generation/service";

type Props = { initialPersonas?: CustomerPersona[] };

export function PersonaPanel({ initialPersonas = [] }: Props) {
  const wt = useWorkspaceT("marketing");
  const { t, locale } = useTranslation();
  const [personas, setPersonas] = useState(initialPersonas);
  const [brief, setBrief] = useState("");
  const [language, setLanguage] = useState(() =>
    getInitialGlsGenerationLanguage({ fallback: "ui-locale", uiLocale: locale }),
  );
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!brief.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "persona", brief, save: true, ...glsGenerationLanguagePayload(language) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.persona) setPersonas((p) => [data.persona, ...p]);
      toast.success(wt("personaPanel.generated"));
      setBrief("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("personaPanel.failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-2 text-xs uppercase text-white/40">{wt("personaPanel.generatorTitle")}</p>
        <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={wt("personaPanel.briefPlaceholder")} rows={3} className="border-white/10 bg-white/5 text-white" />
        <div className="mt-2 max-w-md">
          <label className="mb-1.5 block text-xs font-medium text-white/60">{t("common.language")}</label>
          <GlsGenerationLanguageSelect serviceId="marketing-ai" value={language} onChange={setLanguage} />
        </div>
        <Button className="mt-2 rounded-lg" onClick={() => void generate()} disabled={busy}>
          <Sparkles className="mr-2 size-4" />
          {wt("personaPanel.generatePersona")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {personas.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-medium text-white">{p.name}</p>
            <p className="text-xs text-white/40">{p.title}</p>
            <p className="mt-2 text-sm text-white/60">{p.summary}</p>
            {p.pain_points?.length > 0 && (
              <p className="mt-2 text-xs text-white/40">{wt("personaPanel.painPrefix", { points: p.pain_points.slice(0, 2).join(", ") })}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
