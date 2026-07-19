import { heroImageImport } from "@/lib/ai-core/components/scaffolds/shared";

const img = heroImageImport();

export const ADVANCED_SCAFFOLDS: Record<string, string> = {
  FeaturesModern: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const DEFAULT_FEATURES = [
  { title: "Clear positioning", body: "Messages that sound premium and convert without noise." },
  { title: "Responsive craft", body: "Layouts tuned for phones first, then desktop polish." },
  { title: "Conversion paths", body: "Every section guides visitors toward a decisive next step." },
  { title: "Design system", body: "Tokens for color, type, space, and motion stay consistent." },
];

type FeaturesModernProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; body: string }>;
  features?: Array<{ title: string; body: string }>;
};

export function FeaturesModern({
  eyebrow = "Features",
  title = "Built for modern brands",
  subtitle = "A clean feature system with scannable benefits and mobile-ready cards.",
  items,
  features,
}: FeaturesModernProps) {
  const list = items?.length ? items : features?.length ? features : DEFAULT_FEATURES;
  return (
    <SectionShell id="features" eyebrow={eyebrow} title={title} subtitle={subtitle} tone="muted">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {list.map((f, i) => {
          const src = resolveSiteImage(SECTION_IMAGES[i] || SERVICE_IMAGE || GALLERY_IMAGES[i] || PRODUCT_IMAGE, i);
          return (
          <Motion key={f.title} delayMs={i * 70} as="article" className="overflow-hidden rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-background)] shadow-[var(--shadow-sm,0_8px_24px_rgba(0,0,0,0.04))]">
            <div className="aspect-[16/10] overflow-hidden bg-[var(--color-surface)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={f.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[var(--color-primary)]/12" />
              )}
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-foreground)]/65">{f.body}</p>
            </div>
          </Motion>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  ServicesModern: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const DEFAULT_SERVICES = [
  { title: "Discovery", body: "Clarify goals, audience, and the conversion path.", cta: "Learn more" },
  { title: "Design", body: "Premium interfaces with intentional hierarchy.", cta: "View approach" },
  { title: "Launch", body: "Ship a polished experience ready for growth.", cta: "Get started" },
];

type ServicesModernProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; body: string; cta?: string }>;
};

