"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BiDataSource } from "@/types/bi";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

const SOURCE_TYPES = [
  "crm",
  "erp",
  "marketing",
  "social",
  "business_manager",
  "website",
  "billing",
] as const;

type Props = { initialSources?: BiDataSource[] };

export function DataSourcesPanel({ initialSources = [] }: Props) {
  const wt = useWorkspaceT("bi");
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
      if (!res.ok) throw new Error(data.error ?? wt("panels.dataSources.syncFailed"));
      setSnapshot(data.snapshot ?? null);
      toast.success(wt("panels.dataSources.syncSuccess"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("panels.dataSources.syncFailed"));
    } finally {
      setSyncing(false);
    }
  };

  const connect = async (sourceType: string, label: string) => {
    try {
      const res = await fetch("/api/bi/data-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: wt("panels.dataSources.connectorName", { label }), sourceType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("toasts.failed"));
      setSources((prev) => [data.dataSource, ...prev]);
      toast.success(wt("panels.dataSources.sourceConnected", { label }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.failed"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void syncAll()} disabled={syncing}>
          {syncing ? wt("panels.dataSources.syncing") : wt("panels.dataSources.syncAll")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SOURCE_TYPES.map((type) => {
          const label = wt(`panels.dataSources.types.${type}`);
          const connected = sources.some((s) => s.source_type === type);
          return (
            <div key={type} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="font-medium text-white">{label}</p>
              <p className="mt-1 text-xs text-white/40">{wt("panels.dataSources.readOnlyConnector")}</p>
              <p className="mt-2 text-sm text-white/50">{connected ? wt("panels.dataSources.connected") : wt("panels.dataSources.notConnected")}</p>
              {!connected ? (
                <Button size="sm" className="mt-3" variant="outline" onClick={() => void connect(type, label)}>
                  {wt("panels.dataSources.connect")}
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>

      {snapshot ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs uppercase text-white/40">{wt("panels.dataSources.latestSnapshot")}</p>
          <pre className="max-h-64 overflow-auto text-xs text-white/60">{JSON.stringify(snapshot, null, 2)}</pre>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-2 text-xs uppercase text-white/40">{wt("panels.dataSources.registeredSources")}</p>
          <ul className="space-y-1 text-sm text-white/60">
            {sources.map((s) => (
              <li key={s.id}>
                {s.name} · {s.source_type} · {s.is_active ? wt("panels.dataSources.active") : wt("panels.dataSources.inactive")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
