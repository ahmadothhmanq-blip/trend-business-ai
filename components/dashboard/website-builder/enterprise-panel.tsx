"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BUILDER_ROLE_PERMISSIONS,
  ENTERPRISE_CAPABILITIES,
  type BuilderGenerationMember,
  type BuilderMemberRole,
} from "@/lib/website/builder";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type EnterprisePanelProps = {
  generationId: string;
  disabled?: boolean;
};

export function EnterprisePanel({ generationId, disabled }: EnterprisePanelProps) {
  const { wb } = useBuilderLocale();
  const [members, setMembers] = useState<BuilderGenerationMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<BuilderGenerationMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BuilderMemberRole>("editor");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/builder/members`);
      if (!res.ok) {
        throw new Error(wb("builder.enterprise.loadFailed"));
      }
      const data = (await res.json()) as { members?: BuilderGenerationMember[] };
      setMembers(data.members ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : wb("builder.enterprise.loadFailed"));
    }
  }, [generationId, wb]);

  const loadPendingInvites = useCallback(async () => {
    try {
      const res = await fetch("/api/website-builder/builder/invitations");
      if (!res.ok) return;
      const data = (await res.json()) as { invitations?: BuilderGenerationMember[] };
      setPendingInvites(
        (data.invitations ?? []).filter((inv) => inv.generationId === generationId),
      );
    } catch {
      // Non-blocking — user may not have pending invites
    }
  }, [generationId]);

  useEffect(() => {
    setLoading(true);
    void Promise.all([loadMembers(), loadPendingInvites()]).finally(() =>
      setLoading(false),
    );
  }, [loadMembers, loadPendingInvites]);

  const invite = async () => {
    if (!email.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/website-builder/${generationId}/builder/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = (await res.json()) as { error?: string; member?: BuilderGenerationMember };
      if (!res.ok) {
        throw new Error(data.error || wb("builder.enterprise.inviteFailed"));
      }
      setEmail("");
      toast.success(wb("builder.enterprise.inviteSent"));
      await loadMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : wb("builder.enterprise.inviteFailed");
      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const acceptInvite = async (token: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/website-builder/builder/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || wb("builder.enterprise.loadFailed"));
      toast.success(wb("builder.enterprise.inviteSent"));
      await Promise.all([loadMembers(), loadPendingInvites()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : wb("builder.enterprise.loadFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const revokeMember = async (memberId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/website-builder/${generationId}/builder/members/${memberId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(wb("builder.enterprise.removeFailed"));
      toast.success(wb("builder.enterprise.inviteRemoved"));
      await loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : wb("builder.enterprise.removeFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const resendInvite = async (memberId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/website-builder/${generationId}/builder/members/${memberId}/resend`,
        { method: "POST" },
      );
      const data = (await res.json()) as {
        error?: string;
        emailDeliveryStatus?: string;
      };
      if (!res.ok) throw new Error(data.error || wb("builder.enterprise.resendFailed"));
      toast.success(
        data.emailDeliveryStatus === "sent"
          ? wb("builder.enterprise.resendSent")
          : data.emailDeliveryStatus === "skipped"
            ? wb("builder.enterprise.resendSkipped")
            : wb("builder.enterprise.inviteSent"),
      );
      await loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : wb("builder.enterprise.resendFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-white/50">
        <Loader2 className="size-5 animate-spin text-premium-gold" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {wb("builder.enterprise.title")}
      </p>

      {pendingInvites.length > 0 ? (
        <div className="rounded-xl border border-premium-gold/25 bg-premium-gold/8 p-3">
          <p className="mb-2 text-xs font-medium text-premium-gold-light">
            {wb("builder.enterprise.pendingInvites")}
          </p>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-white/70">Role: {invite.role}</span>
              <Button
                type="button"
                size="sm"
                disabled={disabled || actionLoading}
                onClick={() => {
                  if (invite.invitationToken) void acceptInvite(invite.invitationToken);
                }}
                className="h-7 text-[10px]"
              >
                {wb("builder.enterprise.accept")}
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <ul className="space-y-2">
        {ENTERPRISE_CAPABILITIES.map((cap) => (
          <li
            key={cap.id}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <p className="text-xs font-medium text-white">
              {wb(`builder.enterprise.capabilities.${cap.id}.label`)}
            </p>
            <p className="text-[10px] text-white/45">
              {wb(`builder.enterprise.capabilities.${cap.id}.description`)}
            </p>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium text-white">
          <Shield className="size-3.5 text-premium-gold" />
          {wb("builder.enterprise.teamMembers")}
        </p>
        {error ? (
          <p className="mb-2 text-[10px] text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mb-2 space-y-1">
          {members.length === 0 ? (
            <p className="text-[10px] text-white/45">{wb("builder.enterprise.noMembers")}</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-2 text-[10px] text-white/70"
              >
                <span className="min-w-0 truncate">
                  {member.email || member.userId || wb("builder.enterprise.pending")}
                </span>
                <span className="shrink-0 text-white/40">
                  {member.role}
                  {member.status === "pending" ? ` · ${wb("builder.enterprise.pending")}` : ""}
                  {member.emailDeliveryStatus
                    ? ` · ${wb("builder.enterprise.emailStatus", { status: member.emailDeliveryStatus })}`
                    : ""}
                </span>
                {member.status === "pending" ? (
                  <button
                    type="button"
                    disabled={disabled || actionLoading}
                    onClick={() => void resendInvite(member.id)}
                    className="shrink-0 text-[10px] text-premium-gold/80 hover:text-premium-gold"
                  >
                    {wb("builder.enterprise.resend")}
                  </button>
                ) : null}
                {member.status !== "revoked" && member.role !== "owner" ? (
                  <button
                    type="button"
                    disabled={disabled || actionLoading}
                    onClick={() => void revokeMember(member.id)}
                    className="shrink-0 text-[10px] text-red-300/80 hover:text-red-200"
                  >
                    {wb("builder.enterprise.remove")}
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={wb("builder.enterprise.emailPlaceholder")}
          disabled={disabled || actionLoading}
          className="mb-2 border-white/10 bg-white/5 text-white"
          aria-label={wb("builder.enterprise.emailPlaceholder")}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as BuilderMemberRole)}
          disabled={disabled || actionLoading}
          className="mb-2 h-9 w-full rounded-md border border-white/10 bg-[#121212] px-2 text-xs text-white"
          aria-label={wb("builder.enterprise.inviteCollaborator")}
        >
          {Object.keys(BUILDER_ROLE_PERMISSIONS)
            .filter((r) => r !== "owner")
            .map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
        </select>
        <Button
          type="button"
          disabled={disabled || actionLoading || !email.trim()}
          onClick={() => void invite()}
          className="h-8 w-full text-xs"
        >
          {actionLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              <UserPlus className="size-3.5" />
              {wb("builder.enterprise.inviteCollaborator")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
