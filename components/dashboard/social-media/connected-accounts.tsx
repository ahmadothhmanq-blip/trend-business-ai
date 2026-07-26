"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Link2, Unlink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { CONNECTABLE_PLATFORMS } from "@/lib/social-media/oauth";
import type { SocialAccountPublic } from "@/types/social-media";

export function ConnectedAccountsPanel() {
  const wt = useWorkspaceT("socialMedia");
  const [accounts, setAccounts] = useState<SocialAccountPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social-media/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("accounts.loadFailed"));
      setAccounts(data.accounts ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("accounts.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [wt]);

  useEffect(() => {
    void load();
  }, [load]);

  const connect = (platform: string) => {
    window.location.assign(`/api/social-media/accounts/connect/${platform}`);
  };

  const disconnect = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/social-media/accounts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? wt("accounts.disconnectFailed"));
      toast.success(wt("accounts.disconnected"));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("accounts.disconnectFailed"));
    } finally {
      setBusy(null);
    }
  };

  const connectedPlatforms = new Set(accounts.filter((a) => a.status === "connected").map((a) => a.platform));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{wt("accounts.title")}</h2>
          <p className="text-sm text-white/40">{wt("accounts.description")}</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/10" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-2 size-4" />
          {wt("accounts.refresh")}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTABLE_PLATFORMS.map((platform) => {
          const connected = connectedPlatforms.has(platform);
          return (
            <div key={platform} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="font-medium text-white">{wt(`accounts.platforms.${platform}`)}</p>
              <p className="mt-1 text-xs text-white/40 capitalize">{connected ? wt("accounts.connected") : wt("accounts.notConnected")}</p>
              <Button
                size="sm"
                className="mt-3 rounded-lg"
                variant={connected ? "outline" : "default"}
                onClick={() => connect(platform)}
                disabled={connected}
              >
                <Link2 className="mr-2 size-4" />
                {connected ? wt("accounts.connected") : wt("accounts.connectAccount")}
              </Button>
            </div>
          );
        })}
      </div>

      {accounts.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">{wt("accounts.yourAccounts")}</p>
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
                  {wt("accounts.disconnect")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
