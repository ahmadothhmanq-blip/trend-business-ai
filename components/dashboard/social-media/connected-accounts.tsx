"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Link2, Unlink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONNECTABLE_PLATFORMS } from "@/lib/social-media/oauth";
import type { SocialAccountPublic } from "@/types/social-media";

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp Business",
  messenger: "Messenger",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
};

export function ConnectedAccountsPanel() {
  const [accounts, setAccounts] = useState<SocialAccountPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social-media/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load accounts");
      setAccounts(data.accounts ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const connect = (platform: string) => {
    window.location.href = `/api/social-media/accounts/connect/${platform}`;
  };

  const disconnect = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/social-media/accounts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Disconnect failed");
      toast.success("Account disconnected");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  };

  const connectedPlatforms = new Set(accounts.filter((a) => a.status === "connected").map((a) => a.platform));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
          <p className="text-sm text-white/40">Connect platforms to publish and schedule posts.</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/10" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTABLE_PLATFORMS.map((platform) => {
          const connected = connectedPlatforms.has(platform);
          return (
            <div key={platform} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="font-medium text-white">{PLATFORM_LABELS[platform] ?? platform}</p>
              <p className="mt-1 text-xs text-white/40 capitalize">{connected ? "Connected" : "Not connected"}</p>
              <Button
                size="sm"
                className="mt-3 rounded-lg"
                variant={connected ? "outline" : "default"}
                onClick={() => connect(platform)}
                disabled={connected}
              >
                <Link2 className="mr-2 size-4" />
                {connected ? "Connected" : "Connect Account"}
              </Button>
            </div>
          );
        })}
      </div>

      {accounts.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">Your accounts</p>
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{account.account_name}</p>
                  <p className="text-xs text-white/40 capitalize">
                    {account.platform} · {account.status ?? account.connection_status}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10"
                  disabled={busy === account.id}
                  onClick={() => void disconnect(account.id)}
                >
                  <Unlink className="mr-1 size-3" />
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
