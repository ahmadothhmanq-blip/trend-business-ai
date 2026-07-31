/**
 * Corporate theme component scaffolds — enterprise trust-first aesthetic.
 * Dual-tier topbar with compliance banner, structured IA, numbered process
 * pipeline, trust metrics band, executive testimonials, split contact with form.
 */

export const CORPORATE_SCAFFOLDS: Record<string, string> = {
  ThemeCorporateNav: `"use client";

const DEFAULT_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#trust", label: "Trust" },
  { href: "#testimonials", label: "Leaders" },
  { href: "#contact", label: "Contact" },
];

const DEFAULT_UTILITY = [
  { href: "#support", label: "Support" },
  { href: "#docs", label: "Documentation" },
  { href: "#careers", label: "Careers" },
  { href: "#login", label: "Client portal" },
];

type ThemeCorporateNavProps = {
  brandName?: string;
  ctaLabel?: string;
  complianceBanner?: string;
  links?: Array<{ href: string; label: string }>;
  utilityLinks?: Array<{ href: string; label: string }>;
};

export function ThemeCorporateNav({
  brandName = "Northline",
  ctaLabel = "Request demo",
  complianceBanner = "Enterprise-grade · SOC 2 Type II · GDPR compliant · 24/7 support",
  links = DEFAULT_LINKS,
  utilityLinks = DEFAULT_UTILITY,
}: ThemeCorporateNavProps) {
  return (
    <header data-theme-scaffold="nav" className="sticky top-0 z-50 border-b border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))]/90 shadow-[0_1px_0_0_color-mix(in_srgb,var(--color-foreground)_6%,transparent)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="border-b border-[var(--color-foreground)]/8 bg-[var(--color-primary)]/[0.06]">
        <div className="mx-auto flex max-w-[76rem] flex-col gap-2 px-6 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-foreground)]/55">
            {complianceBanner}
          </p>
          <nav
            aria-label="Utility"
            className="flex flex-wrap items-center gap-x-5 gap-y-1"
          >
            {utilityLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[11px] font-medium text-[var(--color-foreground)]/50 transition hover:text-[var(--color-primary)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[76rem] px-6 sm:px-8">
        <div className="flex items-center justify-between gap-6 py-4">
          <a
            href="/"
            className="shrink-0 text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-foreground)]"
          >
            {brandName}
          </a>

          <nav
            aria-label="Primary"
            className="hidden flex-1 items-center justify-center gap-8 lg:flex"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[var(--color-foreground)]/65 transition hover:text-[var(--color-primary)]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="shrink-0 rounded bg-[var(--color-primary)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-primary-foreground)]"
          >
            {ctaLabel}
          </a>
        </div>

        <nav
          aria-label="Primary mobile"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-foreground)]/8 py-3 lg:hidden"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-medium text-[var(--color-foreground)]/60"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
`,

  ThemeCorporateHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

const DEFAULT_BADGES = [
  { label: "SOC 2 Type II", detail: "Audited annually" },
  { label: "ISO 27001", detail: "Certified" },
  { label: "GDPR", detail: "EU-ready" },
  { label: "HIPAA", detail: "BAA available" },
];

const DEFAULT_STATS = [
  { value: "120+", label: "Fortune 500 clients" },
  { value: "99.99%", label: "Platform uptime" },
  { value: "48h", label: "Avg. onboarding" },
];

type ThemeCorporateHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
  badges?: Array<{ label: string; detail?: string }>;
  stats?: Array<{ value: string; label: string }>;
};

