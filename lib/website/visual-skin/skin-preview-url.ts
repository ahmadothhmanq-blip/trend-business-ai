import { getVisualSkin } from "@/lib/website/visual-skin/registry";

/** Authenticated catalog/app preview — same HTML artifact as skin:preview. */
export function buildSkinPreviewAppPath(skinId: string): string | null {
  const skin = getVisualSkin(skinId);
  if (!skin) return null;
  return `/api/website-builder/visual-skin/${encodeURIComponent(skin.id)}/preview`;
}
