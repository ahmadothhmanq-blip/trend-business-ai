"use client";

type CreativePortfolioContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export function CreativePortfolioContact({
  eyebrow = "Contact",
  title = "New business",
  subtitle = "Tell us about the brief — we reply within one business day.",
  email = "hello@kinetic.studio",
  phone = "+1 (555) 000-0000",
  address = "Global offices — remote-first",
  submitLabel = "Send message",
}: CreativePortfolioContactProps) {
  return (
    <section id="contact" data-v2-component="creative-portfolio-contact" className="cp-contact-slate cp-reveal">
      <p className="cp-title-card-index">{eyebrow}</p>
      <h2 className="cp-title-card-headline" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
        {title}
      </h2>
      <p className="cp-title-card-deck">{subtitle}</p>
      <a href={`mailto:${email}`} className="cp-contact-email">
        {email}
      </a>
      <div className="cp-title-card-meta">
        <span>{phone}</span>
        <span>{address}</span>
        <span>{submitLabel}</span>
      </div>
    </section>
  );
}