export function ThemeCorporateHero({
  title = "Governance-ready operations at enterprise scale",
  subtitle = "Northline delivers audit-ready infrastructure, executive-grade support, and measurable outcomes for regulated industries.",
  eyebrow = "Enterprise platform",
  primaryCta = "Request executive briefing",
  secondaryCta = "Download compliance brief",
  imageUrl,
  layoutMode = "split",
  badges = DEFAULT_BADGES,
  stats = DEFAULT_STATS,
}: ThemeCorporateHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  const darkAuthority = layoutMode === "dark-authority";

  if (darkAuthority) {
    return (
      <section
        data-theme-scaffold="hero"
        className="relative min-h-[100svh] overflow-hidden border-b border-white/10 bg-[#08080a] text-[#f4f4f5]"
      >
        {src ? (
          <img
            src={src}
            alt={title}
            className="absolute inset-0 h-full w-full scale-105 object-cover object-center opacity-30"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/90 to-[#08080a]/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-[#08080a]/40" />

        <div className="relative mx-auto grid min-h-[100svh] max-w-[76rem] items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[1.06] tracking-tight">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#f4f4f5]/70 sm:text-lg">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[0_8px_32px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
              >
                {primaryCta}
              </a>
              <a
                href="#trust"
                className="rounded border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm"
              >
                {secondaryCta}
              </a>
            </div>
            <dl className="mt-12 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-[#f4f4f5]/45">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-5">
            {src ? (
              <div className="relative min-h-[min(48vh,24rem)] overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.5)] lg:min-h-[min(56vh,32rem)]">
                <img
                  src={src}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <div
                  key={b.label}
                  className="rounded border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
                    {b.label}
                  </p>
                  {b.detail ? (
                    <p className="mt-1 text-[11px] text-[#f4f4f5]/45">{b.detail}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-theme-scaffold="hero"
      className="min-h-[96svh] border-b border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))] py-14 sm:py-20"
    >
      <div className="mx-auto grid min-h-[80svh] max-w-[76rem] items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-[clamp(2rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-tight">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-foreground)]/65 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)]"
            >
              {primaryCta}
            </a>
            <a
              href="#trust"
              className="rounded border border-[var(--color-foreground)]/15 px-5 py-2.5 text-sm font-semibold"
            >
              {secondaryCta}
            </a>
          </div>

          <dl className="mt-10 grid gap-4 border-t border-[var(--color-foreground)]/10 pt-8 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-foreground)]/50">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-5">
          {src ? (
            <div className="relative min-h-[min(48vh,24rem)] overflow-hidden rounded-xl border border-[var(--color-foreground)]/10 shadow-[0_16px_48px_rgba(0,0,0,0.08)] lg:min-h-[min(56vh,32rem)]">
              <img
                src={src}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            {badges.map((b) => (
              <div
                key={b.label}
                className="rounded border border-[var(--color-foreground)]/10 bg-[var(--color-background)] p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
                  {b.label}
                </p>
                {b.detail ? (
                  <p className="mt-1 text-[11px] text-[var(--color-foreground)]/50">{b.detail}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  ThemeCorporateProcess: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_STEPS = [
  { title: "Discovery", detail: "Stakeholder alignment, risk assessment, and compliance mapping." },
  { title: "Architecture", detail: "Solution design with security review and executive sign-off." },
  { title: "Deployment", detail: "Phased rollout with change management and audit trails." },
  { title: "Governance", detail: "Ongoing monitoring, reporting, and continuous improvement." },
];

type ThemeCorporateProcessProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  steps?: Array<{ title: string; detail: string }>;
};

export function ThemeCorporateProcess({
  eyebrow = "Process",
  title = "Structured delivery pipeline",
  subtitle = "A proven four-phase methodology designed for regulated environments and executive oversight.",
  steps = DEFAULT_STEPS,
}: ThemeCorporateProcessProps) {
  return (
    <SectionShell id="process" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <ol data-theme-scaffold="features" className="relative grid gap-10 md:grid-cols-4 md:gap-6">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="group relative rounded-2xl border border-[var(--color-foreground)]/10 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] p-7 transition hover:border-[var(--color-primary)]/30 hover:shadow-[0_20px_48px_color-mix(in_srgb,var(--color-foreground)_8%,transparent)] md:border-l-0 md:pt-10"
          >
            <span
              aria-hidden
              className="absolute -top-px left-7 right-7 hidden h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/40 to-transparent md:block"
            />
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-background)] text-xs font-bold text-[var(--color-primary)] shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary)_20%,transparent)] transition group-hover:scale-105">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]/60">
              {s.detail}
            </p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
`,

  ThemeCorporateServices: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_SERVICES = [
  {
    title: "Strategic advisory",
    summary: "Executive workshops, operating model design, and board-ready roadmaps.",
    features: ["C-suite facilitation", "Risk frameworks", "Quarterly reviews"],
  },
  {
    title: "Managed implementation",
    summary: "End-to-end deployment with dedicated project governance and SLAs.",
    features: ["Dedicated PMO", "Change management", "Go-live support"],
  },
  {
    title: "Compliance & audit",
    summary: "Continuous controls monitoring, evidence collection, and regulator-ready reporting.",
    features: ["SOC 2 readiness", "Audit trails", "Policy automation"],
  },
];

type ThemeCorporateServicesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  services?: Array<{ title: string; summary: string; features?: string[] }>;
};

export function ThemeCorporateServices({
  eyebrow = "Services",
  title = "Professional services portfolio",
  subtitle = "Structured offerings aligned to enterprise procurement and compliance requirements.",
  services = DEFAULT_SERVICES,
}: ThemeCorporateServicesProps) {
  return (
    <SectionShell id="services" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="features" className="grid gap-6 lg:grid-cols-3">
        {services.map((s) => (
          <article
            key={s.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-foreground)]/10 bg-[var(--color-background)] shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-primary)]/25 hover:shadow-[0_24px_48px_color-mix(in_srgb,var(--color-foreground)_10%,transparent)]"
          >
            <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)]/60 to-transparent" />
            <div className="flex flex-1 flex-col p-7">
              <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-foreground)]/65">
                {s.summary}
              </p>
              {s.features?.length ? (
                <ul className="mt-6 space-y-2.5 border-t border-[var(--color-foreground)]/8 pt-5">
                  {s.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-[var(--color-foreground)]/70"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[10px] font-bold text-[var(--color-primary)]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeCorporateTrust: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_METRICS = [
  { stat: "120+", label: "Fortune 500 clients", detail: "Across financial services, healthcare, and public sector." },
  { stat: "99.99%", label: "Platform uptime", detail: "Multi-region failover with published SLA." },
  { stat: "0", label: "Critical breaches", detail: "Independent penetration testing quarterly." },
  { stat: "24/7", label: "Executive support", detail: "Dedicated escalation path for enterprise accounts." },
];

type ThemeCorporateTrustProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  metrics?: Array<{ stat: string; label: string; detail?: string }>;
};

export function ThemeCorporateTrust({
  eyebrow = "Trust & security",
  title = "Proof you can audit",
  subtitle = "Independently verified controls and transparent metrics for procurement and compliance teams.",
  metrics = DEFAULT_METRICS,
}: ThemeCorporateTrustProps) {
  return (
    <SectionShell id="trust" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="features" className="overflow-hidden rounded-2xl border border-[var(--color-foreground)]/10 bg-gradient-to-br from-[var(--color-primary)]/[0.06] via-[var(--color-background)] to-[var(--color-surface)] shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--color-foreground)_6%,transparent)]">
        <div className="grid divide-y divide-[var(--color-foreground)]/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {metrics.map((m) => (
            <div key={m.label} className="group px-7 py-10 text-center transition hover:bg-[var(--color-primary)]/[0.04] sm:text-left">
              <p className="text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight text-[var(--color-primary)]">
                {m.stat}
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em]">
                {m.label}
              </p>
              {m.detail ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]/55">
                  {m.detail}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ThemeCorporateTestimonials: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  {
    quote: "Northline gave our board the audit trail and operational clarity we needed without slowing delivery.",
    name: "Sarah Chen",
    role: "Chief Operating Officer",
    company: "Meridian Financial",
  },
  {
    quote: "Their governance framework reduced our compliance review cycle from months to weeks.",
    name: "James Okonkwo",
    role: "VP, Enterprise Technology",
    company: "Helix Health Systems",
  },
  {
    quote: "Executive support that actually understands regulated environments — rare and invaluable.",
    name: "Elena Vasquez",
    role: "Director of IT Governance",
    company: "Public Sector Alliance",
  },
];

type ThemeCorporateTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; name: string; role?: string; company?: string }>;
};

export function ThemeCorporateTestimonials({
  eyebrow = "Executive voices",
  title = "Trusted by leadership teams",
  subtitle = "Perspectives from COOs, VPs, and directors who demand accountability.",
  items = DEFAULT_ITEMS,
}: ThemeCorporateTestimonialsProps) {
  return (
    <SectionShell id="testimonials" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="testimonials" className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {items.map((t, index) => (
          <blockquote
            key={t.name}
            className={[
              "group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-foreground)]/10 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] p-8 transition hover:border-[var(--color-primary)]/25 hover:shadow-[0_24px_48px_color-mix(in_srgb,var(--color-foreground)_8%,transparent)] sm:p-10",
              index === 0 ? "lg:col-span-7" : "lg:col-span-5",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-5xl leading-none text-[var(--color-primary)]/20"
            >
              &ldquo;
            </span>
            <p className={[
              "mt-4 flex-1 leading-[1.7] text-[var(--color-foreground)]/78",
              index === 0 ? "text-lg" : "text-base",
            ].join(" ")}>
              {t.quote}
            </p>
            <footer className="mt-8 border-t border-[var(--color-foreground)]/8 pt-6">
              <cite className="not-italic">
                <p className="text-sm font-semibold tracking-tight">{t.name}</p>
                <p className="mt-1.5 text-xs text-[var(--color-foreground)]/50">
                  {[t.role, t.company].filter(Boolean).join(" · ")}
                </p>
              </cite>
            </footer>
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeCorporateContact: `import { SectionShell } from "@/components/ui/section-shell";

type ThemeCorporateContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  office?: string;
  submitLabel?: string;
};

export function ThemeCorporateContact({
  eyebrow = "Contact",
  title = "Speak with our enterprise team",
  subtitle = "Schedule a briefing with solutions architects who understand regulated industries.",
  email = "enterprise@northline.com",
  phone = "+1 (555) 010-0200",
  office = "New York · London · Singapore",
  submitLabel = "Request briefing",
}: ThemeCorporateContactProps) {
  return (
    <SectionShell id="contact" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="cta" className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-foreground)]/10 bg-[var(--color-background)] p-7">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
            Direct channels
          </p>
          <dl className="mt-6 space-y-6">
            <div>
              <dt className="text-xs font-bold uppercase text-[var(--color-foreground)]/45">Email</dt>
              <dd className="mt-1">
                <a href={\`mailto:\${email}\`} className="text-lg font-semibold hover:text-[var(--color-primary)]">
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-[var(--color-foreground)]/45">Phone</dt>
              <dd className="mt-1 text-lg font-semibold">{phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-[var(--color-foreground)]/45">Offices</dt>
              <dd className="mt-1 text-sm text-[var(--color-foreground)]/65">{office}</dd>
            </div>
          </dl>
          <p className="mt-8 text-xs leading-relaxed text-[var(--color-foreground)]/45">
            Response within one business day. NDA available upon request.
          </p>
        </div>

        <form className="rounded-lg border border-[var(--color-foreground)]/10 bg-[var(--color-background)] p-7">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
            Briefing request
          </p>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-foreground)]/55">Full name</span>
              <input
                type="text"
                className="mt-1.5 w-full rounded border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2.5 text-sm"
                placeholder="Jane Smith"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-foreground)]/55">Work email</span>
              <input
                type="email"
                className="mt-1.5 w-full rounded border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2.5 text-sm"
                placeholder="jane@company.com"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-foreground)]/55">Organization</span>
              <input
                type="text"
                className="mt-1.5 w-full rounded border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2.5 text-sm"
                placeholder="Company name"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-foreground)]/55">How can we help?</span>
              <textarea
                rows={3}
                className="mt-1.5 w-full rounded border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2.5 text-sm"
                placeholder="Brief description of your requirements"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)]"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </SectionShell>
  );
}
`,

  ThemeCorporateFooter: `type ThemeCorporateFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
  legalLinks?: Array<{ href: string; label: string }>;
};

export function ThemeCorporateFooter({
  brandName = "Northline",
  tagline = "Enterprise operations with audit-ready governance.",
  links = [
    { href: "#services", label: "Services" },
    { href: "#process", label: "Process" },
    { href: "#trust", label: "Trust" },
    { href: "#contact", label: "Contact" },
  ],
  legalLinks = [
    { href: "#privacy", label: "Privacy" },
    { href: "#terms", label: "Terms" },
    { href: "#security", label: "Security" },
    { href: "#compliance", label: "Compliance" },
  ],
}: ThemeCorporateFooterProps) {
  return (
    <footer data-theme-scaffold="footer" className="border-t border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))]">
      <div className="mx-auto max-w-[76rem] px-6 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-[0.12em]">{brandName}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-foreground)]/60">
              {tagline}
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[var(--color-foreground)]/65 transition hover:text-[var(--color-primary)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Legal" className="flex flex-col gap-2.5">
            {legalLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[var(--color-foreground)]/45 transition hover:text-[var(--color-foreground)]/70"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--color-foreground)]/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-foreground)]/40">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-foreground)]/35">
            SOC 2 · ISO 27001 · GDPR
          </p>
        </div>
      </div>
    </footer>
  );
}
`,
};
