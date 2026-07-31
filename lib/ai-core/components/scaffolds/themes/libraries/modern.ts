/**
 * Modern theme component scaffolds — contemporary product-marketing SaaS.
 * Distinctive: floating center pill nav, gradient-mesh split hero with floating product card.
 */

export const MODERN_SCAFFOLDS: Record<string, string> = {
  ThemeModernNav: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

type ThemeModernNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeModernNav({
  brandName = "Pulse",
  ctaLabel = "Start free",
  links = DEFAULT_LINKS,
}: ThemeModernNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header data-theme-scaffold="nav" className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto grid max-w-[74rem] grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-full border border-[var(--color-foreground)]/10 bg-[var(--color-background)]/90 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl backdrop-saturate-150 sm:px-5">
        <a href="/" className="justify-self-start text-sm font-semibold tracking-tight">
          {brandName}
        </a>
        <nav className="hidden items-center gap-0.5 rounded-full bg-[var(--color-foreground)]/[0.04] p-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[var(--color-foreground)]/70 transition hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-self-end gap-2">
          <a
            href="#contact"
            className="hidden rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-primary-foreground)] sm:inline-flex"
          >
            {ctaLabel}
          </a>
          <button
            type="button"
            className="rounded-full border border-[var(--color-foreground)]/10 px-3 py-2 text-xs font-medium md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="mx-auto mt-2 max-w-[74rem] rounded-2xl border border-[var(--color-foreground)]/10 bg-[var(--color-background)]/95 p-4 shadow-lg backdrop-blur-xl md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-2 block rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--color-primary-foreground)]"
            onClick={() => setOpen(false)}
          >
            {ctaLabel}
          </a>
        </nav>
      ) : null}
    </header>
  );
}
`,

  ThemeModernHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

type ThemeModernHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
};

export function ThemeModernHero({
  title = "Ship product pages that convert",
  subtitle = "A conversion-focused stack for SaaS teams — launch landing pages, onboard users, and grow revenue without the rebuild cycle.",
  eyebrow = "Product marketing",
  primaryCta = "Start free trial",
  secondaryCta = "Book a demo",
  imageUrl,
  layoutMode = "split",
}: ThemeModernHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  const editorial = layoutMode === "editorial";

  if (editorial) {
    return (
      <section
        data-theme-scaffold="hero"
        className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent)]"
        />
        <div className="relative mx-auto flex min-h-[100svh] max-w-[88rem] flex-col justify-end px-5 pb-16 pt-32 sm:px-8 sm:pb-24">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            {eyebrow}
          </span>
          <h1 className="mt-8 max-w-[14ch] text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-foreground)]/65 sm:text-xl">
            {subtitle}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[0_16px_48px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
            >
              {primaryCta}
            </a>
            <a
              href="#features"
              className="rounded-full border border-[var(--color-foreground)]/15 bg-[var(--color-background)]/80 px-7 py-3.5 text-sm font-semibold backdrop-blur-sm"
            >
              {secondaryCta}
            </a>
          </div>
          {src ? (
            <div className="relative mt-16 min-h-[min(48vh,26rem)] w-full overflow-hidden rounded-3xl border border-[var(--color-foreground)]/10 shadow-[0_32px_80px_rgba(0,0,0,0.14)] sm:mt-20 sm:min-h-[min(52vh,32rem)]">
              <img
                src={src}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/60 via-transparent to-transparent" />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      data-theme-scaffold="hero"
      className="relative min-h-[96svh] overflow-hidden bg-[var(--color-background)] py-16 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent),radial-gradient(ellipse_70%_50%_at_80%_30%,color-mix(in_srgb,var(--color-accent,var(--color-primary))_14%,transparent),transparent),radial-gradient(ellipse_60%_40%_at_50%_100%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent)]"
      />
      <div className="relative mx-auto grid min-h-[80svh] max-w-[74rem] items-center gap-12 px-5 lg:grid-cols-[1fr_1.15fr] lg:gap-16 sm:px-8">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            {eyebrow}
          </span>
          <h1 className="mt-5 text-[clamp(2.25rem,4.8vw,3.5rem)] font-semibold leading-[1.06] tracking-tight">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-foreground)]/65 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[0_12px_32px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]"
            >
              {primaryCta}
            </a>
            <a
              href="#features"
              className="rounded-full border border-[var(--color-foreground)]/15 bg-[var(--color-background)]/80 px-6 py-3 text-sm font-semibold backdrop-blur-sm"
            >
              {secondaryCta}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-xs text-[var(--color-foreground)]/50">
            <span>No credit card</span>
            <span>14-day trial</span>
            <span>Cancel anytime</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:min-h-[min(72vh,36rem)]">
          <div
            aria-hidden
            className="absolute -right-8 top-8 h-56 w-56 rounded-full bg-[var(--color-primary)]/25 blur-3xl"
          />
          <div className="relative h-full rotate-[1.5deg] rounded-2xl border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-2 shadow-[0_32px_80px_rgba(0,0,0,0.14)] transition hover:rotate-0">
            <div className="flex items-center gap-1.5 rounded-t-xl border-b border-[var(--color-foreground)]/8 bg-[var(--color-foreground)]/[0.03] px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 flex-1 rounded-md bg-[var(--color-foreground)]/5 px-2 py-0.5 text-[10px] text-[var(--color-foreground)]/40">
                app.pulse.io/dashboard
              </span>
            </div>
            {src ? (
              <div className="relative min-h-[min(52vh,28rem)] overflow-hidden rounded-b-xl">
                <img
                  src={src}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="min-h-[min(52vh,28rem)] rounded-b-xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-foreground)]/5" />
            )}
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-xl border border-[var(--color-foreground)]/10 bg-[var(--color-background)] px-4 py-3 shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-foreground)]/45">
              Conversion lift
            </p>
            <p className="mt-0.5 text-lg font-bold text-[var(--color-primary)]">+38%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  ThemeModernFeatures: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FEATURES = [
  { title: "Launch faster", description: "Ship polished pages in hours with pre-built conversion blocks." },
  { title: "Measure everything", description: "Built-in analytics surfaces what drives signups and revenue." },
  { title: "Scale with confidence", description: "Enterprise-ready infrastructure that grows with your team." },
  { title: "Integrate instantly", description: "Connect CRM, billing, and support tools in one click." },
  { title: "Collaborate live", description: "Real-time editing keeps marketing and product aligned." },
  { title: "Stay on-brand", description: "Design tokens ensure every page matches your system." },
];

type ThemeModernFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  features?: Array<{ title: string; description: string }>;
};

export function ThemeModernFeatures({
  eyebrow = "Features",
  title = "Everything you need to grow",
  subtitle = "Rounded cards on a balanced grid — scannable benefits built for conversion.",
  features = DEFAULT_FEATURES,
}: ThemeModernFeaturesProps) {
  return (
    <SectionShell id="features" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="features" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <article
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-7 transition duration-500 hover:-translate-y-1 hover:border-[var(--color-primary)]/30 hover:shadow-[0_20px_48px_color-mix(in_srgb,var(--color-foreground)_10%,transparent)]"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--color-primary)]/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]/60">{f.description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeModernServices: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_SERVICES = [
  { title: "Strategy & positioning", summary: "Clarify ICP, messaging, and the path from visit to signup." },
  { title: "Page design & build", summary: "High-converting layouts with your brand system baked in." },
  { title: "Launch & optimization", summary: "Ship, measure, and iterate on what moves the needle." },
];

type ThemeModernServicesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  services?: Array<{ title: string; summary: string }>;
};

export function ThemeModernServices({
  eyebrow = "Services",
  title = "End-to-end delivery",
  subtitle = "Horizontal service rows — clear scope, fast timelines, measurable outcomes.",
  services = DEFAULT_SERVICES,
}: ThemeModernServicesProps) {
  return (
    <SectionShell id="services" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="flex flex-col gap-3">
        {services.map((s, i) => (
          <div
            key={s.title}
            className="group flex flex-col gap-4 rounded-2xl border border-[var(--color-foreground)]/10 bg-[var(--color-background)] p-6 transition hover:border-[var(--color-foreground)]/20 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--color-foreground)]/60">
                  {s.summary}
                </p>
              </div>
            </div>
            <a
              href="#contact"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--color-foreground)]/15 px-5 py-2.5 text-xs font-semibold transition group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)]"
            >
              Learn more →
            </a>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeModernPricing: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_PLANS = [
  {
    name: "Starter",
    monthlyPrice: "$29",
    annualPrice: "$24",
    features: ["5 projects", "Basic analytics", "Email support"],
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$79",
    annualPrice: "$65",
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domains"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    features: ["Dedicated success", "SSO & audit logs", "SLA guarantee", "Custom integrations"],
    highlighted: false,
  },
];

type ThemeModernPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  plans?: Array<{
    name: string;
    monthlyPrice: string;
    annualPrice: string;
    features: string[];
    highlighted?: boolean;
  }>;
};

export function ThemeModernPricing({
  eyebrow = "Pricing",
  title = "Simple, transparent plans",
  subtitle = "Start free, upgrade when you're ready. Annual billing saves 20%.",
  plans = DEFAULT_PLANS,
}: ThemeModernPricingProps) {
  return (
    <SectionShell id="pricing" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-[var(--color-foreground)]/10 bg-[var(--color-foreground)]/[0.04] p-1">
          <span className="rounded-full bg-[var(--color-background)] px-4 py-1.5 text-xs font-semibold shadow-sm">
            Monthly
          </span>
          <span className="px-4 py-1.5 text-xs font-medium text-[var(--color-foreground)]/55">
            Annual
          </span>
        </div>
        <p className="text-xs text-[var(--color-primary)]">Save 20% with annual billing</p>
      </div>
      <div data-theme-scaffold="pricing" className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <article
            key={p.name}
            className={[
              "flex flex-col rounded-3xl border p-7",
              p.highlighted
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/[0.06] shadow-[0_20px_50px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] lg:-translate-y-1"
                : "border-[var(--color-foreground)]/10 bg-[var(--color-surface)]",
            ].join(" ")}
          >
            {p.highlighted ? (
              <span className="mb-3 w-fit rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-primary-foreground)]">
                Most popular
              </span>
            ) : null}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-3 text-4xl font-bold tracking-tight">{p.monthlyPrice}</p>
            <p className="mt-1 text-xs text-[var(--color-foreground)]/45">per month, billed monthly</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--color-foreground)]/70">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 text-[var(--color-primary)]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className={[
                "mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold",
                p.highlighted
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "border border-[var(--color-foreground)]/15",
              ].join(" ")}
            >
              Get started
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeModernFaq: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FAQS = [
  { q: "How fast can we launch?", a: "Most teams ship their first page within days using our pre-built blocks and templates." },
  { q: "Can we migrate existing content?", a: "Yes — guided import tools and dedicated onboarding help you move without downtime." },
  { q: "Do you offer annual discounts?", a: "Annual plans save 20% compared to monthly billing on all paid tiers." },
  { q: "Is there a free trial?", a: "Every plan includes a 14-day trial with full access to Pro features." },
];

type ThemeModernFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  faqs?: Array<{ q: string; a: string }>;
};

export function ThemeModernFaq({
  eyebrow = "FAQ",
  title = "Questions, answered",
  subtitle = "Everything you need to know before you start.",
  faqs = DEFAULT_FAQS,
}: ThemeModernFaqProps) {
  return (
    <SectionShell id="faq" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="mx-auto max-w-2xl divide-y divide-[var(--color-foreground)]/10 rounded-2xl border border-[var(--color-foreground)]/10 bg-[var(--color-surface)]">
        {faqs.map((f) => (
          <details key={f.q} className="group px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold tracking-tight marker:content-none">
              {f.q}
              <span className="text-lg text-[var(--color-foreground)]/35 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]/65">{f.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeModernFooter: `type ThemeModernFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeModernFooter({
  brandName = "Pulse",
  tagline = "Product marketing pages that convert.",
  links = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ],
}: ThemeModernFooterProps) {
  return (
    <footer data-theme-scaffold="footer" className="border-t border-[var(--color-foreground)]/10 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-[74rem] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-3 text-base font-semibold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                {brandName.slice(0, 1)}
              </span>
              {brandName}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-foreground)]/55">{tagline}</p>
            <p className="mt-8 text-xs text-[var(--color-foreground)]/40">
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-col gap-3 lg:items-end">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[var(--color-foreground)]/65 transition hover:text-[var(--color-primary)] lg:text-right"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
`,
};
