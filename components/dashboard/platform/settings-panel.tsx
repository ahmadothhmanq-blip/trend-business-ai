"use client";

import { useState } from "react";
import { Bell, Globe, Key, Monitor, Palette, Settings2, Shield, User, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamPanel } from "./team-panel";
import { NotificationsPanel } from "./notifications-panel";
import { ApiKeysPanel } from "./api-keys-panel";
import { WebhooksPanel } from "./webhooks-panel";
import { UsagePanel } from "./usage-panel";
import { ActivityPanel } from "./activity-panel";

const SETTINGS_TABS = [
  { id: "team", label: "Team", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "usage", label: "Usage", icon: Monitor },
  { id: "activity", label: "Activity", icon: Shield },
] as const;

export function SettingsPanel() {
  const [tab, setTab] = useState("team");

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex gap-2 overflow-x-auto lg:w-48 lg:flex-col lg:gap-1">
        {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn("flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all", tab === id ? "bg-premium-gold/10 text-premium-gold-light" : "text-white/40 hover:bg-white/[0.03] hover:text-white/60")}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        {tab === "team" && <TeamPanel />}
        {tab === "notifications" && <NotificationsPanel />}
        {tab === "api-keys" && <ApiKeysPanel />}
        {tab === "webhooks" && <WebhooksPanel />}
        {tab === "usage" && <UsagePanel />}
        {tab === "activity" && <ActivityPanel />}
      </div>
    </div>
  );
}
