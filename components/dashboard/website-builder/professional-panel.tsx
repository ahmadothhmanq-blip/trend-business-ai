"use client";

import { useState } from "react";
import { LayoutTemplate, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplatesPanel } from "@/components/dashboard/website-builder/templates-panel";
import { PROFESSIONAL_FEATURES } from "@/lib/website/builder";
import { filterItemsByCapabilities } from "@/lib/website/builder/capabilities/service";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";
import type { WebsiteStructureTemplateChoice } from "@/components/dashboard/website-builder/templates-panel";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

type ProfessionalPanelProps = {
  capabilityService: WebsiteCapabilityService;
  managementHref: string;
  disabled?: boolean;
  selectedVisualSkinId?: string | null;
  onCopilotCommand: (command: string) => void;
  onTemplateSelect?: (choice: WebsiteStructureTemplateChoice) => void;
};

export function ProfessionalPanel({
  capabilityService,
  managementHref,
  disabled,
  selectedVisualSkinId,
  onCopilotCommand,
  onTemplateSelect,
}: ProfessionalPanelProps) {
  const { wb } = useBuilderLocale();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const features = filterItemsByCapabilities(PROFESSIONAL_FEATURES, capabilityService);

  return (
    <>
      <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {wb("builder.professional.title")}
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
                {feature.id === "templates" ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled}
                    onClick={() => setTemplatesOpen(true)}
                    className="h-7 bg-premium-gold/15 text-[10px] text-premium-gold-light"
                  >
                    <LayoutTemplate className="size-3" aria-hidden />
                    {wb("builder.professional.browseTemplates")}
                  </Button>
                ) : null}
                {feature.managementTab ? (
                  <a
                    href={`${managementHref}?tab=${feature.managementTab}`}
                    className="inline-flex items-center gap-1 text-[10px] text-premium-gold hover:underline"
                  >
                    {wb("builder.professional.openManagement")}
                  </a>
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

      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden border-white/10 bg-[#101010] text-white">
          <DialogHeader>
            <DialogTitle>{wb("builder.professional.templatesDialogTitle")}</DialogTitle>
            <DialogDescription className="text-white/45">
              {wb("builder.professional.templatesDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto pr-1">
            <TemplatesPanel
              disabled={disabled}
              selectedId={selectedVisualSkinId}
              showHeader
              onSelect={(choice) => {
                setTemplatesOpen(false);
                if (onTemplateSelect) {
                  onTemplateSelect(choice);
                  return;
                }
                onCopilotCommand(
                  `Apply the ${choice.label} visual design to this website`,
                );
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
