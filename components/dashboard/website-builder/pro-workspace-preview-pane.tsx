"use client";

import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProWorkspacePreviewPaneProps = {
  generationId: string;
  title: string;
  revision?: number;
  className?: string;
};

function previewSrc(generationId: string, revision = 0) {
  const base = `/api/website-builder/${generationId}/live-preview`;
  return revision > 0 ? `${base}?v=${revision}` : base;
}

export function ProWorkspacePreviewPane({
  generationId,
  title,
  revision = 0,
  className,
}: ProWorkspacePreviewPaneProps) {
  const src = previewSrc(generationId, revision);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/25",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-xs text-white/45">
        <Globe2 className="size-3.5 text-premium-gold/70" />
        Live preview
      </div>
      <iframe
        key={src}
        title={title}
        src={src}
        className="min-h-0 flex-1 w-full bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
