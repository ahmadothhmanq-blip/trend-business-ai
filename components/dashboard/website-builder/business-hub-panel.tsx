"use client";

import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_FEATURES } from "@/lib/website/builder";
import { filterItemsByCapabilities } from "@/lib/website/builder/capabilities/service";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type BusinessHubPanelProps = {
  capabilityService: WebsiteCapabilityService;
  managementHref: string;
  disabled?: boolean;
  onOpenWorkspaceTab?: (tab: "analytics" | "experiments" | "deploy") => void;
  onCopilotCommand?: (command: string) => void;
};

export function BusinessHubPanel({
  capabilityService,
  managementHref,
  disabled,
  onOpenWorkspaceTab,
  onCopilotCommand,
}: BusinessHubPanelProps) {
  const { wb } = useBuilderLocale();
  const features = filterItemsByCapabilities(BUSINESS_FEATURES, capabilityService);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {wb("builder.business.title")}
      </p>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li
            key={feature.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <p className="text-xs font-medium text-white">
              {wb(`builder.features.${feature.id}.label`)}
            </p>
            <p className="mt-0.5 text-[10px] text-white/45">
              {wb(`builder.features.${feature.id}.description`)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {feature.workspaceTab && onOpenWorkspaceTab ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onOpenWorkspaceTab(feature.workspaceTab!)}
                  className="h-7 text-[10px]"
                  variant="outline"
                >
                  {wb("builder.business.openTab", { tab: feature.workspaceTab })}
                </Button>
              ) : null}
              {feature.href?.startsWith("management:") ? (
                <Link
                  href={`${managementHref}?tab=${feature.href.replace("management:", "")}`}
                  className="inline-flex items-center gap-1 text-[10px] text-premium-gold hover:underline"
                >
                  {wb("builder.business.manage")}
                  <ExternalLink className="size-3" aria-hidden />
                </Link>
              ) : null}
              {feature.copilotCommand && onCopilotCommand ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onCopilotCommand(feature.copilotCommand!)}
                  className="h-7 bg-premium-gold/15 text-[10px] text-premium-gold-light"
                >
                  <Sparkles className="size-3" aria-hidden />
                  {wb("builder.business.copilot")}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
