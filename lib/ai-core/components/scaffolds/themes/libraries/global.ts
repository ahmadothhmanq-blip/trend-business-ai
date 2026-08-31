/**
 * Global theme — world-class SaaS product marketing.
 * Refined dark surfaces, subtle borders, gradient accents, generous whitespace.
 * Reference feel: Linear / Vercel / Stripe — not neo-brutalist.
 */

export const GLOBAL_SCAFFOLDS: Record<string, string> = {
  ThemeGlobalNav: `"use client";

import { useState } from "react";

const DEFAULT_LINKS = [
  { href: "#showcase", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

type ThemeGlobalNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeGlobalNav({
  brandName = "Axiom",
  ctaLabel = "Book a demo",
  links = DEFAULT_LINKS,
}: ThemeGlobalNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      data-theme-scaffold="nav"
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-[var(--color-background)]/80 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex max-w-[76rem] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="/" className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
          {brandName}
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[var(--color-foreground)]/55 transition hover:text-[var(--color-foreground)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden rounded-full bg-[var(--color-primary)] px-4 py-2 text-[13px] font-medium text-white shadow-[0_0_24px_-6px_var(--color-primary)] transition hover:brightness-110 sm:inline-flex"
          >
            {ctaLabel}
          </a>
          <button
            type="button"
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-white/[0.06] px-5 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-2 block rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-medium text-white"
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

  ThemeGlobalHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

type ThemeGlobalHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
};

export function ThemeGlobalHero({
  title = "Infrastructure for companies that scale globally",
  subtitle = "One platform for product, revenue, and customer experience — designed with the restraint and precision of the world's best SaaS brands.",
  eyebrow = "Enterprise-ready",
  primaryCta = "Start free trial",
  secondaryCta = "View platform",
  imageUrl,
}: ThemeGlobalHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0], 0);

  return (
    <section
      data-theme-scaffold="hero"
      className="relative overflow-hidden border-b border-white/[0.06] bg-[var(--color-background)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/20 blur-[120px]" />
      <div className="relative mx-auto grid max-w-[76rem] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-accent)]">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-balance text-[var(--color-foreground)]">
            {title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[var(--color-foreground)]/55 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="inline-flex rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white shadow-[0_0_32px_-8px_var(--color-primary)] transition hover:brightness-110"
            >
              {primaryCta}
            </a>
            <a
              href="#showcase"
              className="inline-flex rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-[var(--color-foreground)]/80 transition hover:border-white/25 hover:text-[var(--color-foreground)]"
            >
              {secondaryCta}
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-6 text-xs text-[var(--color-foreground)]/40">
            <span>SOC 2 ready</span>
            <span>99.99% uptime</span>
            <span>140+ countries</span>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-2 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.65)]">
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--color-surface,#0f0f12)]">
              {src ? (
                <img
                  src={src}
                  alt={title}
                  className="aspect-[4/3] w-full object-cover object-center"
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col justify-end gap-3 p-6">
                  <div className="h-2 w-24 rounded-full bg-white/10" />
                  <div className="h-3 w-full max-w-xs rounded-full bg-white/15" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-lg border border-white/8 bg-white/[0.03]" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  ThemeGlobalShowcase: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

const DEFAULT_ITEMS = [
  { title: "Revenue cockpit", tag: "Analytics" },
  { title: "Global rollout", tag: "Operations" },
  { title: "Client portal", tag: "Experience" },
];

type ThemeGlobalShowcaseProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; tag: string }>;
};

export function ThemeGlobalShowcase({
  eyebrow = "Platform",
  title = "Built for teams operating at global scale",
  subtitle = "Curated surfaces that feel bespoke — not assembled from a template library.",
  items = DEFAULT_ITEMS,
}: ThemeGlobalShowcaseProps) {
  return (
    <SectionShell id="showcase" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item, i) => {
          const src = resolveSiteImage(GALLERY_IMAGES[i] || HERO_IMAGE, i);
          return (
            <article
              key={item.title}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] transition hover:border-[var(--color-primary)]/30 hover:bg-white/[0.04]"
            >
              {src ? (
                <img src={src} alt={item.title} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent" />
              )}
              <div className="p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  {item.tag}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{item.title}</h3>
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  ThemeGlobalIntegrations: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_LOGOS = ["Stripe", "Slack", "Notion", "HubSpot", "Salesforce", "Zendesk"];

type ThemeGlobalIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: string[];
};

export function ThemeGlobalIntegrations({
  eyebrow = "Integrations",
  title = "Connects to the tools your team already trusts",
  subtitle = "Open APIs and native connectors — deploy in days, not quarters.",
  logos = DEFAULT_LOGOS,
}: ThemeGlobalIntegrationsProps) {
  return (
    <SectionShell id="integrations" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {logos.map((name) => (
          <div
            key={name}
            className="flex h-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-medium tracking-wide text-[var(--color-foreground)]/45"
          >
            {name}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeGlobalFeatures: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FEATURES = [
  { title: "Unified workspace", description: "One source of truth for product, GTM, and customer data — no tab chaos." },
  { title: "Global by default", description: "Multi-region hosting, locale-aware content, and compliance built in." },
  { title: "Precision analytics", description: "Executive-grade dashboards with the clarity of a board-ready report." },
  { title: "Enterprise security", description: "SSO, audit logs, and role-based access without slowing teams down." },
  { title: "Workflow automation", description: "Orchestrate handoffs between sales, success, and product in one flow." },
  { title: "White-glove onboarding", description: "Dedicated launch support so your brand reads global from day one." },
];

type ThemeGlobalFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  features?: Array<{ title: string; description: string }>;
};

export function ThemeGlobalFeatures({
  eyebrow = "Capabilities",
  title = "Everything a modern company expects",
  subtitle = "Quietly powerful — the details that separate a startup site from a global brand.",
  features = DEFAULT_FEATURES,
}: ThemeGlobalFeaturesProps) {
  return (
    <SectionShell id="features" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.title}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-[var(--color-primary)]/25"
          >
            <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]/50">{f.description}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeGlobalFaq: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FAQ = [
  { q: "How fast can we launch?", a: "Most teams go live in under two weeks with our guided rollout." },
  { q: "Do you support enterprise SSO?", a: "Yes — SAML, OIDC, and SCIM provisioning on Growth plans and above." },
  { q: "Can we keep our existing stack?", a: "Native integrations and webhooks connect to your CRM, billing, and data warehouse." },
  { q: "Is there dedicated support?", a: "Every account includes success onboarding; enterprise plans add a named lead." },
];

type ThemeGlobalFaqProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ q: string; a: string }>;
};

export function ThemeGlobalFaq({
  eyebrow = "FAQ",
  title = "Answers for decision-makers",
  subtitle = "Clear, direct — the way global companies communicate.",
  items = DEFAULT_FAQ,
}: ThemeGlobalFaqProps) {
  return (
    <SectionShell id="faq" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {items.map((item) => (
          <details key={item.q} className="group px-6 py-5">
            <summary className="cursor-pointer list-none text-sm font-medium tracking-tight marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span className="text-[var(--color-foreground)]/30 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-foreground)]/50">{item.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeGlobalPricing: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_TIERS = [
  { name: "Growth", price: "$89", note: "per seat / month", features: ["Core platform", "5 integrations", "Email support"] },
  { name: "Scale", price: "$189", note: "per seat / month", features: ["Everything in Growth", "SSO & audit", "Priority support"], featured: true },
  { name: "Enterprise", price: "Custom", note: "annual contract", features: ["Dedicated success", "Custom SLAs", "On-prem options"] },
];

type ThemeGlobalPricingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: Array<{ name: string; price: string; note: string; features: string[]; featured?: boolean }>;
};

export function ThemeGlobalPricing({
  eyebrow = "Pricing",
  title = "Plans that scale with your ambition",
  subtitle = "Transparent tiers — upgrade when your footprint goes global.",
  tiers = DEFAULT_TIERS,
}: ThemeGlobalPricingProps) {
  return (
    <SectionShell id="pricing" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-5 lg:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={[
              "flex flex-col rounded-2xl border p-6",
              tier.featured
                ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 shadow-[0_0_48px_-16px_var(--color-primary)]"
                : "border-white/[0.08] bg-white/[0.02]",
            ].join(" ")}
          >
            <p className="text-sm font-medium text-[var(--color-foreground)]/60">{tier.name}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{tier.price}</p>
            <p className="text-xs text-[var(--color-foreground)]/40">{tier.note}</p>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-[var(--color-foreground)]/55">
              {tier.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <a
              href="#contact"
              className={[
                "mt-8 inline-flex justify-center rounded-full px-4 py-2.5 text-sm font-medium",
                tier.featured
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-white/12 text-[var(--color-foreground)]/80",
              ].join(" ")}
            >
              Talk to sales
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeGlobalTestimonials: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { quote: "The platform reads like a global brand from day one — our board noticed immediately.", name: "Elena Voss", role: "COO, Northline" },
  { quote: "We replaced three tools and still shipped a sharper public site in two weeks.", name: "Marcus Chen", role: "VP Product, Arcline" },
  { quote: "Quiet design, loud results. Conversion up without feeling salesy.", name: "Sofia Rahman", role: "Growth Lead, Meridian" },
];

type ThemeGlobalTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; name: string; role: string }>;
};

export function ThemeGlobalTestimonials({
  eyebrow = "Proof",
  title = "Trusted by teams building globally",
  subtitle = "Measured praise — no filler quotes.",
  items = DEFAULT_ITEMS,
}: ThemeGlobalTestimonialsProps) {
  return (
    <SectionShell id="testimonials" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <blockquote
            key={item.name}
            className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
          >
            <p className="flex-1 text-sm leading-relaxed text-[var(--color-foreground)]/65">&ldquo;{item.quote}&rdquo;</p>
            <footer className="mt-6 border-t border-white/[0.06] pt-4">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-[var(--color-foreground)]/45">{item.role}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeGlobalContact: `import { SectionShell } from "@/components/ui/section-shell";

type ThemeGlobalContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
};

