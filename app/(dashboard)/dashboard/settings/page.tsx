import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { SettingsPanel } from "@/components/dashboard/platform/settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Settings" description="Manage your account, team, API keys, and integrations" />
      <SettingsPanel />
    </div>
  );
}
