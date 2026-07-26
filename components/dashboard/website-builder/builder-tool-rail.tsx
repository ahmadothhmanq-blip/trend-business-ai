"use client";

import {
  Blocks,
  Briefcase,
  Layers,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";

export type BuilderToolId =
  | "structure"
  | "design"
  | "blocks"
  | "ai"
  | "professional"
  | "business"
  | "publish"
  | "enterprise";

const TOOLS: Array<{
  id: BuilderToolId;
  labelKey: string;
  icon: typeof Layers;
}> = [
  { id: "structure", labelKey: "structure", icon: Layers },
  { id: "design", labelKey: "design", icon: Palette },
  { id: "blocks", labelKey: "blocks", icon: Blocks },
  { id: "ai", labelKey: "ai", icon: Wand2 },
  { id: "professional", labelKey: "professional", icon: Sparkles },
  { id: "business", labelKey: "business", icon: Briefcase },
  { id: "publish", labelKey: "publish", icon: Rocket },
  { id: "enterprise", labelKey: "enterprise", icon: Shield },
];

type BuilderToolRailProps = {
  active: BuilderToolId;
  onChange: (tool: BuilderToolId) => void;
};

export function BuilderToolRail({ active, onChange }: BuilderToolRailProps) {
  const { wb } = useBuilderLocale();

  return (
    <div className="flex flex-wrap gap-1 border-b border-white/[0.08] px-2 py-2">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const selected = active === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onChange(tool.id)}
            aria-pressed={selected}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition",
              selected
                ? "bg-premium-gold/15 text-premium-gold-light"
                : "text-white/45 hover:bg-white/[0.04] hover:text-white/75",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {wb(`builder.toolRail.${tool.labelKey}`)}
          </button>
        );
      })}
    </div>
  );
}
