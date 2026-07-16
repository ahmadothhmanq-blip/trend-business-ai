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

const TABS: Array<{ id: TabId; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "affiliate", label: "Affiliate", icon: Wallet },
  { id: "referrals", label: "Referrals", icon: Share2 },
  { id: "leads", label: "Leads", icon: Target },
  { id: "crm", label: "CRM", icon: Users },
  { id: "email", label: "Email", icon: Mail },
  { id: "experiments", label: "A/B Tests", icon: FlaskConical },
  { id: "automation", label: "Automation", icon: Megaphone },
];

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

function origin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export function GrowthPanel() {
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
      setError(json.error ?? "Failed to load growth dashboard");
      setData(null);
      return;
    }
    setData(json.growth as GrowthDashboardPayload);
  }, []);

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
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  async function runAction(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <DashboardPanel className="flex items-center justify-center gap-2 py-16 text-sm text-white/40">
        <Loader2 className="size-4 animate-spin" /> Loading growth engine…
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
        {TABS.map((item) => {
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
              { label: "Pageviews (30d)", value: data.analytics.pageviews },
              { label: "Conversions", value: data.analytics.conversions },
              { label: "Leads", value: data.analytics.leads },
              { label: "Subscribers", value: data.analytics.subscribers },
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
              <DashboardCardTitle>Funnel analytics</DashboardCardTitle>
              <DashboardCardDescription>Attributed growth events for your workspace</DashboardCardDescription>
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
              <DashboardCardTitle>Affiliate dashboard</DashboardCardTitle>
              <DashboardCardDescription>
                Share your link, track commissions, and review payouts.
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-4">
              {data.affiliate ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <DashboardPanel className="p-4 text-center">
                      <p className="text-xl font-black text-white">{data.affiliate.total_clicks}</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">Clicks</p>
                    </DashboardPanel>
                    <DashboardPanel className="p-4 text-center">
                      <p className="text-xl font-black text-white">{data.affiliate.total_referrals}</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">Referrals</p>
                    </DashboardPanel>
                    <DashboardPanel className="p-4 text-center">
                      <p className="text-xl font-black text-white">
                        {money(data.affiliate.total_earned_cents)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30">Earned</p>
                    </DashboardPanel>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input readOnly className={cn(dashboardInputClass, "flex-1")} value={affLink} />
                    <button
                      type="button"
                      onClick={() => copy(affLink)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
                    >
                      <Copy className="size-4" /> Copy link
                    </button>
                  </div>
                  <p className="text-xs text-white/40">
                    Code <span className="text-white/70">{data.affiliate.code}</span> · Commission{" "}
                    {(data.affiliate.commission_rate_bps / 100).toFixed(0)}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/50">Affiliate profile unavailable.</p>
              )}
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>Commission tracking</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent>
              {data.commissions.length === 0 ? (
                <p className="text-sm text-white/40">No commissions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.commissions.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                    >
                      <span>
                        {c.event_type} · {c.referral_email ?? "—"}
                      </span>
                      <span>
                        {money(c.amount_cents)} · {c.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>Payout history</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent>
              {data.payouts.length === 0 ? (
                <p className="text-sm text-white/40">No payouts yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.payouts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                    >
                      <span>
                        {money(p.amount_cents)} · {p.method}
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
            <DashboardCardTitle>Referral program</DashboardCardTitle>
            <DashboardCardDescription>
              Invite friends and earn {data.referral?.reward_credits ?? 100} credits when they join.
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
                <Copy className="size-4" /> Copy invite
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={cn(dashboardInputClass, "flex-1")}
                placeholder="friend@email.com"
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
                    if (!res.ok) throw new Error(json.error ?? "Invite failed");
                    toast.success("Invite recorded");
                    setInviteEmail("");
                  })
                }
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                {busy === "invite" ? <Loader2 className="size-4 animate-spin" /> : "Send invite"}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DashboardPanel className="p-4 text-center">
                <p className="text-xl font-black text-white">{data.referral?.total_invites ?? 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/30">Invites</p>
              </DashboardPanel>
              <DashboardPanel className="p-4 text-center">
                <p className="text-xl font-black text-white">{data.referral?.total_accepted ?? 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/30">Accepted</p>
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
                <DashboardCardTitle>Lead generation inbox</DashboardCardTitle>
                <DashboardCardDescription>
                  Scored leads from contact, newsletter, CTAs and exit intent.
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
                    if (!res.ok) throw new Error(json.error ?? "Claim failed");
                    toast.success(`Claimed ${json.claimed ?? 0} platform leads`);
                  })
                }
                className="rounded-xl bg-premium-gold px-3 py-2 text-xs font-semibold text-luxury-black"
              >
                Claim platform leads (admin)
              </button>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
            {data.leads.length === 0 ? (
              <p className="text-sm text-white/40">No leads yet. Claim platform leads or capture from the site.</p>
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
                        score {lead.score} · {lead.status} · {lead.source}
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
              <DashboardCardTitle>Contact management</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  className={dashboardInputClass}
                  placeholder="Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <input
                  className={dashboardInputClass}
                  placeholder="Name"
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
                      if (!res.ok) throw new Error(json.error ?? "Save failed");
                      toast.success("Contact saved");
                      setContactEmail("");
                      setContactName("");
                    })
                  }
                  className="rounded-xl bg-premium-gold px-3 py-2 text-sm font-semibold text-luxury-black"
                >
                  Add contact
                </button>
              </div>
              <ul className="space-y-2">
                {data.contacts.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                  >
                    <span>
                      {c.name ?? c.email} · {c.lifecycle_stage}
                    </span>
                    <span>score {c.score}</span>
                  </li>
                ))}
              </ul>
            </DashboardCardContent>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader>
              <DashboardCardTitle>Sales pipeline</DashboardCardTitle>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className={cn(dashboardInputClass, "flex-1")}
                  placeholder="Deal title"
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
                      if (!res.ok) throw new Error(json.error ?? "Deal failed");
                      toast.success("Deal created");
                      setDealTitle("");
                    })
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80"
                >
                  Add deal
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {(["new", "qualified", "proposal", "negotiation", "won", "lost"] as const).map(
                  (stage) => (
                    <DashboardPanel key={stage} className="p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                        {stage}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {data.deals
                          .filter((d) => d.stage === stage)
                          .map((d) => (
                            <li key={d.id} className="text-xs text-white/70">
                              {d.title} · {money(d.value_cents)}
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
              <DashboardCardTitle>Email campaigns</DashboardCardTitle>
              <DashboardCardDescription>
                  Draft campaigns only — connect an ESP (Resend/SendGrid) before live sends.
                  Delivery provider can be wired via env later.
              </DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className={dashboardInputClass}
                  placeholder="Campaign name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
                <input
                  className={dashboardInputClass}
                  placeholder="Subject line"
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
                        bodyText: "Thanks for following Trend Business AI.",
                        status: "draft",
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? "Campaign failed");
                    toast.success("Campaign draft created");
                    setCampaignName("");
                    setCampaignSubject("");
                  })
                }
                className="rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
              >
                Create draft campaign
              </button>
              <ul className="space-y-2">
                {data.campaigns.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                  >
                    <span>
                      {c.name} · {c.subject}
                    </span>
                    <span>
                      {c.status} · sent {c.stats?.sent ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/40">
                Subscribers in workspace: {data.subscribers.length}
              </p>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      )}

      {tab === "experiments" && (
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>A/B testing</DashboardCardTitle>
            <DashboardCardDescription>
              Landing, headline, CTA and pricing experiments.
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={cn(dashboardInputClass, "flex-1")}
                placeholder="Experiment name"
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
                        hypothesis: "Stronger CTA increases conversions",
                        status: "running",
                        variants: [
                          { id: "a", label: "Control", value: "Start free", weight: 50 },
                          { id: "b", label: "Variant", value: "Launch your AI workspace", weight: 50 },
                        ],
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? "Experiment failed");
                    toast.success("Experiment started");
                    setExperimentName("");
                  })
                }
                className="rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
              >
                Launch CTA test
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
                      {exp.name} · {exp.target_type}
                    </span>
                    <span>{exp.status}</span>
                  </div>
                  <p className="mt-1 text-white/40">{exp.hypothesis}</p>
                  <p className="mt-1">
                    impressions {exp.metrics?.impressions ?? 0} · conversions{" "}
                    {exp.metrics?.conversions ?? 0}
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
            <DashboardCardTitle>Marketing automation</DashboardCardTitle>
            <DashboardCardDescription>
              Trigger-based workflows, email sequences and segmentation hooks.
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={cn(dashboardInputClass, "flex-1")}
                placeholder="Automation name"
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
                        name: automationName || "Lead nurture sequence",
                        triggerEvent: "lead_created",
                        status: "active",
                        steps: [
                          {
                            id: "1",
                            type: "email",
                            subject: "Welcome — next steps",
                            body: "Thanks for reaching out. Here is how to get started.",
                          },
                          { id: "2", type: "wait", delayHours: 48 },
                          { id: "3", type: "score", scoreDelta: 10 },
                          { id: "4", type: "tag", tag: "nurturing" },
                        ],
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error ?? "Automation failed");
                    toast.success("Automation created");
                    setAutomationName("");
                  })
                }
                className="rounded-xl bg-premium-gold px-4 py-2 text-sm font-semibold text-luxury-black"
              >
                Create nurture flow
              </button>
            </div>
            <textarea
              className={cn(dashboardTextareaClass, "min-h-[80px]")}
              readOnly
              value="Event tracking endpoint: POST /api/growth/events — use for pageview, cta_click, signup and campaign events."
            />
            <ul className="space-y-2">
              {data.automations.map((auto) => (
                <li
                  key={auto.id}
                  className="flex justify-between rounded-xl border border-white/5 px-3 py-2 text-xs text-white/70"
                >
                  <span>
                    {auto.name} · {auto.trigger_event}
                  </span>
                  <span>
                    {auto.status} · {auto.steps?.length ?? 0} steps
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/40">
              Segments: {data.segments.length} · Running experiments:{" "}
              {data.analytics.experimentsRunning}
            </p>
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}