export function ThemeGlobalContact({
  eyebrow = "Contact",
  title = "Speak with our team",
  subtitle = "Enterprise onboarding, partnerships, and product questions — we respond within one business day.",
  email = "hello@company.com",
  phone = "+1 (555) 010-2400",
}: ThemeGlobalContactProps) {
  return (
    <SectionShell id="contact" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-4 text-sm text-[var(--color-foreground)]/55">
          <p>
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-foreground)]/35">Email</span>
            <a href={\`mailto:\${email}\`} className="mt-1 inline-block font-medium text-[var(--color-foreground)]">{email}</a>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-foreground)]/35">Phone</span>
            <a href={\`tel:\${phone.replace(/[^+\\d]/g, "")}\`} className="mt-1 inline-block font-medium text-[var(--color-foreground)]">{phone}</a>
          </p>
        </div>
        <form className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-[var(--color-foreground)]/50">
              Name
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm" placeholder="Your name" />
            </label>
            <label className="block text-xs font-medium text-[var(--color-foreground)]/50">
              Company
              <input className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm" placeholder="Company" />
            </label>
          </div>
          <label className="mt-4 block text-xs font-medium text-[var(--color-foreground)]/50">
            Work email
            <input type="email" className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm" placeholder="you@company.com" />
          </label>
          <label className="mt-4 block text-xs font-medium text-[var(--color-foreground)]/50">
            How can we help?
            <textarea rows={4} className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm" placeholder="Tell us about your goals" />
          </label>
          <button type="submit" className="mt-6 w-full rounded-full bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white">
            Send message
          </button>
        </form>
      </div>
    </SectionShell>
  );
}
`,

  ThemeGlobalFooter: `"use client";

const DEFAULT_COLUMNS = [
  { title: "Product", links: ["Platform", "Integrations", "Security", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Documentation", "API", "Status", "Legal"] },
];

type ThemeGlobalFooterProps = {
  brandName?: string;
  tagline?: string;
  columns?: Array<{ title: string; links: string[] }>;
};

export function ThemeGlobalFooter({
  brandName = "Axiom",
  tagline = "Built for companies that operate globally.",
  columns = DEFAULT_COLUMNS,
}: ThemeGlobalFooterProps) {
  return (
    <footer
      data-theme-scaffold="footer"
      className="border-t border-white/[0.06] bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-[76rem] px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="text-sm font-semibold">{brandName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-foreground)]/45">{tagline}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-foreground)]/35">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-[var(--color-foreground)]/50 transition hover:text-[var(--color-foreground)]">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-12 border-t border-white/[0.06] pt-8 text-xs text-[var(--color-foreground)]/35">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
`,

  ThemeGlobalFloatingCta: `"use client";

type ThemeGlobalFloatingCtaProps = {
  label?: string;
  href?: string;
};

export function ThemeGlobalFloatingCta({
  label = "Book a demo",
  href = "#contact",
}: ThemeGlobalFloatingCtaProps) {
  return (
    <a
      href={href}
      className="fixed bottom-6 end-6 z-40 hidden rounded-full border border-white/10 bg-[var(--color-background)]/90 px-5 py-2.5 text-sm font-medium text-[var(--color-foreground)] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl transition hover:border-[var(--color-primary)]/40 sm:inline-flex"
    >
      {label}
    </a>
  );
}
`,
};
