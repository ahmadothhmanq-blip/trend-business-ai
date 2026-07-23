"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CRMDeal, CRMDealStageKey } from "@/types/crm";

const STAGES: CRMDealStageKey[] = ["new", "qualified", "proposal", "negotiation", "won", "lost"];

export function DealsPipeline({ initialDeals = [], onDealsChange }: { initialDeals?: CRMDeal[]; onDealsChange?: (d: CRMDeal[]) => void }) {
  const [deals, setDeals] = useState(initialDeals);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("0");
  const [dragId, setDragId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g = Object.fromEntries(STAGES.map((s) => [s, [] as CRMDeal[]])) as Record<CRMDealStageKey, CRMDeal[]>;
    for (const d of deals) {
      const stage = STAGES.includes(d.stage) ? d.stage : "new";
      g[stage].push(d);
    }
    return g;
  }, [deals]);

  const update = (next: CRMDeal[]) => {
    setDeals(next);
    onDealsChange?.(next);
  };

  const create = async () => {
    if (!title.trim()) return toast.error("Deal title required");
    const res = await fetch("/api/crm/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, valueCents: Number(value) * 100, stage: "new" }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    update([data.deal, ...deals]);
    setTitle("");
    toast.success("Deal created");
  };

  const moveDeal = async (dealId: string, stage: CRMDealStageKey) => {
    const res = await fetch(`/api/crm/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    update(deals.map((d) => (d.id === dealId ? data.deal : d)));
  };

  const money = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deal title" className="border-white/10 bg-white/5 text-white" />
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value USD" className="w-28 border-white/10 bg-white/5 text-white" />
        <Button onClick={() => void create()}>Add deal</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="min-h-[200px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) void moveDeal(dragId, stage);
              setDragId(null);
            }}
          >
            <p className="mb-2 text-xs font-medium uppercase text-white/40">{stage}</p>
            <div className="space-y-2">
              {grouped[stage].map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={() => setDragId(d.id)}
                  className={cn(
                    "cursor-grab rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-xs active:cursor-grabbing",
                    dragId === d.id && "opacity-50",
                  )}
                >
                  <p className="font-medium text-white">{d.title}</p>
                  <p className="text-white/40">{money(d.value_cents)} · {d.probability}%</p>
                  {d.owner_name && <p className="text-white/30">{d.owner_name}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
