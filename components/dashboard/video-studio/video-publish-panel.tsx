"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Code2, Copy, ExternalLink, Globe, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/dashboard/ui/dashboard-card";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import {
  videoPublishUiFromApi,
  type VideoPublishUiState,
} from "@/lib/ai-core/video-production-platform/publish/ui-state";

type Props = {
  generationId: string;
  title: string;
  domainState?: string | null;
  hasPlayableComposite: boolean;
  onPublicationChange?: () => void;
};

const emptyState: VideoPublishUiState = {
  published: false,
  publicUrl: null,
  publicPath: null,
  embedHtml: null,
};

export function VideoPublishPanel({
  generationId,
  title,
  domainState,
  hasPlayableComposite,
  onPublicationChange,
}: Props) {
  const p = useProductT("videoStudio");
  const [state, setState] = useState<VideoPublishUiState>(emptyState);
  const [busy, setBusy] = useState<"publish" | "unpublish" | "hydrate" | null>(null);

  const applyPayload = useCallback((json: Record<string, unknown>) => {
    const publication =
      json.publication && typeof json.publication === "object"
        ? (json.publication as { status?: string; slug?: string; title?: string })
        : null;
    setState(
      videoPublishUiFromApi(
        {
          publicUrl: typeof json.publicUrl === "string" ? json.publicUrl : null,
          publicPath: typeof json.publicPath === "string" ? json.publicPath : null,
          publication,
        },
        window.location.origin,
      ),
    );
  }, []);

  const runPublish = useCallback(
    async (silent: boolean) => {
      setBusy(silent ? "hydrate" : "publish");
      try {
        const res = await fetch(`/api/video-studio/projects/${generationId}/publish`, {
          method: "POST",
        });
        const json = (await res.json()) as Record<string, unknown>;
        if (!res.ok) {
          if (!silent) {
            toast.error(typeof json.error === "string" ? json.error : p("management.publishFailed"));
          }
          return false;
        }
        applyPayload(json);
        if (!silent) {
          toast.success(typeof json.message === "string" ? json.message : p("management.published"));
        }
        onPublicationChange?.();
        return true;
      } catch {
        if (!silent) toast.error(p("management.publishFailed"));
        return false;
      } finally {
        setBusy(null);
      }
    },
    [applyPayload, generationId, onPublicationChange, p],
  );

  useEffect(() => {
    if (domainState !== "published") {
      setState(emptyState);
      return;
    }
    void runPublish(true);
  }, [domainState, generationId, runPublish]);

  const unpublish = useCallback(async () => {
    setBusy("unpublish");
    try {
      const res = await fetch(`/api/video-studio/projects/${generationId}/unpublish`, {
        method: "POST",
      });
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        toast.error(typeof json.error === "string" ? json.error : p("management.unpublishFailed"));
        return;
      }
      applyPayload(json);
      toast.success(typeof json.message === "string" ? json.message : p("management.unpublished"));
      onPublicationChange?.();
    } catch {
      toast.error(p("management.unpublishFailed"));
    } finally {
      setBusy(null);
    }
  }, [applyPayload, generationId, onPublicationChange, p]);

  const copy = async (value: string, successKey: "linkCopied" | "embedCopied") => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(p(`management.${successKey}`));
    } catch {
      toast.error(p("errors.requestFailed"));
    }
  };

  const canPublish =
    hasPlayableComposite || domainState === "video_rendered" || domainState === "published";
  const publicUrl = state.publicUrl;
  const actionBusy = Boolean(busy);
  const hydrating = busy === "hydrate";

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>{p("management.publishTitle")}</DashboardCardTitle>
        <DashboardCardDescription>{p("management.publishDescription")}</DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        {hydrating ? (
          <p className="flex items-center gap-2 text-sm text-white/50">
            <Loader2 className="size-4 animate-spin" />
            {p("management.hydrating")}
          </p>
        ) : null}
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">
          {state.published ? p("management.publishedStatus") : p("management.notPublished")}
        </p>
        {!canPublish ? (
          <p className="text-sm text-amber-200/80">{p("management.publishRequiresRender")}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            className="btn-gold rounded-xl font-bold text-luxury-black"
            disabled={actionBusy || !canPublish || state.published}
            onClick={() => void runPublish(false)}
          >
            <Globe className="mr-2 size-4" />
            {busy === "publish" ? p("management.publishing") : p("actions.publish")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={actionBusy || !state.published}
            onClick={() => void unpublish()}
          >
            {busy === "unpublish" ? p("management.unpublishing") : p("management.unpublishAction")}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={actionBusy || !publicUrl}
            onClick={() => {
              if (!publicUrl) return;
              window.open(publicUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink className="mr-2 size-4" />
            {p("management.previewPublic")}
          </Button>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">{p("management.publicLink")}</label>
          <div className="flex flex-wrap gap-2">
            <Input
              readOnly
              value={publicUrl || p("management.notPublished")}
              className={dashboardInputClass}
              aria-label={p("management.publicLink")}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={!publicUrl}
              onClick={() => publicUrl && void copy(publicUrl, "linkCopied")}
            >
              <Copy className="mr-2 size-4" />
              {p("management.copyPublicLink")}
            </Button>
            {publicUrl ? (
              <Button asChild variant="outline" className="rounded-xl border-white/10">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <Link2 className="mr-2 size-4" />
                  {title}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">{p("management.embedCode")}</label>
          <textarea
            readOnly
            rows={3}
            value={state.embedHtml || ""}
            placeholder={p("management.embedPlaceholder")}
            className={`${dashboardInputClass} min-h-[88px] resize-none font-mono text-[11px]`}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-2 rounded-xl border-white/10"
            disabled={!state.embedHtml}
            onClick={() => state.embedHtml && void copy(state.embedHtml, "embedCopied")}
          >
            <Code2 className="mr-2 size-4" />
            {p("management.copyEmbed")}
          </Button>
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
