"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { DeploymentDashboard } from "@/lib/ai-core/deployment";
import type { WebsiteDomain } from "@/lib/ai-core/domains";
import { useWebsitePublish } from "@/lib/hooks/use-website-publish";
import { buildReferralSharePayload } from "@/lib/website/growth/referral";
import { VisualSkinEditor } from "@/components/dashboard/website-builder/visual-skin-editor";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";

export function DeploymentDashboardPanel(props: {
  generationId: string | null;
  project?: GeneratedWebsiteProject | null;
  onProjectChange?: (project: GeneratedWebsiteProject) => void;
}) {
  const wb = useProductT("websiteBuilder");
  const [dashboard, setDashboard] = useState<DeploymentDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [domainToRemove, setDomainToRemove] = useState<WebsiteDomain | null>(null);
  const [domainBusy, setDomainBusy] = useState<string | null>(null);
  const publish = useWebsitePublish(props.generationId);

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
        throw new Error(body.error || wb("panels.failedLoadDeployment"));
      }
      const data = (await res.json()) as { dashboard: DeploymentDashboard };
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : wb("panels.failedLoad"));
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [props.generationId, wb]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (
    action: "prepare" | "publish" | "unpublish" | "archive" | "republish",
    force = false,
  ) => {
    if (!props.generationId) return;
    const data = await publish.runAction(action, { force });
    if (!data.ok) {
      toast.error(
        data.blockers?.[0] ?? data.error ?? wb("management.errors.actionFailed"),
      );
      return;
    }
    if (data.dashboard) setDashboard(data.dashboard);
    toast.success(
      action === "publish" || action === "republish"
        ? wb("panels.publishedToast", {
            url: data.publicUrl ? `: ${data.publicUrl}` : "",
          })
        : wb("panels.deploymentAction", { action }),
    );
  };

  const addDomain = async () => {
    if (!props.generationId || !hostname.trim()) return;
    setDomainBusy("add-domain");
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
      if (!res.ok) throw new Error(data.error || wb("panels.failedAddDomain"));
      setHostname("");
      toast.success(wb("panels.domainAdded"));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : wb("panels.failedAddDomain"));
    } finally {
      setDomainBusy(null);
    }
  };

  const verifyDomain = async (domainId: string, simulate = false) => {
    if (!props.generationId) return;
    setDomainBusy(`verify-${domainId}`);
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
      if (!res.ok) throw new Error(data.error || wb("panels.verificationFailed"));
      toast.success(data.domain?.lastCheckMessage || wb("panels.verificationComplete"));
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : wb("panels.verificationFailed"));
    } finally {
      setDomainBusy(null);
    }
  };

  const confirmRemoveDomain = async () => {
    if (!props.generationId || !domainToRemove) return;
    const domainId = domainToRemove.id;
    setDomainBusy(`remove-${domainId}`);
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
        throw new Error(data.error || wb("panels.removeFailed"));
      }
      toast.success(wb("panels.domainRemoved"));
      setDomainToRemove(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : wb("panels.removeFailed"));
    } finally {
      setDomainBusy(null);
    }
  };

  const actionBusy = publish.isBusy || Boolean(domainBusy);

  const referral = useMemo(() => {
    if (!props.generationId || !dashboard?.publishing.publicUrl) return null;
    return buildReferralSharePayload({
      publicUrl: dashboard.publishing.publicUrl,
      userId: props.generationId,
      generationId: props.generationId,
      title: dashboard.projectName ?? undefined,
    });
  }, [props.generationId, dashboard]);

  if (!props.generationId) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-white/40">
        {wb("panels.selectWebsiteDeployment")}
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="flex h-[420px] items-center justify-center gap-2 text-white/40">
        <Loader2 className="size-4 animate-spin" />
        {wb("panels.loadingDeployment")}
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
            {wb("panels.publishingDomains")}
          </div>
          <h3 className="text-lg font-bold text-white">
            {wb("panels.deploymentTitle", { name: dashboard.projectName || wb("labels.website") })}
          </h3>
          <p className="mt-1 max-w-2xl text-[12px] text-white/40">
            {wb("panels.deploymentDescription")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-white/15 text-white"
            disabled={actionBusy}
            onClick={() => void runAction("prepare")}
          >
            {publish.busy === "prepare" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {wb("panels.prepare")}
          </Button>
          <Button
            className="bg-premium-gold text-black hover:bg-premium-gold/90"
            disabled={actionBusy}
            onClick={() =>
              void runAction(isPublished ? "republish" : "publish")
            }
          >
            {publish.busy === "publish" || publish.busy === "republish" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            {isPublished ? wb("panels.updateRepublish") : wb("panels.publish")}
          </Button>
        </div>
      </div>

      {props.project && props.generationId ? (
        <VisualSkinEditor
          generationId={props.generationId}
          project={props.project}
          onApplied={props.onProjectChange}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={wb("panels.status")}
          value={publishing.lifecycleStatus}
          hint={publishing.backendStatus}
        />
        <StatTile
          label={wb("panels.websiteUrl")}
          value={dashboard.primaryUrl ? wb("panels.ready") : "—"}
          hint={dashboard.primaryUrl || wb("panels.publishForUrl")}
        />
        <StatTile
          label={wb("panels.ssl")}
          value={dashboard.sslStatus}
          hint={
            dashboard.sslStatus === "active"
              ? wb("panels.certificateReady")
              : wb("panels.certificatePending")
          }
        />
        <StatTile
          label={wb("panels.integrations")}
          value={
            [
              dashboard.analyticsReady ? wb("sections.analytics") : null,
              dashboard.seoAgentReady ? wb("sections.seo") : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"
          }
          hint={wb("panels.connectedSystems")}
        />
      </div>

      <DashboardPanel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-white">{wb("panels.websiteUrl")}</h4>
          {dashboard.primaryUrl ? (
            <a
              href={dashboard.primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-premium-gold hover:underline"
            >
              {wb("panels.open")} <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
        <div className="mt-3 space-y-2 text-[12px]">
          <UrlRow
            label={wb("panels.publicPath")}
            value={publishing.publicUrl || publishing.publicPath || wb("panels.notPublished")}
          />
          <UrlRow
            label={wb("panels.subdomain")}
            value={dashboard.subdomainUrl || wb("panels.subdomainHint")}
          />
          <UrlRow
            label={wb("panels.customDomain")}
            value={dashboard.customDomainUrl || wb("panels.noneConnected")}
          />
        </div>
        {isPublished ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white"
              disabled={actionBusy}
              onClick={() => void runAction("unpublish")}
            >
              {wb("panels.unpublish")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/15 text-white"
              disabled={actionBusy}
              onClick={() => void runAction("archive")}
            >
              {wb("panels.archive")}
            </Button>
            {referral ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-premium-gold/25 text-premium-gold-light"
                  onClick={() => {
                    void navigator.clipboard.writeText(referral.referralUrl);
                    toast.success("Referral link copied");
                  }}
                >
                  Copy referral link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 text-white"
                  asChild
                >
                  <a href={referral.twitterIntentUrl} target="_blank" rel="noreferrer">
                    Share on X
                  </a>
                </Button>
              </>
            ) : null}
          </div>
        ) : null}
      </DashboardPanel>

      <DashboardPanel className="p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Globe2 className="size-4 text-premium-gold" />
          <h4 className="text-sm font-semibold text-white">{wb("panels.domainSettings")}</h4>
        </div>
        <p className="mb-3 text-[12px] text-white/40">
          {wb("panels.domainSettingsHint")}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder={wb("panels.domainPlaceholder")}
            className="border-white/10 bg-white/5 text-white"
          />
          <Button
            className="bg-premium-gold text-black"
            disabled={actionBusy || !hostname.trim()}
            onClick={() => void addDomain()}
          >
            {domainBusy === "add-domain" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {wb("panels.connectDomain")}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {dashboard.domains.length === 0 ? (
            <p className="text-[12px] text-white/35">
              {wb("panels.noDomainsYet")}
            </p>
          ) : (
            dashboard.domains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                busy={domainBusy}
                wb={wb}
                onVerify={(simulate) => void verifyDomain(domain.id, simulate)}
                onRemove={() => setDomainToRemove(domain)}
              />
            ))
          )}
        </div>
      </DashboardPanel>

      <Dialog
        open={Boolean(domainToRemove)}
        onOpenChange={(open) => !open && !domainBusy && setDomainToRemove(null)}
      >
        <DialogContent className="border-white/10 bg-[#141414]/95 text-white">
          <DialogHeader>
            <DialogTitle>{wb("dialogs.deleteTitle")}</DialogTitle>
            <DialogDescription className="text-white/45">
              {domainToRemove
                ? `${wb("dialogs.deleteDescription")} (${domainToRemove.hostname})`
                : wb("dialogs.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-white/10 bg-white/[0.03]">
            <Button
              type="button"
              variant="outline"
              className="border-white/15 text-white"
              disabled={Boolean(domainBusy)}
              onClick={() => setDomainToRemove(null)}
            >
              {wb("dialogs.cancel")}
            </Button>
            <Button
              type="button"
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={Boolean(domainBusy)}
              onClick={() => void confirmRemoveDomain()}
            >
              {domainBusy?.startsWith("remove-") ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {wb("dialogs.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardPanel className="p-4 sm:p-5">
        <h4 className="text-sm font-semibold text-white">{wb("panels.deploymentHistory")}</h4>
        <div className="mt-3 space-y-2">
          {dashboard.history.length === 0 ? (
            <p className="text-[12px] text-white/35">{wb("panels.noDeploymentEvents")}</p>
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
                    {wb("panels.urlLabel")}
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
  wb: ReturnType<typeof useProductT>;
  onVerify: (simulate?: boolean) => void;
  onRemove: () => void;
}) {
  const { domain, wb } = props;
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
                {wb("panels.verifyDns")}
              </Button>
              {process.env.NODE_ENV !== "production" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 text-white"
                  disabled={Boolean(props.busy)}
                  onClick={() => props.onVerify(true)}
                >
                  {wb("panels.simulate")}
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
              <Lock className="size-3" /> {wb("panels.platform")}
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
                <th className="py-1 pr-2 font-medium">{wb("panels.dnsType")}</th>
                <th className="py-1 pr-2 font-medium">{wb("panels.dnsHost")}</th>
                <th className="py-1 pr-2 font-medium">{wb("panels.dnsValue")}</th>
                <th className="py-1 font-medium">{wb("panels.dnsPurpose")}</th>
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
        {wb("panels.sslStatus", { status: domain.sslStatus })}
      </p>
    </div>
  );
}
