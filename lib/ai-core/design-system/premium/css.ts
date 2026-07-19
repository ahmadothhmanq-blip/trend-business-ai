import type { PremiumDesignSystem } from "@/lib/ai-core/design-system/premium/types";

/**
 * Emit CSS custom properties for premium tokens (used in globals.css scaffolding).
 */
export function premiumDesignCssVariables(premium: PremiumDesignSystem): string {
  const c = premium.colors;
  const t = premium.typography;
  const s = premium.spacing;
  const r = premium.radius;
  const sh = premium.shadows;
  const g = premium.gradients;
  const glass = premium.glass;
  const a = premium.animation;

  return `
  /* Premium Design System Engine */
  --premium-style: ${premium.styleId};
  --color-primary: ${c.primary};
  --color-secondary: ${c.secondary};
  --color-accent: ${c.accent};
  --color-neutral: ${c.neutral};
  --color-surface: ${c.surface};
  --color-background: ${c.background};
  --color-foreground: ${c.foreground};
  --color-muted: ${c.muted};
  --color-success: ${c.success};
  --color-warning: ${c.warning};
  --color-danger: ${c.danger};
  --color-on-primary: ${c.onPrimary};
  --font-display: "${t.displayFont}", Georgia, serif;
  --font-heading: "${t.headingFont}", Georgia, serif;
  --font-body: "${t.bodyFont}", system-ui, sans-serif;
  --font-mono: "${t.monoFont}", ui-monospace, monospace;
  --text-display: ${t.scale.display};
  --text-h1: ${t.scale.h1};
  --text-h2: ${t.scale.h2};
  --text-h3: ${t.scale.h3};
  --text-body: ${t.scale.body};
  --text-small: ${t.scale.small};
  --leading-display: ${t.lineHeights.display};
  --leading-heading: ${t.lineHeights.heading};
  --leading-body: ${t.lineHeights.body};
  --tracking-display: ${t.tracking.display};
  --space-xs: ${s.scale.xs};
  --space-sm: ${s.scale.sm};
  --space-md: ${s.scale.md};
  --space-lg: ${s.scale.lg};
  --space-xl: ${s.scale.xl};
  --space-2xl: ${s.scale["2xl"]};
  --space-3xl: ${s.scale["3xl"]};
  --section-y: ${s.sectionY};
  --section-y-mobile: ${s.sectionYMobile};
  --container-max: ${s.containerMax};
  --gutter: ${s.gutter};
  --radius: ${r.default};
  --radius-sm: ${r.sm};
  --radius-md: ${r.md};
  --radius-lg: ${r.lg};
  --radius-xl: ${r.xl};
  --radius-full: ${r.full};
  --shadow-sm: ${sh.sm};
  --shadow-md: ${sh.md};
  --shadow-lg: ${sh.lg};
  --shadow-xl: ${sh.xl};
  --shadow-glow: ${sh.glow};
  --shadow: ${sh.default};
  --gradient-hero: ${g.hero};
  --gradient-cta: ${g.cta};
  --gradient-surface: ${g.surface};
  --gradient-accent: ${g.accent};
  --glass-bg: ${glass.background};
  --glass-border: ${glass.border};
  --glass-blur: ${glass.blur};
  --glass-saturate: ${glass.saturate};
  --ease-premium: ${a.easing};
  --duration-fast: ${a.durationFast};
  --duration: ${a.duration};
  --duration-slow: ${a.durationSlow};
  --hero-style: ${premium.layout.heroStyle};
  --card-style: ${premium.layout.cardStyle};
  --nav-style: ${premium.layout.navigationStyle};
  --footer-style: ${premium.layout.footerStyle};
`.trim();
}

export function premiumUtilityCss(premium: PremiumDesignSystem): string {
  return `
.premium-glass {
  background: var(--glass-bg);
  border: var(--glass-border);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
}
.premium-hero-overlay {
  background-image: var(--gradient-hero);
}
.premium-cta {
  background-image: var(--gradient-cta);
  color: var(--color-on-primary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-glow);
  transition: transform var(--duration-fast) var(--ease-premium), opacity var(--duration-fast) var(--ease-premium);
}
.premium-cta:hover {
  transform: translateY(-1px);
  opacity: 0.94;
}
.premium-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  background: var(--color-surface);
  transition: transform var(--duration) var(--ease-premium), box-shadow var(--duration) var(--ease-premium);
}
.premium-editorial {
  border: 0;
  box-shadow: none;
  background: transparent;
}
.premium-media {
  overflow: hidden;
  border-radius: var(--radius-xl);
  transition: transform var(--duration-slow) var(--ease-premium);
}
a, button {
  transition: color var(--duration-fast) var(--ease-premium), background-color var(--duration-fast) var(--ease-premium), border-color var(--duration-fast) var(--ease-premium), opacity var(--duration-fast) var(--ease-premium), transform var(--duration-fast) var(--ease-premium);
}
@media (max-width: 768px) {
  :root {
    --section-y: var(--section-y-mobile);
  }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
/* style: ${premium.styleId} · ${premium.layout.heroStyle} · ${premium.layout.sectionLayout} */
`.trim();
}
