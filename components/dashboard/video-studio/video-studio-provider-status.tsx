"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Film, Mic, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";

type HealthPayload = {
  readyForProduction?: boolean;
  klingConfigured?: boolean;
  fullRenderProvider?: string;
  avatarProvider?: string;
  strictMode?: boolean;
  ffmpeg?: { available?: boolean; version?: string };
  tts?: { configured?: boolean; provider?: string };
  providerHealth?: {
    fullRenderReady?: boolean;
    avatarRenderReady?: boolean;
    providers?: Array<{
      id: string;
      label: string;
      role: string;
      configured: boolean;
      ready: boolean;
      message: string;
    }>;
    blockers?: string[];
    warnings?: string[];
  };
  blockers?: string[];
  warnings?: string[];
};

type Props = {
  className?: string;
  compact?: boolean;
};

export function VideoStudioProviderStatus({ className, compact }: Props) {
  const p = useProductT("videoStudio");
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/video-studio/health");
        if (res.ok) setHealth(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <p className={cn("text-xs text-white/40", className)}>
        {p("providerStatus.checking")}
      </p>
    );
  }

  if (!health) {
    return (
      <p className={cn("text-xs text-amber-400/80", className)}>
        {p("providerStatus.healthUnavailable")}
      </p>
    );
  }

  const klingReady = health.providerHealth?.fullRenderReady ?? health.klingConfigured;
  const avatarReady = health.providerHealth?.avatarRenderReady ?? false;
  const ffmpegOk = health.ffmpeg?.available;
  const ttsOk = health.tts?.configured;

  const items = [
    {
      icon: Sparkles,
      label: p("providerStatus.fullRender"),
      value: health.fullRenderProvider || "preview",
      ok: klingReady || health.fullRenderProvider === "kling",
      hint: klingReady
        ? p("providerStatus.klingReady")
        : p("providerStatus.klingMissing"),
    },
    {
      icon: Film,
      label: p("providerStatus.avatar"),
      value: health.avatarProvider || "heygen",
      ok: avatarReady,
      hint: avatarReady
        ? p("providerStatus.heygenReady")
        : p("providerStatus.heygenMissing"),
    },
    {
      icon: Mic,
      label: p("providerStatus.voice"),
      value: health.tts?.provider || "preview",
      ok: Boolean(ttsOk),
      hint: ttsOk ? p("providerStatus.ttsReady") : p("providerStatus.ttsMissing"),
    },
    {
      icon: Shield,
      label: p("providerStatus.strict"),
      value: health.strictMode ? p("providerStatus.on") : p("providerStatus.off"),
      ok: Boolean(health.strictMode),
      hint: health.strictMode
        ? p("providerStatus.strictOn")
        : p("providerStatus.strictOff"),
    },
  ];

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2 text-[11px]", className)}>
        {items.map((item) => (
          <span
            key={item.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
              item.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-200",
            )}
            title={item.hint}
          >
            {item.ok ? (
              <CheckCircle2 className="size-3 shrink-0" />
            ) : (
              <AlertCircle className="size-3 shrink-0" />
            )}
            {item.label}: {item.value}
          </span>
        ))}
        {ffmpegOk ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-white/50">
            FFmpeg ✓
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{p("providerStatus.title")}</h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            health.readyForProduction
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/20 text-amber-200",
          )}
        >
          {health.readyForProduction
            ? p("providerStatus.productionReady")
            : p("providerStatus.setupRequired")}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2"
          >
            <item.icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                item.ok ? "text-emerald-400" : "text-amber-400",
              )}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white">{item.label}</p>
              <p className="text-[11px] text-white/45">{item.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {health.ffmpeg?.available ? (
        <p className="text-[11px] text-white/35">
          {p("management.ffmpegReady", {
            version: health.ffmpeg.version || "ok",
          })}
        </p>
      ) : (
        <p className="text-[11px] text-amber-400/80">{p("management.ffmpegMissing")}</p>
      )}

      {(health.blockers?.length || health.warnings?.length) ? (
        <ul className="space-y-1 text-[11px] text-white/40">
          {health.blockers?.map((b) => (
            <li key={b} className="text-red-300/90">
              {b}
            </li>
          ))}
          {health.warnings?.slice(0, 4).map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function useVideoStudioFullRenderReady(): {
  loading: boolean;
  canFullRender: boolean;
  message: string;
} {
  const p = useProductT("videoStudio");
  const [state, setState] = useState({
    loading: true,
    canFullRender: false,
    message: "",
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/video-studio/health");
        const json = res.ok ? await res.json() : null;
        const klingReady =
          json?.providerHealth?.fullRenderReady ?? json?.klingConfigured;
        setState({
          loading: false,
          canFullRender: Boolean(klingReady),
          message: klingReady
            ? ""
            : p("providerStatus.fullRenderBlocked"),
        });
      } catch {
        setState({
          loading: false,
          canFullRender: false,
          message: p("providerStatus.healthUnavailable"),
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  return state;
}
