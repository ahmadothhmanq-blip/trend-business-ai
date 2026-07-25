"use client";

import { useState } from "react";
import { Bell, Globe, Key, Monitor, Shield, User, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { TeamPanel } from "./team-panel";
import { NotificationsPanel } from "./notifications-panel";
import { ApiKeysPanel } from "./api-keys-panel";
import { WebhooksPanel } from "./webhooks-panel";
import { UsagePanel } from "./usage-panel";
import { ActivityPanel } from "./activity-panel";

export function SettingsPanel() {
  const wt = useWorkspaceT("platform");
  const [tab, setTab] = useState("team");

  const settingsTabs = [
    { id: "team", label: wt("settings.tabs.team"), icon: User },
    { id: "notifications", label: wt("settings.tabs.notifications"), icon: Bell },
    { id: "api-keys", label: wt("settings.tabs.apiKeys"), icon: Key },
    { id: "webhooks", label: wt("settings.tabs.webhooks"), icon: Webhook },
    { id: "usage", label: wt("settings.tabs.usage"), icon: Monitor },
    { id: "activity", label: wt("settings.tabs.activity"), icon: Shield },
    { id: "language", label: wt("settings.tabs.language"), icon: Globe },
  ] as const;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex gap-2 overflow-x-auto lg:w-48 lg:flex-col lg:gap-1">
        {settingsTabs.map(({ id, label, icon: Icon }) => (
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
        {tab === "language" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-white">{wt("settings.language.title")}</h3>
            <p className="mt-1 text-sm text-white/45">{wt("settings.language.description")}</p>
            <div className="mt-6">
              <LanguageSelector variant="default" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
