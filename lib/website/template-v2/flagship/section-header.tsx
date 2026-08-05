import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

type SectionHeaderProps = {
  ui: FlagshipUi;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: "start" | "center";
  className?: string;
};

export function FlagshipSectionHeader({
  ui,
  id = "section",
  eyebrow,
  title,
  subtitle,
  align = "start",
  className = "",
}: SectionHeaderProps) {
  if (!eyebrow && !title && !subtitle) return null;
  const alignClass = align === "center" ? "mx-auto text-center max-w-3xl" : "max-w-2xl";

  return (
    <header className={`mb-12 ${alignClass} ${className}`.trim()}>
      {eyebrow ? <p className={`${ui.eyebrow} mb-3`}>{eyebrow}</p> : null}
      {title ? (
        <h2 id={`${id}-title`} className={ui.headlineSm}>
          {title}
        </h2>
      ) : null}
      {title ? (
        <div
          className={`mt-4 h-px w-12 bg-gradient-to-r from-[var(--color-accent)] to-transparent ${align === "center" ? "mx-auto" : ""}`}
          aria-hidden
        />
      ) : null}
      {subtitle ? <p className={`${ui.body} text-muted-foreground mt-5`}>{subtitle}</p> : null}
    </header>
  );
}
