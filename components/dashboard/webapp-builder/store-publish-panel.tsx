"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Download, ExternalLink, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import { isStoreSuitableProductionUrl } from "@/lib/webapp/store-publish";

type StoreTarget = "google" | "apple";

type StorePublishPanelProps = {
  appName: string;
  busy?: boolean;
  productionUrl?: string | null;
  previewHostUrl?: string | null;
  runtimeHostStatus?: string | null;
  onDeployProduction: () => void | Promise<void>;
  onDownloadZip: () => void | Promise<void>;
  onSyncPackaging: () => void | Promise<string | void>;
  onRegisterRuntimeHost: (url: string) => void | Promise<void>;
  onClearRuntimeHost: () => void | Promise<void>;
};

const GOOGLE_COMMANDS = [
  "cd mobile-store",
  "npm install",
  "npm run android:twa:init",
  "npm run android:twa:build",
];

const APPLE_COMMANDS = [
  "cd mobile-store",
  "npm install",
  "npm run cap:init",
  "npm run cap:add:ios",
  "npm run cap:sync",
  "npm run cap:open:ios",
];

export function StorePublishPanel({
  appName,
  busy = false,
  productionUrl,
  previewHostUrl,
  runtimeHostStatus,
  onDeployProduction,
  onDownloadZip,
  onSyncPackaging,
  onRegisterRuntimeHost,
  onClearRuntimeHost,
}: StorePublishPanelProps) {
  const p = useProductT("webappBuilder");
  const [target, setTarget] = useState<StoreTarget>("google");
  const [runtimeUrlDraft, setRuntimeUrlDraft] = useState(productionUrl ?? "");
  const [packagingNotes, setPackagingNotes] = useState<string[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>({
    deploy: false,
    download: false,
    icons: false,
    build: false,
    submit: false,
  });

  const urlSuitable = isStoreSuitableProductionUrl(productionUrl);
  const hasPreviewHost =
    Boolean(previewHostUrl) && /\/w\/app\//i.test(String(previewHostUrl));

  useEffect(() => {
    setRuntimeUrlDraft(productionUrl ?? "");
    if (isStoreSuitableProductionUrl(productionUrl)) {
      setDone((prev) => ({ ...prev, deploy: true }));
    }
  }, [productionUrl]);

  const steps = useMemo(
    () => [
      { id: "deploy", label: p("management.mobileStores.stepDeploy") },
      { id: "download", label: p("management.mobileStores.stepDownload") },
      { id: "icons", label: p("management.mobileStores.stepIcons") },
      { id: "build", label: p("management.mobileStores.stepBuild") },
      { id: "submit", label: p("management.mobileStores.stepSubmit") },
    ],
    [p],
  );

  const commands = target === "google" ? GOOGLE_COMMANDS : APPLE_COMMANDS;
  const commandBlock = commands.join("\n");
  const completedCount = Object.values(done).filter(Boolean).length;

  const toggleStep = (id: string) => {
    if (id === "deploy" && !urlSuitable) {
      toast.error(p("management.mobileStores.productionUrlNotSuitableToast"));
      return;
    }
    if (id === "build" && !done.download) {
      toast.error(p("management.mobileStores.downloadRequiredToast"));
      return;
    }
    if (id === "submit" && (!done.download || !done.build)) {
      toast.error(p("management.mobileStores.submitBlockedToast"));
      return;
    }
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyCommands = async () => {
    if (!done.download) {
      toast.error(p("management.mobileStores.downloadRequiredToast"));
      return;
    }
    try {
      await navigator.clipboard.writeText(commandBlock);
      toast.success(p("management.mobileStores.commandsCopied"));
      setDone((prev) => ({ ...prev, build: true }));
    } catch {
      toast.error(p("management.mobileStores.copyFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-premium-gold/15 text-premium-gold-light">
              <Store className="size-5" aria-hidden />
            </div>
            <div>
              <DashboardCardTitle>{p("management.mobileStores.publishTitle")}</DashboardCardTitle>
              <DashboardCardDescription>
                {p("management.mobileStores.publishDescription", { appName })}
              </DashboardCardDescription>
            </div>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTarget("google")}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                target === "google"
                  ? "bg-premium-gold/15 text-premium-gold-light"
                  : "border border-white/10 text-white/55 hover:bg-white/5",
              )}
            >
              {p("management.mobileStores.googlePlay")}
            </button>
            <button
              type="button"
              onClick={() => setTarget("apple")}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                target === "apple"
                  ? "bg-premium-gold/15 text-premium-gold-light"
                  : "border border-white/10 text-white/55 hover:bg-white/5",
              )}
            >
              {p("management.mobileStores.appStore")}
            </button>
          </div>

          <p className="text-sm text-white/60">
            {target === "google"
              ? p("management.mobileStores.googlePlayHint")
              : p("management.mobileStores.appStoreHint")}
          </p>

          <div
            className={cn(
              "rounded-xl border px-3 py-3 text-xs",
              urlSuitable
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                : "border-amber-500/30 bg-amber-500/10 text-amber-100",
            )}
          >
            <div className="flex items-start gap-2">
              {!urlSuitable ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              ) : (
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
              )}
              <div className="space-y-1">
                {urlSuitable ? (
                  <p>
                    {p("management.mobileStores.productionUrlSuitable")}{" "}
                    <a
                      href={productionUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:underline"
                    >
                      {productionUrl}
                    </a>
                    {runtimeHostStatus ? (
                      <span className="text-white/50"> · {runtimeHostStatus}</span>
                    ) : null}
                  </p>
                ) : hasPreviewHost ? (
                  <p>{p("management.mobileStores.productionUrlNotSuitable")}</p>
                ) : (
                  <p>{p("management.mobileStores.productionUrlMissing")}</p>
                )}
                {!urlSuitable ? (
                  <p className="text-white/55">{p("management.mobileStores.storeHostRequirement")}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="text-sm font-medium text-white/80">
              {p("management.mobileStores.registerHostTitle")}
            </p>
            <p className="text-xs text-white/45">
              {p("management.mobileStores.registerHostHint")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                value={runtimeUrlDraft}
                onChange={(e) => setRuntimeUrlDraft(e.target.value)}
                placeholder="https://app.yourdomain.com"
                className="h-10 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30"
                disabled={busy}
              />
              <Button
                className="btn-gold rounded-xl font-bold text-luxury-black"
                disabled={busy || !runtimeUrlDraft.trim()}
                onClick={async () => {
                  await onRegisterRuntimeHost(runtimeUrlDraft.trim());
                  if (isStoreSuitableProductionUrl(runtimeUrlDraft.trim())) {
                    setDone((prev) => ({ ...prev, deploy: true }));
                  }
                }}
              >
                {p("management.mobileStores.registerHost")}
              </Button>
              {productionUrl && urlSuitable ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-white/10"
                  disabled={busy}
                  onClick={async () => {
                    await onClearRuntimeHost();
                    setRuntimeUrlDraft("");
                    setDone((prev) => ({ ...prev, deploy: false }));
                  }}
                >
                  {p("management.mobileStores.clearHost")}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={async () => {
                await onDeployProduction();
                // Platform deploy publishes /w/app preview — do not mark store-ready.
                setDone((prev) => ({ ...prev, deploy: false }));
                toast.message(p("management.mobileStores.previewHostDeployedHint"));
              }}
            >
              {p("management.deployProduction")}
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-white/10"
              disabled={busy}
              onClick={async () => {
                await onDownloadZip();
                setDone((prev) => ({ ...prev, download: true }));
              }}
            >
              <Download className="size-4" aria-hidden />
              {p("management.downloadZip")}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={busy}
              onClick={async () => {
                const message = await onSyncPackaging();
                const notes =
                  typeof message === "string"
                    ? message
                        .split(/(?<=\.)\s+/)
                        .map((part) => part.trim())
                        .filter(Boolean)
                    : [];
                setPackagingNotes(notes);
                toast.success(p("management.mobileStores.packagingRefreshed"));
              }}
            >
              {p("management.mobileStores.syncPackaging")}
            </Button>
            <Button asChild variant="outline" className="gap-2 rounded-xl border-white/10">
              <a
                href={
                  target === "google"
                    ? "https://play.google.com/console"
                    : "https://appstoreconnect.apple.com"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" aria-hidden />
                {target === "google"
                  ? p("management.mobileStores.openPlayConsole")
                  : p("management.mobileStores.openAppStoreConnect")}
              </a>
            </Button>
          </div>

          {packagingNotes.length > 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3">
              <p className="mb-2 text-sm font-medium text-white/80">
                {p("management.mobileStores.packagingHealthTitle")}
              </p>
              <ul className="list-disc space-y-1 ps-4 text-xs text-white/55">
                {packagingNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </DashboardCardContent>
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>{p("management.mobileStores.checklistTitle")}</DashboardCardTitle>
            <DashboardCardDescription>
              {p("management.mobileStores.checklistProgress", {
                done: completedCount,
                total: steps.length,
              })}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {steps.map((step, index) => {
              const checked = Boolean(done[step.id]);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-start transition-all",
                    checked
                      ? "border-premium-gold/30 bg-premium-gold/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                      checked
                        ? "border-premium-gold/50 bg-premium-gold/20 text-premium-gold-light"
                        : "border-white/20 text-white/40",
                    )}
                  >
                    {checked ? <Check className="size-3" aria-hidden /> : index + 1}
                  </span>
                  <span className={cn("text-sm", checked ? "text-white" : "text-white/65")}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>
              {target === "google"
                ? p("management.mobileStores.googleCommandsTitle")
                : p("management.mobileStores.appleCommandsTitle")}
            </DashboardCardTitle>
            <DashboardCardDescription>
              {p("management.mobileStores.commandsHint")}
            </DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-3">
            <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-6 text-white/75">
              <code>{commandBlock}</code>
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-white/10"
                onClick={() => void copyCommands()}
              >
                <Copy className="size-4" aria-hidden />
                {p("management.mobileStores.copyCommands")}
              </Button>
            </div>
            <p className="text-xs text-white/40">
              {p("management.mobileStores.guideFiles")}{" "}
              <code className="text-white/60">
                {target === "google"
                  ? "mobile-store/GOOGLE_PLAY.md"
                  : "mobile-store/APPLE_APP_STORE.md"}
              </code>
            </p>
            <p className="text-xs text-white/40">
              {p("management.mobileStores.setHostInConfig")}{" "}
              <code className="text-white/60">
                {target === "google"
                  ? "mobile-store/twa-manifest.json"
                  : "mobile-store/capacitor.config.ts"}
              </code>
            </p>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
