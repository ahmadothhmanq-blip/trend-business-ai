"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Copy,
  FlaskConical,
  Loader2,
  Mail,
  Megaphone,
  Share2,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardPanel,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass, dashboardTextareaClass } from "@/components/dashboard/ui/dashboard-styles";
import { useFormatter } from "@/lib/i18n/use-formatter";
import { useWorkspaceT } from "@/lib/i18n/use-scoped-t";
import { cn } from "@/lib/utils";
import { affiliateLink, referralLink } from "@/lib/growth/codes";
import type { GrowthDashboardPayload } from "@/types/growth";

type TabId =
  | "overview"
  | "affiliate"
  | "referrals"
  | "leads"
  | "crm"
  | "email"
  | "experiments"
  | "automation";

function origin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export function GrowthPanel() {
  const wt = useWorkspaceT("platform");
  const { formatCurrency } = useFormatter();
  const [tab, setTab] = useState<TabId>("overview");
  const [data, setData] = useState<GrowthDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [dealTitle, setDealTitle] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [experimentName, setExperimentName] = useState("");
  const [automationName, setAutomationName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/growth/dashboard");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? wt("growth.loadFailed"));
      setData(null);
      return;
    }
    setData(json.growth as GrowthDashboardPayload);
  }, [wt]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const affLink = data?.affiliate
    ? affiliateLink(origin(), data.affiliate.code, "/pricing")
    : "";

  const refLink = data?.referral
    ? referralLink(origin(), data.referral.code)
    : "";

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(wt("toasts.copiedToClipboard"));
    } catch {
      toast.error(wt("toasts.couldNotCopy"));
    }
  }

  async function runAction(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : wt("toasts.actionFailed"));
    } finally {
      setBusy(null);
    }
  }

  const tabs: Array<{ id: TabId; label: string; icon: typeof Users }> = [
    { id: "overview", label: wt("growth.tabs.overview"), icon: BarChart3 },
    { id: "affiliate", label: wt("growth.tabs.affiliate"), icon: Wallet },
    { id: "referrals", label: wt("growth.tabs.referrals"), icon: Share2 },
    { id: "leads", label: wt("growth.tabs.leads"), icon: Target },
    { id: "crm", label: wt("growth.tabs.crm"), icon: Users },
    { id: "email", label: wt("growth.tabs.email"), icon: Mail },
    { id: "experiments", label: wt("growth.tabs.experiments"), icon: FlaskConical },
    { id: "automation", label: wt("growth.tabs.automation"), icon: Megaphone },
  ];

  if (loading) {
    return (
      <DashboardPanel className="flex items-center justify-center gap-2 py-16 text-sm text-white/40">
        <Loader2 className="size-4 animate-spin" /> {wt("growth.loading")}
      </DashboardPanel>
    );
  }

  if (error) {
    return (
      <DashboardPanel className="border-amber-500/30 bg-amber-500/5 px-4 py-6 text-sm text-amber-200">
        {error}
      </DashboardPanel>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                tab === item.id
                  ? "border-premium-gold/40 bg-premium-gold/15 text-premium-gold-light"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80",
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: wt("growth.overview.pageviews30d"), value: data.analytics.pageviews },
              { label: wt("growth.overview.conversions"), value: data.analytics.conversions },
              { label: wt("growth.overview.leads"), value: data.analytics.leads },
              { label: wt("growth.overview.subscribers"), value: data.analytics.subscribers },
            ].map((stat) => (
              <DashboardPanel key={stat.label} className="p-5 text-center">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  {stat.label}
                </p>
              </DashboardPanel>
            ))}
          </div>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("growth.overview.funnelAnalytics")}</DashboardCardTitle>
              <DashboardCardDescription>{wt("growth.overview.funnelDescription")}</DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              {data.analytics.funnel.map((step) => {
                const max = Math.max(...data.analytics.funnel.map((s) => s.count), 1);
                return (
                  <div key={step.step} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{step.step}</span>
                      <span>{step.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-premium-gold/40"
                        style={{ width: `${(step.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "affiliate" && (
        <div className="space-y-6">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("growth.affiliate.title")}</DashboardCardTitle>
              <DashboardCardDescription>
                {wt("growth.affiliate.description")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-4">
              {data.affiliate ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <DashboardPanel className="p-4 text-center">
                      <p className="text-xl font-black text-white">{data.affiliate.total_clicks}</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">{wt("growth.affiliate.clicks")}</p>
                    </DashboardPanel>
                    <DashboardPanel className="p-4 text-center">
                      <p className="text-xl font-black text-white">{data.affiliate.total_referrals}</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">{wt("growth.affiliate.referrals")}</p>
                    </DashboardPanel>
                    <DashboardPanel className="p-4 text-center">
                      <p className="text-xl font-black text-white">
                        {formatCurrency(data.affiliate.total_earned_cents)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">{wt("growth.affiliate.earned")}</p>
                    </DashboardPanel>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input readOnly className={cn(dashboardInputClass, "flex-1")} value={affLink} />
                    <button
                      type="button"
                      onClick={() => copy(affLink)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
                    >
                      <Copy className="size-4" /> {wt("common.copyLink")}
                    </button>
                  </div>
                  <p className="text-xs text-white/40">
                    {wt("growth.affiliate.codeCommission", {
                      code: data.affiliate.code,
                      rate: (data.affiliate.commission_rate_bps / 100).toFixed(0),
                    })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">{wt("growth.affiliate.unavailable")}</p>
              )}
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("growth.affiliate.commissionTracking")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent>
              {data.commissions.length === 0 ? (
                <p className="text-sm text-white/40">{wt("growth.affiliate.noCommissions")}</p>
              ) : (
                <ul className="space-y-2">
                  {data.commissions.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                    >
                      <span>
                        {wt("growth.affiliate.commissionRow", { eventType: c.event_type, email: c.referral_email ?? wt("common.emDash") })}
                      </span>
                      <span>
                        {wt("growth.affiliate.commissionAmount", { amount: formatCurrency(c.amount_cents), status: c.status })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("growth.affiliate.payoutHistory")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent>
              {data.payouts.length === 0 ? (
                <p className="text-sm text-white/40">{wt("growth.affiliate.noPayouts")}</p>
              ) : (
                <ul className="space-y-2">
                  {data.payouts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                    >
                      <span>
                        {wt("growth.affiliate.payoutRow", { amount: formatCurrency(p.amount_cents), method: p.method })}
                      </span>
                      <span>{p.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "referrals" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{wt("growth.referrals.title")}</DashboardCardTitle>
            <DashboardCardDescription>
              {wt("growth.referrals.description", { credits: data.referral?.reward_credits ?? 100 })}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input readOnly className={cn(dashboardInputClass, "flex-1")} value={refLink} />
              <button
                type="button"
                onClick={() => copy(refLink)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
              >
                <Copy className="size-4" /> {wt("common.copyInvite")}
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={cn(dashboardInputClass, "flex-1")}
                placeholder={wt("growth.referrals.invitePlaceholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <button
                type="button"
                disabled={busy === "invite"}
                onClick={() =>
                  runAction("invite", async () => {
                    const res = await fetch("/api/growth/referrals", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: inviteEmail }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? wt("toasts.inviteFailed"));
                    toast.success(wt("toasts.inviteRecorded"));
                    setInviteEmail("");
                  })
                }
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                {busy === "invite" ? <Loader2 className="size-4 animate-spin" /> : wt("common.sendInvite")}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DashboardPanel className="p-4 text-center">
                <p className="text-xl font-black text-white">{data.referral?.total_invites ?? 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/30">{wt("growth.referrals.invites")}</p>
              </DashboardPanel>
              <DashboardPanel className="p-4 text-center">
                <p className="text-xl font-black text-white">{data.referral?.total_accepted ?? 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/30">{wt("growth.referrals.accepted")}</p>
              </DashboardPanel>
            </div>
            <ul className="space-y-2">
              {data.invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                >
                  <span>{invite.invitee_email}</span>
                  <span>{invite.status}</span>
                </li>
              ))}
            </ul>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "leads" && (
        <DashboardCard>
          <DashboardCardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <DashboardCardTitle>{wt("growth.leads.title")}</DashboardCardTitle>
                <DashboardCardDescription>
                  {wt("growth.leads.description")}
                </DashboardCardDescription>
              </div>
              <button
                type="button"
                disabled={busy === "claim"}
                onClick={() =>
                  runAction("claim", async () => {
                    const res = await fetch("/api/growth/actions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ kind: "claim-leads" }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? wt("toasts.claimFailed"));
                    toast.success(wt("toasts.claimedLeads", { count: json.claimed ?? 0 }));
                  })
                }
                className="rounded-xl bg-premium-gold px-3 py-2 text-xs font-semibold text-luxury-black"
              >
                {wt("growth.leads.claimButton")}
              </button>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            {data.leads.length === 0 ? (
              <p className="text-sm text-white/40">{wt("growth.leads.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {data.leads.map((lead) => (
                  <li
                    key={lead.id}
                    className="rounded-xl border border-white/5 px-3 py-3 text-xs text-white/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-white/90">
                        {lead.name ?? lead.email}
                      </span>
                      <span>
                        {wt("growth.leads.scoreRow", { score: lead.score, status: lead.status, source: lead.source })}
                      </span>
                    </div>
                    <p className="mt-1 text-white/40">{lead.email}</p>
                    {lead.message ? <p className="mt-2 text-white/55">{lead.message}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "crm" && (
        <div className="space-y-6">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("growth.crm.contactManagement")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  className={dashboardInputClass}
                  placeholder={wt("growth.crm.emailPlaceholder")}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <input
                  className={dashboardInputClass}
                  placeholder={wt("growth.crm.namePlaceholder")}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busy === "contact"}
                  onClick={() =>
                    runAction("contact", async () => {
                      const res = await fetch("/api/growth/crm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: contactEmail, name: contactName }),
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.error ?? wt("toasts.saveFailed"));
                      toast.success(wt("toasts.contactSaved"));
                      setContactEmail("");
                      setContactName("");
                    })
                  }
                  className="rounded-xl bg-premium-gold px-3 py-2 text-sm font-semibold text-luxury-black"
                >
                  {wt("common.addContact")}
                </button>
              </div>
              <ul className="space-y-2">
                {data.contacts.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                  >
                    <span>
                      {wt("growth.crm.contactRow", { name: c.name ?? c.email, stage: c.lifecycle_stage })}
                    </span>
                    <span>{wt("common.score")} {c.score}</span>
                  </li>
                ))}
              </ul>
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("growth.crm.salesPipeline")}</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className={cn(dashboardInputClass, "flex-1")}
                  placeholder={wt("growth.crm.dealTitlePlaceholder")}
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busy === "deal"}
                  onClick={() =>
                    runAction("deal", async () => {
                      const res = await fetch("/api/growth/crm", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: dealTitle, stage: "new", valueCents: 0 }),
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.error ?? wt("toasts.dealFailed"));
                      toast.success(wt("toasts.dealCreated"));
                      setDealTitle("");
                    })
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80"
                >
                  {wt("common.addDeal")}
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {(["new", "qualified", "proposal", "negotiation", "won", "lost"] as const).map(
                  (stage) => (
                    <DashboardPanel key={stage} className="p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                        {wt(`growth.crm.stages.${stage}`)}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {data.deals
                          .filter((d) => d.stage === stage)
                          .map((d) => (
                            <li key={d.id} className="text-xs text-white/70">
                              {wt("growth.crm.dealRow", { title: d.title, amount: formatCurrency(d.value_cents) })}
                            </li>
                          ))}
                      </ul>
                    </DashboardPanel>
                  ),
                )}
              </div>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "email" && (
        <div className="space-y-6">
          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>{wt("growth.email.title")}</DashboardCardTitle>
              <DashboardCardDescription>
                  {wt("growth.email.description")}
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className={dashboardInputClass}
                  placeholder={wt("growth.email.campaignNamePlaceholder")}
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
                <input
                  className={dashboardInputClass}
                  placeholder={wt("growth.email.subjectPlaceholder")}
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={busy === "campaign"}
                onClick={() =>
                  runAction("campaign", async () => {
                    const res = await fetch("/api/growth/actions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        kind: "campaign",
                        name: campaignName,
                        subject: campaignSubject,
                        bodyText: wt("growth.email.demoBodyText"),
                        status: "draft",
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? wt("toasts.campaignFailed"));
                    toast.success(wt("toasts.campaignDraftCreated"));
                    setCampaignName("");
                    setCampaignSubject("");
                  })
                }
                className="rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
              >
                {wt("growth.email.createDraft")}
              </button>
              <ul className="space-y-2">
                {data.campaigns.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                  >
                    <span>
                      {wt("growth.email.campaignRow", { name: c.name, subject: c.subject })}
                    </span>
                    <span>
                      {wt("growth.email.campaignStats", { status: c.status, sent: c.stats?.sent ?? 0 })}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/40">
                {wt("growth.email.subscribersCount", { count: data.subscribers.length })}
              </p>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "experiments" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{wt("growth.experiments.title")}</DashboardCardTitle>
            <DashboardCardDescription>
              {wt("growth.experiments.description")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={cn(dashboardInputClass, "flex-1")}
                placeholder={wt("growth.experiments.namePlaceholder")}
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
              />
              <button
                type="button"
                disabled={busy === "experiment"}
                onClick={() =>
                  runAction("experiment", async () => {
                    const res = await fetch("/api/growth/actions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        kind: "experiment",
                        name: experimentName,
                        targetType: "cta",
                        hypothesis: wt("growth.experiments.demoHypothesis"),
                        status: "running",
                        variants: [
                          { id: "a", label: wt("growth.experiments.demoControlLabel"), value: wt("growth.experiments.demoControlValue"), weight: 50 },
                          { id: "b", label: wt("growth.experiments.demoVariantLabel"), value: wt("growth.experiments.demoVariantValue"), weight: 50 },
                        ],
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? wt("toasts.experimentFailed"));
                    toast.success(wt("toasts.experimentStarted"));
                    setExperimentName("");
                  })
                }
                className="rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
              >
                {wt("growth.experiments.launchCtaTest")}
              </button>
            </div>
            <ul className="space-y-2">
              {data.experiments.map((exp) => (
                <li
                  key={exp.id}
                  className="rounded-xl border border-white/5 px-3 py-3 text-xs text-white/70"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-white/90">
                      {wt("growth.experiments.experimentRow", { name: exp.name, targetType: exp.target_type })}
                    </span>
                    <span>{exp.status}</span>
                  </div>
                  <p className="mt-1 text-white/40">{exp.hypothesis}</p>
                  <p className="mt-1">
                    {wt("growth.experiments.metrics", {
                      impressions: exp.metrics?.impressions ?? 0,
                      conversions: exp.metrics?.conversions ?? 0,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {tab === "automation" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{wt("growth.automation.title")}</DashboardCardTitle>
            <DashboardCardDescription>
              {wt("growth.automation.description")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={cn(dashboardInputClass, "flex-1")}
                placeholder={wt("growth.automation.namePlaceholder")}
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
              />
              <button
                type="button"
                disabled={busy === "automation"}
                onClick={() =>
                  runAction("automation", async () => {
                    const res = await fetch("/api/growth/actions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        kind: "automation",
                        name: automationName || wt("growth.automation.defaultName"),
                        triggerEvent: "lead_created",
                        status: "active",
                        steps: [
                          {
                            id: "1",
                            type: "email",
                            subject: wt("growth.automation.demoWelcomeSubject"),
                            body: wt("growth.automation.demoWelcomeBody"),
                          },
                          { id: "2", type: "wait", delayHours: 48 },
                          { id: "3", type: "score", scoreDelta: 10 },
                          { id: "4", type: "tag", tag: "nurturing" },
                        ],
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? wt("toasts.automationFailed"));
                    toast.success(wt("toasts.automationCreated"));
                    setAutomationName("");
                  })
                }
                className="rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
              >
                {wt("growth.automation.createNurtureFlow")}
              </button>
            </div>
            <textarea
              className={cn(dashboardTextareaClass, "min-h-[80px]")}
              readOnly
              value={wt("growth.automation.eventsEndpoint")}
            />
            <ul className="space-y-2">
              {data.automations.map((auto) => (
                <li
                  key={auto.id}
                  className="flex justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                >
                  <span>
                    {wt("growth.automation.automationRow", { name: auto.name, trigger: auto.trigger_event })}
                  </span>
                  <span>
                    {wt("growth.automation.automationStats", { status: auto.status, steps: auto.steps?.length ?? 0 })}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/40">
              {wt("growth.automation.segmentsSummary", {
                segments: data.segments.length,
                experiments: data.analytics.experimentsRunning,
              })}
            </p>
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}
