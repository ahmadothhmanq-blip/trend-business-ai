"use client";

type MedicalPremiumContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
  ctaLabel?: string;
};

export function MedicalPremiumContact({
  eyebrow = "Contact",
  title = "Let's start a conversation",
  subtitle = "Tell us about your goals — our team responds within one business day.",
  email,
  phone,
  address,
  submitLabel,
  ctaLabel = "Get started",
}: MedicalPremiumContactProps) {
  return (
    <section
      id="contact"
      data-v2-component="medical-premium-contact"
      aria-labelledby="mp-contact-title"
      className="mp-reveal mp-section-alt py-20 sm:py-28"
    >
      <div className="df-reveal-stagger mp-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 id="mp-contact-title" className="mp-headline-sm mt-4 text-balance">
            {title}
          </h2>
          {subtitle ? <p className="mp-body mt-4">{subtitle}</p> : null}
          {email || phone || address ? (
            <address className="mp-body-sm mt-8 space-y-3 not-italic">
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
        <form className="mp-form-panel space-y-4 rounded-[var(--radius-lg)]" onSubmit={(event) => event.preventDefault()}>
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
          <button type="submit" className="mp-btn-primary mp-focus-ring">
            {submitLabel || ctaLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
