"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardCard, DashboardCardContent, DashboardCardHeader, DashboardCardTitle, DashboardCardDescription, DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardSelectClass } from "@/components/dashboard/ui/dashboard-styles";
import { cn } from "@/lib/utils";
import { ORG_ROLES, getRoleLabel } from "@/lib/constants/platform";
import type { OrgMember, TeamInvitation } from "@/types/platform";

export function TeamPanel() {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/platform/team");
      if (!res.ok) return;
      const d = await res.json();
      setMembers(d.members ?? []);
      setInvitations(d.invitations ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleInvite = async () => {
    if (!email.trim()) { toast.error("Enter an email address"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/platform/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, organizationId: "00000000-0000-0000-0000-000000000000" }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Invite failed"); return; }
      toast.success("Invitation sent");
      setEmail("");
      fetchTeam();
    } catch { toast.error("Request failed"); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-2"><UserPlus className="size-5 text-premium-gold-light" /><DashboardCardTitle>Invite Team Member</DashboardCardTitle></div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <div className="flex gap-3">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" className={cn(dashboardInputClass, "flex-1")} />
            <select value={role} onChange={(e) => setRole(e.target.value)} className={cn(dashboardSelectClass, "w-32")}>
              {ORG_ROLES.filter((r) => r.id !== "owner").map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <Button onClick={handleInvite} disabled={loading} className="btn-gold rounded-xl font-bold text-luxury-black">
              <Mail className="mr-1.5 size-4" /> Invite
            </Button>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-2"><Users className="size-5 text-premium-gold-light" /><DashboardCardTitle>Team Members ({members.length})</DashboardCardTitle></div>
        </DashboardCardHeader>
        <DashboardCardContent>
          {members.length === 0 ? (
            <DashboardPanel className="py-10 text-center"><Users className="mx-auto size-8 text-white/10" /><p className="mt-3 text-xs text-white/30">No team members yet</p></DashboardPanel>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <DashboardPanel key={m.id} className="flex items-center gap-3 p-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-premium-gold/15 text-xs font-bold text-premium-gold-light">{(m.profile?.full_name ?? m.user_id)?.[0]?.toUpperCase() ?? "?"}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white/80">{m.profile?.full_name ?? m.user_id}</p>
                    <p className="text-[10px] text-white/30">{m.profile?.email ?? ""}</p>
                  </div>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/50">{getRoleLabel(m.role)}</span>
                </DashboardPanel>
              ))}
            </div>
          )}
        </DashboardCardContent>
      </DashboardCard>

      {invitations.length > 0 && (
        <DashboardCard>
          <DashboardCardHeader><DashboardCardTitle>Pending Invitations ({invitations.length})</DashboardCardTitle></DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <DashboardPanel key={inv.id} className="flex items-center gap-3 p-3">
                  <Mail className="size-4 text-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white/70">{inv.email}</p>
                    <p className="text-[10px] text-white/30">Invited as {getRoleLabel(inv.role as "admin" | "member" | "viewer")} &middot; Expires {new Date(inv.expires_at).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-md bg-yellow-500/15 px-2 py-0.5 text-[10px] font-medium text-yellow-400">Pending</span>
                </DashboardPanel>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}
