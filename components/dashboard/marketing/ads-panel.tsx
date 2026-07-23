"use client";

import { useEffect, useState } from "react";

export function AdsPanel() {
  const [drafts, setDrafts] = useState<Array<{ id: string; name: string; platform: string; status: string }>>([]);

  useEffect(() => {
    void fetch("/api/marketing/ads")
      .then((r) => r.json())
      .then((d) => setDrafts(d.drafts ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/40">Google Ads & Meta Ads draft campaigns — no live publishing yet.</p>
      {drafts.length === 0 ? (
        <p className="text-sm text-white/30">No ad drafts yet. Create from a campaign.</p>
      ) : (
        drafts.map((d) => (
          <div key={d.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <p className="text-sm text-white">{d.name}</p>
            <p className="text-xs capitalize text-white/40">{d.platform} · {d.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
