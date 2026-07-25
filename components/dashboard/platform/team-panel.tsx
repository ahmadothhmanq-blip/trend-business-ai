"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Mail, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { useFormatter } from "@/lib/i18n/use-formatter";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";
import { ORG_ROLES } from "@/lib/constants/platform";
import type { OrgMember, TeamInvitation } from "@/types/platform";

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  plan: string;
};

export function TeamPanel() {
  const wt = useWorkspaceT("platform");
  const { formatDate } = useFormatter();
  const [organization, setOrganization] = useState<OrgSummary | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/team");
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? wt("toasts.failedToLoadTeam"));
        return;
      }
      setOrganizationId(d.organizationId ?? null);
      setOrganization(d.organization ?? null);
      setMembers(d.members ?? []);
      setInvitations(d.invitations ?? []);
    } catch {
      toast.error(wt("toasts.failedToLoadTeam"));
    } finally {
      setBootstrapping(false);
    }
  }, [wt]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast.error(wt("toasts.workspaceNameRequired"));
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/platform/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName.trim() }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? wt("toasts.failedToCreateWorkspace"));
        return;
      }
      toast.success(d.created ? wt("toasts.workspaceCreated") : wt("toasts.workspaceReady"));
      setWorkspaceName("");
      await fetchTeam();
    } catch {
      toast.error(wt("toasts.requestFailed"));
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error(wt("toasts.emailRequired"));
      return;
    }
    if (!organizationId) {
      toast.error(wt("toasts.createWorkspaceFirst"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/platform/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, organizationId }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error ?? wt("toasts.inviteFailed"));
        return;
      }
      toast.success(d.message ?? wt("toasts.invitationCreated"));
      setEmail("");
      fetchTeam();
    } catch {
      toast.error(wt("toasts.requestFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (bootstrapping) {
    return (
      <DashboardPanel className="py-12 text-center">
        <p className="text-xs text-white/40">{wt("team.loadingWorkspace")}</p>
      </DashboardPanel>
    );
  }

  if (!organizationId) {
    return (
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-premium-gold-light" />
            <DashboardCardTitle>{wt("team.createWorkspace")}</DashboardCardTitle>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-4">
          <p className="text-xs text-white/50">
            {wt("team.createWorkspaceDescription")}
          </p>
          <div className="flex gap-3">
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder={wt("team.workspaceNamePlaceholder")}
              className={cn(dashboardInputClass, "flex-1")}
            />
            <Button
              onClick={handleCreateWorkspace}
              disabled={creating}
              className="btn-gold rounded-xl font-bold text-luxury-black"
            >
              {wt("common.create")}
            </Button>
          </div>
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6">
      {organization && (
        <DashboardPanel className="flex items-center gap-3 p-4">
          <Building2 className="size-5 text-premium-gold-light" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white/90">{organization.name}</p>
            <p className="text-[10px] text-white/40">
              {organization.slug} · {organization.plan}
            </p>
          </div>
        </DashboardPanel>
      )}

      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-premium-gold-light" />
            <DashboardCardTitle>{wt("team.inviteTeamMember")}</DashboardCardTitle>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={wt("team.emailPlaceholder")}
              className={cn(dashboardInputClass, "flex-1")}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={cn(dashboardSelectClass, "w-full sm:w-32")}
            >
              {ORG_ROLES.filter((r) => r.id !== "owner").map((r) => (
                <option key={r.id} value={r.id}>
                  {wt(`roles.${r.id}`)}
                </option>
              ))}
            </select>
            <Button
              onClick={handleInvite}
              disabled={loading}
              className="btn-gold rounded-xl font-bold text-luxury-black"
            >
              <Mail className="mr-1.5 size-4" /> {wt("team.invite")}
            </Button>
          </div>
          <p className="mt-3 text-[10px] text-white/35">
            {wt("team.inviteFootnote")}
          </p>
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-premium-gold-light" />
            <DashboardCardTitle>{wt("team.teamMembers", { count: members.length })}</DashboardCardTitle>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          {members.length === 0 ? (
            <DashboardPanel className="py-10 text-center">
              <Users className="mx-auto size-8 text-white/10" />
              <p className="mt-3 text-xs text-white/30">{wt("team.noTeamMembers")}</p>
            </DashboardPanel>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <DashboardPanel key={m.id} className="flex items-center gap-3 p-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-premium-gold/15 text-xs font-bold text-premium-gold-light">
                    {(m.profile?.full_name ?? m.user_id)?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white/80">
                      {m.profile?.full_name ?? m.user_id}
                    </p>
                    <p className="text-[10px] text-white/30">{m.profile?.email ?? ""}</p>
                  </div>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/50">
                    {wt(`roles.${m.role}`)}
                  </span>
                </DashboardPanel>
              ))}
            </div>
          )}
        </DashboardCardContent>
      </DashboardCard>

      {invitations.length > 0 && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{wt("team.pendingInvitations", { count: invitations.length })}</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <DashboardPanel key={inv.id} className="flex items-center gap-3 p-3">
                  <Mail className="size-4 text-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white/70">{inv.email}</p>
                    <p className="text-[10px] text-white/30">
                      {wt("team.invitedAs", {
                        role: wt(`roles.${inv.role}`),
                        expires: formatDate(inv.expires_at),
                      })}
                    </p>
                  </div>
                  <span className="rounded-md bg-yellow-500/15 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                    {wt("common.pending")}
                  </span>
                </DashboardPanel>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}
