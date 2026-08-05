"use client";

import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import {
  SLOT_LABELS,
  isBuilderEditorContext,
  resolveSlotImageStrict,
} from "@/lib/website/template-v2/slots/slot-utils";

export type SlotImageProps = {
  slot: ImageSlotKind;
  index?: number;
  preferred?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
};

/**
 * Image-independent template image: resolves a semantic slot only.
 * Renders layout-preserving empty state when the slot is unfilled.
 * Shows a labeled placeholder in the Website Builder editor only.
 */
export function SlotImage({
  slot,
  index = 0,
  preferred,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
  loading = "lazy",
  width,
  height,
}: SlotImageProps) {
  const src = resolveSlotImageStrict(slot, index, preferred);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : loading}
        fetchPriority={priority ? "high" : undefined}
        width={width}
        height={height}
      />
    );
  }

  const editor = isBuilderEditorContext();

  return (
    <div
      className={[
        containerClassName || className,
        "bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-surface))]",
        editor
          ? "border border-dashed border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!editor}
      data-slot-empty={slot}
      data-slot-index={index}
    >
      {editor ? (
        <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {SLOT_LABELS[slot]}
          </span>
          <span className="text-[0.5625rem] text-[var(--color-muted)] opacity-70">
            Slot {index + 1}
          </span>
        </div>
      ) : null}
    </div>
  );
}
