/**
 * Phase 5 — Elite visual system for theme preview.
 * Global polish: typography, motion, cards, heroes — no architecture changes.
 */
export function buildEliteVisualSystemCss(colors: {
  primary: string;
  accent: string;
  foreground: string;
  background: string;
  surface: string;
}): string {
  const c = colors;
  return `
    /* ── Phase 5 Elite Visual System ── */
    :root {
      --ti-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --ti-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ti-section-gap: clamp(4rem, 10vw, 7rem);
      --ti-container: min(80rem, 100% - 2.5rem);
      --ti-glow: 0 0 80px color-mix(in srgb, ${c.accent} 28%, transparent);
      --ti-hero-min: min(96svh, 920px);
    }

    /* Scroll-reveal stagger for theme sections */
    [data-theme-scaffold] {
      animation: ti-elite-reveal 0.9s var(--ti-ease-out-expo) both;
      animation-timeline: view();
      animation-range: entry 0% cover 22%;
    }
    @keyframes ti-elite-reveal {
      from { opacity: 0; transform: translateY(28px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @supports not (animation-timeline: view()) {
      [data-theme-scaffold] {
        animation: ti-elite-fallback 0.85s var(--ti-ease-out-expo) both;
      }
      @keyframes ti-elite-fallback {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    }

    /* Hero — wow within 3 seconds */
    [data-theme-scaffold="hero"] {
      min-height: var(--ti-hero-min);
      animation: ti-hero-enter 1.1s var(--ti-ease-out-expo) both;
    }
    @keyframes ti-hero-enter {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    [data-theme-scaffold="hero"] h1 {
      animation: ti-hero-title 1s var(--ti-ease-out-expo) 0.12s both;
    }
    [data-theme-scaffold="hero"] img {
      animation: ti-hero-image 1.2s var(--ti-ease-out-expo) 0.08s both;
    }
    @keyframes ti-hero-title {
      from { opacity: 0; transform: translateY(32px); letter-spacing: 0.02em; }
      to { opacity: 1; transform: translateY(0); letter-spacing: inherit; }
    }
    @keyframes ti-hero-image {
      from { opacity: 0; transform: scale(1.06); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Cinematic full-bleed heroes */
    .ti-hero-cinematic [data-theme-scaffold="hero"] {
      min-height: 100svh;
    }
    .ti-hero-cinematic [data-theme-scaffold="hero"] img {
      object-position: center 35%;
    }

    /* Dark authority (law, finance) */
    .ti-hero-dark-authority {
      --color-background: #08080a;
      --color-foreground: #f4f4f5;
      --color-surface: #121214;
    }
    .ti-hero-dark-authority [data-theme-scaffold="hero"] {
      background: linear-gradient(180deg, #08080a 0%, #0f0f12 100%);
    }

    /* Dashboard / SaaS heroes */
    .ti-hero-dashboard [data-theme-scaffold="hero"] {
      background: radial-gradient(ellipse 90% 70% at 50% -10%, color-mix(in srgb, ${c.accent} 18%, transparent), transparent);
    }

    /* Editorial oversized type */
    .ti-hero-editorial [data-theme-scaffold="hero"] h1 {
      font-size: clamp(2.75rem, 7vw, 5.5rem) !important;
      line-height: 0.98 !important;
      letter-spacing: -0.04em !important;
    }

    /* Premium navigation glass */
    header[class*="sticky"],
    aside[class*="fixed"] {
      backdrop-filter: blur(20px) saturate(1.4);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
    }

    /* Cards & feature blocks */
    .theme-luxury-section article,
    .theme-modern-section article,
    .theme-minimal-section article,
    .theme-corporate-section article,
    .theme-creative-section article,
    .theme-tech-section article,
    .theme-editorial-section article,
    .theme-bold-section article,
    [class*="rounded-2xl"][class*="border"],
    [class*="rounded-xl"][class*="border"] {
      transition: transform 0.45s var(--ti-ease-out-expo), box-shadow 0.45s var(--ti-ease-out-expo), border-color 0.35s ease;
    }
    .theme-luxury-section article:hover,
    .theme-modern-section article:hover,
    .theme-corporate-section article:hover,
    .theme-bold-section article:hover {
      transform: translateY(-4px);
      box-shadow: 0 24px 48px color-mix(in srgb, ${c.foreground} 12%, transparent);
    }

    /* CTA buttons micro-interaction */
    a[class*="rounded-full"],
    a[class*="uppercase"][class*="border"],
    a[class*="bg-[var(--color-accent)]"],
    a[class*="bg-[var(--color-primary)]"] {
      transition: transform 0.35s var(--ti-ease-spring), box-shadow 0.35s ease, background 0.3s ease !important;
    }
    a[class*="rounded-full"]:hover,
    a[class*="bg-[var(--color-accent)]"]:hover,
    a[class*="bg-[var(--color-primary)]"]:hover {
      transform: translateY(-2px);
      box-shadow: var(--ti-glow);
    }

    /* Testimonials — editorial quotes */
    blockquote, [class*="testimonial"], [class*="quote"] {
      font-feature-settings: "liga" 1, "kern" 1;
    }

    /* Pricing cards — elevated highlight */
    [data-theme-scaffold="pricing"] article {
      transition: transform 0.5s var(--ti-ease-out-expo), box-shadow 0.5s var(--ti-ease-out-expo);
    }
    [data-theme-scaffold="pricing"] article:hover {
      transform: translateY(-6px);
    }

    /* Feature grid rhythm */
    [data-theme-scaffold="features"] article {
      transition: transform 0.45s var(--ti-ease-out-expo), border-color 0.35s ease, box-shadow 0.45s ease;
    }
    [data-theme-scaffold="features"] article:hover {
      transform: translateY(-3px);
    }

    /* CTA bands */
    [data-theme-scaffold="cta"] {
      animation: ti-cta-glow 4s ease-in-out infinite alternate;
    }
    @keyframes ti-cta-glow {
      from { box-shadow: 0 0 0 color-mix(in srgb, ${c.accent} 0%, transparent); }
      to { box-shadow: 0 0 48px color-mix(in srgb, ${c.accent} 12%, transparent); }
    }

    /* Footer rhythm */
    footer {
      border-top: 1px solid color-mix(in srgb, ${c.foreground} 8%, transparent);
    }

    /* Inner pages match homepage quality */
    .ti-inner-hero {
      min-height: clamp(280px, 42vh, 480px);
      display: flex;
      align-items: flex-end;
      position: relative;
      overflow: hidden;
    }
    .ti-inner-hero::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 80% 60% at 20% 100%, color-mix(in srgb, ${c.accent} 12%, transparent), transparent);
      pointer-events: none;
    }
    .ti-inner-hero__title {
      font-size: clamp(2.25rem, 5vw, 3.75rem) !important;
    }

    /* Mobile — generous touch, no cramped heroes */
    @media (max-width: 767px) {
      [data-theme-scaffold="hero"] {
        min-height: min(88svh, 720px);
      }
      [data-theme-scaffold="hero"] h1 {
        font-size: clamp(2rem, 8vw, 2.75rem) !important;
      }
      a[class*="px-"] {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-theme-scaffold],
      [data-theme-scaffold="hero"],
      [data-theme-scaffold="hero"] h1,
      [data-theme-scaffold="hero"] img {
        animation: none !important;
      }
      a:hover, article:hover {
        transform: none !important;
      }
    }
  `;
}
