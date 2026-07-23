"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MarketingCampaign } from "@/types/marketing";
import { CampaignEditor } from "@/components/dashboard/marketing/campaign-editor";

type Props = {
  campaigns: MarketingCampaign[];
  onCampaignsChange: (campaigns: MarketingCampaign[]) => void;
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
};

export function CampaignList({ campaigns, onCampaignsChange, selectedId, onSelect }: Props) {
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!brief.trim()) {
      toast.error("Enter a campaign brief.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, generate: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      onCampaignsChange([data.campaign, ...campaigns]);
      onSelect(data.campaign.id);
      setBrief("");
      toast.success("Campaign generated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs font-medium uppercase text-white/40">AI Campaign Generator</p>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe product, audience, goals, channels, budget..."
            rows={4}
            className="border-white/10 bg-white/5 text-white"
          />
          <Button className="mt-2 w-full rounded-lg" onClick={() => void generate()} disabled={generating}>
            <Sparkles className="mr-2 size-4" />
            {generating ? "Generating…" : "Generate Campaign"}
          </Button>
        </div>

        <div className="space-y-2">
          {campaigns.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                selectedId === c.id
                  ? "border-premium-gold/40 bg-premium-gold/10 text-premium-gold-light"
                  : "border-white/[0.06] bg-white/[0.02] text-white/70 hover:bg-white/5"
              }`}
            >
              <p className="font-medium">{c.name}</p>
              <p className="text-xs capitalize text-white/40">{c.status}</p>
            </button>
          ))}
          {campaigns.length === 0 && (
            <p className="text-sm text-white/30">No campaigns yet. Generate your first campaign.</p>
          )}
        </div>
      </div>

      {selected ? (
        <CampaignEditor
          campaign={selected}
          onUpdated={(updated) => {
            onCampaignsChange(campaigns.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 p-12 text-white/30">
          Select or generate a campaign
        </div>
      )}
    </div>
  );
}
