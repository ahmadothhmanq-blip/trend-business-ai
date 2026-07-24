"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BiReport, BiScheduledReport } from "@/types/bi";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

type Props = {
  initialReports?: BiReport[];
  initialScheduled?: BiScheduledReport[];
};

export function ReportsPanel({ initialReports = [], initialScheduled = [] }: Props) {
  const wt = useWorkspaceT("bi");
  const [reports, setReports] = useState(initialReports);
  const [scheduled, setScheduled] = useState(initialScheduled);
  const [title, setTitle] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(false);

  const createReport = async () => {
    if (!title.trim()) return toast.error(wt("panels.reports.reportTitleRequired"));
    setLoading(true);
    try {
      const res = await fetch("/api/bi/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, reportType: "custom", payload: { exportReady: true } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setReports((prev) => [data.report, ...prev]);
      setTitle("");
      toast.success(wt("toasts.reportCreated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  const scheduleReport = async () => {
    if (!scheduleTitle.trim()) return toast.error(wt("panels.reports.scheduleTitleRequired"));
    setLoading(true);
    try {
      const res = await fetch("/api/bi/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: scheduleTitle, frequency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setScheduled((prev) => [data.scheduledReport, ...prev]);
      setScheduleTitle("");
      toast.success(wt("toasts.reportScheduled"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">{wt("panels.reports.customReports")}</p>
        <div className="flex flex-wrap gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={wt("forms.reportTitle")}
            className="max-w-xs border-white/10 bg-white/5 text-white"
          />
          <Button onClick={() => void createReport()} disabled={loading}>
            {wt("panels.reports.createReport")}
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-white/60">
          {reports.map((r) => (
            <li key={r.id} className="rounded-lg border border-white/5 px-3 py-2">
              {r.title} · {r.report_type} · {new Date(r.generated_at).toLocaleDateString()}
            </li>
          ))}
          {reports.length === 0 && <li className="text-white/30">{wt("panels.reports.noCustomReports")}</li>}
        </ul>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-3 text-xs uppercase text-white/40">{wt("panels.reports.scheduledReports")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={scheduleTitle}
            onChange={(e) => setScheduleTitle(e.target.value)}
            placeholder={wt("forms.scheduleName")}
            className="max-w-xs border-white/10 bg-white/5 text-white"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="daily">{wt("panels.reports.frequency.daily")}</option>
            <option value="weekly">{wt("panels.reports.frequency.weekly")}</option>
            <option value="monthly">{wt("panels.reports.frequency.monthly")}</option>
          </select>
          <Button onClick={() => void scheduleReport()} disabled={loading}>
            {wt("panels.reports.schedule")}
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-white/60">
          {scheduled.map((s) => (
            <li key={s.id} className="rounded-lg border border-white/5 px-3 py-2">
              {s.title} · {s.frequency} · {wt("panels.reports.nextRun")}: {s.next_run_at ? new Date(s.next_run_at).toLocaleDateString() : wt("panels.reports.pending")}
            </li>
          ))}
          {scheduled.length === 0 && <li className="text-white/30">{wt("panels.reports.noScheduledReports")}</li>}
        </ul>
      </div>

      <p className="text-xs text-white/40">
        {wt("panels.reports.legacyNote")}
      </p>
    </div>
  );
}
