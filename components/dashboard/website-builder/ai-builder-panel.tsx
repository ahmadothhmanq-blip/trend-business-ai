"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_BUILDER_ACTIONS } from "@/lib/website/builder";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type AiBuilderPanelProps = {
  disabled?: boolean;
  loading?: boolean;
  streamMessage?: string | null;
  onRun: (command: string, useStream?: boolean) => void;
};

const ACTION_I18N_IDS: Record<string, string> = {
  "full-modernize": "fullModernize",
  "page-about": "pageAbout",
  "section-testimonials": "sectionTestimonials",
  "section-hero": "sectionHero",
  "content-home": "contentHome",
  "images-fresh": "imagesFresh",
  "seo-improve": "seoImprove",
};

export function AiBuilderPanel({
  disabled,
  loading,
  streamMessage,
  onRun,
}: AiBuilderPanelProps) {
  const { wb } = useBuilderLocale();

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {wb("builder.ai.title")}
      </p>
      <p className="text-xs text-white/50">{wb("builder.ai.subtitle")}</p>
      {streamMessage ? (
        <p
          className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-[10px] text-white/55"
          role="status"
        >
          {streamMessage}
        </p>
      ) : null}
      <ul className="space-y-2">
        {AI_BUILDER_ACTIONS.map((action) => {
          const i18nId = ACTION_I18N_IDS[action.id] ?? action.id;
          return (
            <li key={action.id}>
              <Button
                type="button"
                disabled={disabled || loading}
                onClick={() => onRun(action.command, action.useStream)}
                className="h-auto w-full flex-col items-start gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-start hover:border-premium-gold/30"
                variant="ghost"
              >
                <span className="flex w-full items-center gap-2 text-xs font-medium text-white">
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Sparkles className="size-3.5 text-premium-gold" aria-hidden />
                  )}
                  {wb(`builder.ai.${i18nId}.label`)}
                </span>
                <span className="text-[10px] text-white/45">
                  {wb(`builder.ai.${i18nId}.description`)}
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
