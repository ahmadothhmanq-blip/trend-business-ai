"use client";

type RealEstatePrestigeContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
  ctaLabel?: string;
};

export function RealEstatePrestigeContact({
  eyebrow = "Contact",
  title = "Let's start a conversation",
  subtitle = "Tell us about your goals — our team responds within one business day.",
  email,
  phone,
  address,
  submitLabel,
  ctaLabel = "Get started",
}: RealEstatePrestigeContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="real-estate-prestige-contact"
      aria-labelledby="rep-contact-title"
      className="rep-reveal rep-section-alt py-20 sm:py-28"
    >
      <div className="df-reveal-stagger rep-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-contact-title" className="rep-headline-sm mt-4 text-balance">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
          {email || phone || address ? (
            <address className="rep-body-sm mt-8 space-y-3 not-italic">
              {address ? <p>{address}</p> : null}
              {email ? (
                <p>
                  <a href={`mailto:${email}`} className="hover:text-[var(--color-foreground)]">
                    {email}
                  </a>
                </p>
              ) : null}
              {phone ? (
                <p>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-[var(--color-foreground)]">
                    {phone}
                  </a>
                </p>
              ) : null}
            </address>
          ) : null}
        </div>
        <form className="rep-form-panel space-y-4 rounded-[var(--radius-lg)]" onSubmit={(event) => event.preventDefault()}>
          <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Full name"
              aria-label="Full name"
              className="df-input rounded-lg px-4 py-3 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              aria-label="Email"
              className="df-input rounded-lg px-4 py-3 text-sm"
            />
          </div>
          <textarea
            placeholder="How can we help?"
            aria-label="Message"
            rows={4}
            className="df-textarea rounded-lg px-4 py-3 text-sm"
          />
          <button type="submit" className="rep-btn-primary rep-focus-ring">
            {submitLabel || ctaLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
