"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import type { ActivityLogEntry } from "@/types/platform";

export function ActivityPanel() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`/api/platform/activity?page=${page}&limit=20`);
      if (!res.ok) return;
      const d = await res.json();
      setEntries(d.entries ?? []);
      setTotal(d.total ?? 0);
      setTotalPages(d.totalPages ?? 1);
    } catch { /* ignore */ }
  }, [page]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-premium-gold-light" />
          <div>
            <DashboardCardTitle>Activity Log</DashboardCardTitle>
            <DashboardCardDescription>{total} total events</DashboardCardDescription>
          </div>
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        {entries.length === 0 ? (
          <DashboardPanel className="py-10 text-center"><Clock className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">No activity recorded yet</p></DashboardPanel>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <DashboardPanel key={e.id} className="flex items-start gap-3 p-3">
                <div className="mt-0.5 size-1.5 flex-shrink-0 rounded-full bg-premium-gold/40" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/80">{e.action}</p>
                  {e.resource_type && <p className="text-[10px] text-white/40">{e.resource_type}{e.resource_id ? ` #${e.resource_id.slice(0, 8)}` : ""}</p>}
                  <p className="mt-0.5 text-[10px] text-white/20">{new Date(e.created_at).toLocaleString()}</p>
                </div>
              </DashboardPanel>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 disabled:opacity-30">Previous</button>
            <span className="text-xs text-white/30">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 disabled:opacity-30">Next</button>
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
