"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import type { CyberAlert } from "@/types/cyber";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

export function AlertsPanel() {
  const wt = useWorkspaceT("cyber");
  const [alerts, setAlerts] = useState<CyberAlert[]>([]);
  const [title, setTitle] = useState("");

  const load = () => void fetch("/api/cyber/alerts").then((r) => r.json()).then((d) => setAlerts(d.alerts ?? [])).catch(() => undefined);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    await fetch("/api/cyber/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, severity: "high" }) });
    setTitle(""); load(); toast.success(wt("toasts.alertCreated"));
  };

  const resolve = async (id: string) => {
    await fetch("/api/cyber/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update-status", alertId: id, status: "resolved" }) });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={wt("forms.alertTitle")} className={`${dashboardInputClass} max-w-xs`} />
        <Button onClick={() => void create()}>{wt("panels.alerts.createAlert")}</Button>
      </div>
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-sm text-white/70">
            <span>{a.title} · <span className={a.severity === "critical" ? "text-rose-400" : "text-amber-400"}>{a.severity}</span> · {a.status}</span>
            {a.status === "open" && <Button size="sm" variant="outline" onClick={() => void resolve(a.id)}>{wt("panels.alerts.resolve")}</Button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
