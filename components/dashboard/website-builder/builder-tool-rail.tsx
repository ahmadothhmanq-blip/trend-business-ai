"use client";

import {
  Blocks,
  Briefcase,
  ImageIcon,
  Layers,
  Lock,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuilderLocale } from "@/lib/website/builder/use-builder-locale";
import type { ResolvedBuilderTool } from "@/lib/website/builder/tools/types";
import { getLegacyBuilderTools } from "@/lib/website/builder/tools/resolve";

export type BuilderToolId =
  | "structure"
  | "design"
  | "blocks"
  | "media"
  | "ai"
  | "professional"
  | "business"
  | "publish"
  | "enterprise";

const TOOL_ICONS: Record<string, LucideIcon> = {
  Layers,
  Palette,
  Blocks,
  ImageIcon,
  Wand2,
  Sparkles,
  Briefcase,
  Rocket,
  Shield,
};

const LEGACY_TOOLS: ResolvedBuilderTool[] = getLegacyBuilderTools();

type BuilderToolRailProps = {
  active: BuilderToolId;
  onChange: (tool: BuilderToolId) => void;
  tools?: ResolvedBuilderTool[];
};

export function BuilderToolRail({ active, onChange, tools }: BuilderToolRailProps) {
  const { wb } = useBuilderLocale();
  const visibleTools = tools?.length ? tools : LEGACY_TOOLS;

  return (
    <div className="flex flex-wrap gap-1 border-b border-white/[0.08] px-2 py-2">
      {visibleTools.map((tool) => {
        const Icon = TOOL_ICONS[tool.icon] ?? Layers;
        const selected = active === tool.id;
        const locked = tool.enabled === false;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onChange(tool.id as BuilderToolId)}
            aria-pressed={selected}
            aria-disabled={locked}
            title={locked ? wb("builder.toolRail.lockedHint") : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition",
              selected
                ? locked
                  ? "bg-white/[0.06] text-white/55"
                  : "bg-premium-gold/15 text-premium-gold-light"
                : locked
                  ? "text-white/25 hover:bg-white/[0.03] hover:text-white/40"
                  : "text-white/45 hover:bg-white/[0.04] hover:text-white/75",
            )}
          >
            {locked ? (
              <Lock className="size-3 opacity-70" aria-hidden />
            ) : (
              <Icon className="size-3.5" aria-hidden />
            )}
            {wb(`builder.toolRail.${tool.labelKey}`)}
          </button>
        );
      })}
    </div>
  );
}
