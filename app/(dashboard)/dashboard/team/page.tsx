import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { TeamPanel } from "@/components/dashboard/platform/team-panel";

export const metadata: Metadata = { title: "Team & Workspace" };

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Team & Workspace" description="Manage team members, roles, and invitations" />
      <TeamPanel />
    </div>
  );
}
