"use client";

import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type PackageFooterVariant =
  | "corporate"
  | "saas"
  | "education"
  | "finance"
  | "restaurant"
  | "hotel";

export type PackageFooterShellProps = {
  variant: PackageFooterVariant;
  ui: FlagshipUi;
  componentId: string;
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
  exploreLinks?: Array<{ href: string; label: string }>;
  legalLinks?: Array<{ href: string; label: string }>;
  address?: string;
  badges?: string[];
  legalNotice?: string;
};

export function PackageFooterShell({
  variant,
  ui,
  componentId,
  brandName,
  tagline,
  links,
  exploreLinks,
  legalLinks,
  address,
  badges,
  legalNotice,
}: PackageFooterShellProps) {
  const year = new Date().getFullYear();
  const navLinks = exploreLinks ?? links;

  if (variant === "corporate") {
    return (
      <footer data-v2-component={componentId} className="cb-section-ink relative overflow-hidden" role="contentinfo">
        <div className="cb-grid-bg pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden />
        <div className={`${ui.container} relative grid gap-16 border-b border-white/8 pb-16 lg:grid-cols-12`}>
          <div className="lg:col-span-4">
            <p className={`${ui.fontDisplay} text-2xl font-medium text-white`}>{brandName}</p>
            <p className={`${ui.fontBody} mt-6 max-w-xs text-sm text-white/50`}>{tagline}</p>
          </div>
          <nav aria-label="Explore" className="lg:col-span-3 lg:col-start-6">
            <p className={`${ui.fontBody} text-[0.6875rem] uppercase tracking-[0.18em] text-white/35`}>Explore</p>
            <ul className="mt-5 space-y-3">
              {navLinks?.map((link) => (
                <li key={link.href}><a href={link.href} className={`${ui.fontBody} text-sm text-white/55 hover:text-[var(--color-signal)] ${ui.focusRing}`}>{link.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-3">
            <p className={`${ui.fontBody} text-[0.6875rem] uppercase tracking-[0.18em] text-white/35`}>Insights</p>
            <p className={`${ui.fontBody} mt-5 text-sm text-white/50`}>{legalNotice ?? "Quarterly perspectives on governance and markets."}</p>
          </div>
        </div>
        <div className={`${ui.container} flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between`}>
          <p className={`${ui.fontBody} text-xs text-white/30`}>© {year} {brandName}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-6">
            {legalLinks?.map((link) => (
              <a key={link.href} href={link.href} className={`${ui.fontBody} text-xs text-white/30 hover:text-white/55 ${ui.focusRing}`}>{link.label}</a>
            ))}
          </nav>
        </div>
      </footer>
    );
  }

  if (variant === "saas") {
    if (!links?.length) return null;
    return (
      <footer data-v2-component={componentId} className="border-t border-[var(--border-default)] bg-[var(--color-ink,#020617)] text-white" role="contentinfo">
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className={`${ui.fontDisplay} text-xl font-bold`}>{brandName}</p>
              <p className={`${ui.fontBody} mt-3 max-w-sm text-sm text-white/60`}>{tagline}</p>
            </div>
            <nav aria-label="Footer">
              <p className={`${ui.eyebrow} text-white/40`}>Explore</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {links.map((link) => (
                  <li key={link.href}><a href={link.href} className={`${ui.fontBody} text-sm text-white/65 hover:text-[var(--color-accent)] ${ui.focusRing}`}>{link.label}</a></li>
                ))}
              </ul>
            </nav>
          </div>
          <p className={`${ui.fontBody} mt-12 border-t border-white/10 pt-6 text-xs text-white/40`}>© {year} {brandName}</p>
        </div>
      </footer>
    );
  }

  if (variant === "education") {
    if (!links?.length) return null;
    return (
      <footer data-v2-component={componentId} className="border-t-4 border-[var(--color-signal)] bg-[var(--color-surface)]" role="contentinfo">
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <p className={`${ui.fontDisplay} text-2xl font-semibold`}>{brandName}</p>
              <p className={`${ui.fontBody} mt-4 max-w-sm text-sm`}>{tagline}</p>
            </div>
            <nav aria-label="Campus">
              <p className={`${ui.eyebrow}`}>Campus</p>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}><a href={link.href} className={`${ui.fontBody} text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] ${ui.focusRing}`}>{link.label}</a></li>
                ))}
              </ul>
            </nav>
            <div>
              <p className={`${ui.eyebrow}`}>Accreditation</p>
              <p className={`${ui.fontBody} mt-4 text-sm text-[var(--color-muted)]`}>{legalNotice ?? "Accredited programs with global recognition."}</p>
            </div>
          </div>
          <p className={`${ui.fontBody} mt-10 text-xs text-[var(--color-muted)]`}>© {year} {brandName}</p>
        </div>
      </footer>
    );
  }

  if (variant === "finance") {
    if (!links?.length) return null;
    return (
      <footer data-v2-component={componentId} className="border-t border-[var(--border-accent)] bg-[var(--color-ink)] text-[var(--color-background)]" role="contentinfo">
        <div className="fn-gold-rule mx-auto max-w-[82rem] opacity-30" aria-hidden />
        <div className="mx-auto max-w-[82rem] px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className={`${ui.fontDisplay} text-xl font-semibold`}>{brandName}</p>
              <p className={`${ui.fontBody} mt-3 max-w-sm text-sm opacity-70`}>{tagline}</p>
              {badges?.length ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {badges.map((badge) => (
                    <span key={badge} className="fn-font-mono rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-signal)_35%,transparent)] px-2.5 py-1 text-[0.625rem] text-[var(--color-signal)]">{badge}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <nav aria-label="Footer">
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}><a href={link.href} className={`${ui.fontBody} text-sm opacity-70 hover:opacity-100 ${ui.focusRing}`}>{link.label}</a></li>
                ))}
              </ul>
            </nav>
          </div>
          <p className={`${ui.fontBody} mt-10 text-xs opacity-50`}>{legalNotice ?? `© ${year} ${brandName}`}</p>
        </div>
      </footer>
    );
  }

  const ruleClass = variant === "restaurant" ? "rp-copper-rule" : "hr-azure-rule";
  const socialAccent = variant === "restaurant" ? "hover:text-[var(--color-copper)]" : "hover:text-[var(--color-azure)]";

  return (
    <footer data-v2-component={componentId} className="border-t border-[var(--border-subtle)] bg-[var(--color-background)]" role="contentinfo">
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className={`${ui.fontDisplay} text-3xl`}>{brandName}</p>
            <p className={`${ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{tagline}</p>
            {address ? <address className={`${ui.fontBody} mt-6 not-italic text-sm text-[var(--color-muted)]`}>{address}</address> : null}
          </div>
          <nav aria-label="Footer navigation">
            <p className={`${ui.eyebrow} mb-4`}>Explore</p>
            <ul className="space-y-3">
              {navLinks?.map((link) => (
                <li key={link.href}><a href={link.href} className={`${ui.fontBody} text-sm text-[var(--color-muted)] transition ${socialAccent}`}>{link.label}</a></li>
              ))}
            </ul>
          </nav>
          <div>
            <p className={`${ui.eyebrow} mb-4`}>{variant === "restaurant" ? "Hours" : "Concierge"}</p>
            <p className={`${ui.fontBody} text-sm text-[var(--color-muted)]`}>
              {variant === "restaurant" ? "Tue–Sat · 6pm – 11pm" : "24-hour guest services"}
            </p>
          </div>
        </div>
        <div className={`${ruleClass} mt-16`} />
        <p className={`${ui.fontBody} mt-8 text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--color-muted)]`}>© {year} {brandName}</p>
      </div>
    </footer>
  );
}
