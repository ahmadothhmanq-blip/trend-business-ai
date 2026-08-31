"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResolvedBuilderTool } from "@/lib/website/builder/tools/types";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type LockedToolGateProps = {
  tool: ResolvedBuilderTool;
  disabled?: boolean;
  onEnable: () => void;
};

export function LockedToolGate({ tool, disabled, onEnable }: LockedToolGateProps) {
  const { wb } = useBuilderLocale();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Lock className="size-4 text-white/45" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-white">
          {wb(`builder.toolRail.${tool.labelKey}`)}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/45">
          {wb("builder.toolRail.lockedHint")}
        </p>
      </div>
      {tool.unlockCopilotCommand ? (
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          onClick={onEnable}
          className="h-8 bg-premium-gold/15 text-[11px] text-premium-gold-light"
        >
          <Sparkles className="size-3.5" aria-hidden />
          {wb("builder.toolRail.enableFeature")}
        </Button>
      ) : null}
    </div>
  );
}
