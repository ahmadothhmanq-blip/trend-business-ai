"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerPersona } from "@/types/marketing";

type Props = { initialPersonas?: CustomerPersona[] };

export function PersonaPanel({ initialPersonas = [] }: Props) {
  const [personas, setPersonas] = useState(initialPersonas);
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!brief.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "persona", brief, save: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.persona) setPersonas((p) => [data.persona, ...p]);
      toast.success("Persona generated!");
      setBrief("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-2 text-xs uppercase text-white/40">Persona Generator</p>
        <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe your ideal customer..." rows={3} className="border-white/10 bg-white/5 text-white" />
        <Button className="mt-2 rounded-lg" onClick={() => void generate()} disabled={busy}>
          <Sparkles className="mr-2 size-4" />
          Generate Persona
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {personas.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-medium text-white">{p.name}</p>
            <p className="text-xs text-white/40">{p.title}</p>
            <p className="mt-2 text-sm text-white/60">{p.summary}</p>
            {p.pain_points?.length > 0 && (
              <p className="mt-2 text-xs text-white/40">Pain: {p.pain_points.slice(0, 2).join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
