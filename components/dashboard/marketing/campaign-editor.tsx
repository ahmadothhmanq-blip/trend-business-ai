"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MARKETING_CHANNELS } from "@/lib/marketing/prompts";
import type { MarketingCampaign, MarketingChannel } from "@/types/marketing";

type Props = {
  campaign: MarketingCampaign;
  onUpdated: (campaign: MarketingCampaign) => void;
};

export function CampaignEditor({ campaign, onUpdated }: Props) {
  const [name, setName] = useState(campaign.name);
  const [objective, setObjective] = useState(campaign.objective);
  const [channels, setChannels] = useState<MarketingChannel[]>(
    campaign.channels?.length
      ? campaign.channels
      : MARKETING_CHANNELS.map((c) => ({ ...c, enabled: false })),
  );
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const res = await fetch(`/api/marketing/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, objective, channels }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    onUpdated(data.campaign);
    toast.success("Campaign saved");
  };

  const runAction = async (action: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/marketing/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: `${name}\n${objective}\n${JSON.stringify(campaign.strategy)}`,
          campaignContext: campaign.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("AI assistant completed");
      void data;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleChannel = (type: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.type === type ? { ...c, enabled: !c.enabled } : c)),
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Campaign Editor</p>
        <span className="text-xs capitalize text-white/40">{campaign.status}</span>
      </div>

      <div>
        <label className="text-xs text-white/50">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 border-white/10 bg-white/5 text-white" />
      </div>
      <div>
        <label className="text-xs text-white/50">Objective</label>
        <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={3} className="mt-1 border-white/10 bg-white/5 text-white" />
      </div>

      <div>
        <p className="mb-2 text-xs text-white/50">Channels</p>
        <div className="flex flex-wrap gap-2">
          {channels.map((ch) => (
            <button
              key={ch.type}
              type="button"
              onClick={() => toggleChannel(ch.type)}
              className={`rounded-lg px-3 py-1.5 text-xs ${
                ch.enabled ? "bg-premium-gold/15 text-premium-gold-light" : "bg-white/5 text-white/40"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {campaign.kpis?.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-white/50">KPIs</p>
          <div className="space-y-1">
            {campaign.kpis.map((kpi, i) => (
              <div key={i} className="flex justify-between text-sm text-white/70">
                <span>{kpi.name}</span>
                <span>{kpi.target}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {campaign.timeline?.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-white/50">Timeline</p>
          {campaign.timeline.map((t, i) => (
            <div key={i} className="text-sm text-white/60">
              {t.date} — {t.label}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void save()} className="rounded-lg">Save</Button>
        {["improve_campaign", "analyze_campaign", "suggest_improvements", "generate_ideas"].map((a) => (
          <Button key={a} size="sm" variant="outline" disabled={busy} className="rounded-lg border-white/10 text-xs capitalize" onClick={() => void runAction(a)}>
            <Wand2 className="mr-1 size-3" />
            {a.replace(/_/g, " ")}
          </Button>
        ))}
      </div>
    </div>
  );
}
