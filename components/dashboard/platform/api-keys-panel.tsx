"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Key, Plus, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import { API_KEY_SCOPES } from "@/lib/constants/platform";
import { CheckboxToggle } from "@/components/dashboard/builder-shared";
import type { ApiKey } from "@/types/platform";

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<Partial<ApiKey>[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [newFullKey, setNewFullKey] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/api-keys");
      if (!res.ok) return;
      const d = await res.json();
      setKeys(d.keys ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    const res = await fetch("/api/platform/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, scopes, expiresInDays: parseInt(expiresInDays) || 90 }),
    });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error ?? "Failed"); return; }
    setNewFullKey(d.fullKey);
    toast.success(d.message);
    setShowCreate(false);
    setName("");
    fetchKeys();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/platform/api-keys/${id}`, { method: "DELETE" });
    toast.success("Key revoked");
    fetchKeys();
  };

  const handleToggle = async (id: string) => {
    const res = await fetch(`/api/platform/api-keys/${id}`, { method: "PATCH" });
    const d = await res.json();
    toast.success(d.message);
    fetchKeys();
  };

  return (
    <div className="space-y-6">
      {newFullKey && (
        <DashboardPanel gold className="space-y-2 p-4">
          <p className="text-xs font-bold text-premium-gold-light">Your new API key (copy it now):</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-black/40 px-3 py-2 font-mono text-xs text-white/80">{newFullKey}</code>
            <Button variant="ghost" size="icon-xs" className="text-premium-gold-light" onClick={() => { navigator.clipboard.writeText(newFullKey); toast.success("Copied"); }}>
              <Copy className="size-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-white/40" onClick={() => setNewFullKey(null)}>Dismiss</Button>
        </DashboardPanel>
      )}

      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Key className="size-5 text-premium-gold-light" /><DashboardCardTitle>API Keys</DashboardCardTitle></div>
            <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="btn-gold gap-1.5 rounded-lg text-xs font-bold text-luxury-black">
              <Plus className="size-3" /> Create Key
            </Button>
          </div>
          <DashboardCardDescription>Manage API keys for programmatic access</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          {showCreate && (
            <DashboardPanel className="mb-4 space-y-3 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Key Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My API Key" className={dashboardInputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Expires in</label>
                  <select value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} className={dashboardSelectClass}>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="0">Never</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Scopes</label>
                <div className="flex flex-wrap gap-2">
                  {API_KEY_SCOPES.map((s) => (
                    <CheckboxToggle key={s.id} label={s.label} checked={scopes.includes(s.id)} onChange={(c) => setScopes((p) => c ? [...p, s.id] : p.filter((x) => x !== s.id))} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="rounded-lg border-white/10 text-white/50" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" className="btn-gold rounded-lg font-bold text-luxury-black" onClick={handleCreate}>Create Key</Button>
              </div>
            </DashboardPanel>
          )}

          {keys.length === 0 ? (
            <DashboardPanel className="py-10 text-center"><Key className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">No API keys created</p></DashboardPanel>
          ) : (
            <div className="space-y-2">
              {keys.map((k) => (
                <DashboardPanel key={k.id} className="flex items-center gap-3 p-3">
                  <Key className={cn("size-4", k.is_active ? "text-green-400" : "text-white/20")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white/80">{k.name}</p>
                    <p className="text-[10px] text-white/30">{k.key_prefix}... &middot; {(k.scopes ?? []).join(", ")} &middot; Created {new Date(k.created_at!).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => handleToggle(k.id!)} title={k.is_active ? "Deactivate" : "Activate"}>
                      <Power className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-red-400" onClick={() => handleDelete(k.id!)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </DashboardPanel>
              ))}
            </div>
          )}
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
