"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import type { CyberThreat, CyberIoc } from "@/types/cyber";

export function ThreatIntelligencePanel() {
  const [threats, setThreats] = useState<CyberThreat[]>([]);
  const [iocs, setIocs] = useState<CyberIoc[]>([]);
  const [title, setTitle] = useState("");
  const [iocValue, setIocValue] = useState("");

  const load = () => {
    void fetch("/api/cyber/threats").then((r) => r.json()).then((d) => setThreats(d.threats ?? [])).catch(() => undefined);
    void fetch("/api/cyber/threats?type=iocs").then((r) => r.json()).then((d) => setIocs(d.iocs ?? [])).catch(() => undefined);
  };

  useEffect(() => { load(); }, []);

  const addThreat = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/cyber/threats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, severity: "high" }) });
    if (!res.ok) return toast.error("Failed");
    setTitle(""); load(); toast.success("Threat added");
  };

  const addIoc = async () => {
    if (!iocValue.trim()) return;
    const res = await fetch("/api/cyber/threats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ iocType: "ip", value: iocValue }) });
    if (!res.ok) return toast.error("Failed");
    setIocValue(""); load(); toast.success("IOC added");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-xs uppercase text-white/40">Threats</p>
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Threat title" className={dashboardInputClass} />
          <Button onClick={() => void addThreat()}>Add</Button>
        </div>
        <ul className="space-y-1 text-sm text-white/60">
          {threats.map((t) => <li key={t.id}>{t.title} · {t.severity} · {t.status}</li>)}
          {threats.length === 0 && <li className="text-white/30">No threats recorded.</li>}
        </ul>
      </div>
      <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-xs uppercase text-white/40">IOCs</p>
        <div className="flex gap-2">
          <Input value={iocValue} onChange={(e) => setIocValue(e.target.value)} placeholder="IP / domain / hash" className={dashboardInputClass} />
          <Button onClick={() => void addIoc()}>Add IOC</Button>
        </div>
        <ul className="space-y-1 text-sm text-white/60">
          {iocs.map((i) => <li key={i.id}>{i.ioc_type}: {i.value}</li>)}
          {iocs.length === 0 && <li className="text-white/30">No IOCs yet.</li>}
        </ul>
      </div>
    </div>
  );
}
