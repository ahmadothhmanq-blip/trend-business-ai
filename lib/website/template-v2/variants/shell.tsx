import type { ReactNode } from "react";
import type { SectionKind, SectionVariantId } from "@/lib/website/template-v2/variants/types";

export type SectionVariantShellProps = {
  sectionKind: SectionKind;
  variantId: SectionVariantId;
  componentId: string;
  id: string;
  title?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Accessible section wrapper — preserves SEO anchors, aria landmarks, and variant metadata.
 */
export function SectionVariantShell({
  sectionKind,
  variantId,
  componentId,
  id,
  title,
  className = "",
  children,
}: SectionVariantShellProps) {
  const labelledBy = title ? `${id}-title` : undefined;

  return (
    <section
      id={id}
      data-v2-component={componentId}
      data-v2-section={sectionKind}
      data-v2-variant={variantId}
      aria-labelledby={labelledBy}
      className={className.trim() || undefined}
    >
      {children}
    </section>
  );
}
