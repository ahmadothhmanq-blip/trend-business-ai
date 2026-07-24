import type { Metadata } from "next";
import { LocalizedDashboardHeader } from "@/components/dashboard/localized-header";
import { SettingsPanel } from "@/components/dashboard/platform/settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <LocalizedDashboardHeader pageId="settings" />
      <SettingsPanel />
    </div>
  );
}
