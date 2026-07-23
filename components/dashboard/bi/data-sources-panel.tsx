"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BiDataSource } from "@/types/bi";

const SOURCE_TYPES = [
  { type: "crm", label: "CRM" },
  { type: "erp", label: "ERP" },
  { type: "marketing", label: "Marketing" },
  { type: "social", label: "Social" },
  { type: "business_manager", label: "Business Manager" },
  { type: "website", label: "Website Builder" },
  { type: "billing", label: "Billing" },
] as const;

type Props = { initialSources?: BiDataSource[] };

export function DataSourcesPanel({ initialSources = [] }: Props) {
  const [sources, setSources] = useState(initialSources);
  const [syncing, setSyncing] = useState(false);
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(null);

  const syncAll = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/bi/data-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-all" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setSnapshot(data.snapshot ?? null);
      toast.success("Data sources synced (read-only)");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const connect = async (sourceType: string, label: string) => {
    try {
      const res = await fetch("/api/bi/data-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${label} connector`, sourceType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSources((prev) => [data.dataSource, ...prev]);
      toast.success(`${label} connected`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void syncAll()} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync all integrations"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SOURCE_TYPES.map(({ type, label }) => {
          const connected = sources.some((s) => s.source_type === type);
          return (
            <div key={type} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="font-medium text-white">{label}</p>
              <p className="mt-1 text-xs text-white/40">Read-only connector</p>
              <p className="mt-2 text-sm text-white/50">{connected ? "Connected" : "Not connected"}</p>
              {!connected ? (
                <Button size="sm" className="mt-3" variant="outline" onClick={() => void connect(type, label)}>
                  Connect
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>

      {snapshot ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs uppercase text-white/40">Latest sync snapshot</p>
          <pre className="max-h-64 overflow-auto text-xs text-white/60">{JSON.stringify(snapshot, null, 2)}</pre>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs uppercase text-white/40">Registered sources</p>
          <ul className="space-y-1 text-sm text-white/60">
            {sources.map((s) => (
              <li key={s.id}>
                {s.name} · {s.source_type} · {s.is_active ? "active" : "inactive"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
