/**
 * Shared motion keyframes and entrance bindings for all V2 flagship templates.
 */
export function buildFoundationMotionCss(): string {
  const revealPrefixes = [
    "df",
    "hr",
    "mp",
    "rep",
    "as",
    "se",
    "cb",
    "fn",
    "ec",
    "ed",
    "sv",
    "cp",
    "rs",
    "rp",
    "ct",
    "pr",
    "ob",
    "pu",
    "fg",
    "lu",
  ];

  const revealSelectors = revealPrefixes
    .map((p) => `.${p}-reveal`)
    .join(",\n");
  const visibleSelectors = revealPrefixes
    .map((p) => `.${p}-reveal.${p}-is-visible, .${p}-reveal.df-is-visible`)
    .join(",\n");
  const staggerChildSelectors = revealPrefixes
    .map((p) => `.${p}-reveal-stagger > *`)
    .join(",\n");
  const staggerVisibleSelectors = revealPrefixes
    .flatMap((p) => [
      `.${p}-reveal-stagger.${p}-is-visible > *`,
      `.${p}-reveal-stagger.df-is-visible > *`,
      `.${p}-reveal.${p}-is-visible .${p}-reveal-stagger > *`,
      `.${p}-reveal.df-is-visible .${p}-reveal-stagger > *`,
    ])
    .join(",\n");

  return `
/* Design Foundation — motion */
@keyframes df-reveal-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes df-reveal-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes df-slide-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes df-scale-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes df-draw-line {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes df-float-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes df-nav-enter {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes df-cta-pulse {
  0%, 100% { box-shadow: 0 8px 28px color-mix(in srgb, var(--color-primary) 18%, transparent); }
  50% { box-shadow: 0 12px 36px color-mix(in srgb, var(--color-accent, var(--color-signal)) 24%, transparent); }
}

.v2-motion[data-entrance="slide-up"],
.v2-motion[data-entrance="fade-in"] {
  animation-duration: var(--df-motion-base);
  animation-timing-function: var(--df-motion-ease);
  animation-fill-mode: both;
}
.v2-motion[data-entrance="slide-up"] { animation-name: df-reveal-up; }
.v2-motion[data-entrance="fade-in"] { animation-name: df-reveal-fade; }

.df-animate-reveal {
  animation: df-reveal-up var(--df-motion-slow) var(--df-motion-ease) both;
}
.df-animate-slide-up {
  animation: df-slide-up var(--df-motion-base) var(--df-motion-ease) both;
}
.df-animate-nav {
  animation: df-nav-enter 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.df-animate-float {
  animation: df-float-soft 6s ease-in-out infinite;
}

${revealSelectors} {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
${visibleSelectors} {
  opacity: 1;
  transform: translateY(0);
}

${staggerChildSelectors} {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
${staggerVisibleSelectors} {
  opacity: 1;
  transform: translateY(0);
}
.df-reveal-stagger > *:nth-child(1), .hr-reveal-stagger > *:nth-child(1), .mp-reveal-stagger > *:nth-child(1), .rep-reveal-stagger > *:nth-child(1),
.se-reveal-stagger > *:nth-child(1), .cb-reveal-stagger > *:nth-child(1), .fn-reveal-stagger > *:nth-child(1), .as-reveal-stagger > *:nth-child(1) { transition-delay: 0.05s; }
.df-reveal-stagger > *:nth-child(2), .hr-reveal-stagger > *:nth-child(2), .mp-reveal-stagger > *:nth-child(2), .rep-reveal-stagger > *:nth-child(2),
.se-reveal-stagger > *:nth-child(2), .cb-reveal-stagger > *:nth-child(2), .fn-reveal-stagger > *:nth-child(2), .as-reveal-stagger > *:nth-child(2) { transition-delay: 0.1s; }
.df-reveal-stagger > *:nth-child(3), .hr-reveal-stagger > *:nth-child(3), .mp-reveal-stagger > *:nth-child(3), .rep-reveal-stagger > *:nth-child(3),
.se-reveal-stagger > *:nth-child(3), .cb-reveal-stagger > *:nth-child(3), .fn-reveal-stagger > *:nth-child(3), .as-reveal-stagger > *:nth-child(3) { transition-delay: 0.15s; }
.df-reveal-stagger > *:nth-child(4), .hr-reveal-stagger > *:nth-child(4), .mp-reveal-stagger > *:nth-child(4), .rep-reveal-stagger > *:nth-child(4),
.se-reveal-stagger > *:nth-child(4), .cb-reveal-stagger > *:nth-child(4), .fn-reveal-stagger > *:nth-child(4), .as-reveal-stagger > *:nth-child(4) { transition-delay: 0.2s; }
.df-reveal-stagger > *:nth-child(5), .hr-reveal-stagger > *:nth-child(5), .mp-reveal-stagger > *:nth-child(5), .rep-reveal-stagger > *:nth-child(5) { transition-delay: 0.25s; }
.df-reveal-stagger > *:nth-child(6), .hr-reveal-stagger > *:nth-child(6), .mp-reveal-stagger > *:nth-child(6), .rep-reveal-stagger > *:nth-child(6) { transition-delay: 0.3s; }

.df-hero-stagger > * {
  opacity: 0;
  animation: df-reveal-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.df-hero-stagger > *:nth-child(1) { animation-delay: 0.05s; }
.df-hero-stagger > *:nth-child(2) { animation-delay: 0.12s; }
.df-hero-stagger > *:nth-child(3) { animation-delay: 0.2s; }
.df-hero-stagger > *:nth-child(4) { animation-delay: 0.28s; }
.df-hero-stagger > *:nth-child(5) { animation-delay: 0.36s; }
.df-hero-stagger > *:nth-child(6) { animation-delay: 0.44s; }

.df-card, .se-card, .cb-card, .fn-card, .mp-card, .ec-card, .ed-card, .hr-card, .rep-card,
.sv-card, .cp-card, .rs-card, .rp-card, .ct-card, .pr-card, .fg-card, .lu-card, .as-card {
  transition: border-color 0.3s ease, box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.df-card:hover, .se-card:hover, .cb-card:hover, .fn-card:hover, .mp-card:hover, .ec-card:hover,
.hr-card:hover, .rep-card:hover, .sv-card:hover, .cp-card:hover, .rs-card:hover, .ct-card:hover,
.pr-card:hover, .fg-card:hover, .lu-card:hover, .as-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card, var(--shadow-surface));
  border-color: color-mix(in srgb, var(--color-accent, var(--color-signal)) 28%, var(--border-subtle, transparent));
}

.df-floating-cta a, .se-floating-cta a, .fn-floating-cta a, .cb-floating-cta a, .ct-floating-cta a {
  animation: df-cta-pulse 3.5s ease-in-out 1s infinite;
}

.df-accent-rule, .se-accent-rule, .cb-accent-rule, .fn-accent-rule, .mp-accent-rule, .rep-accent-rule,
.hr-azure-rule, .as-accent-rule, .ct-accent-rule {
  transform-origin: left;
  animation: df-draw-line 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}
[dir="rtl"] .df-accent-rule, [dir="rtl"] .hr-azure-rule, [dir="rtl"] .rep-accent-rule { transform-origin: right; }

@supports (animation-timeline: view()) {
  .df-reveal:not(.df-reveal-js), .hr-reveal:not(.df-reveal-js), .mp-reveal:not(.df-reveal-js), .rep-reveal:not(.df-reveal-js),
  .se-reveal:not(.df-reveal-js), .cb-reveal:not(.df-reveal-js), .fn-reveal:not(.df-reveal-js), .as-reveal:not(.df-reveal-js),
  .ec-reveal:not(.df-reveal-js), .ed-reveal:not(.df-reveal-js), .sv-reveal:not(.df-reveal-js), .cp-reveal:not(.df-reveal-js),
  .rs-reveal:not(.df-reveal-js), .rp-reveal:not(.df-reveal-js), .ct-reveal:not(.df-reveal-js), .pr-reveal:not(.df-reveal-js),
  .ob-reveal:not(.df-reveal-js), .pu-reveal:not(.df-reveal-js), .fg-reveal:not(.df-reveal-js), .lu-reveal:not(.df-reveal-js) {
    animation: df-slide-up linear both;
    animation-timeline: view();
    animation-range: entry 5% cover 28%;
  }
  .df-reveal-stagger:not(.df-reveal-js) > *, .hr-reveal-stagger:not(.df-reveal-js) > *, .mp-reveal-stagger:not(.df-reveal-js) > *,
  .rep-reveal-stagger:not(.df-reveal-js) > *, .se-reveal-stagger:not(.df-reveal-js) > *, .cb-reveal-stagger:not(.df-reveal-js) > *,
  .fn-reveal-stagger:not(.df-reveal-js) > *, .as-reveal-stagger:not(.df-reveal-js) > *, .ec-reveal-stagger:not(.df-reveal-js) > *,
  .ed-reveal-stagger:not(.df-reveal-js) > *, .sv-reveal-stagger:not(.df-reveal-js) > *, .cp-reveal-stagger:not(.df-reveal-js) > *,
  .rs-reveal-stagger:not(.df-reveal-js) > *, .rp-reveal-stagger:not(.df-reveal-js) > *, .ct-reveal-stagger:not(.df-reveal-js) > *,
  .pr-reveal-stagger:not(.df-reveal-js) > *, .ob-reveal-stagger:not(.df-reveal-js) > *, .pu-reveal-stagger:not(.df-reveal-js) > *,
  .fg-reveal-stagger:not(.df-reveal-js) > *, .lu-reveal-stagger:not(.df-reveal-js) > * {
    animation: df-slide-up linear both;
    animation-timeline: view();
    animation-range: entry 8% cover 32%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v2-motion, [data-v2-motion], .df-animate-reveal, .df-animate-slide-up, .df-animate-nav, .df-animate-float {
    animation: none !important;
    transition: none !important;
  }
  ${revealSelectors}, ${staggerChildSelectors} {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
    transition: none !important;
  }
  .df-hero-stagger > * { opacity: 1 !important; animation: none !important; }
  .df-card:hover, .se-card:hover, .cb-card:hover, .fn-card:hover, .hr-card:hover, .rep-card:hover, .mp-card:hover {
    transform: none !important;
  }
  .df-floating-cta a, .se-floating-cta a, .fn-floating-cta a { animation: none !important; }
  .df-accent-rule, .hr-azure-rule { animation: none !important; }
}
`.trim();
}
