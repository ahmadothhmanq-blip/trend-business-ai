"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  Lock,
  Rocket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { DeploymentDashboard } from "@/lib/ai-core/deployment";
import type { WebsiteDomain } from "@/lib/ai-core/domains";

export function DeploymentDashboardPanel(props: {
  generationId: string | null;
}) {
  const [dashboard, setDashboard] = useState<DeploymentDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!props.generationId) {
      setDashboard(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/deploy`,
      );
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Failed to load deployment");
      }
      const data = (await res.json()) as { dashboard: DeploymentDashboard };
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [props.generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (
    action: "prepare" | "publish" | "unpublish" | "archive" | "republish",
  ) => {
    if (!props.generationId) return;
    setBusy(action);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/deploy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        dashboard?: DeploymentDashboard;
        publicUrl?: string;
      };
      if (!res.ok) throw new Error(data.error || "Action failed");
      if (data.dashboard) setDashboard(data.dashboard);
      toast.success(
        action === "publish" || action === "republish"
          ? `Published${data.publicUrl ? `: ${data.publicUrl}` : ""}`
          : `Deployment: ${action}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const addDomain = async () => {
    if (!props.generationId || !hostname.trim()) return;
    setBusy("add-domain");
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/domains`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostname: hostname.trim() }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to add domain");
      setHostname("");
      toast.success("Domain added — configure DNS, then verify.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setBusy(null);
    }
  };

  const verifyDomain = async (domainId: string, simulate = false) => {
    if (!props.generationId) return;
    setBusy(`verify-${domainId}`);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/domains/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainId, simulate }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        domain?: WebsiteDomain;
      };
      if (!res.ok) throw new Error(data.error || "Verification failed");
      toast.success(data.domain?.lastCheckMessage || "Verification complete");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(null);
    }
  };

  const removeDomain = async (domainId: string) => {
    if (!props.generationId) return;
    setBusy(`remove-${domainId}`);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/domains`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainId }),
        },
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Remove failed");
      }
      toast.success("Domain removed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusy(null);
    }
  };

  if (!props.generationId) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-white/40">
        Generate or select a website to open publishing & domains.
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="flex h-[420px] items-center justify-center gap-2 text-white/40">
        <Loader2 className="size-4 animate-spin" />
        Loading deployment dashboard…
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-red-400/80">
        {error}
      </div>
    );
  }

  if (!dashboard) return null;

  const { publishing } = dashboard;
  const isPublished = publishing.lifecycleStatus === "published";

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-premium-gold">
            <Rocket className="size-3" />
            Publishing & Domains
          </div>
          <h3 className="text-lg font-bold text-white">
            {dashboard.projectName || "Website"} deployment
          </h3>
          <p className="mt-1 max-w-2xl text-[12px] text-white/40">
            Publish instantly, connect custom domains, and track SSL + deployment
            history. Integrates with Analytics and SEO Agent readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-white/15 text-white"
            disabled={Boolean(busy)}
            onClick={() => void runAction("prepare")}
          >
            {busy === "prepare" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Prepare
          </Button>
          <Button
            className="bg-premium-gold text-black hover:bg-premium-gold/90"
            disabled={Boolean(busy)}
            onClick={() =>
              void runAction(isPublished ? "republish" : "publish")
            }
          >
            {busy === "publish" || busy === "republish" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            {isPublished ? "Update & republish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Status"
          value={publishing.lifecycleStatus}
          hint={publishing.backendStatus}
        />
        <StatTile
          label="Website URL"
          value={dashboard.primaryUrl ? "Ready" : "—"}
          hint={dashboard.primaryUrl || "Publish to get a public URL"}
        />
        <StatTile
          label="SSL"
          value={dashboard.sslStatus}
          hint={
            dashboard.sslStatus === "active"
              ? "Certificate ready"
              : "Activates after publish / domain verify"
          }
        />
        <StatTile
          label="Integrations"
          value={
            [
              dashboard.analyticsReady ? "Analytics" : null,
              dashboard.seoAgentReady ? "SEO" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"
          }
          hint="Connected intelligence systems"
        />
      </div>

      <DashboardPanel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-white">Website URL</h4>
          {dashboard.primaryUrl ? (
            <a
              href={dashboard.primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-premium-gold hover:underline"
            >
              Open <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
        <div className="mt-3 space-y-2 text-[12px]">
          <UrlRow
            label="Public path"
            value={publishing.publicUrl || publishing.publicPath || "Not published"}
          />
          <UrlRow
            label="Subdomain"
            value={dashboard.subdomainUrl || "Assigns from your username"}
          />
          <UrlRow
            label="Custom domain"
            value={dashboard.customDomainUrl || "None connected"}
          />
        </div>
        {isPublished ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white"
              disabled={Boolean(busy)}
              onClick={() => void runAction("unpublish")}
            >
              Unpublish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white"
              disabled={Boolean(busy)}
              onClick={() => void runAction("archive")}
            >
              Archive
            </Button>
          </div>
        ) : null}
      </DashboardPanel>

      <DashboardPanel className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Globe2 className="size-4 text-premium-gold" />
          <h4 className="text-sm font-semibold text-white">Domain settings</h4>
        </div>
        <p className="mb-3 text-[12px] text-white/40">
          Connect customer.com with CNAME / A records and TXT verification. SSL
          provisioning is marked ready after successful verification.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="www.yourdomain.com"
            className="border-white/10 bg-white/5 text-white"
          />
          <Button
            className="bg-premium-gold text-black"
            disabled={Boolean(busy) || !hostname.trim()}
            onClick={() => void addDomain()}
          >
            {busy === "add-domain" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Connect domain
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {dashboard.domains.length === 0 ? (
            <p className="text-[12px] text-white/35">
              No domains yet. Platform subdomain appears after publish when a
              username handle is available.
            </p>
          ) : (
            dashboard.domains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                busy={busy}
                onVerify={(simulate) => void verifyDomain(domain.id, simulate)}
                onRemove={() => void removeDomain(domain.id)}
              />
            ))
          )}
        </div>
      </DashboardPanel>

      <DashboardPanel className="p-4 sm:p-5">
        <h4 className="text-sm font-semibold text-white">Deployment history</h4>
        <div className="mt-3 space-y-2">
          {dashboard.history.length === 0 ? (
            <p className="text-[12px] text-white/35">No deployment events yet.</p>
          ) : (
            dashboard.history.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px]"
              >
                <div>
                  <p className="font-medium text-white/85">{ev.message}</p>
                  <p className="text-white/35">
                    {ev.kind} · {new Date(ev.createdAt).toLocaleString()}
                  </p>
                </div>
                {ev.url ? (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-premium-gold hover:underline"
                  >
                    URL
                  </a>
                ) : null}
              </div>
            ))
          )}
        </div>
      </DashboardPanel>
    </div>
  );
}

