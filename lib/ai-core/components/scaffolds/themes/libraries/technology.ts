/**
 * Technology theme component scaffolds — modern SaaS dashboard aesthetic.
 * Sidebar rail nav, glassmorphism, bento grid, monospace accents, glow effects.
 */

export const TECHNOLOGY_SCAFFOLDS: Record<string, string> = {
  ThemeTechNav: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#features", label: "Features", icon: "▦" },
  { href: "#cases", label: "Cases", icon: "◈" },
  { href: "#integrations", label: "Integrations", icon: "⬡" },
  { href: "#trust", label: "Trust", icon: "◉" },
  { href: "#contact", label: "Contact", icon: "◎" },
];

type ThemeTechNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string; icon?: string }>;
};

export function ThemeTechNav({
  brandName = "Vertex",
  ctaLabel = "Deploy",
  links = DEFAULT_LINKS,
}: ThemeTechNavProps) {
  const [open, setOpen] = useState(false);
  const initials = brandName.slice(0, 2).toUpperCase();

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[4.25rem] flex-col items-center border-r border-white/10 bg-[var(--color-background)]/85 py-5 backdrop-blur-xl lg:flex">
        <a
          href="/"
          title={brandName}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono text-[10px] font-bold text-[var(--color-accent)] shadow-[0_0_24px_-6px_var(--color-accent)]"
        >
          {initials}
        </a>
        <nav className="flex flex-1 flex-col items-center gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              title={l.label}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-[var(--color-foreground)]/70 transition hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] hover:shadow-[0_0_20px_-4px_var(--color-accent)]"
            >
              {l.icon ?? "•"}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          title={ctaLabel}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)] font-mono text-[10px] font-bold text-black shadow-[0_0_28px_-4px_var(--color-accent)]"
        >
          →
        </a>
      </aside>

      <header data-theme-scaffold="nav" className="sticky top-0 z-40 border-b border-white/10 bg-[var(--color-background)]/80 backdrop-blur-2xl backdrop-saturate-150 lg:pl-[4.25rem]">
        <div className="mx-auto flex max-w-[82rem] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <a href="/" className="font-mono text-sm font-semibold tracking-tight lg:hidden">
            {brandName}
          </a>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)] lg:block">
            Platform / Dashboard
          </p>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 font-mono text-[11px] text-[var(--color-foreground)]/60 transition hover:bg-white/5 hover:text-[var(--color-foreground)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 font-mono text-[10px] text-[var(--color-accent)] sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
              live
            </span>
            <a
              href="#contact"
              className="hidden rounded-lg bg-[var(--color-accent)] px-4 py-2 font-mono text-[11px] font-bold text-black shadow-[0_0_24px_-6px_var(--color-accent)] sm:inline-flex"
            >
              {ctaLabel}
            </a>
            <button
              type="button"
              className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? "×" : "☰"}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="border-t border-white/10 px-4 py-4 lg:hidden">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 py-2.5 font-mono text-sm"
                onClick={() => setOpen(false)}
              >
                <span className="text-[var(--color-accent)]">{l.icon ?? "•"}</span>
                {l.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>
    </>
  );
}
`,

  ThemeTechHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

const DEFAULT_METRICS = [
  { label: "Uptime", value: "99.99%" },
  { label: "P99 latency", value: "42ms" },
  { label: "Events / sec", value: "2.4M" },
];

type ThemeTechHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
  metrics?: Array<{ label: string; value: string }>;
};

export function ThemeTechHero({
  title = "Infrastructure for intelligent products",
  subtitle = "Deploy APIs, stream events, and ship dashboards from one glass surface.",
  eyebrow = "Tech stack",
  primaryCta = "Start building",
  secondaryCta = "Read docs",
  imageUrl,
  layoutMode = "dashboard",
  metrics = DEFAULT_METRICS,
}: ThemeTechHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  const cinematic = layoutMode === "cinematic";

  if (cinematic) {
    return (
      <section
        data-theme-scaffold="hero"
        className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)] lg:pl-[4.25rem]"
      >
        {src ? (
          <img
            src={src}
            alt={title}
            className="absolute inset-0 h-full w-full scale-105 object-cover object-center opacity-40"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/70 to-[var(--color-background)]/30" />
        <div className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[var(--color-accent)] opacity-20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[var(--color-primary)] opacity-15 blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,color-mix(in_srgb,var(--color-accent)_25%,transparent),transparent)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[82rem] flex-col justify-end px-4 pb-16 pt-32 sm:px-6 sm:pb-24">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)] shadow-[0_0_40px_-8px_var(--color-accent)]">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-[14ch] text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-foreground)]/65 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-mono text-sm font-bold text-black shadow-[0_0_48px_-8px_var(--color-accent)]"
            >
              {primaryCta}
            </a>
            <a
              href="#docs"
              className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-mono text-sm font-semibold backdrop-blur-xl"
            >
              {secondaryCta}
            </a>
          </div>
          <div className="mt-14 flex flex-wrap gap-8 border-t border-white/10 pt-8">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="font-mono text-2xl font-bold tracking-tight text-[var(--color-accent)] shadow-[0_0_30px_-10px_var(--color-accent)]">
                  {m.value}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-foreground)]/45">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-theme-scaffold="hero"
      className="relative min-h-[96svh] overflow-hidden bg-[var(--color-background)] py-14 lg:pl-[4.25rem]"
    >
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[var(--color-accent)] opacity-[0.14] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[var(--color-primary)] opacity-[0.1] blur-[100px]" />

      <div className="relative mx-auto grid min-h-[88svh] max-w-[82rem] gap-6 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:items-stretch">
        <aside className="hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Live metrics
          </p>
          <ul className="mt-5 flex-1 space-y-5">
            {metrics.map((m) => (
              <li key={m.label}>
                <p className="font-mono text-2xl font-bold tracking-tight text-[var(--color-accent)] shadow-[0_0_30px_-10px_var(--color-accent)]">
                  {m.value}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--color-foreground)]/45">
                  {m.label}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[10px] text-[var(--color-foreground)]/50">
            <p className="text-[var(--color-accent)]">cluster_us_east</p>
            <p className="mt-1">status: healthy</p>
          </div>
        </aside>

        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-xl shadow-[0_0_80px_-20px_var(--color-accent)] sm:p-10">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.06] tracking-tight">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-foreground)]/60">
              {subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 font-mono text-sm font-bold text-black shadow-[0_0_32px_-8px_var(--color-accent)]"
              >
                {primaryCta}
              </a>
              <a
                href="#docs"
                className="rounded-lg border border-white/15 px-5 py-2.5 font-mono text-sm font-semibold backdrop-blur"
              >
                {secondaryCta}
              </a>
            </div>
          </div>

          {src ? (
            <div className="relative min-h-[min(52vh,28rem)] flex-1 overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_60px_-16px_var(--color-accent)]">
              <img
                src={src}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/80 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-mono text-[10px] text-[var(--color-foreground)]/40">
                vertex-cli — bash
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--color-foreground)]/70">
              <code>{\`$ npx vertex deploy --region us-east
✓ cluster ready · 1.2s
✓ edge cache warmed · 340ms
→ https://api.vertex.dev/v1\`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  ThemeTechBento: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { title: "Realtime streams", description: "Sub-50ms event delivery with automatic fan-out.", span: "lg" },
  { title: "Zero-trust auth", description: "Scoped tokens and audit trails by default.", span: "sm" },
  { title: "Edge compute", description: "Deploy functions to 40+ regions.", span: "sm" },
  { title: "Observability", description: "Traces, metrics, and logs in one glass panel.", span: "md" },
  { title: "Webhooks", description: "Signed payloads with retry logic.", span: "md" },
];

type ThemeTechBentoProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; span?: string }>;
};

function spanClass(span?: string): string {
  if (span === "lg") return "md:col-span-4 md:row-span-2";
  if (span === "md") return "md:col-span-3";
  return "md:col-span-3";
}

export function ThemeTechBento({
  eyebrow = "Platform",
  title = "Modular by design",
  subtitle = "Glass bento grid with glow-accent panels.",
  items = DEFAULT_ITEMS,
}: ThemeTechBentoProps) {
  return (
    <SectionShell id="features" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="features" className="grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(160px,auto)]">
        {items.map((item, i) => (
          <article
            key={item.title}
            className={[
              "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[var(--color-accent)]/40 hover:shadow-[0_0_48px_-8px_var(--color-accent)]",
              spanClass(item.span),
            ].join(" ")}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--color-accent)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-25" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent opacity-0 transition group-hover:opacity-100" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
              0{i + 1}
            </p>
            <h3 className="mt-4 text-[clamp(1.1rem,2vw,1.35rem)] font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]/55">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeTechCases: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

const DEFAULT_CASES = [
  { name: "Flowstack", metric: "3× faster releases", detail: "CI/CD pipeline migrated in 2 weeks." },
  { name: "Nimbus AI", metric: "−68% infra cost", detail: "Edge routing cut egress spend." },
  { name: "Lattice", metric: "99.99% uptime", detail: "Multi-region failover in production." },
];

type ThemeTechCasesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cases?: Array<{ name: string; metric: string; detail?: string }>;
};

export function ThemeTechCases({
  eyebrow = "Cases",
  title = "Customer outcomes",
  subtitle = "Metric-led case cards with monospace highlights.",
  cases = DEFAULT_CASES,
}: ThemeTechCasesProps) {
  return (
    <SectionShell id="cases" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="testimonials" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => {
          const src = resolveSiteImage(GALLERY_IMAGES[i] || HERO_IMAGE, i);
          return (
            <article
              key={c.name}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[var(--color-accent)]/35 hover:shadow-[0_0_48px_-8px_var(--color-accent)]"
            >
              {src ? (
                <div className="relative h-44 overflow-hidden">
                  <img src={src} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/20 to-transparent" />
                </div>
              ) : null}
              <div className="p-7">
                <p className="font-mono text-sm font-bold text-[var(--color-accent)] shadow-[0_0_24px_-8px_var(--color-accent)]">{c.metric}</p>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{c.name}</h3>
                {c.detail ? (
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-foreground)]/55">{c.detail}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  ThemeTechIntegrations: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { name: "GitHub", category: "VCS" },
  { name: "Slack", category: "Comms" },
  { name: "Stripe", category: "Billing" },
  { name: "Datadog", category: "Observability" },
  { name: "Terraform", category: "IaC" },
  { name: "Vercel", category: "Deploy" },
];

type ThemeTechIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ name: string; category?: string }>;
};

export function ThemeTechIntegrations({
  eyebrow = "Integrations",
  title = "Connect your stack",
  subtitle = "One-click connectors with webhook sync.",
  items = DEFAULT_ITEMS,
}: ThemeTechIntegrationsProps) {
  return (
    <SectionShell id="integrations" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.name}
            className="group flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-6 backdrop-blur transition hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 hover:shadow-[0_0_24px_-8px_var(--color-accent)]"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">{item.name}</span>
            {item.category ? (
              <span className="mt-2 font-mono text-[9px] uppercase tracking-wider text-[var(--color-foreground)]/40">
                {item.category}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeTechTrust: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { label: "Developers", value: "80k+" },
  { label: "API requests / day", value: "1.2B" },
  { label: "Regions", value: "42" },
  { label: "Enterprise SLA", value: "99.99%" },
];

type ThemeTechTrustProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ label: string; value: string }>;
};

export function ThemeTechTrust({
  eyebrow = "Trust",
  title = "Battle-tested at scale",
  subtitle = "Metrics panels with glow-accent typography.",
  items = DEFAULT_ITEMS,
}: ThemeTechTrustProps) {
  return (
    <SectionShell id="trust" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl transition hover:border-[var(--color-accent)]/30 hover:shadow-[0_0_32px_-10px_var(--color-accent)]"
          >
            <p className="font-mono text-3xl font-bold tracking-tight text-[var(--color-accent)] shadow-[0_0_24px_-8px_var(--color-accent)]">
              {item.value}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-foreground)]/50">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeTechCta: `import { SectionShell } from "@/components/ui/section-shell";

type ThemeTechCtaProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function ThemeTechCta({
  eyebrow = "Deploy",
  title = "Ship your next release",
  subtitle = "Generate API keys, connect webhooks, and go live in minutes.",
  primaryCta = "Get API keys",
  secondaryCta = "View pricing",
}: ThemeTechCtaProps) {
  return (
    <SectionShell id="cta" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="cta" className="relative overflow-hidden rounded-2xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)]/15 via-white/5 to-transparent p-8 backdrop-blur-xl shadow-[0_0_60px_-16px_var(--color-accent)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--color-accent)] opacity-20 blur-3xl" />
        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
          <p className="mt-2 max-w-lg text-sm text-[var(--color-foreground)]/60">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex rounded-lg bg-[var(--color-accent)] px-5 py-2.5 font-mono text-sm font-bold text-black shadow-[0_0_32px_-8px_var(--color-accent)]"
            >
              {primaryCta}
            </a>
            <a
              href="#pricing"
              className="inline-flex rounded-lg border border-white/15 px-5 py-2.5 font-mono text-sm font-semibold backdrop-blur"
            >
              {secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ThemeTechFooter: `type ThemeTechFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeTechFooter({
  brandName = "Vertex",
  tagline = "Infrastructure for intelligent products.",
  links = [
    { href: "#features", label: "Features" },
    { href: "#integrations", label: "Integrations" },
    { href: "#contact", label: "Contact" },
  ],
}: ThemeTechFooterProps) {
  return (
    <footer data-theme-scaffold="footer" className="border-t border-white/10 bg-[var(--color-background)] py-16 lg:pl-[4.25rem]">
      <div className="mx-auto max-w-[82rem] px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="font-mono text-sm font-semibold tracking-tight">{brandName}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-foreground)]/55">{tagline}</p>
            <p className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] text-emerald-400/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              all systems operational
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 lg:justify-end">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-foreground)]/60 transition hover:text-[var(--color-accent)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 border-t border-white/8 pt-6">
          <p className="font-mono text-[10px] text-[var(--color-foreground)]/35">
            © {new Date().getFullYear()} {brandName} · Built for scale
          </p>
        </div>
      </div>
    </footer>
  );
}
`,

  ThemeTechFloatingCta: `"use client";

import { useState } from "react";

type ThemeTechFloatingCtaProps = { label?: string; href?: string };

export function ThemeTechFloatingCta({
  label = "Start trial",
  href = "#contact",
}: ThemeTechFloatingCtaProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 lg:bottom-8 lg:right-8">
      <a
        href={href}
        className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/90 px-5 py-3 font-mono text-xs font-bold text-black shadow-[0_0_32px_-6px_var(--color-accent)] backdrop-blur-xl transition hover:bg-[var(--color-accent)]"
      >
        {label}
      </a>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-[var(--color-background)]/90 font-mono text-sm backdrop-blur-xl transition hover:border-white/30"
      >
        ×
      </button>
    </div>
  );
}
`,
};
