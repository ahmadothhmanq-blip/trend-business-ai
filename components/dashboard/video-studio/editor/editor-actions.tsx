"use client";

import Link from "next/link";
import { Redo2, Save, Scissors, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorActions({
  projectTitle,
  saveStatus,
  dirty,
  onSave,
  onUndo,
  onRedo,
  onSplit,
  onDuplicate,
  onDelete,
  onTrimStart,
  onTrimEnd,
  onRegenerate,
  manageHref,
}: {
  projectTitle: string;
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  dirty: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSplit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTrimStart: () => void;
  onTrimEnd: () => void;
  onRegenerate: () => void;
  manageHref: string;
}) {
  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/30 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{projectTitle}</p>
        <p className="text-[11px] uppercase tracking-wide text-white/40">
          {saveStatus === "saving" ? "Saving" : saveStatus === "unsaved" || dirty ? "Unsaved changes" : saveStatus === "error" ? "Save failed" : "Saved"}
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onUndo}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onRedo}>
        <Redo2 className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onTrimStart}>
        Trim start
      </Button>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onTrimEnd}>
        Trim end
      </Button>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onSplit}>
        <Scissors className="mr-1 h-4 w-4" />
        Split
      </Button>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onDuplicate}>
        Duplicate
      </Button>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onDelete}>
        Delete
      </Button>
      <Button type="button" size="sm" className="bg-premium-gold text-black hover:bg-premium-gold-light" onClick={onRegenerate}>
        Regenerate Scene
      </Button>
      <Button type="button" size="sm" variant="outline" className="border-white/15" onClick={onSave}>
        <Save className="mr-1 h-4 w-4" />
        Save
      </Button>
      <Link href={manageHref} className="text-xs text-white/50 hover:text-premium-gold">
        Production
      </Link>
    </header>
  );
}
