/**
 * Per-theme section shells — exclusive rhythm, typography, and spacing per theme.
 */

import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";

export const THEME_SECTION_SHELL_PATH = "components/ui/section-shell.tsx";

const MOTION_IMPORT = `import { Motion } from "@/components/ui/motion";`;

function shell(
  themeClass: string,
  container: string,
  header: string,
  title: string,
  eyebrow: string,
  subtitle: string,
): string {
  return `"use client";

import type { ReactNode } from "react";
${MOTION_IMPORT}

type ThemeSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: ThemeSectionShellProps) {
  return (
    <section
      id={id}
      data-theme-scaffold="section"
      className={["${themeClass}", className].filter(Boolean).join(" ")}
    >
      <div className="${container}">
        {(eyebrow || title || subtitle) ? (
          <Motion className="${header}">
            {eyebrow ? <p className="${eyebrow}">{eyebrow}</p> : null}
            {title ? <h2 className="${title}">{title}</h2> : null}
            {subtitle ? <p className="${subtitle}">{subtitle}</p> : null}
          </Motion>
        ) : null}
        {children}
      </div>
    </section>
  );
}
`;
}

const THEME_SHELLS: Record<WebsiteThemePresetId, string> = {
  luxury: shell(
    "relative overflow-hidden bg-[var(--color-background)] py-28 sm:py-36 lg:py-44 theme-luxury-section",
    "mx-auto max-w-[80rem] px-6 sm:px-10 lg:px-14",
    "mb-20 max-w-2xl border-l-[2px] border-[var(--color-primary)] pl-10 sm:pl-12",
    "font-[family-name:var(--font-display,inherit)] text-[clamp(2.5rem,4.8vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.045em]",
    "mb-5 text-[9px] font-medium uppercase tracking-[0.42em] text-[var(--color-foreground)]/40",
    "mt-8 max-w-xl text-[15px] leading-[2] text-[var(--color-foreground)]/55 font-light",
  ),
  modern: shell(
    "relative bg-[var(--color-background)] py-20 sm:py-24 lg:py-32 theme-modern-section",
    "mx-auto max-w-[76rem] px-5 sm:px-8 lg:px-10",
    "mb-14 flex max-w-3xl flex-col gap-4",
    "text-[clamp(2rem,3.5vw,3rem)] font-semibold tracking-[-0.035em] text-balance",
    "inline-flex w-fit rounded-full bg-[var(--color-primary)]/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]",
    "text-base leading-relaxed text-[var(--color-foreground)]/60 max-w-2xl",
  ),
  minimal: shell(
    "relative bg-[var(--color-background)] py-32 sm:py-40 lg:py-52 theme-minimal-section",
    "mx-auto max-w-[52rem] px-6 sm:px-8",
    "mb-24 max-w-md",
    "text-[clamp(2.25rem,3.5vw,3.25rem)] font-extralight leading-[1.08] tracking-[-0.03em]",
    "mb-8 text-[9px] uppercase tracking-[0.45em] text-[var(--color-foreground)]/28",
    "text-[15px] leading-[2.1] text-[var(--color-foreground)]/42 font-light max-w-sm",
  ),
  corporate: shell(
    "relative border-t border-[var(--color-foreground)]/6 bg-[var(--color-surface,var(--color-background))] py-16 sm:py-20 theme-corporate-section",
    "mx-auto max-w-[80rem] px-6 sm:px-8 lg:px-10",
    "mb-12 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-10",
    "text-[clamp(1.875rem,2.6vw,2.625rem)] font-semibold tracking-[-0.025em] text-[var(--color-foreground)]",
    "text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]",
    "text-sm leading-[1.7] text-[var(--color-foreground)]/65 sm:col-span-2 sm:max-w-2xl",
  ),
  creative: shell(
    "relative overflow-hidden bg-[var(--color-background)] py-24 sm:py-32 lg:py-40 theme-creative-section",
    "mx-auto grid max-w-[88rem] gap-16 px-6 sm:grid-cols-[minmax(0,0.28fr)_1fr] sm:px-10 lg:px-14",
    "sm:sticky sm:top-32 sm:self-start",
    "font-[family-name:var(--font-display,inherit)] text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.05em]",
    "text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent,var(--color-primary))]",
    "mt-6 text-sm leading-[2] text-[var(--color-foreground)]/50 sm:max-w-[14rem]",
  ),
  technology: shell(
    "relative bg-[var(--color-background)] py-12 sm:py-16 theme-tech-section",
    "mx-auto max-w-[82rem] px-4 sm:px-6 lg:px-8",
    "mb-10 flex items-end justify-between gap-6 border-b border-white/8 pb-6",
    "font-mono text-[clamp(1.5rem,2.5vw,2.125rem)] font-semibold tracking-[-0.04em]",
    "text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]",
    "text-sm text-[var(--color-foreground)]/55 max-w-md",
  ),
  editorial: shell(
    "relative bg-[var(--color-background)] py-20 sm:py-28 lg:py-36 theme-editorial-section",
    "mx-auto grid max-w-[86rem] gap-16 px-5 sm:grid-cols-[minmax(0,0.34fr)_1fr] sm:px-10 lg:px-14",
    "sm:sticky sm:top-28 sm:border-l sm:border-[var(--color-foreground)]/10 sm:pl-10",
    "font-[family-name:var(--font-display,inherit)] text-[clamp(3rem,6.5vw,5rem)] font-semibold leading-[0.94] tracking-[-0.05em]",
    "mb-4 text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--color-primary)]",
    "mt-6 text-sm leading-[2.05] text-[var(--color-foreground)]/48 max-w-xs",
  ),
  bold: shell(
    "relative bg-[var(--color-background)] py-14 sm:py-20 theme-bold-section",
    "mx-auto max-w-[72rem] px-4 sm:px-6",
    "mb-10 text-center",
    "text-[clamp(2.25rem,4vw,3.5rem)] font-black uppercase tracking-[-0.04em] leading-[0.95]",
    "mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-foreground)]/35",
    "mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--color-foreground)]/55",
  ),
};

export function resolveThemeSectionShellSource(
  themeId: WebsiteThemePresetId,
): string {
  return THEME_SHELLS[themeId];
}

export function isThemeSectionShellTheme(
  themeId: string | null | undefined,
): themeId is WebsiteThemePresetId {
  return Boolean(themeId && themeId in THEME_SHELLS);
}
