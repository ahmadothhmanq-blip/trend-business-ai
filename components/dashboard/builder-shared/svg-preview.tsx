"use client";

import { sanitizeSvgContent } from "@/lib/ai/sanitize";
import { cn } from "@/lib/utils";

export function SvgPreview({ svg, label, className }: { svg: string; label?: string; className?: string }) {
  const sanitized = sanitizeSvgContent(svg);
  if (!sanitized) return null;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]", className)}>
      <div className="flex items-center justify-center p-4" dangerouslySetInnerHTML={{ __html: sanitized }} />
      {label && <p className="border-t border-white/[0.06] px-3 py-1.5 text-center text-[10px] text-white/30">{label}</p>}
    </div>
  );
}
