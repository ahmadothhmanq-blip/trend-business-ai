"use client";

import { CheckCircle2, AlertTriangle, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PublishReadinessStatus =
  | "ready"
  | "needs_review"
  | "generating"
  | "failed"
  | "unknown";

export function PublishReadinessBadge({
  status,
  score,
  className,
}: {
  status: PublishReadinessStatus;
  score?: number | null;
  className?: string;
}) {
  const config = {
    ready: {
      label: "Ready to publish",
      icon: CheckCircle2,
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    },
    needs_review: {
      label: "Needs review",
      icon: AlertTriangle,
      className: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    },
    generating: {
      label: "Generating",
      icon: Clock3,
      className: "border-premium-gold/30 bg-premium-gold/10 text-premium-gold-light",
    },
    failed: {
      label: "Failed",
      icon: AlertTriangle,
      className: "border-red-400/30 bg-red-400/10 text-red-200",
    },
    unknown: {
      label: "Status unknown",
      icon: Clock3,
      className: "border-white/15 bg-white/5 text-white/50",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
      {typeof score === "number" ? (
        <span className="opacity-80">· {Math.round(score)}</span>
      ) : null}
    </span>
  );
}

export function publishStatusFromQuality(quality: unknown): {
  status: PublishReadinessStatus;
  score?: number;
} {
  if (!quality || typeof quality !== "object") {
    return { status: "unknown" };
  }
  const q = quality as {
    publishReady?: boolean;
    passed?: boolean;
    score?: number;
  };
  if (q.publishReady === true) {
    return { status: "ready", score: q.score };
  }
  if (q.passed === false || q.publishReady === false) {
    return { status: "needs_review", score: q.score };
  }
  if (typeof q.score === "number") {
    return {
      status: q.score >= 60 ? "ready" : "needs_review",
      score: q.score,
    };
  }
  return { status: "unknown" };
}
