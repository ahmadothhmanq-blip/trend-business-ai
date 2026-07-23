"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import type { CyberIncident } from "@/types/cyber";

export function IncidentsPanel() {
  const [incidents, setIncidents] = useState<CyberIncident[]>([]);
  const [title, setTitle] = useState("");

  const load = () => void fetch("/api/cyber/incidents").then((r) => r.json()).then((d) => setIncidents(d.incidents ?? [])).catch(() => undefined);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    await fetch("/api/cyber/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, severity: "high" }) });
    setTitle(""); load(); toast.success("Incident opened");
  };

  const resolve = async (id: string) => {
    await fetch("/api/cyber/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update", id, status: "resolved" }) });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Incident title" className={`${dashboardInputClass} max-w-xs`} />
        <Button onClick={() => void create()}>Open Incident</Button>
      </div>
      <ul className="space-y-2 text-sm text-white/60">
        {incidents.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2">
            <span>{i.title} · {i.severity} · {i.status}</span>
            {i.status !== "resolved" && i.status !== "closed" && (
              <Button size="sm" variant="outline" onClick={() => void resolve(i.id)}>Resolve</Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
