"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import type { CyberAsset } from "@/types/cyber";

export function AssetsPanel() {
  const [assets, setAssets] = useState<CyberAsset[]>([]);
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("server");

  const load = () => void fetch("/api/cyber/assets").then((r) => r.json()).then((d) => setAssets(d.assets ?? [])).catch(() => undefined);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/cyber/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, assetType }) });
    if (!res.ok) return toast.error("Failed");
    setName(""); load(); toast.success("Asset added");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Asset name" className={`${dashboardInputClass} max-w-xs`} />
        <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className={dashboardSelectClass}>
          <option value="server">Server</option>
          <option value="device">Device</option>
          <option value="application">Application</option>
          <option value="cloud">Cloud</option>
        </select>
        <Button onClick={() => void create()}>Add Asset</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {assets.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-medium text-white">{a.name}</p>
            <p className="text-xs text-white/40">{a.asset_type} · {a.status} · risk {a.risk_score}</p>
            {a.hostname && <p className="text-sm text-white/50">{a.hostname}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
