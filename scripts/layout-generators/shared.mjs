export const METRICS = {
  "glass-dashboard": [
    { value: "12ms", label: "Inference latency", trend: "p99 edge" },
    { value: "99.99%", label: "Platform uptime", trend: "global SLA" },
    { value: "140+", label: "Model endpoints", trend: "production" },
    { value: "48", label: "Regions live", trend: "multi-cloud" },
  ],
  "kinetic-split": [
    { value: "240+", label: "Global launches", trend: "2020–2026" },
    { value: "38", label: "Markets served", trend: "6 continents" },
    { value: "92%", label: "Repeat clients", trend: "studio avg." },
    { value: "18", label: "Design awards", trend: "last 3 years" },
  ],
  default: [
    { value: "500+", label: "Enterprise clients", trend: "Global footprint" },
    { value: "28", label: "Countries served", trend: "Active markets" },
    { value: "97%", label: "Client retention", trend: "3-year average" },
    { value: "$48B", label: "Assets advised", trend: "AUM" },
  ],
};

export function heroPropsType(Pascal) {
  return `type ${Pascal}HeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};`;
}

export function heroDefaults(Pascal, h, metricsKey) {
  const metrics = METRICS[metricsKey] ?? METRICS.default;
  return `const DEFAULT_METRICS = ${JSON.stringify(metrics, null, 2)};

${heroPropsType(Pascal)}

export function ${Pascal}Hero({
  title = ${JSON.stringify(h.title)},
  subtitle = ${JSON.stringify(h.subtitle)},
  eyebrow = ${JSON.stringify(h.eyebrow)},
  primaryCta = ${JSON.stringify(h.primaryCta)},
  secondaryCta = ${JSON.stringify(h.secondaryCta)},
  imageUrl = null,
  metrics = DEFAULT_METRICS,
}: ${Pascal}HeroProps)`;
}

export function featuresPropsType(Pascal) {
  return `type ${Pascal}FeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};`;
}

export function navPropsType(Pascal) {
  return `type ${Pascal}NavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};`;
}

export const NAV_HOOKS = `"use client";

import { useEffect, useState } from "react";`;

export const MOBILE_NAV_HOOKS = `
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);`;

export const NAV_SKIP_LINK = `
      <a href="#main-content" className="df-skip-link">
        Skip to main content
      </a>`;

export function mobileMenu({ p, linksVar = "links", ctaLabelVar = "ctaLabel", id }) {
  return `
      {open ? (
        <nav id="${id}" aria-label="Mobile" className="border-t border-[var(--border-default)] bg-[var(--color-surface)] px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {${linksVar}.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="${p}-font-body block py-1 text-sm font-medium text-[var(--color-foreground)]">
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#contact" onClick={() => setOpen(false)} className="${p}-btn-primary w-full">{${ctaLabelVar}}</a>
            </li>
          </ul>
        </nav>
      ) : null}`;
}

export function hamburgerButton({ p, id, prefix }) {
  return `
          <button
            type="button"
            aria-expanded={open}
            aria-controls="${id}"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] lg:hidden ${p}-focus-ring"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="flex flex-col gap-1">
              <span className={\`block h-0.5 w-5 bg-current transition \${open ? "translate-y-[5px] rotate-45" : ""}\`} />
              <span className={\`block h-0.5 w-5 bg-current transition \${open ? "opacity-0" : ""}\`} />
              <span className={\`block h-0.5 w-5 bg-current transition \${open ? "-translate-y-[5px] -rotate-45" : ""}\`} />
            </span>
          </button>`;
}
