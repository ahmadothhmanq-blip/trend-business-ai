"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Organization, Team, Role } from "@/types/business-manager";

type Props = {
  organizations: Organization[];
  initialTeams?: Team[];
  initialRoles?: Role[];
};

export function TeamsPanel({ organizations, initialTeams = [], initialRoles = [] }: Props) {
  const [teams, setTeams] = useState(initialTeams);
  const [roles, setRoles] = useState(initialRoles);
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? "");
  const [teamName, setTeamName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<Role["role_type"]>("member");

  const createTeam = async () => {
    if (!orgId || !teamName.trim()) {
      toast.error("Select organization and enter team name.");
      return;
    }
    const res = await fetch("/api/business-manager/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId, name: teamName }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setTeams([data.team, ...teams]);
    setTeamName("");
    toast.success("Team created");
  };

  const addRole = async () => {
    if (!orgId || !memberName.trim()) {
      toast.error("Select organization and enter member name.");
      return;
    }
    const res = await fetch("/api/business-manager/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId, memberName, roleType: memberRole }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    setRoles([data.role, ...roles]);
    setMemberName("");
    toast.success("Member added");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-medium uppercase text-white/40">Teams</p>
          {organizations.length > 0 && (
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name"
              className="border-white/10 bg-white/5 text-white"
            />
            <Button onClick={() => void createTeam()}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {teams.map((t) => (
            <div key={t.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <p className="font-medium text-white">{t.name}</p>
              <p className="text-xs text-white/40">{t.description || "No description"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-medium uppercase text-white/40">Roles & permissions</p>
          <div className="flex flex-wrap gap-2">
            <Input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Member name"
              className="border-white/10 bg-white/5 text-white"
            />
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value as Role["role_type"])}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {(["owner", "admin", "manager", "member"] as const).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Button onClick={() => void addRole()}>Add member</Button>
          </div>
        </div>
        <div className="space-y-2">
          {roles.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className="text-white">{r.member_name}</span>
              <span className="text-xs capitalize text-premium-gold-light">{r.role_type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
