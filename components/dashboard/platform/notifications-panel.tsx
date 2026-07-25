"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import { NOTIFICATION_TYPE_CONFIG } from "@/lib/constants/platform";
import { useFormatter } from "@/lib/i18n/use-formatter";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import type { Notification } from "@/types/platform";

export function NotificationsPanel() {
  const wt = useWorkspaceT("platform");
  const { formatDateTime } = useFormatter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/notifications?limit=50");
      if (!res.ok) return;
      const d = await res.json();
      setNotifications(d.notifications ?? []);
      setUnread(d.unread ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/platform/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark-all-read" }) });
    toast.success(wt("notifications.allMarkedRead"));
    fetchNotifications();
  };

  const markRead = async (ids: string[]) => {
    await fetch("/api/platform/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark-read", ids }) });
    fetchNotifications();
  };

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-premium-gold-light" />
            <DashboardCardTitle>{wt("notifications.title")}</DashboardCardTitle>
            {unread > 0 && <span className="rounded-full bg-premium-gold px-2 py-0.5 text-[10px] font-bold text-luxury-black">{unread}</span>}
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white/40 hover:text-white" onClick={markAllRead}>
              <CheckCheck className="size-3" /> {wt("notifications.markAllRead")}
            </Button>
          )}
        </div>
      </DashboardCardHeader>
      <DashboardCardContent>
        {notifications.length === 0 ? (
          <DashboardPanel className="py-12 text-center"><Inbox className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">{wt("notifications.empty")}</p></DashboardPanel>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg = NOTIFICATION_TYPE_CONFIG[n.type] ?? NOTIFICATION_TYPE_CONFIG.info;
              return (
                <button key={n.id} type="button" className={cn("flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors border-white/[0.09] glass-panel glass-panel-premium", !n.is_read && "border-l-2 border-l-premium-gold/50 bg-premium-gold/[0.02]")}
                  onClick={() => !n.is_read && markRead([n.id])}>
                  <span className={cn("mt-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase", cfg.color)}>{wt(`notificationTypes.${n.type}`)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/80">{n.title}</p>
                    {n.message && <p className="mt-0.5 text-[11px] text-white/40">{n.message}</p>}
                    <p className="mt-1 text-[10px] text-white/20">{formatDateTime(n.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