function StatTile(props: { label: string; value: string; hint: string }) {
  return (
    <DashboardPanel className="p-4">
      <p className="text-[11px] text-white/40">{props.label}</p>
      <p className="mt-1 text-lg font-bold capitalize text-white">
        {props.value}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[11px] text-white/35">{props.hint}</p>
    </DashboardPanel>
  );
}

function UrlRow(props: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-white/35">{props.label}</span>
      <span className="break-all text-white/75">{props.value}</span>
    </div>
  );
}

function DomainCard(props: {
  domain: WebsiteDomain;
  busy: string | null;
  onVerify: (simulate?: boolean) => void;
  onRemove: () => void;
}) {
  const { domain } = props;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-semibold text-white">{domain.hostname}</p>
          <p className="mt-0.5 text-[11px] text-white/40">
            {domain.kind} · {domain.status} · SSL {domain.sslStatus}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {domain.kind === "custom" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-white/15 text-white"
                disabled={Boolean(props.busy)}
                onClick={() => props.onVerify(false)}
              >
                {props.busy === `verify-${domain.id}` ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Verify DNS
              </Button>
              {process.env.NODE_ENV !== "production" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 text-white"
                  disabled={Boolean(props.busy)}
                  onClick={() => props.onVerify(true)}
                >
                  Simulate
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="border-white/15 text-white"
                disabled={Boolean(props.busy)}
                onClick={props.onRemove}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-premium-gold">
              <Lock className="size-3" /> Platform
            </span>
          )}
        </div>
      </div>
      {domain.lastCheckMessage ? (
        <p className="mt-2 text-[11px] text-white/45">{domain.lastCheckMessage}</p>
      ) : null}
      {domain.dnsInstructions.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-[11px] text-white/60">
            <thead className="text-white/35">
              <tr>
                <th className="py-1 pr-2 font-medium">Type</th>
                <th className="py-1 pr-2 font-medium">Host</th>
                <th className="py-1 pr-2 font-medium">Value</th>
                <th className="py-1 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {domain.dnsInstructions.map((rec, i) => (
                <tr key={`${rec.type}-${i}`} className="border-t border-white/5">
                  <td className="py-1.5 pr-2 font-semibold text-premium-gold">
                    {rec.type}
                  </td>
                  <td className="py-1.5 pr-2 font-mono">{rec.host}</td>
                  <td className="max-w-[220px] break-all py-1.5 pr-2 font-mono">
                    {rec.value}
                  </td>
                  <td className="py-1.5">{rec.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p
        className={cn(
          "mt-2 text-[10px] uppercase tracking-wide",
          domain.sslStatus === "active"
            ? "text-emerald-400/90"
            : "text-white/30",
        )}
      >
        SSL: {domain.sslStatus}
      </p>
    </div>
  );
}
