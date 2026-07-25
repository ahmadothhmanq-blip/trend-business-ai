"use client";

import { useEffect, useState } from "react";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";

export function EmailPanel() {
  const wt = useWorkspaceT("marketing");
  const [data, setData] = useState<{ campaigns: unknown[]; templates: unknown[]; audiences: unknown[] }>({
    campaigns: [],
    templates: [],
    audiences: [],
  });

  useEffect(() => {
    void fetch("/api/marketing/email")
      .then((r) => r.json())
      .then((d) => setData({ campaigns: d.campaigns ?? [], templates: d.templates ?? [], audiences: d.audiences ?? [] }));
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { label: wt("emailPanel.emailCampaigns"), count: data.campaigns.length },
        { label: wt("emailPanel.templates"), count: data.templates.length },
        { label: wt("emailPanel.audienceLists"), count: data.audiences.length },
      ].map(({ label, count }) => (
        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs text-white/40">{label}</p>
          <p className="text-2xl font-semibold text-white">{count}</p>
        </div>
      ))}
      <p className="sm:col-span-3 text-xs text-white/30">
        {wt("emailPanel.foundationHint")}
      </p>
    </div>
  );
}
