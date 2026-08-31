import type { SectionShellVariant } from "@/lib/ai-core/components/scaffolds";
import type { VisualSkin } from "@/lib/website/visual-skin/types";

const SKIN_SHELL_MAP: Record<string, SectionShellVariant> = {
  signal: "bento",
  volt: "card-first",
  ledger: "card-first",
  atlas: "card-first",
  monolith: "editorial",
  serenity: "minimal",
  haven: "editorial",
  ember: "editorial",
  heritage: "card-first",
  atelier: "editorial",
  nexus: "bento",
  kinetic: "bento",
  estates: "editorial",
  forest: "editorial",
  prism: "bento",
  obsidian: "editorial",
  forge: "card-first",
  citadel: "card-first",
  lumina: "minimal",
  sovereign: "bento",
  prestige: "card-first",
  horizon: "default",
  vault: "editorial",
  pulse: "bento",
  clarity: "card-first",
  "bold-saas": "bento",
  "editorial-elegant": "editorial",
  "minimal-product": "minimal",
  "local-warm": "default",
  "luxury-dark": "editorial",
  "creative-gradient": "bento",
  "calm-accessible": "card-first",
};

const LEGACY_SHELL_MAP: Record<string, SectionShellVariant> = {
  editorial: "editorial",
  magazine: "magazine",
  bento: "bento",
  minimal: "minimal",
  "card-first": "card-first",
  default: "default",
};

export function resolveSkinSectionShellVariant(
  skin: VisualSkin,
): SectionShellVariant {
  return (
    SKIN_SHELL_MAP[skin.id] ??
    LEGACY_SHELL_MAP[skin.sectionShellVariant] ??
    "default"
  );
}
