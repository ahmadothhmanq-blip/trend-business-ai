"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KPI } from "@/types/business-manager";

type Props = { initialKpis?: KPI[] };

export function KpisPanel({ initialKpis = [] }: Props) {
  const [kpis, setKpis] = useState(initialKpis);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("100");
  const [current, setCurrent] = useState("0");

  const create = async () => {
    if (!name.trim()) return toast.error("KPI name required");
    const res = await fetch("/api/business-manager/kpis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetValue: Number(target), currentValue: Number(current) }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setKpis([data.kpi, ...kpis]);
    setName("");
    toast.success("KPI added");
  };

  const updateCurrent = async (id: string, value: number) => {
    const res = await fetch("/api/business-manager/kpis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, currentValue: value }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setKpis(kpis.map((k) => (k.id === id ? data.kpi : k)));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs font-medium uppercase text-white/40">Add KPI</p>
        <div className="flex flex-wrap gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="KPI name" className="border-white/10 bg-white/5 text-white" />
          <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target" className="w-24 border-white/10 bg-white/5 text-white" />
          <Input value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current" className="w-24 border-white/10 bg-white/5 text-white" />
          <Button onClick={() => void create()}><Plus className="size-4" /></Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const pct = kpi.target_value > 0 ? Math.round((kpi.current_value / kpi.target_value) * 100) : 0;
          return (
            <div key={kpi.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="font-medium text-white">{kpi.name}</p>
              <p className="text-xs text-white/40">{kpi.category}</p>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-premium-gold" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="mt-1 text-sm text-white/60">
                  {kpi.current_value} / {kpi.target_value} {kpi.unit} ({pct}%)
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => void updateCurrent(kpi.id, kpi.current_value + 5)}
              >
                +5 progress
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
