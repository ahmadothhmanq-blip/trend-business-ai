/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const FLOATING_CTA_GENERATORS = {
  "bottom-bar": bottomBar,
  "corner-pill": cornerPill,
  "slide-up-minimal": slideUpMinimal,
  "corporate-banner": corporateBanner,
  "luxury-minimal": luxuryMinimal,
  "soft-pill": softPill,
  "resort-chip": resortChip,
  "warm-bordered": warmBordered,
  "academic-badge": academicBadge,
  "shop-fab": shopFab,
  "saas-dock": saasDock,
  "studio-bold": studioBold,
  "estate-elegant": estateElegant,
  "organic-float": organicFloat,
  "glass-float": glassFloat,
  "terminal-toast": terminalToast,
  "fintech-alert": fintechAlert,
  "industrial-bar": industrialBar,
  "law-subtle": lawSubtle,
  "wellness-soft": wellnessSoft,
};

export function generateFloatingCta(entry, layoutKey) {
  const fn = FLOATING_CTA_GENERATORS[layoutKey] ?? bottomBar;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function floatingHeader({ p, pkg, Pascal }) {
  return `"use client";

import { useEffect, useState } from "react";

type ${Pascal}FloatingCtaProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function ${Pascal}FloatingCta({
  title = "Ready to get started?",
  subtitle = "Speak with our team today.",
  ctaLabel = "Contact us",
  ctaHref = "#contact",
}: ${Pascal}FloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;`;
}

function bottomBar({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4" role="complementary" aria-label="Quick action">
      <div className="pointer-events-auto mx-auto flex max-w-[82rem] items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--color-surface)]/95 px-5 py-3 shadow-lg backdrop-blur-xl">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{title}</p>
          <p className="hidden truncate text-xs text-[var(--color-muted)] sm:block">{subtitle}</p>
        </div>
        <a href={ctaHref} className="${p}-btn-primary shrink-0 text-xs sm:text-sm">{ctaLabel}</a>
      </div>
    </div>
  );
}
`;
}

function cornerPill({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-6 end-6 z-40" role="complementary">
      <a href={ctaHref} className="${p}-btn-volt inline-flex rounded-full px-6 py-3 text-sm font-bold shadow-lg">{ctaLabel}</a>
    </div>
  );
}
`;
}

function slideUpMinimal({ p, pkg, Pascal }) {
  return bottomBar({ p, pkg, Pascal });
}

function corporateBanner({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-default)] bg-[var(--color-surface)]" role="complementary">
      <div className="mx-auto flex max-w-[82rem] items-center justify-between gap-4 px-5 py-3">
        <p className="text-sm font-semibold">{title}</p>
        <a href={ctaHref} className="${p}-btn-primary text-sm">{ctaLabel}</a>
      </div>
    </div>
  );
}
`;
}

function luxuryMinimal({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-8 start-1/2 z-40 -translate-x-1/2" role="complementary">
      <a href={ctaHref} className="${p}-btn-secondary inline-flex border px-8 py-3 text-xs uppercase tracking-[0.2em]">{ctaLabel}</a>
    </div>
  );
}
`;
}

function softPill({ p, pkg, Pascal }) {
  return cornerPill({ p, pkg, Pascal }).replace(`${p}-btn-volt`, `${p}-btn-primary !rounded-full`);
}

function resortChip({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4" role="complementary">
      <a href={ctaHref} className="${p}-btn-primary rounded-full px-8 py-3 text-sm shadow-lg">{ctaLabel}</a>
    </div>
  );
}
`;
}

function warmBordered({ p, pkg, Pascal }) {
  return cornerPill({ p, pkg, Pascal }).replace(`rounded-full`, `rounded-lg border-2 border-[var(--color-accent)]`);
}

function academicBadge({ p, pkg, Pascal }) {
  return corporateBanner({ p, pkg, Pascal });
}

function shopFab({ p, pkg, Pascal }) {
  return cornerPill({ p, pkg, Pascal });
}

function saasDock({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4" role="complementary">
      <div className="${p}-glass-card flex items-center gap-4 rounded-2xl border border-[var(--border-accent)] px-5 py-3 backdrop-blur-xl">
        <p className="text-sm font-medium">{title}</p>
        <a href={ctaHref} className="${p}-btn-primary text-xs">{ctaLabel}</a>
      </div>
    </div>
  );
}
`;
}

function studioBold({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-0 inset-x-0 z-40 bg-[var(--color-accent)] px-5 py-4" role="complementary">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between">
        <p className="${p}-font-display text-lg font-black uppercase text-[var(--color-background)]">{title}</p>
        <a href={ctaHref} className="bg-[var(--color-background)] px-6 py-2 text-sm font-bold">{ctaLabel}</a>
      </div>
    </div>
  );
}
`;
}

function estateElegant({ p, pkg, Pascal }) {
  return luxuryMinimal({ p, pkg, Pascal });
}

function organicFloat({ p, pkg, Pascal }) {
  return resortChip({ p, pkg, Pascal });
}

function glassFloat({ p, pkg, Pascal }) {
  return saasDock({ p, pkg, Pascal });
}

function terminalToast({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-4 end-4 z-40 font-mono text-xs" role="complementary">
      <div className="border border-[var(--border-default)] bg-[var(--color-background)] p-4 shadow-lg">
        <p className="text-[var(--color-accent)]">&gt; {title}</p>
        <a href={ctaHref} className="mt-2 inline-block underline">{ctaLabel}</a>
      </div>
    </div>
  );
}
`;
}

function fintechAlert({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-4 inset-x-4 z-40 font-mono text-xs sm:inset-x-auto sm:end-4 sm:max-w-sm" role="complementary">
      <div className="border border-[#00ff88]/30 bg-[#0d140d] p-4 text-[#00ff88]">
        <p className="text-white">{title}</p>
        <a href={ctaHref} className="mt-2 inline-block text-[#00ff88]">[ {ctaLabel} ]</a>
      </div>
    </div>
  );
}
`;
}

function industrialBar({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-0 inset-x-0 z-40 border-t-4 border-[var(--color-accent)] bg-[var(--color-background)]" role="complementary">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between px-5 py-3">
        <p className="font-bold uppercase">{title}</p>
        <a href={ctaHref} className="${p}-btn-primary">{ctaLabel}</a>
      </div>
    </div>
  );
}
`;
}

function lawSubtle({ p, pkg, Pascal }) {
  return corporateBanner({ p, pkg, Pascal });
}

function wellnessSoft({ p, pkg, Pascal }) {
  return `${floatingHeader({ p, pkg, Pascal })}
  return (
    <div data-v2-component="${pkg}-floating-cta" className="fixed bottom-6 end-6 z-40" role="complementary">
      <a href={ctaHref} className="inline-flex rounded-full bg-[var(--color-accent)]/15 px-5 py-3 text-sm text-[var(--color-accent)] shadow-sm">{ctaLabel}</a>
    </div>
  );
}
`;
}
