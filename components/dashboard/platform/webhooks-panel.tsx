"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe, Plus, Power, Trash2, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";
import { WEBHOOK_EVENTS } from "@/lib/constants/platform";
import { CheckboxToggle } from "@/components/dashboard/builder-shared";
import type { Webhook as WebhookType } from "@/types/platform";

export function WebhooksPanel() {
  const wt = useWorkspaceT("platform");
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["generation.completed"]);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/webhooks");
      if (!res.ok) return;
      const d = await res.json();
      setWebhooks(d.webhooks ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const handleCreate = async () => {
    if (!url.trim()) { toast.error(wt("webhooks.urlRequired")); return; }
    if (events.length === 0) { toast.error(wt("webhooks.selectEvent")); return; }
    const res = await fetch("/api/platform/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, events }) });
    const d = await res.json();
    if (!res.ok) { toast.error(d.error ?? wt("toasts.failed")); return; }
    toast.success(d.message);
    setShowCreate(false);
    setUrl("");
    setEvents(["generation.completed"]);
    fetchWebhooks();
  };

  const handleDelete = async (id: string) => { await fetch(`/api/platform/webhooks/${id}`, { method: "DELETE" }); toast.success(wt("toasts.webhookDeleted")); fetchWebhooks(); };
  const handleToggle = async (id: string) => { const res = await fetch(`/api/platform/webhooks/${id}`, { method: "PATCH" }); const d = await res.json(); toast.success(d.message); fetchWebhooks(); };

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Globe className="size-5 text-premium-gold-light" /><DashboardCardTitle>{wt("webhooks.title")}</DashboardCardTitle></div>
            <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="btn-gold gap-1.5 rounded-lg text-xs font-bold text-luxury-black">
              <Plus className="size-3" /> {wt("webhooks.addWebhook")}
            </Button>
          </div>
          <DashboardCardDescription>{wt("webhooks.description")}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          {showCreate && (
            <DashboardPanel className="mb-4 space-y-3 p-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">{wt("webhooks.endpointUrl")}</label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={wt("webhooks.endpointPlaceholder")} className={dashboardInputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">{wt("webhooks.events")}</label>
                <div className="flex flex-wrap gap-2">
                  {WEBHOOK_EVENTS.map((ev) => (
                    <CheckboxToggle key={ev.id} label={wt(`webhookEvents.${ev.id}`)} checked={events.includes(ev.id)} onChange={(c) => setEvents((p) => c ? [...p, ev.id] : p.filter((x) => x !== ev.id))} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="rounded-lg border-white/10 text-white/50" onClick={() => setShowCreate(false)}>{wt("common.cancel")}</Button>
                <Button size="sm" className="btn-gold rounded-lg font-bold text-luxury-black" onClick={handleCreate}>{wt("webhooks.createWebhook")}</Button>
              </div>
            </DashboardPanel>
          )}

          {webhooks.length === 0 ? (
            <DashboardPanel className="py-10 text-center"><Globe className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">{wt("webhooks.noWebhooks")}</p></DashboardPanel>
          ) : (
            <div className="space-y-2">
              {webhooks.map((w) => (
                <DashboardPanel key={w.id} className="flex items-center gap-3 p-3">
                  <Webhook className={cn("size-4", w.is_active ? "text-green-400" : "text-white/20")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white/80">{w.url}</p>
                    <p className="text-[10px] text-white/30">{w.events.join(", ")} &middot; {w.failure_count > 0 ? wt("webhooks.failures", { count: w.failure_count }) : wt("common.healthy")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-white" onClick={() => handleToggle(w.id)} title={w.is_active ? wt("common.disable") : wt("common.enable")}>
                      <Power className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-white/30 hover:text-red-400" onClick={() => handleDelete(w.id)}>
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
