/** Shared premium UI primitives injected into generated websites. */

export const SECTION_SHELL_PATH = "components/ui/section-shell.tsx";
export const MOTION_PATH = "components/ui/motion.tsx";

export const SECTION_SHELL_SOURCE = `"use client";

import type { ReactNode } from "react";
import { Motion } from "@/components/ui/motion";

type SectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  tone?: "default" | "muted" | "inverse";
};

export function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  narrow = false,
  tone = "default",
}: SectionShellProps) {
  const toneClass =
    tone === "muted"
      ? "bg-[var(--color-surface,var(--color-background))]"
      : tone === "inverse"
        ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
        : "bg-[var(--color-background)] text-[var(--color-foreground)]";

  return (
    <section
      id={id}
        className={["relative overflow-hidden py-[var(--section-y-mobile,4.25rem)] sm:py-[5rem] lg:py-[var(--section-y,7.5rem)]", toneClass, className]
          .filter(Boolean)
          .join(" ")}
      >
      <div
        className={[
          "mx-auto w-full px-5 sm:px-6 lg:px-8",
          narrow ? "max-w-3xl" : "max-w-[var(--container-max,72rem)]",
        ].join(" ")}
      >
        {(eyebrow || title || subtitle) && (
          <Motion className="mb-12 max-w-2xl sm:mb-14 lg:mb-[4.5rem]">
            {eyebrow ? (
              <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent,var(--color-primary))] sm:text-xs">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="font-[family-name:var(--font-heading,inherit)] text-[clamp(1.95rem,3.6vw,var(--text-h2,2.75rem))] font-semibold leading-[1.06] tracking-[-0.032em]">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--color-foreground)]/68 sm:text-base sm:leading-[1.75]">
                {subtitle}
              </p>
            ) : null}
          </Motion>
        )}
        {children}
      </div>
    </section>
  );
}
`;

export const MOTION_SOURCE = `"use client";

import type { CSSProperties, ReactNode } from "react";

type MotionVariant = "fade-up" | "scale-in" | "slow-reveal";

type MotionProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  variant?: MotionVariant;
  as?: "div" | "header" | "article" | "li";
};

const VARIANT_ANIMATION: Record<MotionVariant, string> = {
  "fade-up": "fadeUp 0.75s var(--ease-premium, cubic-bezier(0.22,1,0.36,1))",
  "scale-in": "scaleIn 0.7s var(--ease-premium, cubic-bezier(0.22,1,0.36,1))",
  "slow-reveal": "slowReveal 0.95s var(--ease-premium, cubic-bezier(0.22,1,0.36,1))",
};

/** Premium entrance motion — respects reduced motion via CSS. */
export function Motion({
  children,
  className = "",
  delayMs = 0,
  variant = "fade-up",
  as = "div",
}: MotionProps) {
  const Tag = as;
  const style = {
    animation: \`\${VARIANT_ANIMATION[variant]} \${delayMs}ms both\`,
  } as CSSProperties;

  return (
    <Tag className={["motion-safe", className].filter(Boolean).join(" ")} style={style}>
      {children}
    </Tag>
  );
}
`;

export function heroImageImport(): string {
  return `import {
  HERO_IMAGE,
  GALLERY_IMAGES,
  SECTION_IMAGES,
  PRODUCT_IMAGE,
  SERVICE_IMAGE,
  BACKGROUND_IMAGE,
  TESTIMONIAL_IMAGES,
  resolveSiteImage,
  siteImagePool,
} from "@/lib/site-images";`;
}
