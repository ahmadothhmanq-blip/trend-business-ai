"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FlaskConical,
  Loader2,
  Plus,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  ExperimentChangeType,
  ExperimentResults,
  WebsiteExperiment,
} from "@/lib/ai-core/ab-testing";

type ExperimentsResponse = {
  experiments: WebsiteExperiment[];
  results: ExperimentResults[];
  count: number;
};

const CHANGE_TYPES: ExperimentChangeType[] = [
  "headline",
  "image",
  "button",
  "layout",
  "color",
  "pricing",
  "section",
  "page",
];

export function ExperimentsPanel(props: { generationId: string | null }) {
  const [data, setData] = useState<ExperimentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!props.generationId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/experiments`,
      );
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Failed to load experiments");
      }
      setData((await res.json()) as ExperimentsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [props.generationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (
    experimentId: string,
    status: WebsiteExperiment["status"],
  ) => {
    if (!props.generationId) return;
    setBusyId(experimentId);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/experiments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "status",
            experimentId,
            status,
          }),
        },
      );
      if (!res.ok) throw new Error("Status update failed");
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const evaluate = async (experimentId: string) => {
    if (!props.generationId) return;
    setBusyId(experimentId);
    try {
      await fetch(`/api/website-builder/${props.generationId}/experiments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate", experimentId }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (!props.generationId) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-white/40">
        Generate or select a website to run A/B experiments.
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex h-[420px] items-center justify-center gap-2 text-white/40">
        <Loader2 className="size-4 animate-spin" />
        Loading experiments…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-red-400/80">
        {error}
      </div>
    );
  }

  const resultsById = new Map(
    (data?.results ?? []).map((r) => [r.experiment.id, r]),
  );

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-premium-gold/25 bg-premium-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-premium-gold">
            <FlaskConical className="size-3" />
            A/B Testing
          </div>
          <h3 className="text-lg font-bold text-white">Experiments</h3>
          <p className="mt-1 max-w-2xl text-[12px] text-white/40">
            Create Variant A / Variant B, duplicate sections, split traffic, and
            automatically declare winning variants by conversion rate.
          </p>
        </div>
        <Button
          className="bg-premium-gold text-black hover:bg-premium-gold/90"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          New experiment
        </Button>
      </div>

      {!data?.experiments.length ? (
        <DashboardPanel className="p-8 text-center text-sm text-white/40">
          No experiments yet. Create Variant A and B to start optimizing.
        </DashboardPanel>
      ) : (
        <div className="space-y-4">
          {data.experiments.map((exp) => {
            const results = resultsById.get(exp.id);
            return (
              <DashboardPanel key={exp.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-[15px] font-bold text-white">
                        {exp.name}
                      </h4>
                      <StatusPill status={exp.status} />
                      {exp.winnerVariantId ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-premium-gold/20 px-2 py-0.5 text-[10px] font-semibold text-premium-gold">
                          <Trophy className="size-3" />
                          Winner declared
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[12px] text-white/45">
                      {exp.hypothesis || "No hypothesis set"}
                    </p>
                    <p className="mt-1 text-[11px] text-white/30">
                      Testing: {exp.changeTypes.join(" · ") || "general"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exp.status === "draft" || exp.status === "paused" ? (
                      <Button
                        size="sm"
                        className="bg-premium-gold text-black"
                        disabled={busyId === exp.id}
                        onClick={() => void setStatus(exp.id, "running")}
                      >
                        Start
                      </Button>
                    ) : null}
                    {exp.status === "running" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 text-white"
                          disabled={busyId === exp.id}
                          onClick={() => void evaluate(exp.id)}
                        >
                          Check winner
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15 text-white"
                          disabled={busyId === exp.id}
                          onClick={() => void setStatus(exp.id, "paused")}
                        >
                          Pause
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {exp.variants.map((v) => {
                    const rate =
                      results?.conversionRates.find(
                        (r) => r.variantId === v.id,
                      )?.conversionRate ??
                      (v.impressions
                        ? Math.round((v.conversions / v.impressions) * 1000) /
                          10
                        : 0);
                    const isWinner = exp.winnerVariantId === v.id;
                    return (
                      <div
                        key={v.id}
                        className={cn(
                          "rounded-lg border px-3 py-3",
                          isWinner
                            ? "border-premium-gold/40 bg-premium-gold/10"
                            : "border-white/10 bg-white/[0.03]",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold text-white">
                            Variant {v.key} · {v.name}
                          </p>
                          <span className="text-[11px] text-white/40">
                            {v.weight}% traffic
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                          <div>
                            <p className="text-white/35">Impressions</p>
                            <p className="font-semibold text-white">
                              {v.impressions}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/35">Conversions</p>
                            <p className="font-semibold text-white">
                              {v.conversions}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/35">CR</p>
                            <p className="font-semibold text-premium-gold">
                              {rate}%
                            </p>
                          </div>
                        </div>
                        <ul className="mt-3 space-y-1 text-[11px] text-white/45">
                          {v.changes.slice(0, 4).map((c, i) => (
                            <li key={`${c.type}-${i}`}>
                              · {c.type} / {c.target}: {c.variantValue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {results ? (
                  <p className="mt-3 text-[12px] text-white/50">
                    {results.summary}
                    {results.liftPercent != null
                      ? ` · Lift ${results.liftPercent > 0 ? "+" : ""}${results.liftPercent}%`
                      : ""}
                  </p>
                ) : null}
              </DashboardPanel>
            );
          })}
        </div>
      )}

      <CreateExperimentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        generationId={props.generationId}
        onCreated={() => {
          setCreateOpen(false);
          void load();
        }}
      />
    </div>
  );
}

function StatusPill(props: { status: WebsiteExperiment["status"] }) {
  return (
    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
      {props.status}
    </span>
  );
}

function CreateExperimentDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generationId: string;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Hero headline & CTA test");
  const [hypothesis, setHypothesis] = useState(
    "A clearer outcome-led CTA will beat the control on conversions.",
  );
  const [changeType, setChangeType] =
    useState<ExperimentChangeType>("headline");
  const [target, setTarget] = useState("hero");
  const [controlValue, setControlValue] = useState("Original headline");
  const [variantValue, setVariantValue] = useState(
    "Grow faster with a conversion-ready website",
  );
  const [buttonControl, setButtonControl] = useState("Get started");
  const [buttonVariant, setButtonVariant] = useState("Book a free consult");

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/website-builder/${props.generationId}/experiments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            hypothesis,
            changeTypes: [changeType, "button"],
            variantA: {
              name: "Control (A)",
              weight: 50,
              changes: [
                {
                  type: changeType,
                  target,
                  controlValue,
                  variantValue: controlValue,
                },
                {
                  type: "button",
                  target: "hero-cta",
                  controlValue: buttonControl,
                  variantValue: buttonControl,
                },
              ],
            },
            variantB: {
              name: "Challenger (B)",
              weight: 50,
              changes: [
                {
                  type: changeType,
                  target,
                  controlValue,
                  variantValue,
                },
                {
                  type: "button",
                  target: "hero-cta",
                  controlValue: buttonControl,
                  variantValue: buttonVariant,
                },
              ],
            },
            start: true,
          }),
        },
      );
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Create failed");
      }
      props.onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0c0c0c] text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create A/B experiment</DialogTitle>
          <DialogDescription className="text-white/45">
            Duplicate a section into Variant A (control) and Variant B
            (challenger). Traffic splits 50/50 by default.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Experiment name"
            className="border-white/10 bg-white/5 text-white"
          />
          <Textarea
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="Hypothesis"
            className="min-h-[72px] border-white/10 bg-white/5 text-white"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={changeType}
              onChange={(e) =>
                setChangeType(e.target.value as ExperimentChangeType)
              }
              className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white"
            >
              {CHANGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Target section (e.g. hero, pricing)"
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <Input
            value={controlValue}
            onChange={(e) => setControlValue(e.target.value)}
            placeholder="Variant A (control) value"
            className="border-white/10 bg-white/5 text-white"
          />
          <Input
            value={variantValue}
            onChange={(e) => setVariantValue(e.target.value)}
            placeholder="Variant B value"
            className="border-white/10 bg-white/5 text-white"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={buttonControl}
              onChange={(e) => setButtonControl(e.target.value)}
              placeholder="Button A"
              className="border-white/10 bg-white/5 text-white"
            />
            <Input
              value={buttonVariant}
              onChange={(e) => setButtonVariant(e.target.value)}
              placeholder="Button B"
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          {error ? <p className="text-[12px] text-red-400">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-white/15 text-white"
            onClick={() => props.onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-premium-gold text-black"
            disabled={saving || name.trim().length < 3}
            onClick={() => void submit()}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Start experiment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
