import { heroImageImport } from "@/lib/ai-core/components/scaffolds/shared";

const img = heroImageImport();

export const SECTION_SCAFFOLDS: Record<string, string> = {
  SiteHeader: `"use client";

const links = [
  { href: "#services", label: "Services" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-foreground)]/10 bg-[var(--color-background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[var(--container-max,72rem)] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="text-sm font-semibold tracking-tight">Brand</a>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--color-foreground)]/70 transition hover:text-[var(--color-foreground)]">
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-[var(--color-on-primary,white)]">
          Get started
        </a>
      </div>
    </header>
  );
}
`,

  SiteFooter: `type SiteFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function SiteFooter({
  brandName = "Brand",
  tagline = "Professional experiences, thoughtfully designed.",
  links = [
    { href: "#services", label: "Services" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ],
}: SiteFooterProps) {
  return (
    <footer className="border-t border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))] py-14 sm:py-16">
      <div className="mx-auto grid max-w-[var(--container-max,72rem)] gap-10 px-5 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-tight">{brandName}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-foreground)]/60">{tagline}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/50">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-foreground)]/70">
            {links.slice(0, 5).map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/50">Legal</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-foreground)]/70">
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
`,

  ServicesGrid: `import { SectionShell } from "@/components/ui/section-shell";
${img}

const items = [
  { title: "Strategy", body: "Clear positioning and a roadmap built around outcomes." },
  { title: "Design", body: "Premium interfaces that feel intentional on every device." },
  { title: "Delivery", body: "Reliable execution with measurable business impact." },
];

export function ServicesGrid() {
  return (
    <SectionShell id="services" eyebrow="Services" title="What we deliver" subtitle="A focused set of offerings designed to create professional results.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const src = resolveSiteImage(SECTION_IMAGES[i] || SERVICE_IMAGE || GALLERY_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i);
          return (
          <article key={item.title} className="overflow-hidden rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))] shadow-[var(--shadow-sm,0_8px_24px_rgba(0,0,0,0.04))] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md,0_16px_40px_rgba(0,0,0,0.08))]" style={{ animation: \`fadeUp 0.6s var(--ease-premium,ease) \${i * 80}ms both\` }}>
            <div className="aspect-[16/10] overflow-hidden bg-[var(--color-background)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]/65">{item.body}</p>
            </div>
          </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  FeatureHighlights: `import { SectionShell } from "@/components/ui/section-shell";
${img}

const features = [
  { title: "Premium craft", body: "Every detail is tuned for clarity, polish, and conversion." },
  { title: "Responsive by default", body: "Layouts that feel intentional from mobile to desktop." },
  { title: "Built to convert", body: "Clear hierarchy and CTAs that guide the next action." },
];

export function FeatureHighlights() {
  return (
    <SectionShell id="features" eyebrow="Features" title="Why teams choose us" subtitle="Differentiators that read as premium — not generic filler.">
      <div className="space-y-10">
        {features.map((f, i) => {
          const src = resolveSiteImage(SECTION_IMAGES[i] || SERVICE_IMAGE || GALLERY_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i);
          return (
          <div key={f.title} className={\`grid items-center gap-8 lg:grid-cols-2 \${i % 2 ? "lg:[&>div:first-child]:order-2" : ""}\`}>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-3 text-[var(--color-foreground)]/70">{f.body}</p>
            </div>
            <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-xl,1.25rem)] bg-[var(--color-surface)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
          </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  FeaturesBento: `import { SectionShell } from "@/components/ui/section-shell";

const cells = [
  { title: "Automation", body: "Remove busywork with smart workflows.", span: "lg:col-span-2" },
  { title: "Insights", body: "See what drives growth.", span: "" },
  { title: "Collaboration", body: "Keep teams aligned.", span: "" },
  { title: "Security", body: "Enterprise-grade protection.", span: "lg:col-span-2" },
];

export function FeaturesBento() {
  return (
    <SectionShell id="features" eyebrow="Capabilities" title="Everything you need" subtitle="A modern feature system arranged for scanability and impact.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cells.map((c) => (
          <article key={c.title} className={\`rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-6 \${c.span}\`}>
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-foreground)]/65">{c.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ProductShowcase: `import { SectionShell } from "@/components/ui/section-shell";
${img}

export function ProductShowcase() {
  const heroSrc = resolveSiteImage(PRODUCT_IMAGE || HERO_IMAGE, 0);
  const cards = [0, 1, 2, 3].map((i) =>
    resolveSiteImage(GALLERY_IMAGES[i] || SECTION_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i + 1),
  );
  return (
    <SectionShell id="product" eyebrow="Showcase" title="Flagship collection" subtitle="A premium product moment with clear benefits and decisive inventory photography.">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-xl,1.25rem)] bg-[var(--color-surface)]">
          {heroSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <ul className="space-y-4 text-sm text-[var(--color-foreground)]/75">
            <li>• Designed for real-world use cases</li>
            <li>• Premium materials and finish</li>
            <li>• Supported by expert guidance</li>
          </ul>
          <a href="#contact" className="mt-8 inline-flex rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">
            Learn more
          </a>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((src, i) => (
          <figure key={i} className="aspect-[4/3] overflow-hidden rounded-[var(--radius-lg,1rem)] bg-[var(--color-surface)]">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : null}
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  GalleryGrid: `import { SectionShell } from "@/components/ui/section-shell";
${img}

export function GalleryGrid() {
  const images = [0, 1, 2, 3, 4, 5].map((i) =>
    resolveSiteImage(GALLERY_IMAGES[i] || SECTION_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i),
  );
  return (
    <SectionShell id="gallery" eyebrow="Gallery" title="Selected moments" subtitle="A curated visual story that feels editorial, not stock.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <figure key={i} className="group overflow-hidden rounded-[var(--radius-lg,1rem)] bg-[var(--color-surface)] aspect-[4/3]">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            ) : (
              <div className="h-full w-full bg-gradient-hero opacity-40" />
            )}
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  TestimonialsCarousel: `import { SectionShell } from "@/components/ui/section-shell";
${img}

const quotes = [
  { quote: "The experience felt genuinely premium from the first interaction.", name: "Alex Rivera", role: "Founder" },
  { quote: "Clear, polished, and conversion-focused — exactly what we needed.", name: "Jordan Lee", role: "Marketing Lead" },
  { quote: "Our customers noticed the difference immediately.", name: "Sam Patel", role: "Director" },
];

export function TestimonialsCarousel() {
  return (
    <SectionShell id="testimonials" eyebrow="Testimonials" title="Trusted by modern brands" subtitle="Social proof that sounds human and specific.">
      <div className="grid gap-5 md:grid-cols-3">
        {quotes.map((q, i) => {
          const src = resolveSiteImage(TESTIMONIAL_IMAGES[i] || GALLERY_IMAGES[i] || SECTION_IMAGES[i] || HERO_IMAGE, i);
          return (
          <blockquote key={q.name} className="overflow-hidden rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)]">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="h-36 w-full object-cover" />
            ) : null}
            <div className="p-6">
              <p className="text-sm leading-relaxed text-[var(--color-foreground)]/80">“{q.quote}”</p>
              <footer className="mt-5 text-sm font-semibold">{q.name}</footer>
              <p className="text-xs text-[var(--color-foreground)]/50">{q.role}</p>
            </div>
          </blockquote>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  PricingTable: `import { SectionShell } from "@/components/ui/section-shell";

const plans = [
  { name: "Starter", price: "$49", features: ["Core features", "Email support", "1 project"], featured: false },
  { name: "Growth", price: "$129", features: ["Everything in Starter", "Priority support", "Unlimited projects"], featured: true },
  { name: "Enterprise", price: "Custom", features: ["Dedicated success", "SSO & security", "Custom SLA"], featured: false },
];

export function PricingTable() {
  return (
    <SectionShell id="pricing" eyebrow="Pricing" title="Simple plans" subtitle="Transparent pricing with a clear recommended path.">
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className={\`rounded-[var(--radius-xl,1.25rem)] border p-6 \${plan.featured ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[var(--shadow-md,0_16px_40px_rgba(0,0,0,0.08))]" : "border-[var(--color-foreground)]/10 bg-[var(--color-surface)]"}\`}>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{plan.price}</p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--color-foreground)]/70">
              {plan.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            <a href="#contact" className="mt-8 inline-flex w-full items-center justify-center rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary,white)]">
              Choose {plan.name}
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  FaqAccordion: `"use client";

import { useState } from "react";
import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FAQS = [
  { q: "How quickly can we get started?", a: "Most teams launch a first version within days, not months." },
  { q: "Do you support custom requirements?", a: "Yes — we tailor components, content, and workflows to your industry." },
  { q: "Is mobile experience included?", a: "Every section is responsive and tuned for mobile-first use." },
];

type FaqAccordionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ q: string; a: string }>;
  faqs?: Array<{ q: string; a: string }>;
};

export function FaqAccordion({
  eyebrow = "FAQ",
  title = "Questions, answered",
  subtitle = "Handle objections before they become friction.",
  items,
  faqs,
}: FaqAccordionProps) {
  const list = items?.length ? items : faqs?.length ? faqs : DEFAULT_FAQS;
  const [open, setOpen] = useState(0);
  return (
    <SectionShell id="faq" eyebrow={eyebrow} title={title} subtitle={subtitle} narrow>
      <div className="space-y-3">
        {list.map((item, i) => (
          <div key={item.q} className="rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)]">
            <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold" onClick={() => setOpen(i === open ? -1 : i)}>
              {item.q}
              <span className="text-[var(--color-foreground)]/40">{open === i ? "−" : "+"}</span>
            </button>
            {open === i ? <p className="px-5 pb-4 text-sm leading-relaxed text-[var(--color-foreground)]/70">{item.a}</p> : null}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  BookingForm: `"use client";

import { SectionShell } from "@/components/ui/section-shell";

export function BookingForm() {
  return (
    <SectionShell id="booking" eyebrow="Booking" title="Reserve a time" subtitle="A clean booking form that feels trustworthy and simple.">
      <form className="grid max-w-2xl gap-4 rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-6 sm:grid-cols-2">
        <label className="text-sm sm:col-span-1">Name<input className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="name" /></label>
        <label className="text-sm">Email<input type="email" className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="email" /></label>
        <label className="text-sm">Date<input type="date" className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="date" /></label>
        <label className="text-sm">Guests<input type="number" min={1} className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="guests" /></label>
        <label className="text-sm sm:col-span-2">Notes<textarea className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" rows={3} name="notes" /></label>
        <button type="submit" className="sm:col-span-2 rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">Request booking</button>
      </form>
    </SectionShell>
  );
}
`,

  BookingSection: `"use client";

import { SectionShell } from "@/components/ui/section-shell";

export function BookingSection() {
  return (
    <SectionShell id="booking" eyebrow="Booking" title="Plan your trip" subtitle="Capture travel dates and intent with a polished booking panel.">
      <form className="grid max-w-2xl gap-4 rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-6 sm:grid-cols-2">
        <label className="text-sm">Destination<input className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="destination" /></label>
        <label className="text-sm">Travelers<input type="number" min={1} className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="travelers" /></label>
        <label className="text-sm">Start date<input type="date" className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="start" /></label>
        <label className="text-sm">End date<input type="date" className="mt-1 w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2" name="end" /></label>
        <button type="submit" className="sm:col-span-2 rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">Check availability</button>
      </form>
    </SectionShell>
  );
}
`,

  ContactSection: `"use client";

import { SectionShell } from "@/components/ui/section-shell";

type ContactSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
};

export function ContactSection({
  eyebrow = "Contact",
  title = "Let’s talk",
  subtitle = "A professional contact section with form and details.",
  ctaLabel = "Send message",
}: ContactSectionProps) {
  return (
    <SectionShell id="contact" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <form className="space-y-4 rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-6 sm:p-8">
          <input className="w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3.5 py-2.5 text-sm" placeholder="Name" name="name" />
          <input type="email" className="w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3.5 py-2.5 text-sm" placeholder="Email" name="email" />
          <textarea className="w-full rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3.5 py-2.5 text-sm" rows={4} placeholder="How can we help?" name="message" />
          <button type="submit" className="rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">{ctaLabel}</button>
        </form>
        <div className="space-y-5 text-sm leading-relaxed text-[var(--color-foreground)]/70">
          <p><span className="font-semibold text-[var(--color-foreground)]">Email</span><br />hello@example.com</p>
          <p><span className="font-semibold text-[var(--color-foreground)]">Phone</span><br />+1 (555) 000-0000</p>
          <p><span className="font-semibold text-[var(--color-foreground)]">Hours</span><br />Mon–Fri, 9am–6pm</p>
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ContactCta: `"use client";

import { SectionShell } from "@/components/ui/section-shell";

export function ContactCta() {
  return (
    <SectionShell id="contact" eyebrow="Contact" title="Start the conversation" subtitle="Capture leads with a focused contact CTA.">
      <form className="mx-auto grid max-w-xl gap-3 rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] p-6">
        <input className="rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2 text-sm" placeholder="Name" name="name" />
        <input type="email" className="rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2 text-sm" placeholder="Email" name="email" />
        <textarea className="rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 bg-transparent px-3 py-2 text-sm" rows={3} placeholder="Message" name="message" />
        <button type="submit" className="rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary,white)]">Send inquiry</button>
      </form>
    </SectionShell>
  );
}
`,

  MapsSection: `import { SectionShell } from "@/components/ui/section-shell";

export function MapsSection() {
  return (
    <SectionShell id="locations" eyebrow="Locations" title="Find us" subtitle="Clear directions and a map panel for local discovery.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)]">
          <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[var(--color-background)] text-sm text-[var(--color-foreground)]/55">
            <div className="absolute inset-0 bg-gradient-hero opacity-30" />
            <div className="relative rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur-sm">
              Interactive map · Connect Google Maps embed
            </div>
          </div>
        </div>
        <div className="space-y-3 text-sm text-[var(--color-foreground)]/70">
          <p className="text-base font-semibold text-[var(--color-foreground)]">Main studio</p>
          <p>123 Market Street<br />San Francisco, CA</p>
          <a href="#contact" className="inline-flex rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 px-4 py-2 text-sm font-semibold">Get directions</a>
        </div>
      </div>
    </SectionShell>
  );
}
`,

  TeamSection: `import { SectionShell } from "@/components/ui/section-shell";
${img}

const team = [
  { name: "Morgan Blake", role: "Creative Director" },
  { name: "Riley Chen", role: "Head of Product" },
  { name: "Casey Nguyen", role: "Client Success" },
];

export function TeamSection() {
  return (
    <SectionShell id="team" eyebrow="Team" title="People behind the work" subtitle="Human expertise that builds trust.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member, i) => {
          const src = resolveSiteImage(SECTION_IMAGES[i] || GALLERY_IMAGES[i] || SERVICE_IMAGE || HERO_IMAGE, i);
          return (
          <article key={member.name} className="overflow-hidden rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)]">
            <div className="aspect-[4/3] bg-[var(--color-background)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-5">
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-[var(--color-foreground)]/60">{member.role}</p>
            </div>
          </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  BlogSection: `import { SectionShell } from "@/components/ui/section-shell";
${img}

const posts = [
  { title: "How premium brands design for conversion", category: "Insights" },
  { title: "A practical guide to modern section systems", category: "Product" },
  { title: "What audiences notice in the first 3 seconds", category: "Brand" },
];

export function BlogSection() {
  return (
    <SectionShell id="insights" eyebrow="Insights" title="Latest thinking" subtitle="Thought leadership that reinforces expertise.">
      <div className="grid gap-5 md:grid-cols-3">
        {posts.map((post, i) => {
          const src = resolveSiteImage(GALLERY_IMAGES[i] || SECTION_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i);
          return (
          <article key={post.title} className="overflow-hidden rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)]">
            <div className="aspect-[16/10] bg-[var(--color-background)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent,var(--color-primary))]">{post.category}</p>
              <h3 className="mt-2 text-base font-semibold leading-snug">{post.title}</h3>
              <a href="#contact" className="mt-4 inline-flex text-sm font-semibold text-[var(--color-primary)]">Read more →</a>
            </div>
          </article>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  CtaBand: `${img}

export function CtaBand() {
  const bg = resolveSiteImage(BACKGROUND_IMAGE || HERO_IMAGE || PRODUCT_IMAGE, 0);
  return (
    <section className="relative overflow-hidden px-4 py-16 text-center text-[var(--color-on-primary,white)] sm:px-6">
      {bg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-cta opacity-90" />
      <div className="relative">
        <h2 className="text-3xl font-semibold tracking-tight">Ready to move forward?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">Take the next step with a clear CTA and a confident close.</p>
        <a href="#contact" className="mt-8 inline-flex rounded-[var(--radius-md,0.75rem)] bg-white px-5 py-3 text-sm font-semibold text-black">Get started</a>
      </div>
    </section>
  );
}
`,
};
