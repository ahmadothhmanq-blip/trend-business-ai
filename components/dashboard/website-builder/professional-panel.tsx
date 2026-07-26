"use client";

import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROFESSIONAL_FEATURES } from "@/lib/website/builder";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type ProfessionalPanelProps = {
  managementHref: string;
  disabled?: boolean;
  onCopilotCommand: (command: string) => void;
};

export function ProfessionalPanel({
  managementHref,
  disabled,
  onCopilotCommand,
}: ProfessionalPanelProps) {
  const { wb } = useBuilderLocale();

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        {wb("builder.professional.title")}
      </p>
      <ul className="space-y-2">
        {PROFESSIONAL_FEATURES.map((feature) => (
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
              {feature.managementTab ? (
                <Link
                  href={`${managementHref}?tab=${feature.managementTab}`}
                  className="inline-flex items-center gap-1 text-[10px] text-premium-gold hover:underline"
                >
                  {wb("builder.professional.openManagement")}
                  <ExternalLink className="size-3" aria-hidden />
                </Link>
              ) : null}
              {feature.copilotCommand ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onCopilotCommand(feature.copilotCommand!)}
                  className="h-7 bg-premium-gold/15 text-[10px] text-premium-gold-light"
                >
                  <Sparkles className="size-3" aria-hidden />
                  {wb("builder.professional.runCopilot")}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