export function ServicesModern({
  eyebrow = "Services",
  title = "How we help",
  subtitle = "Service storytelling with imagery, clarity, and mobile stacking.",
  items = DEFAULT_SERVICES,
}: ServicesModernProps) {
  return (
    <SectionShell id="services" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-7">
        {items.map((s, i) => {
          const src = resolveSiteImage(SECTION_IMAGES[i] || SERVICE_IMAGE || GALLERY_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i);
          return (
          <Motion key={s.title} delayMs={i * 80} as="article" className="group overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))]">
            <div className="aspect-[16/10] overflow-hidden bg-[var(--color-background)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={s.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              ) : (
                <div className="h-full w-full bg-gradient-hero opacity-50" />
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-foreground)]/65">{s.body}</p>
              <a href="#contact" className="mt-5 inline-flex text-sm font-semibold text-[var(--color-primary)]">{s.cta || "Learn more"} →</a>
            </div>
          </Motion>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  TestimonialsModern: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const DEFAULT_QUOTES = [
  { quote: "The site feels like a world-class brand — clear, cinematic, and built to convert.", name: "Avery Quinn", role: "CEO, Northline" },
  { quote: "Launch felt effortless and premium.", name: "Sam Ortiz", role: "Founder" },
  { quote: "Our leads noticed the quality jump immediately.", name: "Jordan Miles", role: "Marketing Lead" },
];

type TestimonialsModernProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; name: string; role?: string }>;
  quotes?: Array<{ quote: string; name: string; role?: string }>;
};

export function TestimonialsModern({
  eyebrow = "Testimonials",
  title = "Trusted by teams who care about craft",
  subtitle = "Layered social proof — one featured quote plus supporting voices.",
  items,
  quotes,
}: TestimonialsModernProps) {
  const list = items?.length ? items : quotes?.length ? quotes : DEFAULT_QUOTES;
  const featured = list[0];
  const supporting = list.slice(1, 3);
  const portrait = resolveSiteImage(TESTIMONIAL_IMAGES[0] || GALLERY_IMAGES[0] || SECTION_IMAGES[0] || SERVICE_IMAGE || HERO_IMAGE, 0);
  return (
    <SectionShell id="testimonials" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
        <Motion className="overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] lg:col-span-3">
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portrait} alt="" className="h-40 w-full object-cover sm:h-52" />
          ) : null}
          <div className="p-7 sm:p-8">
            <p className="text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">“{featured.quote}”</p>
            <footer className="mt-8">
              <p className="text-sm font-semibold">{featured.name}</p>
              <p className="text-xs text-[var(--color-foreground)]/50">{featured.role || "Customer"}</p>
            </footer>
          </div>
        </Motion>
        <div className="grid gap-4 lg:col-span-2">
          {supporting.map((t, i) => {
            const src = resolveSiteImage(TESTIMONIAL_IMAGES[i + 1] || GALLERY_IMAGES[i + 1] || SECTION_IMAGES[i] || PRODUCT_IMAGE, i + 1);
            return (
            <Motion key={t.name} delayMs={(i + 1) * 90} className="overflow-hidden rounded-[var(--radius-lg,1rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-background)]">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-28 w-full object-cover" />
              ) : null}
              <div className="p-5">
                <p className="text-sm leading-relaxed text-[var(--color-foreground)]/75">“{t.quote}”</p>
                <p className="mt-4 text-xs font-semibold">{t.name}</p>
                {t.role ? <p className="text-[11px] text-[var(--color-foreground)]/45">{t.role}</p> : null}
              </div>
            </Motion>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
`,

  PricingModern: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";

const DEFAULT_PLANS = [
  { name: "Starter", price: "$49", blurb: "For focused launches", features: ["Core pages", "Essential sections", "Email support"], featured: false },
  { name: "Growth", price: "$149", blurb: "For scaling teams", features: ["Advanced sections", "Priority support", "Conversion CTAs", "Analytics-ready"], featured: true },
  { name: "Scale", price: "Custom", blurb: "For ambitious brands", features: ["Custom components", "Dedicated partner", "SLA & security"], featured: false },
];

type PricingModernProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  plans?: Array<{ name: string; price: string; blurb?: string; features: string[]; featured?: boolean }>;
};

export function PricingModern({
  eyebrow = "Pricing",
  title = "Plans that match your ambition",
  subtitle = "Highlighted tiers with mobile-first stacking and a clear recommended path.",
  plans = DEFAULT_PLANS,
}: PricingModernProps) {
  return (
    <SectionShell id="pricing" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-6">
        {plans.map((plan, i) => (
          <Motion key={plan.name} delayMs={i * 80} as="article" className={[
            "flex flex-col rounded-[var(--radius-xl,1.25rem)] border p-6 sm:p-7",
            plan.featured
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[var(--shadow-md,0_18px_50px_rgba(0,0,0,0.1))] lg:-translate-y-2"
              : "border-[var(--color-foreground)]/10 bg-[var(--color-surface)]",
          ].join(" ")}>
            {plan.featured ? <span className="mb-3 w-fit rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-primary,white)]">Most popular</span> : null}
            <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
            <p className="mt-1.5 text-sm text-[var(--color-foreground)]/55">{plan.blurb}</p>
            <p className="mt-5 text-4xl font-semibold tracking-tight">{plan.price}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[var(--color-foreground)]/70">
              {plan.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            <a href="#contact" className="mt-8 inline-flex items-center justify-center rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">
              Choose {plan.name}
            </a>
          </Motion>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  PortfolioGallery: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const DEFAULT_ITEMS = [
  { title: "Brand system", tag: "Identity" },
  { title: "Product launch", tag: "Digital" },
  { title: "Destination story", tag: "Campaign" },
  { title: "Commerce refresh", tag: "Retail" },
  { title: "Editorial site", tag: "Web" },
  { title: "Experience film", tag: "Motion" },
];

type PortfolioGalleryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; tag: string }>;
};

export function PortfolioGallery({
  eyebrow = "Portfolio",
  title = "Selected work",
  subtitle = "A mosaic gallery with hover reveals — built for agency and brand storytelling.",
  items = DEFAULT_ITEMS,
}: PortfolioGalleryProps) {
  return (
    <SectionShell id="gallery" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {items.map((item, i) => {
          const src = resolveSiteImage(GALLERY_IMAGES[i] || SECTION_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i);
          return (
          <Motion key={item.title} delayMs={i * 50} as="figure" className={["group relative overflow-hidden rounded-[var(--radius-lg,1rem)] bg-[var(--color-surface)]", i === 0 || i === 3 ? "md:row-span-1 aspect-[4/5]" : "aspect-[4/3]"].join(" ")}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            ) : (
              <div className="h-full w-full bg-gradient-hero opacity-40" />
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-100 transition md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">{item.tag}</p>
              <p className="text-sm font-semibold">{item.title}</p>
            </figcaption>
          </Motion>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  CtaSplit: `import { Motion } from "@/components/ui/motion";
${img}

type CtaSplitProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function CtaSplit({
  eyebrow = "Next step",
  title = "Ready to build something world-class?",
  subtitle = "A decisive close with room for nuance — perfect for demos, consultations, and qualified leads.",
  primaryCta = "Book a consultation",
  secondaryCta = "View pricing",
}: CtaSplitProps) {
  const bg = resolveSiteImage(BACKGROUND_IMAGE || HERO_IMAGE || PRODUCT_IMAGE, 0);
  return (
    <section id="cta" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      {bg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-[var(--color-foreground)]/70" />
      <div className="relative mx-auto max-w-[var(--container-max,72rem)] px-4 sm:px-6 lg:px-8">
        <Motion className="grid overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-white/15 bg-black/30 backdrop-blur-md lg:grid-cols-2">
          <div className="p-8 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
            <h2 className="mt-3 font-[family-name:var(--font-heading,inherit)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 bg-[var(--color-primary)]/95 p-8 text-[var(--color-on-primary,white)] sm:p-10 lg:p-12">
            <a href="#contact" className="inline-flex items-center justify-center rounded-[var(--radius-md,0.75rem)] bg-white px-5 py-3.5 text-sm font-semibold text-black">
              {primaryCta}
            </a>
            <a href="#pricing" className="inline-flex items-center justify-center rounded-[var(--radius-md,0.75rem)] border border-white/40 px-5 py-3.5 text-sm font-semibold">
              {secondaryCta}
            </a>
          </div>
        </Motion>
      </div>
    </section>
  );
}
`,
};
