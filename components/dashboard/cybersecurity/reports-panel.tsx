"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

export function ReportsPanel() {
  const wt = useWorkspaceT("cyber");
  const [reports, setReports] = useState<{ id: string; title: string; summary: string }[]>([]);
  const [title, setTitle] = useState("");

  const load = () => void fetch("/api/cyber/reports").then((r) => r.json()).then((d) => setReports(d.reports ?? [])).catch(() => undefined);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    await fetch("/api/cyber/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, summary: wt("panels.reports.defaultSummary") }) });
    setTitle(""); load(); toast.success(wt("toasts.reportCreated"));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={wt("forms.reportTitle")} className={`${dashboardInputClass} max-w-xs`} />
        <Button onClick={() => void create()}>{wt("panels.reports.createReport")}</Button>
      </div>
      <ul className="space-y-2 text-sm text-white/60">
        {reports.map((r) => <li key={r.id} className="rounded-lg border border-white/5 px-3 py-2">{r.title} — {r.summary.slice(0, 80)}</li>)}
      </ul>
    </div>
  );
}
