import {
  DEFAULT_VISUAL_SKIN_ID,
  LEGACY_VISUAL_SKIN_ALIASES,
  VISUAL_SKIN_CATALOG,
} from "@/lib/website/visual-skin/catalog";
import type { VisualSkin } from "@/lib/website/visual-skin/types";

export const VISUAL_SKIN_REGISTRY: readonly VisualSkin[] = VISUAL_SKIN_CATALOG;

export function listVisualSkins(): readonly VisualSkin[] {
  return VISUAL_SKIN_REGISTRY;
}

export function hasPublishedVisualSkins(): boolean {
  return VISUAL_SKIN_REGISTRY.length > 0;
}

function resolveSkinId(id?: string | null): string | null {
  if (!id?.trim()) return null;
  const trimmed = id.trim();
  return LEGACY_VISUAL_SKIN_ALIASES[trimmed] ?? trimmed;
}

export function getVisualSkin(id?: string | null): VisualSkin | null {
  const resolvedId = resolveSkinId(id);
  const found = resolvedId
    ? VISUAL_SKIN_REGISTRY.find((s) => s.id === resolvedId)
    : undefined;
  if (found) return found;
  if (DEFAULT_VISUAL_SKIN_ID) {
    return VISUAL_SKIN_REGISTRY.find((s) => s.id === DEFAULT_VISUAL_SKIN_ID) ?? null;
  }
  return null;
}

export function getFlagshipVisualSkin(): VisualSkin | null {
  return VISUAL_SKIN_REGISTRY.find((s) => s.flagship) ?? null;
}
