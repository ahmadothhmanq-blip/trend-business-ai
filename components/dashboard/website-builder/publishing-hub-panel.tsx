"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  resolvePublishingChecklist,
  runBuilderAccessibilityHeuristics,
} from "@/lib/website/builder";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type PublishingHubPanelProps = {
  capabilityService: WebsiteCapabilityService;
  files: GeneratedProjectFile[];
  disabled?: boolean;
  onOpenDeploy?: () => void;
  onBackup?: () => void;
  backingUp?: boolean;
};

export function PublishingHubPanel({
  capabilityService,
  files,
  disabled,
  onOpenDeploy,
  onBackup,
  backingUp,
}: PublishingHubPanelProps) {
  const { wb } = useBuilderLocale();
  const a11yIssues = useMemo(
    () => runBuilderAccessibilityHeuristics(files),
    [files],
  );

  const checklist = useMemo(
    () => resolvePublishingChecklist(capabilityService),
    [capabilityService],
  );

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {wb("builder.publishing.title")}
      </p>
      <ul className="space-y-2">
        {checklist.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <p className="text-xs font-medium text-white">
              {wb(`builder.publishingItems.${item.id}.label`)}
              {item.required ? (
                <span className="ms-1 text-[10px] text-amber-300">
                  {wb("builder.publishing.required")}
                </span>
              ) : null}
            </p>
            <p className="text-[10px] text-white/45">
              {wb(`builder.publishingItems.${item.id}.description`)}
            </p>
          </li>
        ))}
      </ul>
      {a11yIssues.length > 0 ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-3">
          <p className="text-xs font-medium text-amber-200">
            {wb("builder.publishing.accessibility", { count: a11yIssues.length })}
          </p>
          <ul className="mt-2 space-y-1">
            {a11yIssues.slice(0, 5).map((issue) => (
              <li key={issue.id} className="text-[10px] text-amber-100/80">
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-emerald-400/80">{wb("builder.publishing.noA11yIssues")}</p>
      )}
      <div className="flex flex-col gap-2">
        {onOpenDeploy ? (
          <Button
            type="button"
            disabled={disabled}
            onClick={onOpenDeploy}
            className="btn-ghost-gold h-9 rounded-xl text-xs"
          >
            {wb("builder.publishing.openDeploy")}
          </Button>
        ) : null}
        {onBackup ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled || backingUp}
            onClick={onBackup}
            className="h-9 rounded-xl border-white/15 text-xs text-white"
          >
            {backingUp ? wb("builder.publishing.backingUp") : wb("builder.publishing.backup")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
