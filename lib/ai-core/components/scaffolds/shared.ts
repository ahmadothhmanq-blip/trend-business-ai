/** Shared premium UI primitives injected into generated websites. */

export const SECTION_SHELL_PATH = "components/ui/section-shell.tsx";
export const MOTION_PATH = "components/ui/motion.tsx";

export type SectionShellVariant =
  | "default"
  | "editorial"
  | "magazine"
  | "bento"
  | "card-first"
  | "minimal";

const SHELL_BASE = `"use client";

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
        className={["relative overflow-hidden {{SHELL_CLASSES}}", toneClass, className]
          .filter(Boolean)
          .join(" ")}
      >
      <div
        className={[
          "{{CONTAINER_CLASSES}}",
          narrow ? "max-w-3xl" : "max-w-[var(--container-max,72rem)]",
        ].join(" ")}
      >
        {(eyebrow || title || subtitle) && (
          <Motion className="{{HEADER_CLASSES}}">
            {eyebrow ? (
              <p className="{{EYEBROW_CLASSES}}">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="{{TITLE_CLASSES}}">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="{{SUBTITLE_CLASSES}}">
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

function buildShellSource(variant: SectionShellVariant): string {
  const presets: Record<
    SectionShellVariant,
    {
      shell: string;
      container: string;
      header: string;
      eyebrow: string;
      title: string;
      subtitle: string;
    }
  > = {
    default: {
      shell:
        "py-[var(--section-y-mobile,4.25rem)] sm:py-[5rem] lg:py-[var(--section-y,7.5rem)]",
      container: "mx-auto w-full px-5 sm:px-6 lg:px-8",
      header: "mb-12 max-w-2xl sm:mb-14 lg:mb-[4.5rem]",
      eyebrow:
        "mb-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent,var(--color-primary))] sm:text-xs",
      title:
        "font-[family-name:var(--font-heading,inherit)] text-[clamp(1.95rem,3.6vw,var(--text-h2,2.75rem))] font-semibold leading-[1.06] tracking-[-0.032em]",
      subtitle:
        "mt-5 max-w-xl text-[15px] leading-[1.75] text-[var(--color-foreground)]/68 sm:text-base sm:leading-[1.75]",
    },
    editorial: {
      shell: "py-20 sm:py-28 lg:py-36",
      container: "mx-auto w-full px-6 sm:px-10 lg:px-14",
      header: "mb-16 max-w-3xl border-l-2 border-[var(--color-primary)] pl-6 sm:mb-20 sm:pl-8",
      eyebrow:
        "mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-foreground)]/45",
      title:
        "font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.04em]",
      subtitle:
        "mt-6 max-w-2xl text-base leading-[1.8] text-[var(--color-foreground)]/62 sm:text-lg",
    },
    magazine: {
      shell: "py-16 sm:py-24 lg:py-32",
      container: "mx-auto grid w-full max-w-[var(--container-max,80rem)] gap-10 px-5 sm:grid-cols-[0.35fr_1fr] sm:px-8 lg:gap-16",
      header: "sm:sticky sm:top-28 sm:self-start",
      eyebrow:
        "mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]",
      title:
        "font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.04em]",
      subtitle:
        "mt-5 text-sm leading-[1.9] text-[var(--color-foreground)]/58 sm:max-w-xs",
    },
    bento: {
      shell: "py-12 sm:py-16 lg:py-20",
      container: "mx-auto w-full px-4 sm:px-6 lg:px-8",
      header: "mb-8 max-w-xl sm:mb-10",
      eyebrow:
        "mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent,var(--color-primary))]",
      title:
        "text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.03em]",
      subtitle: "mt-3 text-sm leading-relaxed text-[var(--color-foreground)]/60",
    },
    "card-first": {
      shell: "py-10 sm:py-14",
      container: "mx-auto w-full max-w-[var(--container-max,68rem)] px-4 sm:px-6",
      header: "mb-8 text-center sm:mb-10",
      eyebrow:
        "mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground)]/40",
      title:
        "mx-auto max-w-2xl text-[clamp(1.85rem,3.2vw,2.65rem)] font-semibold tracking-[-0.03em]",
      subtitle:
        "mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[var(--color-foreground)]/58",
    },
    minimal: {
      shell: "py-24 sm:py-32 lg:py-40",
      container: "mx-auto w-full max-w-[var(--container-max,60rem)] px-6 sm:px-8",
      header: "mb-20 max-w-xl sm:mb-24",
      eyebrow:
        "mb-5 text-[10px] uppercase tracking-[0.3em] text-[var(--color-foreground)]/35",
      title:
        "text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.08] tracking-[-0.02em]",
      subtitle:
        "mt-6 text-base leading-[2] text-[var(--color-foreground)]/50",
    },
  };
  const p = presets[variant];
  return SHELL_BASE.replace("{{SHELL_CLASSES}}", p.shell)
    .replace("{{CONTAINER_CLASSES}}", p.container)
    .replace("{{HEADER_CLASSES}}", p.header)
    .replace("{{EYEBROW_CLASSES}}", p.eyebrow)
    .replace("{{TITLE_CLASSES}}", p.title)
    .replace("{{SUBTITLE_CLASSES}}", p.subtitle);
}

export const SECTION_SHELL_SOURCE = buildShellSource("default");

export function resolveSectionShellSource(
  variant: SectionShellVariant = "default",
): string {
  return buildShellSource(variant);
}

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
