"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { VisualSkinPreview } from "@/components/dashboard/website-builder/visual-skin-preview";
import { VisualSkinSelect } from "@/components/dashboard/website-builder/visual-skin-select";
import { Button } from "@/components/ui/button";
import { DEFAULT_VISUAL_SKIN_ID } from "@/lib/website/visual-skin/catalog";
import { getVisualSkin, hasPublishedVisualSkins } from "@/lib/website/visual-skin/registry";

type VisualSkinEditorProps = {
  generationId: string;
  project: GeneratedWebsiteProject;
  onApplied?: (project: GeneratedWebsiteProject) => void;
};

/** Change visual skin on a saved project without re-generating (R-09). */
export function VisualSkinEditor({
  generationId,
  project,
  onApplied,
}: VisualSkinEditorProps) {
  const published = hasPublishedVisualSkins();
  const currentSkinId =
    project.settings?.visualSkinId ?? DEFAULT_VISUAL_SKIN_ID ?? "";
  const [skinId, setSkinId] = useState(currentSkinId);
  const [isApplying, setIsApplying] = useState(false);

  const applySkin = useCallback(async () => {
    if (!skinId || skinId === currentSkinId || !getVisualSkin(skinId)) return;
    setIsApplying(true);
    try {
      const res = await fetch(
        `/api/website-builder/${generationId}/visual-skin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visualSkinId: skinId }),
        },
      );
      const data = (await res.json()) as {
        error?: string;
        project?: GeneratedWebsiteProject;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to apply skin");
      }
      if (data.project) onApplied?.(data.project);
      toast.success("Visual skin updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Skin update failed");
    } finally {
      setIsApplying(false);
    }
  }, [currentSkinId, generationId, onApplied, skinId]);

  if (!published) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div>
        <p className="text-sm font-semibold text-white/85">Visual skin</p>
        <p className="text-xs text-white/45">
          Update design tokens only — no full re-generation.
        </p>
      </div>
      <VisualSkinSelect value={skinId} onChange={setSkinId} />
      <VisualSkinPreview skinId={skinId} />
      <Button
        type="button"
        size="sm"
        disabled={isApplying || !skinId || skinId === currentSkinId}
        onClick={() => void applySkin()}
        className="rounded-lg bg-premium-gold text-black hover:bg-premium-gold-light"
      >
        {isApplying ? "Applying…" : "Apply skin"}
      </Button>
    </div>
  );
}
