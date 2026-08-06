import { FlagshipSectionHeader } from "@/lib/website/template-v2/flagship/section-header";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export function VariantHeader({
  ui,
  id,
  eyebrow,
  title,
  subtitle,
  align = "start",
  className = "",
}: {
  ui: FlagshipUi;
  id: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <FlagshipSectionHeader
      ui={ui}
      id={id}
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      align={align}
      className={className}
    />
  );
}

export function VariantCtaRow({
  ui,
  primary,
  secondary,
  primaryHref = "#contact",
  secondaryHref = "#pricing",
  className = "",
}: {
  ui: FlagshipUi;
  primary?: string;
  secondary?: string;
  primaryHref?: string;
  secondaryHref?: string;
  className?: string;
}) {
  if (!primary && !secondary) return null;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      {primary ? (
        <a href={primaryHref} className={`${ui.btnPrimary} ${ui.focusRing}`}>
          {primary}
        </a>
      ) : null}
      {secondary ? (
        <a href={secondaryHref} className={`${ui.btnSecondary} ${ui.focusRing}`}>
          {secondary}
        </a>
      ) : null}
    </div>
  );
}

export function VariantMetricStrip({
  ui,
  metrics,
  className = "",
}: {
  ui: FlagshipUi;
  metrics: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <dl
      className={`grid grid-cols-2 gap-4 sm:grid-cols-4 ${className}`.trim()}
      aria-label="Key metrics"
    >
      {metrics.map((m) => (
        <div key={m.label} className={`${ui.card} px-4 py-5 text-center sm:px-5`}>
          <dt className={`${ui.fontBody} text-xs font-medium text-[var(--color-muted)]`}>{m.label}</dt>
          <dd className={`${ui.metric} mt-2 block`}>{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}
