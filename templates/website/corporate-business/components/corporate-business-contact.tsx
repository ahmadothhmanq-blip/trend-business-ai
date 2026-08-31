"use client";

const OFFICES = [
  { city: "New York", address: "One Vanderbilt Avenue, 45th Floor", email: "newyork@atlas-advisory.com" },
  { city: "London", address: "30 St Mary Axe", email: "london@atlas-advisory.com" },
  { city: "Singapore", address: "Marina Bay Financial Centre", email: "singapore@atlas-advisory.com" },
];

export function CorporateBusinessContact() {
  return (
    <section id="contact" data-v2-component="corporate-business-contact" aria-labelledby="cb-contact-title" className="df-reveal border-t border-[var(--border-default)] cb-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="cb-eyebrow">Contact</p>
          <h2 id="cb-contact-title" className="cb-headline-sm mt-2">Start a conversation</h2>
          <p className="cb-body mt-4 text-[var(--color-muted)]">Speak with a partner about your transformation priorities.</p>
        </header>
        <div className="df-reveal-stagger grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            {OFFICES.map((o) => (
              <div key={o.city} className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-background)] p-6">
                <h3 className="font-semibold">{o.city}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{o.address}</p>
                <a href={`mailto:${o.email}`} className="mt-3 inline-block text-sm text-[var(--color-accent)]">{o.email}</a>
              </div>
            ))}
          </div>
          <form className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-background)] p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
            <div className="df-reveal-stagger grid gap-4 sm:grid-cols-2">
              <input type="text" placeholder="Full name" aria-label="Full name" className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-3 text-sm" />
              <input type="email" placeholder="Work email" aria-label="Email" className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-3 text-sm" />
            </div>
            <input type="text" placeholder="Company" aria-label="Company" className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-3 text-sm" />
            <textarea placeholder="Describe your transformation challenge" aria-label="Message" rows={4} className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-3 text-sm" />
            <button type="submit" className="cb-btn-primary cb-focus-ring">Request consultation</button>
          </form>
        </div>
      </div>
    </section>
  );
}
