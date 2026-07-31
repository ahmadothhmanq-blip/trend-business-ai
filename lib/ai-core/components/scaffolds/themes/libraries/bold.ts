/**
 * Bold theme component scaffolds — high-energy startup neo-brutalism.
 * Chunky borders, hard offset shadows, oversized uppercase type, dramatic CTAs, masonry portfolio.
 * Distinctive: card-in-card nav, brutalist-framed hero (not split, not fullscreen).
 */

export const BOLD_SCAFFOLDS: Record<string, string> = {
  ThemeBoldNav: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#portfolio", label: "Work" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

type ThemeBoldNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeBoldNav({
  brandName = "IMPACT",
  ctaLabel = "GO BIG",
  links = DEFAULT_LINKS,
}: ThemeBoldNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header data-theme-scaffold="nav" className="sticky top-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[68rem] px-4 py-3 sm:px-6">
        <div className="rounded-2xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-primary)] p-1.5 shadow-[8px_8px_0_0_var(--color-foreground)]">
          <div className="rounded-xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-surface)] p-3 shadow-[4px_4px_0_0_var(--color-foreground)]">
            <div className="flex items-center justify-between gap-4">
              <a
                href="/"
                className="text-lg font-black uppercase tracking-tight text-[var(--color-foreground)]"
              >
                {brandName}
              </a>
              <nav className="hidden items-center gap-1 md:flex">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="rounded-lg border-2 border-transparent px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition hover:border-[var(--color-foreground)] hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <a
                  href="#contact"
                  className="hidden rounded-lg border-[3px] border-[var(--color-foreground)] bg-[var(--color-primary)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--color-primary-foreground)] shadow-[4px_4px_0_0_var(--color-foreground)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:inline-flex"
                >
                  {ctaLabel}
                </a>
                <button
                  type="button"
                  className="rounded-lg border-[3px] border-[var(--color-foreground)] px-3 py-2 text-[11px] font-black uppercase md:hidden"
                  aria-label={open ? "Close menu" : "Open menu"}
                  onClick={() => setOpen((v) => !v)}
                >
                  {open ? "Close" : "Menu"}
                </button>
              </div>
            </div>
            {open ? (
              <nav className="mt-3 flex flex-col gap-2 border-t-[3px] border-[var(--color-foreground)] pt-3 md:hidden">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="rounded-lg border-2 border-[var(--color-foreground)] px-3 py-2.5 text-sm font-black uppercase"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  className="mt-1 rounded-lg border-[3px] border-[var(--color-foreground)] bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-black uppercase text-[var(--color-primary-foreground)] shadow-[4px_4px_0_0_var(--color-foreground)]"
                  onClick={() => setOpen(false)}
                >
                  {ctaLabel}
                </a>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
`,

  ThemeBoldHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

type ThemeBoldHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
};

export function ThemeBoldHero({
  title = "Make it impossible to ignore",
  subtitle = "Neo-brutalist landing pages for startups that refuse to whisper. Loud type, hard shadows, zero apologies.",
  eyebrow = "Startup energy",
  primaryCta = "Go big",
  secondaryCta = "See work",
  imageUrl,
  layoutMode = "split",
}: ThemeBoldHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  const cinematic = layoutMode === "cinematic";

  if (cinematic) {
    return (
      <section data-theme-scaffold="hero" className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]">
        {src ? (
          <img src={src} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover object-center" />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-primary)]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/70 to-[var(--color-background)]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/85 via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-[68rem] flex-col justify-end px-4 pb-16 pt-32 sm:px-6 sm:pb-24 lg:pb-28">
          <div className="max-w-3xl rounded-2xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-primary)] p-8 text-[var(--color-primary-foreground)] shadow-[12px_12px_0_0_var(--color-foreground)] sm:p-12">
            <p className="inline-block rounded-md border-2 border-current px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em]">
              {eyebrow}
            </p>
            <h1 className="mt-8 text-[clamp(2.75rem,8vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight text-balance">
              {title}
            </h1>
            <p className="mt-8 max-w-2xl text-base font-semibold leading-relaxed opacity-90 sm:text-lg">
              {subtitle}
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex rounded-xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-background)] px-8 py-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-foreground)] shadow-[6px_6px_0_0_var(--color-foreground)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                {primaryCta}
              </a>
              <a
                href="#portfolio"
                className="inline-flex rounded-xl border-[3px] border-current px-8 py-4 text-sm font-black uppercase tracking-[0.1em] shadow-[6px_6px_0_0_currentColor] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                {secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-theme-scaffold="hero" className="relative min-h-[96svh] overflow-hidden bg-[var(--color-background)]">
      <div className="mx-auto flex min-h-[96svh] max-w-[68rem] flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-2xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-primary)] p-8 text-[var(--color-primary-foreground)] shadow-[12px_12px_0_0_var(--color-foreground)] sm:p-12 lg:p-14">
          <p className="inline-block rounded-md border-2 border-current px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em]">
            {eyebrow}
          </p>
          <h1 className="mt-8 text-[clamp(2.75rem,7.5vw,5.25rem)] font-black uppercase leading-[0.9] tracking-tight text-balance">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-base font-semibold leading-relaxed opacity-90 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="inline-flex rounded-xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-background)] px-8 py-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-foreground)] shadow-[6px_6px_0_0_var(--color-foreground)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              {primaryCta}
            </a>
            <a
              href="#portfolio"
              className="inline-flex rounded-xl border-[3px] border-current px-8 py-4 text-sm font-black uppercase tracking-[0.1em] shadow-[6px_6px_0_0_currentColor] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              {secondaryCta}
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
            <span className="rounded-md border-2 border-current px-2.5 py-1">No fluff</span>
            <span className="rounded-md border-2 border-current px-2.5 py-1">Hard edges</span>
            <span className="rounded-md border-2 border-current px-2.5 py-1">Ship loud</span>
          </div>
        </div>
        {src ? (
          <div className="mt-10 overflow-hidden rounded-2xl border-[3px] border-[var(--color-foreground)] shadow-[10px_10px_0_0_var(--color-foreground)] sm:mt-14">
            <img src={src} alt={title} className="aspect-[21/9] w-full object-cover object-center sm:aspect-[2/1]" />
          </div>
        ) : (
          <div className="mt-10 aspect-[21/9] rounded-2xl border-[3px] border-dashed border-[var(--color-foreground)] bg-[var(--color-foreground)]/5 shadow-[10px_10px_0_0_var(--color-foreground)] sm:mt-14 sm:aspect-[2/1]" />
        )}
      </div>
    </section>
  );
}
`,

  ThemeBoldPortfolio: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

const DEFAULT_ITEMS = [
  { title: "Launch kit", tag: "Brand" },
  { title: "Pulse app", tag: "Product" },
  { title: "Neon drop", tag: "Campaign" },
  { title: "Studio rebrand", tag: "Identity" },
];

type ThemeBoldPortfolioProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; tag: string }>;
};

export function ThemeBoldPortfolio({
  eyebrow = "Portfolio",
  title = "Work that hits",
  subtitle = "Masonry grid — chunky cards, hard shadows, zero subtlety.",
  items = DEFAULT_ITEMS,
}: ThemeBoldPortfolioProps) {
  return (
    <SectionShell id="portfolio" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {items.map((item, i) => {
          const src = resolveSiteImage(GALLERY_IMAGES[i] || HERO_IMAGE, i);
          const tall = i % 3 === 0;
          return (
            <article
              key={item.title}
              className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-surface)] shadow-[6px_6px_0_0_var(--color-foreground)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              {src ? (
                <img
                  src={src}
                  alt={item.title}
                  className={[
                    "w-full object-cover",
                    tall ? "aspect-[3/4]" : "aspect-[4/3]",
                  ].join(" ")}
                />
              ) : (
                <div
                  className={[
                    "bg-[var(--color-primary)]/15",
                    tall ? "aspect-[3/4]" : "aspect-[4/3]",
                  ].join(" ")}
                />
              )}
              <div className="border-t-[3px] border-[var(--color-foreground)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-primary)]">
                  {item.tag}
                </p>
                <h3 className="mt-2 text-xl font-black uppercase tracking-tight">{item.title}</h3>
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  ThemeBoldFeatures: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FEATURES = [
  { title: "Loud layouts", description: "High-contrast blocks with brutal borders and offset shadows that demand attention." },
  { title: "Fast ship", description: "Pre-built neo-brutalist sections — launch a landing page in hours, not weeks." },
  { title: "Hard CTAs", description: "Oversized uppercase buttons with dramatic hover states that actually convert." },
  { title: "Token-driven", description: "Theme colors flow through CSS variables — rebrand without rebuilding markup." },
  { title: "Masonry ready", description: "Portfolio grids with break-inside-avoid cards for editorial punch." },
  { title: "Mobile brutal", description: "Chunky tap targets and stacked cards that stay bold on every screen size." },
];

type ThemeBoldFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  features?: Array<{ title: string; description: string }>;
};

export function ThemeBoldFeatures({
  eyebrow = "Features",
  title = "Built bold",
  subtitle = "Card-first feature grid — every block punches above its weight.",
  features = DEFAULT_FEATURES,
}: ThemeBoldFeaturesProps) {
  return (
    <SectionShell id="features" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="features" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <article
            key={f.title}
            className={[
              "group rounded-2xl border-[3px] border-[var(--color-foreground)] p-7 shadow-[6px_6px_0_0_var(--color-foreground)] transition duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--color-foreground)]",
              i === 0 ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-surface)]",
            ].join(" ")}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-[3px] border-current text-sm font-black">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-xl font-black uppercase tracking-tight">{f.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed opacity-90">{f.description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeBoldPricing: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_PLANS = [
  { name: "Studio", price: "$49", period: "/mo", perks: ["3 seats", "Bold templates", "Email support"], highlighted: false },
  { name: "Scale", price: "$129", period: "/mo", perks: ["Unlimited seats", "Custom tokens", "Priority support", "Analytics"], highlighted: true },
  { name: "Enterprise", price: "Custom", period: "", perks: ["Dedicated success", "SSO", "SLA", "White-label"], highlighted: false },
];

type ThemeBoldPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  plans?: Array<{ name: string; price: string; period?: string; perks: string[]; highlighted?: boolean }>;
};

export function ThemeBoldPricing({
  eyebrow = "Pricing",
  title = "Pick your power",
  subtitle = "Bold pricing cards — hard shadows, louder typography, clearer value.",
  plans = DEFAULT_PLANS,
}: ThemeBoldPricingProps) {
  return (
    <SectionShell id="pricing" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="pricing" className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <article
            key={p.name}
            className={[
              "flex flex-col rounded-2xl border-[3px] border-[var(--color-foreground)] p-8 shadow-[8px_8px_0_0_var(--color-foreground)]",
              p.highlighted
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] lg:-translate-y-2"
                : "bg-[var(--color-surface)]",
            ].join(" ")}
          >
            {p.highlighted ? (
              <span className="mb-4 w-fit rounded-md border-2 border-current px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                Most popular
              </span>
            ) : null}
            <h3 className="text-2xl font-black uppercase tracking-tight">{p.name}</h3>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tight">{p.price}</span>
              {p.period ? (
                <span className="text-sm font-black uppercase opacity-80">{p.period}</span>
              ) : null}
            </p>
            <ul className="mt-8 flex-1 space-y-3 text-sm font-bold">
              {p.perks.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <span className="mt-0.5 font-black">→</span>
                  {x}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className={[
                "mt-8 inline-flex items-center justify-center rounded-xl border-[3px] px-5 py-3.5 text-sm font-black uppercase tracking-[0.1em] shadow-[5px_5px_0_0_var(--color-foreground)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                p.highlighted
                  ? "border-[var(--color-foreground)] bg-[var(--color-background)] text-[var(--color-foreground)]"
                  : "border-[var(--color-foreground)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
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

  ThemeBoldIntegrations: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { name: "Stripe" },
  { name: "HubSpot" },
  { name: "Slack" },
  { name: "Notion" },
  { name: "Zapier" },
  { name: "GitHub" },
];

type ThemeBoldIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ name: string }>;
};

export function ThemeBoldIntegrations({
  eyebrow = "Integrations",
  title = "Plug and punch",
  subtitle = "Chunky integration badges — connect your stack without softening the edges.",
  items = DEFAULT_ITEMS,
}: ThemeBoldIntegrationsProps) {
  return (
    <SectionShell id="integrations" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="flex flex-wrap gap-4">
        {items.map((item, i) => (
          <div
            key={item.name}
            className={[
              "rounded-xl border-[3px] border-[var(--color-foreground)] px-6 py-4 text-sm font-black uppercase tracking-[0.08em] shadow-[5px_5px_0_0_var(--color-foreground)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
              i % 3 === 0 ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-surface)]",
            ].join(" ")}
          >
            {item.name}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeBoldFaq: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FAQS = [
  { q: "Is it customizable?", a: "Fully themeable via CSS variables — swap colors and fonts without touching component markup." },
  { q: "Can I use my own images?", a: "Pass imageUrl props or rely on site-images defaults. Every hero and portfolio card resolves automatically." },
  { q: "Does it work on mobile?", a: "Yes — stacked brutalist cards, chunky tap targets, and a collapsible card-in-card nav." },
  { q: "How fast can we launch?", a: "Most teams ship a bold landing page in days using these pre-built scaffolds." },
];

type ThemeBoldFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  faqs?: Array<{ q: string; a: string }>;
};

export function ThemeBoldFaq({
  eyebrow = "FAQ",
  title = "Straight answers",
  subtitle = "No accordion fluff — bold FAQ cards with hard shadows.",
  faqs = DEFAULT_FAQS,
}: ThemeBoldFaqProps) {
  return (
    <SectionShell id="faq" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <article
            key={f.q}
            className={[
              "rounded-2xl border-[3px] border-[var(--color-foreground)] p-6 shadow-[5px_5px_0_0_var(--color-foreground)]",
              i === 0 ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-surface)]",
            ].join(" ")}
          >
            <h3 className="text-lg font-black uppercase tracking-tight">{f.q}</h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed opacity-90">{f.a}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeBoldFooter: `type ThemeBoldFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeBoldFooter({
  brandName = "IMPACT",
  tagline = "Built loud. Shipped bold.",
  links = [
    { href: "#portfolio", label: "Work" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ],
}: ThemeBoldFooterProps) {
  return (
    <footer data-theme-scaffold="footer" className="border-t-[3px] border-[var(--color-foreground)] bg-[var(--color-background)] py-14">
      <div className="mx-auto max-w-[68rem] px-4 sm:px-6">
        <div className="inline-block w-full rounded-2xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-surface)] p-8 shadow-[8px_8px_0_0_var(--color-foreground)] sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-2xl font-black uppercase tracking-tight">{brandName}</p>
              <p className="mt-3 max-w-xs text-sm font-bold uppercase tracking-[0.12em] opacity-70">
                {tagline}
              </p>
            </div>
            <nav className="flex flex-wrap gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg border-[3px] border-[var(--color-foreground)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] shadow-[4px_4px_0_0_var(--color-foreground)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="mt-10 border-t-[3px] border-[var(--color-foreground)] pt-6 text-[10px] font-black uppercase tracking-[0.24em] opacity-60">
            © {new Date().getFullYear()} {brandName} — all rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
`,

  ThemeBoldFloatingCta: `"use client";

import { useState } from "react";

type ThemeBoldFloatingCtaProps = { label?: string; href?: string };

export function ThemeBoldFloatingCta({
  label = "Let's talk",
  href = "#contact",
}: ThemeBoldFloatingCtaProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2 sm:bottom-8 sm:right-8">
      <a
        href={href}
        className="rounded-xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-primary)] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[var(--color-primary-foreground)] shadow-[6px_6px_0_0_var(--color-foreground)] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        {label}
      </a>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
        className="flex h-12 w-12 items-center justify-center rounded-xl border-[3px] border-[var(--color-foreground)] bg-[var(--color-background)] text-lg font-black shadow-[4px_4px_0_0_var(--color-foreground)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
      >
        ×
      </button>
    </div>
  );
}
`,
};
