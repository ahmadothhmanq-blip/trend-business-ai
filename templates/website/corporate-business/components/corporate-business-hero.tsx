"use client";

const HIGHLIGHTS = ["Enterprise strategy", "Operating model", "Digital transformation", "Change leadership"];

const PROOF = [
  { value: "340+", label: "Transformations delivered" },
  { value: "42", label: "Countries" },
  { value: "94%", label: "Repeat engagements" },
];

type CorporateBusinessHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function CorporateBusinessHero({
  title = "Strategy and execution for the enterprise",
  subtitle = "We help global organizations modernize operations, strengthen governance, and deliver lasting stakeholder value.",
  eyebrow = "Management consulting",
  primaryCta = "Schedule consultation",
  secondaryCta = "Our capabilities",
  imageUrl = null,
}: CorporateBusinessHeroProps) {
  return (
    <section id="top" data-v2-component="corporate-business-hero" aria-labelledby="cb-hero-title" className="relative overflow-hidden border-b border-[var(--border-default)] bg-[var(--color-background)]">
      <div className="cb-hero-atmosphere pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto grid max-w-[88rem] items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
        <div className="df-hero-stagger min-w-0 lg:col-span-6">
          <p className="cb-eyebrow text-[var(--color-accent)]">{eyebrow}</p>
          <h1 id="cb-hero-title" className="cb-headline mt-5 max-w-[14ch] text-balance">{title}</h1>
          <p className="cb-body mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#contact" className="cb-btn-primary cb-focus-ring">{primaryCta}</a>
            <a href="#features" className="cb-btn-secondary cb-focus-ring">{secondaryCta}</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {HIGHLIGHTS.map((item) => (
              <span key={item} className="rounded-full border border-[var(--border-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-muted)]">{item}</span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="cb-hero-image-frame relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] shadow-[var(--shadow-surface)]">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col justify-between bg-[linear-gradient(165deg,var(--color-primary)_0%,color-mix(in_srgb,var(--color-secondary)_90%,#000)_100%)] p-8 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Executive perspective</p>
                  <p className="cb-font-display mt-6 text-3xl font-semibold leading-tight">Board-ready strategy. Operator-led delivery.</p>
                </div>
                <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                  {PROOF.map((p) => (
                    <div key={p.label}>
                      <dd className="cb-font-display text-2xl font-semibold text-[var(--color-accent)]">{p.value}</dd>
                      <dt className="mt-1 text-[0.65rem] leading-snug text-white/65">{p.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
