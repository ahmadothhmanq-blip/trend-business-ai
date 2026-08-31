import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import { buildDesignFoundationCss } from "@/lib/website/template-v2/foundation";
import { buildTbdpNativeAuthorityCss } from "@/lib/website/template-v2/tbdp";
import { buildAiStartupSignalGlobalCss } from "@/lib/website/template-v2/tokens/ai-startup-signal-global-css";
import { buildCorporateBusinessGlobalCss } from "@/lib/website/template-v2/tokens/corporate-business-global-css";
import { buildDnaLockCss } from "@/lib/website/template-v2/tokens/dna-lock-css";

function setCssVar(css: string, name: string, value: string): string {
  const re = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`);
  if (re.test(css)) return css.replace(re, `$1${value}$3`);
  if (css.includes(":root")) {
    return css.replace(/:root\s*\{/, `:root {\n  --${name}: ${value};`);
  }
  return `${css}\n:root { --${name}: ${value}; }\n`;
}

function extractFontFamily(fontStack: string): string {
  const first = fontStack.split(",")[0]?.trim() ?? fontStack;
  return first.includes(" ") ? `"${first}"` : first;
}

export function buildV2DesignTokenCss(
  tokens: TemplateV2DesignTokens,
  bundle: Pick<
    TemplateV2PackageBundle,
    | "packageId"
    | "manifest"
    | "tbdpNative"
    | "tbdpDesignContext"
    | "responsive"
  >,
): string {
  const lines = [
    `/* Template Architecture V2 — ${bundle.packageId} · spec ${bundle.manifest.specVersion} */`,
    ":root {",
    `  --v2-package: "${bundle.packageId}";`,
  ];

  for (const [key, value] of Object.entries(tokens.colors)) {
    lines.push(`  --color-${key}: ${value};`);
  }

  lines.push(
    `  --font-display: ${extractFontFamily(tokens.typography.display)}, ui-sans-serif, system-ui, sans-serif;`,
    `  --font-body: ${extractFontFamily(tokens.typography.body)}, ui-sans-serif, system-ui, sans-serif;`,
  );

  if (tokens.spacing?.unit) {
    lines.push(`  --spacing-unit: ${tokens.spacing.unit};`);
  }
  if (tokens.radius) {
    for (const [key, value] of Object.entries(tokens.radius)) {
      lines.push(`  --radius-${key}: ${value};`);
    }
  }
  if (tokens.shadows) {
    for (const [key, value] of Object.entries(tokens.shadows)) {
      lines.push(`  --shadow-${key}: ${value};`);
    }
  }
  if (tokens.borders) {
    for (const [key, value] of Object.entries(tokens.borders)) {
      lines.push(`  --border-${key}: ${value};`);
    }
  }

  lines.push("}");
  if (tokens.languageProfile?.directionAdaptation && tokens.languageProfile.rtlTypography) {
    const rtlDisplay = extractFontFamily(tokens.languageProfile.rtlTypography.display);
    const rtlBody = extractFontFamily(tokens.languageProfile.rtlTypography.body);
    lines.push(
      "",
      "/* V2 language profile — RTL typography adaptation */",
      '[dir="rtl"] {',
      `  --font-display: ${rtlDisplay}, ui-serif, Georgia, serif;`,
      `  --font-body: ${rtlBody}, ui-sans-serif, system-ui, sans-serif;`,
      "  letter-spacing: 0.01em;",
      "}",
    );
  }

  lines.push(
    buildDesignFoundationCss({
      packageId: bundle.packageId,
      tokens,
      responsive: bundle.responsive,
    }),
  );

  if (bundle.packageId === "restaurant-signature") {
    lines.push(buildRestaurantSignatureGlobalCss());
  }

  if (bundle.packageId === "restaurant-premium") {
    lines.push(buildRestaurantPremiumGlobalCss());
  }

  if (bundle.packageId === "hotel-resort-premium") {
    lines.push(buildHotelResortPremiumGlobalCss());
  }

  if (bundle.packageId === "saas-enterprise") {
    lines.push(buildSaasEnterpriseGlobalCss());
  }

  if (bundle.packageId === "ai-startup-signal") {
    lines.push(buildAiStartupSignalGlobalCss());
  }

  if (bundle.packageId === "corporate-business") {
    lines.push(buildCorporateBusinessGlobalCss());
  }

  if (bundle.packageId === "real-estate-prestige") {
    lines.push(buildRealEstatePrestigeGlobalCss());
  }

  if (bundle.packageId === "real-estate-premium") {
    lines.push(buildRealEstatePremiumGlobalCss());
  }

  if (bundle.packageId === "medical-premium") {
    lines.push(buildMedicalPremiumGlobalCss());
  }

  if (bundle.packageId === "creative-portfolio") {
    lines.push(buildCreativePortfolioGlobalCss());
  }

  if (bundle.packageId === "creative-agency-premium") {
    lines.push(buildCreativeAgencyPremiumGlobalCss());
  }

  if (bundle.packageId === "ecommerce-premium") {
    lines.push(buildEcommercePremiumGlobalCss());
  }

  if (bundle.packageId === "education-premium") {
    lines.push(buildEducationPremiumGlobalCss());
  }

  if (bundle.packageId === "finance-premium") {
    lines.push(buildFinancePremiumGlobalCss());
  }

  // DNA-lock architecture layers (distinct structures per remaining flagship skins)
  {
    const dna = buildDnaLockCss(bundle.packageId);
    if (dna) lines.push(dna);
  }

  if (bundle.tbdpNative && bundle.tbdpDesignContext) {
    lines.push(
      buildTbdpNativeAuthorityCss(bundle.tbdpNative, bundle.tbdpDesignContext),
    );
  }

  return lines.join("\n");
}

/** Forest Table design system — restaurant-signature V2 global layer */
function buildRestaurantSignatureGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&family=Noto+Sans+Arabic:wght@400;500;600&display=swap");

@keyframes rs-reveal-hero {
  from { opacity: 0; transform: translateY(36px); filter: blur(6px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes rs-reveal-section {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rs-draw-line {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes rs-scroll-pulse {
  0%, 100% { opacity: 0.35; transform: scaleY(0.6); }
  50% { opacity: 1; transform: scaleY(1); }
}
@keyframes rs-ken-burns {
  from { transform: scale(1.04); }
  to { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .v2-motion, [data-v2-motion] { animation: none !important; transition: none !important; }
}

.rs-font-display { font-family: var(--font-display), "Fraunces", Georgia, serif; }
.rs-font-body { font-family: var(--font-body), "Literata", Georgia, serif; }
.rs-eyebrow {
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: var(--color-copper, #D4A574);
}
.rs-headline {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(2.5rem, 5.5vw, 4.25rem);
  font-weight: 400;
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}
.rs-body {
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: color-mix(in srgb, var(--color-foreground) 68%, transparent);
}
.rs-copper-rule {
  height: 1px;
  width: 4rem;
  background: linear-gradient(90deg, var(--color-copper, #D4A574), transparent);
  transform-origin: left;
}
[dir="rtl"] .rs-copper-rule { transform-origin: right; }
.rs-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.875rem 2rem;
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-linen, #FFFCF7);
  background: var(--color-accent, #B87333);
  border: 1px solid color-mix(in srgb, var(--color-copper) 40%, transparent);
  transition: background 0.4s ease, box-shadow 0.4s ease, transform 0.35s ease;
}
.rs-btn-primary:hover {
  background: var(--color-copper, #D4A574);
  box-shadow: var(--shadow-glow);
}
.rs-btn-primary:focus-visible {
  outline: 2px solid var(--color-copper);
  outline-offset: 3px;
}
.rs-btn-ghost {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.875rem 1.75rem;
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  text-decoration: none;
  color: color-mix(in srgb, var(--color-foreground) 85%, transparent);
  border: 1px solid var(--border-copper, rgba(212,165,116,0.32));
  background: transparent;
  transition: border-color 0.35s ease, color 0.35s ease;
}
.rs-btn-ghost:hover { border-color: var(--color-copper); color: var(--color-copper); }
.rs-btn-ghost:focus-visible { outline: 2px solid var(--color-copper); outline-offset: 3px; }
.rs-section { padding-block: clamp(5rem, 12vw, 8rem); }
.rs-grain::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.rs-focus-ring:focus-visible { outline: 2px solid var(--color-copper); outline-offset: 2px; }
`;
}

/** Nexus Command design system — saas-enterprise V2 global layer */
function buildSaasEnterpriseGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Syne:wght@500;600;700;800&display=swap");

@keyframes se-grid-reveal {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes se-slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes se-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
[dir="rtl"] [class*="se-marquee"],
[dir="rtl"] [class*="cb-marquee"] {
  animation-direction: reverse;
}
@keyframes se-pulse-dot {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
}
@keyframes se-scan-line {
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 0.06; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .se-animate, [data-se-motion] { animation: none !important; transition: none !important; }
}

.se-font-display { font-family: var(--font-display), "Syne", system-ui, sans-serif; }
.se-font-body { font-family: var(--font-body), "DM Sans", system-ui, sans-serif; }
.se-font-mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
.se-eyebrow {
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent, #3B82F6);
}
.se-headline {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: clamp(2.25rem, 4.5vw, 3.75rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.se-headline-sm {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: clamp(1.5rem, 2.8vw, 2.25rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.se-body {
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-muted, rgba(15,23,42,0.58));
}
.se-grid-bg {
  background-image:
    linear-gradient(var(--color-grid, rgba(15,23,42,0.06)) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid, rgba(15,23,42,0.06)) 1px, transparent 1px);
  background-size: 48px 48px;
}
.se-card {
  border: 1px solid var(--border-subtle, rgba(15,23,42,0.04));
  background: var(--color-surface);
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease;
}
.se-card:hover {
  box-shadow: var(--shadow-surface);
  border-color: var(--border-accent, rgba(59,130,246,0.24));
  transform: translateY(-2px);
}
.se-card-featured {
  border-color: var(--border-accent, rgba(59,130,246,0.28));
  background: linear-gradient(165deg, color-mix(in srgb, var(--color-accent) 5%, var(--color-surface)), var(--color-surface));
  box-shadow: var(--shadow-surface), 0 0 0 1px color-mix(in srgb, var(--color-accent) 12%, transparent);
}
.se-section-alt {
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%);
}
.se-section-glow {
  position: relative;
  isolation: isolate;
}
.se-section-glow::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 90% 55% at 50% -15%, color-mix(in srgb, var(--color-accent) 9%, transparent), transparent 68%);
}
.se-glow-orb {
  pointer-events: none;
  position: absolute;
  border-radius: 50%;
  filter: blur(64px);
  opacity: 0.45;
}
.se-browser-frame {
  border: 1px solid var(--border-default, rgba(15,23,42,0.08));
  border-radius: var(--radius-xl, 20px);
  background: var(--color-surface);
  box-shadow: var(--shadow-surface), 0 0 0 1px color-mix(in srgb, var(--color-accent) 8%, transparent);
  overflow: hidden;
}
.se-browser-chrome {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border-bottom: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--color-foreground) 3%, var(--color-surface));
  padding: 0.625rem 0.875rem;
}
.se-browser-dot {
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;
  background: var(--border-default);
}
.se-trust-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem 1.75rem;
}
.se-trust-logo {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: color-mix(in srgb, var(--color-foreground) 42%, transparent);
  transition: color 0.25s ease;
}
.se-trust-logo:hover { color: var(--color-foreground); }
.se-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  padding: 0.25rem 0.625rem;
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-muted);
  backdrop-filter: blur(8px);
}
.se-star {
  color: var(--color-signal, #059669);
  letter-spacing: 0.12em;
}
.se-quote-mark {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: 3.5rem;
  line-height: 1;
  color: color-mix(in srgb, var(--color-accent) 35%, transparent);
}
.se-divider-gradient {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--border-default), transparent);
}
.se-input,
.se-textarea {
  width: 100%;
  border-radius: var(--radius-md, 10px);
  border: 1px solid var(--border-default);
  background: var(--color-background);
  padding: 0.625rem 0.875rem;
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.875rem;
  color: var(--color-foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.se-input:focus-visible,
.se-textarea:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
}
.se-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  color: #fff;
  background: var(--color-primary, #1D4ED8);
  border-radius: var(--radius-md, 10px);
  border: 1px solid transparent;
  box-shadow: 0 1px 2px rgba(15,23,42,0.06);
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
}
.se-btn-primary:hover {
  background: var(--color-accent, #3B82F6);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.se-btn-primary:active {
  transform: translateY(0) scale(0.98);
}
.se-btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.se-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body), "DM Sans", system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--color-foreground);
  background: var(--color-surface);
  border: 1px solid var(--border-default, rgba(15,23,42,0.08));
  border-radius: var(--radius-md, 10px);
  transition: border-color 0.25s ease, background 0.25s ease;
}
.se-btn-secondary:hover { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 4%, var(--color-surface)); transform: translateY(-1px); }
.se-btn-secondary:active { transform: translateY(0) scale(0.98); }
.se-btn-secondary:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
.se-section { padding-block: clamp(4rem, 10vw, 6.5rem); }
.se-metric {
  font-family: var(--font-display), "Syne", system-ui, sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-primary);
}
.se-signal { color: var(--color-signal, #059669); }
.se-focus-ring:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
`;
}

/** Ember Table design system — restaurant-premium V2 (global firm + motion) */
function buildRestaurantPremiumGlobalCss(): string {
  return `@import url("https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&family=Noto+Sans+Arabic:wght@400;500;600&display=swap");

@keyframes rp-reveal-hero {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rp-reveal-section {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rp-rule-grow {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes rp-glow-pulse {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.04); }
}
@keyframes rp-media-enter {
  from { opacity: 0; transform: translateX(24px) scale(0.98); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes rp-slide-left {
  from { opacity: 0; transform: translateX(-22px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes rp-slide-right {
  from { opacity: 0; transform: translateX(22px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes rp-metric-pop {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes rp-cta-pulse {
  0%, 100% { box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28); }
  50% { box-shadow: 0 18px 48px color-mix(in srgb, var(--color-accent) 28%, transparent); }
}
@keyframes rp-shimmer {
  0% { transform: translateX(-130%); }
  100% { transform: translateX(130%); }
}
@keyframes rp-frame-drift {
  0%, 100% { transform: translate(10px, -10px); }
  50% { transform: translate(14px, -14px); }
}

@media (prefers-reduced-motion: reduce) {
  [data-v2-motion], .df-reveal,
  .rp-reveal, .rp-reveal-stagger > *,
  .rp-hero-stagger .rp-hero-item,
  .rp-split-left, .rp-split-right, .rp-form-enter,
  .rp-hero-media-enter, .rp-hero-glow, .rp-hero-frame,
  .rp-btn-primary::after, .rp-cta-band {
    animation: none !important;
    transition: none !important;
  }
  .rp-reveal, .rp-reveal-stagger > *,
  .rp-hero-stagger .rp-hero-item,
  .rp-split-left, .rp-split-right, .rp-form-enter,
  .rp-hero-media-enter {
    opacity: 1 !important;
    transform: none !important;
  }
}

/* Ember — global firm, copper motion system */
[data-v2-package="restaurant-premium"] {
  color-scheme: dark;
  --color-copper: #e09a62;
  --color-ember: #b56a38;
  --rp-max: 72rem;
  --rp-glow: color-mix(in srgb, var(--color-accent) 18%, transparent);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 55%),
    radial-gradient(ellipse 60% 40% at 100% 20%, color-mix(in srgb, #8b4518 12%, transparent), transparent 50%),
    var(--color-background);
}
[data-v2-package="restaurant-premium"] [id] { scroll-margin-top: 5.5rem; }
[data-v2-package="restaurant-premium"] .df-section-glow::before,
[data-v2-package="restaurant-premium"] .rp-section-glow::before { display: none; }
[data-v2-package="restaurant-premium"] ::selection {
  background: color-mix(in srgb, var(--color-accent) 38%, transparent);
  color: var(--color-foreground);
}

.rp-shell {
  width: min(100% - 2.5rem, var(--rp-max));
  margin-inline: auto;
  padding-inline: 1.25rem;
}
@media (min-width: 640px) {
  .rp-shell { padding-inline: 2rem; }
}

.rp-brand {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-foreground);
  text-decoration: none;
  letter-spacing: -0.02em;
  transition: color 0.25s ease;
}
.rp-brand:hover { color: var(--color-copper); }

.rp-kicker {
  margin: 0 0 0.75rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-copper);
}
.rp-kicker--on-dark { color: color-mix(in srgb, #110D0A 72%, transparent); }

.rp-display {
  margin: 0;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(2.35rem, 5.2vw, 3.9rem);
  font-weight: 400;
  line-height: 1.06;
  letter-spacing: -0.028em;
  max-width: 14ch;
  text-wrap: balance;
  background: linear-gradient(135deg, var(--color-foreground) 0%, color-mix(in srgb, var(--color-foreground) 78%, var(--color-copper)) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.rp-h2 {
  margin: 0;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(1.625rem, 3vw, 2.375rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}
.rp-h2--on-dark { color: #110D0A; }
.rp-lead {
  margin: 1.25rem 0 0;
  max-width: 34rem;
  font-size: 1.125rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--color-foreground) 72%, transparent);
}
.rp-body {
  font-family: var(--font-body), "Literata", Georgia, serif;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--color-foreground) 70%, transparent);
}
.rp-headline-sm { font-family: var(--font-display), "Fraunces", Georgia, serif; font-size: clamp(1.5rem, 3vw, 2.25rem); }
.rp-metric { font-family: var(--font-display), "Fraunces", Georgia, serif; color: var(--color-copper); }

.rp-accent-rule {
  width: 3.25rem;
  height: 2px;
  margin: 1.1rem 0 0;
  background: linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-copper) 40%, transparent));
  transform-origin: left center;
  animation: rp-rule-grow 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
}
.rp-accent-rule--center {
  margin-inline: auto;
  transform-origin: center;
}
[dir="rtl"] .rp-accent-rule { transform-origin: right center; }

.rp-btn-primary,
.rp-btn-ghost,
.rp-btn-light,
.rp-btn-ghost-light {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 2.75rem;
  padding: 0.75rem 1.55rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-decoration: none;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}
.rp-btn-primary {
  background: linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-copper) 70%, var(--color-accent)));
  color: #110D0A;
  border: 1px solid transparent;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--color-accent) 22%, transparent);
}
.rp-btn-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%);
  transform: translateX(-130%);
  pointer-events: none;
}
.rp-btn-primary:hover {
  background: var(--color-copper);
  transform: translateY(-2px);
  box-shadow: 0 14px 36px color-mix(in srgb, var(--color-copper) 30%, transparent);
}
.rp-btn-primary:hover::after { animation: rp-shimmer 0.75s ease; }
.rp-btn-ghost {
  background: transparent;
  color: var(--color-foreground);
  border: 1px solid var(--border-default);
}
.rp-btn-ghost:hover {
  border-color: var(--color-copper);
  color: var(--color-copper);
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--color-copper) 8%, transparent);
}
.rp-btn-light {
  background: #110D0A;
  color: #F5EDE4;
  border: 1px solid transparent;
}
.rp-btn-light:hover { transform: translateY(-2px); background: #1a1410; }
.rp-btn-ghost-light {
  background: transparent;
  color: #110D0A;
  border: 1px solid color-mix(in srgb, #110D0A 35%, transparent);
}
.rp-btn-ghost-light:hover {
  background: color-mix(in srgb, #110D0A 8%, transparent);
  transform: translateY(-2px);
}
.rp-focus-ring:focus-visible { outline: 2px solid var(--color-copper); outline-offset: 3px; }

/* Top nav */
.rp-topnav {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid transparent;
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
.rp-topnav--solid {
  background: color-mix(in srgb, var(--color-background) 88%, transparent);
  border-color: var(--border-subtle);
  backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.28);
}
.rp-topnav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.25rem;
}
.rp-topnav-links {
  display: none;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 1.75rem;
}
@media (min-width: 1024px) {
  .rp-topnav-links { display: flex; }
}
.rp-topnav-link {
  position: relative;
  font-size: 0.875rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--color-foreground) 78%, transparent);
  text-decoration: none;
  transition: color 0.25s ease;
}
.rp-topnav-link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.35rem;
  height: 1.5px;
  background: var(--color-copper);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.rp-topnav-link:hover { color: var(--color-copper); }
.rp-topnav-link:hover::after { transform: scaleX(1); }
.rp-topnav-actions { display: flex; align-items: center; gap: 0.75rem; }
.rp-topnav-actions .rp-btn-primary { display: none; }
@media (min-width: 640px) {
  .rp-topnav-actions .rp-btn-primary { display: inline-flex; }
}
.rp-menu-btn {
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--color-foreground);
  padding: 0.45rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: border-color 0.25s ease, color 0.25s ease;
}
.rp-menu-btn:hover { border-color: var(--color-copper); color: var(--color-copper); }
@media (min-width: 1024px) {
  .rp-menu-btn { display: none; }
}
.rp-mobile-panel {
  border-top: 1px solid var(--border-subtle);
  background: var(--color-background);
  padding: 1rem 1.25rem 1.5rem;
}
.rp-mobile-panel ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
.rp-mobile-panel a { color: var(--color-foreground); text-decoration: none; font-size: 0.9375rem; }

/* Hero */
.rp-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(4.5rem, 12vw, 7.5rem) 0 clamp(3rem, 8vw, 5.5rem);
  background:
    radial-gradient(ellipse 50% 55% at 92% 12%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 58%),
    radial-gradient(ellipse 40% 35% at 8% 80%, color-mix(in srgb, #6b3a1f 16%, transparent), transparent 55%),
    linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 35%, transparent), transparent 40%),
    var(--color-background);
}
.rp-hero-glow {
  position: absolute;
  inset: auto -10% 10% 40%;
  height: 55%;
  background: radial-gradient(ellipse at center, var(--rp-glow), transparent 68%);
  pointer-events: none;
  z-index: 0;
  animation: rp-glow-pulse 7s ease-in-out infinite;
}
.rp-hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: clamp(2rem, 5vw, 3.5rem);
  align-items: center;
}
@media (min-width: 1024px) {
  .rp-hero-grid { grid-template-columns: 1.05fr 0.95fr; }
}
.rp-hero-grid--solo { max-width: 40rem; }
.rp-hero-cta { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.75rem; }
.rp-trust-line {
  margin: 1.5rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-muted);
  letter-spacing: 0.02em;
}
.rp-hero-stagger .rp-hero-item {
  opacity: 0;
  animation: rp-reveal-hero 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rp-hero-stagger .rp-hero-item:nth-child(1) { animation-delay: 0.06s; }
.rp-hero-stagger .rp-hero-item:nth-child(2) { animation-delay: 0.14s; }
.rp-hero-stagger .rp-hero-item:nth-child(3) { animation-delay: 0.22s; }
.rp-hero-stagger .rp-hero-item:nth-child(4) { animation-delay: 0.3s; }
.rp-hero-stagger .rp-hero-item:nth-child(5) { animation-delay: 0.38s; }
.rp-hero-stagger .rp-hero-item:nth-child(6) { animation-delay: 0.46s; }
.rp-hero-stagger .rp-hero-item.rp-accent-rule {
  animation: rp-rule-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
}

.rp-hero-media {
  position: relative;
  margin: 0;
  border: 1px solid var(--border-accent);
  overflow: hidden;
  aspect-ratio: 4 / 3;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-accent) 18%, transparent),
    0 28px 64px rgba(0, 0, 0, 0.45);
}
.rp-hero-media:not(:has(img)) { display: none; }
.rp-hero-media-enter {
  opacity: 0;
  animation: rp-media-enter 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
}
.rp-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}
.rp-hero-media:hover .rp-hero-img { transform: scale(1.04); }
.rp-hero-frame {
  position: absolute;
  inset: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-copper) 45%, transparent);
  pointer-events: none;
  animation: rp-frame-drift 8s ease-in-out infinite;
}

/* Metrics */
.rp-metrics {
  position: relative;
  border-block: 1px solid var(--border-subtle);
  background:
    linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 8%, transparent) 50%, transparent),
    color-mix(in srgb, var(--color-surface) 65%, var(--color-background));
  padding: 2rem 0;
}
.rp-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
@media (min-width: 768px) {
  .rp-metrics-grid { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
}
.rp-metrics-item { text-align: center; }
.rp-metrics-item dd,
.rp-metrics-item .rp-metric {
  margin: 0;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(1.85rem, 3.2vw, 2.4rem);
  color: var(--color-copper);
  line-height: 1;
}
.rp-metrics-item dt {
  margin-top: 0.55rem;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--color-muted);
}
.rp-reveal.df-is-visible .rp-metrics-item dd,
.rp-reveal.rp-is-visible .rp-metrics-item dd,
.rp-reveal.df-is-visible .rp-metrics-item .rp-metric,
.rp-reveal.rp-is-visible .rp-metrics-item .rp-metric {
  animation: rp-metric-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rp-reveal.df-is-visible .rp-metrics-item:nth-child(1) dd,
.rp-reveal.rp-is-visible .rp-metrics-item:nth-child(1) dd { animation-delay: 0.08s; }
.rp-reveal.df-is-visible .rp-metrics-item:nth-child(2) dd,
.rp-reveal.rp-is-visible .rp-metrics-item:nth-child(2) dd { animation-delay: 0.16s; }
.rp-reveal.df-is-visible .rp-metrics-item:nth-child(3) dd,
.rp-reveal.rp-is-visible .rp-metrics-item:nth-child(3) dd { animation-delay: 0.24s; }
.rp-reveal.df-is-visible .rp-metrics-item:nth-child(4) dd,
.rp-reveal.rp-is-visible .rp-metrics-item:nth-child(4) dd { animation-delay: 0.32s; }

/* Sections */
.rp-section { padding: clamp(3.5rem, 9vw, 6rem) 0; }
.rp-section-alt {
  background:
    linear-gradient(165deg,
      color-mix(in srgb, var(--color-surface) 55%, var(--color-background)),
      color-mix(in srgb, var(--color-surface) 30%, transparent) 55%,
      var(--color-background));
  border-block: 1px solid var(--border-subtle);
}
.rp-section-head { margin-bottom: 2.5rem; max-width: 38rem; }
.rp-section-head--center { margin-inline: auto; text-align: center; }
.rp-section-sub { margin-top: 0.85rem; }

/* Capabilities */
.rp-cap-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 768px) {
  .rp-cap-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
}
.rp-cap-grid li {
  padding: 1.6rem;
  border: 1px solid var(--border-subtle);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--color-surface) 85%, transparent), color-mix(in srgb, var(--color-background) 40%, transparent));
  transition: border-color 0.3s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}
.rp-cap-grid li:hover {
  border-color: var(--border-accent);
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28), 0 0 0 1px color-mix(in srgb, var(--color-accent) 15%, transparent);
}
.rp-cap-num {
  display: block;
  margin-bottom: 0.85rem;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.125rem;
  color: var(--color-copper);
}
.rp-cap-grid h3 { margin: 0; font-size: 1.125rem; font-weight: 600; }
.rp-cap-grid p {
  margin: 0.55rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-muted);
}

/* Process */
.rp-process {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}
@media (min-width: 900px) {
  .rp-process { grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
}
.rp-process li {
  padding: 1.35rem 0 0;
  border-top: 2px solid transparent;
  border-image: linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-copper) 30%, transparent)) 1;
  transition: transform 0.3s ease;
}
.rp-process li:hover { transform: translateY(-3px); }
.rp-process-num {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: var(--color-copper);
  margin-bottom: 0.65rem;
}
.rp-process h3 { margin: 0; font-size: 1.0625rem; font-weight: 600; }
.rp-process p {
  margin: 0.45rem 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-muted);
}

/* About */
.rp-about-grid { display: grid; gap: 2.5rem; align-items: center; }
@media (min-width: 960px) {
  .rp-about-grid.has-media { grid-template-columns: 0.9fr 1.1fr; gap: 3.5rem; }
}
.rp-about-media {
  margin: 0;
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  aspect-ratio: 4 / 5;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.35);
}
.rp-about-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1s ease;
}
.rp-about-media:hover .rp-about-img { transform: scale(1.03); }
.rp-about-body { margin-top: 1rem; max-width: 36rem; }
.rp-checklist {
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.55rem;
}
.rp-checklist li {
  padding-inline-start: 1.25rem;
  position: relative;
  font-size: 0.9375rem;
  color: color-mix(in srgb, var(--color-foreground) 82%, transparent);
}
.rp-checklist li::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 0.55rem;
  width: 0.45rem;
  height: 0.45rem;
  background: var(--color-copper);
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-copper) 50%, transparent);
}
.rp-about-cta { margin-top: 1.5rem; }

.rp-split-left,
.rp-split-right,
.rp-form-enter {
  opacity: 0;
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}
.rp-split-left { transform: translateX(-18px); }
.rp-split-right,
.rp-form-enter { transform: translateX(18px); }
.rp-reveal.df-is-visible .rp-split-left,
.rp-reveal.rp-is-visible .rp-split-left,
.rp-reveal.df-is-visible .rp-split-right,
.rp-reveal.rp-is-visible .rp-split-right,
.rp-reveal.df-is-visible .rp-form-enter,
.rp-reveal.rp-is-visible .rp-form-enter {
  opacity: 1;
  transform: translateX(0);
}
.rp-reveal.df-is-visible .rp-split-left,
.rp-reveal.rp-is-visible .rp-split-left { transition-delay: 0.08s; }
.rp-reveal.df-is-visible .rp-split-right,
.rp-reveal.rp-is-visible .rp-split-right { transition-delay: 0.16s; }
.rp-reveal.df-is-visible .rp-form-enter,
.rp-reveal.rp-is-visible .rp-form-enter { transition-delay: 0.2s; }

/* Quotes */
.rp-quote-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 900px) {
  .rp-quote-grid { grid-template-columns: repeat(3, 1fr); }
}
.rp-quote-grid li {
  padding: 1.6rem;
  border: 1px solid var(--border-subtle);
  background:
    linear-gradient(165deg, color-mix(in srgb, var(--color-surface) 70%, transparent), color-mix(in srgb, var(--color-background) 50%, transparent));
  transition: transform 0.35s ease, border-color 0.3s ease, box-shadow 0.35s ease;
}
.rp-quote-grid li:hover {
  transform: translateY(-4px);
  border-color: var(--border-accent);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}
.rp-quote-grid blockquote {
  margin: 0;
  font-size: 0.975rem;
  line-height: 1.65;
}
.rp-quote-name { margin: 1.25rem 0 0; font-weight: 600; font-size: 0.9375rem; }
.rp-quote-role { margin: 0.2rem 0 0; font-size: 0.8125rem; color: var(--color-muted); }

/* Cases */
.rp-case-list { list-style: none; margin: 0; padding: 0; }
.rp-case-list li {
  display: grid;
  gap: 1rem;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--border-subtle);
  transition: background 0.3s ease, padding-inline 0.3s ease;
}
.rp-case-list li:first-child { border-top: 1px solid var(--border-subtle); }
.rp-case-list li:hover {
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
  padding-inline: 0.75rem;
}
@media (min-width: 768px) {
  .rp-case-list li {
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 2rem;
  }
}
.rp-case-industry {
  margin: 0;
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-copper);
}
.rp-case-main h3 { margin: 0.35rem 0 0; font-size: 1.25rem; font-weight: 600; }
.rp-case-main p {
  margin: 0.45rem 0 0;
  max-width: 40rem;
  font-size: 0.9375rem;
  color: var(--color-muted);
  line-height: 1.6;
}
.rp-case-metric { text-align: start; }
@media (min-width: 768px) {
  .rp-case-metric { text-align: end; min-width: 8rem; }
}
.rp-case-metric strong {
  display: block;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.75rem;
  color: var(--color-copper);
  font-weight: 400;
}
.rp-case-metric span { font-size: 0.75rem; color: var(--color-muted); }

/* Tiers */
.rp-tier-grid {
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 900px) {
  .rp-tier-grid { grid-template-columns: repeat(3, 1fr); align-items: stretch; }
}
.rp-tier {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.85rem;
  border: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--color-background) 55%, var(--color-surface));
  transition: transform 0.35s ease, border-color 0.3s ease, box-shadow 0.35s ease;
}
.rp-tier:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--color-copper) 40%, var(--border-subtle));
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.3);
}
.rp-tier.is-featured {
  border-color: var(--color-accent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-accent) 35%, transparent),
    0 22px 50px color-mix(in srgb, var(--color-accent) 18%, transparent);
  background:
    linear-gradient(165deg, color-mix(in srgb, var(--color-accent) 10%, var(--color-surface)), var(--color-surface));
}
@media (min-width: 900px) {
  .rp-tier.is-featured { transform: translateY(-0.45rem); }
  .rp-tier.is-featured:hover { transform: translateY(-0.7rem); }
}
.rp-tier-badge {
  position: absolute;
  top: -0.65rem;
  inset-inline-start: 1.25rem;
  padding: 0.2rem 0.65rem;
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--color-accent);
  color: #110D0A;
  font-weight: 700;
}
.rp-tier h3 { margin: 0; font-size: 1.25rem; font-weight: 600; }
.rp-tier-desc { margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--color-muted); }
.rp-tier-price {
  margin: 1.25rem 0;
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: 1.75rem;
  color: var(--color-foreground);
}
.rp-tier-price span { font-size: 0.875rem; color: var(--color-muted); margin-inline-start: 0.25rem; }
.rp-tier ul {
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
  flex: 1;
  display: grid;
  gap: 0.45rem;
}
.rp-tier li {
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--color-foreground) 80%, transparent);
  padding-inline-start: 1rem;
  position: relative;
}
.rp-tier li::before {
  content: "✓";
  position: absolute;
  inset-inline-start: 0;
  color: var(--color-copper);
  font-size: 0.75rem;
}

/* FAQ */
.rp-faq-layout { display: grid; gap: 2rem; }
@media (min-width: 900px) {
  .rp-faq-layout { grid-template-columns: 0.85fr 1.15fr; gap: 3.5rem; align-items: start; }
}
.rp-faq-list { margin: 0; }
.rp-faq-q {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border: 0;
  border-top: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--color-foreground);
  font: inherit;
  font-weight: 600;
  text-align: start;
  cursor: pointer;
  transition: color 0.25s ease;
}
.rp-faq-q:hover { color: var(--color-copper); }
.rp-faq-list > div:last-child .rp-faq-q { border-bottom: 1px solid var(--border-subtle); }
.rp-faq-a {
  margin: 0;
  padding: 0 0 1.1rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-muted);
  animation: rp-reveal-section 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Contact */
.rp-contact-grid { display: grid; gap: 2.5rem; }
@media (min-width: 900px) {
  .rp-contact-grid { grid-template-columns: 0.9fr 1.1fr; gap: 3.5rem; align-items: start; }
}
.rp-contact-meta { margin-top: 1.5rem; font-size: 0.9375rem; color: var(--color-muted); }
.rp-contact-meta a { color: var(--color-copper); transition: opacity 0.2s ease; }
.rp-contact-meta a:hover { opacity: 0.8; }
.rp-form { display: grid; gap: 1rem; }
.rp-form-row {
  display: grid;
  gap: 1rem;
}
@media (min-width: 640px) {
  .rp-form-row { grid-template-columns: 1fr 1fr; }
}
.rp-form label { display: grid; gap: 0.4rem; }
.rp-form label span {
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.rp-input {
  width: 100%;
  padding: 0.8rem 0.95rem;
  border: 1px solid var(--border-default);
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-background) 80%, var(--color-surface));
  color: var(--color-foreground);
  font: inherit;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.rp-input:focus {
  outline: none;
  border-color: var(--color-copper);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-copper) 22%, transparent);
}

/* CTA band + footer */
.rp-cta-band {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(125deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-copper) 75%, var(--color-accent)) 55%, #d4925a 100%);
  color: #110D0A;
  padding: clamp(2.75rem, 6vw, 3.75rem) 0;
}
.rp-cta-band::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 50% 80% at 90% 50%, rgba(255,255,255,0.22), transparent 60%);
  pointer-events: none;
}
.rp-cta-band-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (min-width: 800px) {
  .rp-cta-band-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.rp-cta-sub { margin: 0.5rem 0 0; font-size: 0.9375rem; opacity: 0.85; max-width: 28rem; }
.rp-cta-band-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.rp-cta-band .rp-btn-light {
  animation: rp-cta-pulse 3.2s ease-in-out infinite;
}

.rp-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 2.5rem 0 2rem;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 40%, var(--color-background)), var(--color-background));
}
.rp-footer-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem 2rem;
  margin-bottom: 1.75rem;
}
.rp-footer-tag {
  margin: 0.5rem 0 0;
  max-width: 26rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}
.rp-footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.35rem;
}
.rp-footer-nav a {
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--color-foreground) 75%, transparent);
  text-decoration: none;
  transition: color 0.25s ease;
}
.rp-footer-nav a:hover { color: var(--color-copper); }
.rp-footer-copy {
  margin: 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.75rem;
  color: var(--color-muted);
}

.rp-float {
  position: fixed;
  bottom: 1.25rem;
  inset-inline-end: 1.25rem;
  z-index: 40;
}
.rp-float .rp-btn-primary {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  border-radius: 999px;
  padding-inline: 1.35rem;
  animation: rp-cta-pulse 3.5s ease-in-out infinite;
}

.rp-card { background: transparent; border: 0; box-shadow: none; }

@supports (animation-timeline: view()) {
  .rp-reveal:not(.rp-reveal-js) {
    animation: rp-reveal-section linear both;
    animation-timeline: view();
    animation-range: entry 5% cover 30%;
  }
  .rp-reveal-stagger:not(.rp-reveal-js) > * {
    animation: rp-reveal-section linear both;
    animation-timeline: view();
    animation-range: entry 8% cover 34%;
  }
  .rp-reveal-stagger:not(.rp-reveal-js) > *:nth-child(2) { animation-range: entry 10% cover 36%; }
  .rp-reveal-stagger:not(.rp-reveal-js) > *:nth-child(3) { animation-range: entry 12% cover 38%; }
  .rp-reveal-stagger:not(.rp-reveal-js) > *:nth-child(4) { animation-range: entry 14% cover 40%; }
  .rp-split-left {
    animation: rp-slide-left linear both;
    animation-timeline: view();
    animation-range: entry 8% cover 32%;
  }
  .rp-split-right,
  .rp-form-enter {
    animation: rp-slide-right linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 34%;
  }
}
`;
}

/** Mirage Haven design system — hotel-resort-premium V2 global layer */
function buildHotelResortPremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&family=Noto+Sans+Arabic:wght@400;500;600&family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap");

[data-v2-package="hotel-resort-premium"] {
  color-scheme: light;
  --color-surface-elevated: #F9F7FD;
  --color-surface-inset: #D8CFE8;
  --df-accent-glow: color-mix(in srgb, var(--color-accent) 8%, transparent);
  --hr-accent: var(--color-accent);
  --hr-accent-soft: color-mix(in srgb, var(--hr-accent) 8%, var(--color-background));
  --hr-accent-muted: color-mix(in srgb, var(--hr-accent) 18%, transparent);
  --hr-accent-border: color-mix(in srgb, var(--hr-accent) 22%, var(--border-subtle));
  --hr-brand: var(--color-primary);
  --hr-brand-soft: var(--color-secondary);
  --hr-brand-dark: color-mix(in srgb, var(--hr-brand) 86%, var(--color-foreground));
  --hr-ink-muted: color-mix(in srgb, var(--color-foreground) 72%, transparent);
  --border-azure: var(--hr-accent-border);
  --df-text-display: clamp(2.5rem, 4.8vw, 3.75rem);
  --df-text-2xl: clamp(1.625rem, 2.4vw, 2.125rem);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
[data-v2-package="hotel-resort-premium"] .df-section-glow::before,
[data-v2-package="hotel-resort-premium"] .hr-section-glow::before {
  display: none;
}
[data-v2-package="hotel-resort-premium"] .df-section-alt {
  background: var(--color-surface);
}
[data-v2-package="hotel-resort-premium"] .df-card,
[data-v2-package="hotel-resort-premium"] .df-card-featured {
  border: none;
  background: transparent;
  box-shadow: none;
  transform: none;
}
[data-v2-package="hotel-resort-premium"] .df-card:hover,
[data-v2-package="hotel-resort-premium"] .df-card-featured:hover {
  border: none;
  background: transparent;
  box-shadow: none;
  transform: none;
}
[data-v2-package="hotel-resort-premium"] ::selection {
  background: color-mix(in srgb, var(--hr-accent) 22%, transparent);
  color: var(--color-foreground);
}
[data-v2-package="hotel-resort-premium"] [id] {
  scroll-margin-top: 5.5rem;
}
[data-v2-package="hotel-resort-premium"] .hr-hero {
  background:
    radial-gradient(ellipse 72% 58% at 92% 8%, color-mix(in srgb, var(--hr-accent) 14%, transparent), transparent 55%),
    radial-gradient(ellipse 55% 48% at 6% 88%, color-mix(in srgb, var(--color-secondary) 16%, transparent), transparent 52%),
    var(--color-background);
}
[data-v2-package="hotel-resort-premium"] .hr-section-alt {
  background: linear-gradient(
    168deg,
    color-mix(in srgb, var(--color-surface) 90%, var(--color-background)),
    var(--color-surface) 50%,
    color-mix(in srgb, var(--color-secondary) 8%, var(--color-background))
  );
}
[data-v2-package="hotel-resort-premium"] .hr-hero-frame::before {
  border-color: color-mix(in srgb, var(--hr-accent) 38%, transparent);
  transform: rotate(-1.25deg);
}
[data-v2-package="hotel-resort-premium"] .hr-cta-strip {
  background: linear-gradient(128deg, var(--hr-brand) 0%, color-mix(in srgb, var(--color-secondary) 72%, var(--hr-brand)) 100%);
}
[data-v2-package="hotel-resort-premium"] .hr-footer-dark {
  background: linear-gradient(180deg, var(--hr-brand) 0%, color-mix(in srgb, var(--hr-brand) 82%, #000) 100%);
  border-top-color: color-mix(in srgb, var(--hr-accent) 42%, transparent);
}

@keyframes hr-reveal-hero {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hr-reveal-section {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hr-rule-grow {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes hr-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes hr-cta-enter {
  from { opacity: 0; transform: translateY(14px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes hr-shimmer {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}
@keyframes hr-card-glow {
  0%, 100% { box-shadow: var(--shadow-card); }
  50% { box-shadow: 0 20px 50px color-mix(in srgb, var(--hr-accent) 12%, transparent), var(--shadow-card); }
}
@keyframes hr-band-shine {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hr-slide-left {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes hr-slide-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes hr-scale-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes hr-cta-pulse {
  0%, 100% { box-shadow: 0 12px 40px color-mix(in srgb, var(--hr-brand) 20%, transparent); }
  50% { box-shadow: 0 16px 48px color-mix(in srgb, var(--hr-brand) 32%, transparent); }
}
@keyframes hr-metric-pop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .hr-motion, [data-hr-motion] { animation: none !important; transition: none !important; }
  .hr-reveal, .hr-reveal-stagger > * { opacity: 1 !important; transform: none !important; }
  .hr-hero-frame { animation: none !important; }
  .hr-azure-rule { animation: none !important; }
  .hr-floating-cta { animation: none !important; }
  .hr-btn-primary::after { display: none; }
  .hr-card-featured { animation: none !important; }
  .hr-cta-strip { animation: none !important; }
  .hr-hero-stagger .hr-hero-item { opacity: 1 !important; animation: none !important; }
  .hr-split-left, .hr-split-right, .hr-form-enter, .hr-about-panel { opacity: 1 !important; transform: none !important; animation: none !important; }
  .hr-floating-cta a { animation: none !important; }
  .hr-reveal.hr-is-visible .hr-highlight-pill { animation: none !important; }
  .hr-reveal.hr-is-visible.hr-section-band .hr-metric { animation: none !important; }
}

.hr-font-display { font-family: var(--font-display), "Playfair Display", Georgia, serif; }
.hr-font-body { font-family: var(--font-body), "Outfit", system-ui, sans-serif; }

.hr-eyebrow {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--hr-brand-soft, var(--color-secondary));
}
.hr-headline,
.hr-display {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: var(--df-text-display);
  font-weight: 500;
  line-height: 1.06;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.hr-headline-sm {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: var(--df-text-2xl);
  font-weight: 500;
  line-height: 1.14;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.hr-lead {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 1.125rem;
  line-height: 1.6;
  font-weight: 400;
  color: var(--hr-ink-muted);
}
.hr-body {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  color: var(--hr-ink-muted);
}
.hr-body-sm {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1.65;
  font-weight: 400;
  color: color-mix(in srgb, var(--color-foreground) 66%, transparent);
}
.hr-title-lg {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-foreground);
}
.hr-label {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--hr-accent);
}
.hr-caption {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-muted);
}
.hr-index {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--color-muted);
}
.hr-brand {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-foreground);
  text-decoration: none;
}
.hr-nav-link {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--hr-ink-muted);
  text-decoration: none;
  position: relative;
  transition: color 0.25s ease;
}
.hr-nav-link::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: -0.35rem;
  height: 2px;
  border-radius: 999px;
  background: var(--hr-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
[dir="rtl"] .hr-nav-link::after { transform-origin: right; }
.hr-nav-link:hover { color: var(--hr-brand); }
.hr-nav-link:hover::after { transform: scaleX(1); }
.hr-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.25s ease;
}
.hr-link:hover { color: var(--hr-accent); }
.hr-text-accent { color: var(--hr-accent); }
.hr-quote {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 1.375rem;
  font-style: italic;
  line-height: 1.4;
  color: var(--color-foreground);
}
.hr-stat-label {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-sand) 75%, transparent);
}

.hr-azure-rule {
  height: 3px;
  width: 2.5rem;
  border-radius: 999px;
  background: var(--hr-accent);
  transform-origin: left;
  animation: hr-rule-grow 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
}
[dir="rtl"] .hr-azure-rule { transform-origin: right; }
.hr-section-header--rule .hr-azure-rule { margin-top: 1rem; }

.hr-btn-primary,
.hr-btn-secondary,
.hr-btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.75rem 1.625rem;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-decoration: none;
  border-radius: 999px;
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.25s ease, border-color 0.3s ease, color 0.3s ease;
}
.hr-btn-primary {
  position: relative;
  overflow: hidden;
  color: var(--color-sand);
  background: var(--hr-brand);
  border: 1px solid var(--hr-brand);
}
.hr-btn-primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 42%, color-mix(in srgb, var(--color-sand) 28%, transparent) 50%, transparent 58%);
  transform: translateX(-120%);
  transition: transform 0.55s ease;
}
.hr-btn-primary:hover::after {
  transform: translateX(120%);
}
.hr-btn-primary:hover {
  background: var(--hr-brand-dark);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--hr-brand) 16%, transparent);
  transform: translateY(-1px);
}
.hr-btn-secondary,
.hr-btn-ghost {
  color: var(--hr-brand);
  border: 1.5px solid color-mix(in srgb, var(--hr-brand-soft) 30%, transparent);
  background: var(--color-surface-elevated);
}
.hr-btn-secondary:hover,
.hr-btn-ghost:hover {
  border-color: var(--hr-brand);
  color: var(--hr-brand);
  background: color-mix(in srgb, var(--hr-brand) 4%, var(--color-background));
}
.hr-btn-primary:focus-visible,
.hr-btn-secondary:focus-visible,
.hr-btn-ghost:focus-visible {
  outline: 2px solid var(--hr-accent);
  outline-offset: 3px;
}

.hr-container {
  width: 100%;
  max-width: var(--container-max, 76rem);
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 4vw, 2rem);
}
.hr-section { padding-block: clamp(4rem, 9vw, 6.5rem); }
.hr-section-alt { background: var(--color-surface); }
.hr-section-band {
  background: var(--hr-brand);
  color: var(--color-sand);
}
.hr-section-band .hr-metric { color: var(--color-sand); }
.hr-section-band .hr-stat-label,
.hr-section-band .hr-caption {
  color: color-mix(in srgb, var(--color-sand) 72%, transparent);
}
.hr-section-glow { background: var(--color-background); position: relative; overflow: hidden; }
.hr-section-glow::before { display: none; }
.hr-section-sand {
  background: var(--color-sand);
  color: var(--hr-brand);
}
.hr-section-header { max-width: 38rem; }
.hr-section-header--center { margin-inline: auto; text-align: center; }

.hr-nav-shell {
  padding: 1rem clamp(1rem, 3vw, 1.5rem) 0;
}
.hr-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3.5rem;
  padding: 0.5rem 0.75rem 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
.hr-nav-desktop {
  display: none;
  align-items: center;
  gap: 2rem;
}
@media (min-width: 1024px) {
  .hr-nav-desktop { display: flex; }
}
.hr-nav-bar--scrolled {
  background: color-mix(in srgb, var(--color-surface-elevated) 92%, transparent);
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-surface);
  backdrop-filter: blur(12px);
}

.hr-hero { background: var(--color-background); }
.hr-hero-grid {
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
  min-height: min(92svh, 52rem);
  padding-block: clamp(6rem, 14vw, 8rem) clamp(3rem, 8vw, 5rem);
}
@media (min-width: 1024px) {
  .hr-hero-grid { grid-template-columns: 1fr 0.92fr; }
}
.hr-hero-grid--solo {
  max-width: 42rem;
}
@media (min-width: 1024px) {
  .hr-hero-grid--solo {
    grid-template-columns: 1fr;
    max-width: 44rem;
  }
}
.hr-hero-media {
  position: relative;
  border-radius: var(--radius-lg, 20px);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-subtle);
  aspect-ratio: 4 / 5;
}
.hr-hero-media:not(:has(img)) {
  display: none;
}
.hr-hero-media img { width: 100%; height: 100%; object-fit: cover; }
.hr-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  background: var(--color-surface-elevated);
  border: 1px solid color-mix(in srgb, var(--hr-brand-soft) 22%, transparent);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--hr-ink-muted);
}

.hr-card,
.hr-panel,
.hr-feature-card,
.hr-case-card {
  border: 1px solid var(--border-subtle);
  background: var(--color-surface-elevated, #fff);
  border-radius: var(--radius-md, 12px);
  box-shadow: var(--shadow-surface);
}
.hr-card,
.hr-feature-card,
.hr-case-card {
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.hr-card:hover,
.hr-feature-card:hover,
.hr-case-card:hover {
  border-color: color-mix(in srgb, var(--hr-accent) 30%, transparent);
  box-shadow: var(--shadow-card);
  transform: translateY(-3px);
}
.hr-feature-card { padding: 1.75rem; }
.hr-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--hr-brand) 8%, var(--color-background));
  color: var(--hr-brand);
  font-family: var(--font-display), "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease;
}
.hr-feature-card:hover .hr-feature-icon {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--hr-brand) 12%, var(--color-background));
}
.hr-case-card { padding: 1.5rem; position: relative; overflow: hidden; }
.hr-case-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 1.5rem;
  right: 1.5rem;
  height: 2px;
  border-radius: 999px;
  background: var(--hr-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
[dir="rtl"] .hr-case-card::after { transform-origin: right; }
.hr-case-card:hover::after { transform: scaleX(1); }
.hr-form-panel {
  border: 1px solid var(--border-subtle);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md, 12px);
  padding: clamp(1.5rem, 4vw, 2rem);
  box-shadow: var(--shadow-surface);
}
.hr-panel { overflow: hidden; }

.hr-metric {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 500;
  line-height: 1;
  color: var(--hr-accent);
}

.hr-reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
.hr-reveal.hr-is-visible,
.hr-reveal-js.hr-is-visible { opacity: 1; transform: translateY(0); }
.hr-reveal-stagger > * { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
.hr-reveal-stagger.hr-is-visible > *,
.hr-reveal.hr-is-visible .hr-reveal-stagger > * { opacity: 1; transform: translateY(0); }
.hr-reveal-stagger > *:nth-child(1) { transition-delay: 0.05s; }
.hr-reveal-stagger > *:nth-child(2) { transition-delay: 0.1s; }
.hr-reveal-stagger > *:nth-child(3) { transition-delay: 0.15s; }
.hr-reveal-stagger > *:nth-child(4) { transition-delay: 0.2s; }

.hr-reveal-stagger > *:nth-child(5) { transition-delay: 0.25s; }
.hr-reveal-stagger > *:nth-child(6) { transition-delay: 0.3s; }
.hr-reveal-stagger > *:nth-child(7) { transition-delay: 0.35s; }
.hr-reveal-stagger > *:nth-child(8) { transition-delay: 0.4s; }
.hr-reveal-stagger > *:nth-child(9) { transition-delay: 0.45s; }

.hr-hero-stagger .hr-hero-item {
  opacity: 0;
  animation: hr-reveal-hero 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hr-hero-stagger .hr-hero-item:nth-child(1) { animation-delay: 0.05s; }
.hr-hero-stagger .hr-hero-item:nth-child(2) { animation-delay: 0.12s; }
.hr-hero-stagger .hr-hero-item:nth-child(3) { animation-delay: 0.2s; }
.hr-hero-stagger .hr-hero-item:nth-child(4) { animation-delay: 0.28s; }
.hr-hero-stagger .hr-hero-item:nth-child(5) { animation-delay: 0.36s; }
.hr-hero-stagger .hr-hero-item:nth-child(6) { animation-delay: 0.44s; }

.hr-split-left,
.hr-split-right,
.hr-form-enter,
.hr-about-panel {
  opacity: 0;
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}
.hr-split-left { transform: translateX(-20px); }
.hr-split-right { transform: translateX(20px); }
.hr-form-enter { transform: translateX(16px); }
.hr-about-panel { transform: scale(0.98); }
.hr-about-panel.hr-split-left { transform: translateX(-20px) scale(0.98); }
.hr-reveal.hr-is-visible .hr-split-left,
.hr-reveal.hr-is-visible .hr-split-right,
.hr-reveal.hr-is-visible .hr-form-enter,
.hr-reveal.hr-is-visible .hr-about-panel {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.hr-reveal.hr-is-visible .hr-split-left { transition-delay: 0.08s; }
.hr-reveal.hr-is-visible .hr-split-right { transition-delay: 0.16s; }
.hr-reveal.hr-is-visible .hr-form-enter { transition-delay: 0.2s; }

.hr-floating-cta a {
  animation: hr-cta-pulse 3.5s ease-in-out 1.2s infinite;
}

.hr-reveal.hr-is-visible.hr-section-band .hr-metric {
  animation: hr-metric-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hr-reveal.hr-is-visible.hr-section-band .hr-reveal-stagger > *:nth-child(1) .hr-metric { animation-delay: 0.1s; }
.hr-reveal.hr-is-visible.hr-section-band .hr-reveal-stagger > *:nth-child(2) .hr-metric { animation-delay: 0.2s; }
.hr-reveal.hr-is-visible.hr-section-band .hr-reveal-stagger > *:nth-child(3) .hr-metric { animation-delay: 0.3s; }
.hr-reveal.hr-is-visible.hr-section-band .hr-reveal-stagger > *:nth-child(4) .hr-metric { animation-delay: 0.4s; }

.hr-faq-item { border-bottom: 1px solid var(--border-subtle); }
.hr-faq-answer {
  overflow: hidden;
  animation: hr-reveal-section 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hr-faq-question {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--color-foreground);
  background: transparent;
  border: none;
  cursor: pointer;
}
.hr-faq-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1.5px solid var(--border-default);
  font-size: 1.125rem;
  line-height: 1;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}
.hr-faq-item[data-open="true"] .hr-faq-toggle {
  background: var(--hr-brand);
  border-color: var(--hr-brand);
  color: var(--color-sand);
  transform: rotate(180deg);
}

.hr-footer-dark {
  background: var(--hr-brand);
  border-top: 3px solid var(--hr-accent-muted);
  color: var(--color-sand);
}
.hr-footer-dark .hr-brand,
.hr-footer-dark .hr-body-sm { color: var(--color-sand); }
.hr-footer-dark .hr-caption { color: color-mix(in srgb, var(--color-sand) 70%, transparent); }
.hr-footer-dark .hr-link:hover { color: var(--color-sand); }

.hr-cta-strip {
  background: var(--hr-brand);
  color: var(--color-sand);
  border-radius: var(--radius-lg, 20px);
  padding: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
  animation: hr-band-shine 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hr-cta-strip .hr-eyebrow { color: color-mix(in srgb, var(--color-sand) 80%, transparent); }
.hr-cta-strip .hr-headline-sm { color: var(--color-sand); }
.hr-cta-strip .hr-body-sm { color: color-mix(in srgb, var(--color-sand) 78%, transparent); }
.hr-cta-strip .hr-btn-primary {
  background: var(--color-sand);
  border-color: var(--color-sand);
  color: var(--hr-brand);
}
.hr-cta-strip .hr-btn-primary:hover {
  background: var(--color-surface-elevated);
  color: var(--hr-brand);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--hr-brand) 20%, transparent);
}
.hr-cta-strip .hr-btn-secondary {
  background: transparent;
  border-color: color-mix(in srgb, var(--color-sand) 40%, transparent);
  color: var(--color-sand);
}
.hr-cta-strip .hr-btn-secondary:hover {
  background: color-mix(in srgb, var(--color-sand) 10%, transparent);
  border-color: var(--color-sand);
  color: var(--color-sand);
}

.hr-pricing-badge {
  background: var(--hr-brand);
  color: var(--color-sand);
}
.hr-check { color: var(--hr-accent); }

.hr-highlight-pill {
  display: inline-block;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-md, 12px);
  background: var(--color-surface-elevated);
  border: 1px solid color-mix(in srgb, var(--hr-brand-soft) 20%, transparent);
  font-size: 0.875rem;
  color: var(--hr-ink-muted);
  transition: border-color 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}
.hr-reveal.hr-is-visible .hr-highlight-pill {
  animation: hr-scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hr-reveal.hr-is-visible .hr-highlight-pill:nth-child(1) { animation-delay: 0.05s; }
.hr-reveal.hr-is-visible .hr-highlight-pill:nth-child(2) { animation-delay: 0.12s; }
.hr-reveal.hr-is-visible .hr-highlight-pill:nth-child(3) { animation-delay: 0.19s; }
.hr-highlight-pill:hover {
  border-color: color-mix(in srgb, var(--hr-brand) 28%, transparent);
  transform: translateY(-1px);
}

.hr-card-featured {
  border-color: color-mix(in srgb, var(--hr-accent) 34%, transparent);
  box-shadow: var(--shadow-card);
  background: var(--color-surface-elevated);
  animation: hr-card-glow 4s ease-in-out infinite;
}
.hr-quote-mark {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--hr-accent-muted);
  pointer-events: none;
  user-select: none;
}
.hr-testimonial-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.75rem;
  min-height: 100%;
  transition: border-color 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}
.hr-testimonial-card:hover {
  border-color: color-mix(in srgb, var(--hr-accent) 28%, transparent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}
.hr-testimonial-card blockquote {
  flex: 1;
  margin: 0;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.75;
  color: color-mix(in srgb, var(--color-foreground) 78%, transparent);
}
.hr-testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-subtle);
}
.hr-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--hr-brand) 8%, var(--color-background));
  color: var(--hr-brand);
  font-family: var(--font-body), "Outfit", sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 0 0 2px var(--color-surface-elevated);
}

.hr-hero-frame {
  position: relative;
  animation: hr-float 7s ease-in-out infinite;
}
.hr-hero-frame::before {
  content: "";
  position: absolute;
  inset: -14px -14px 14px 14px;
  border-radius: calc(var(--radius-lg, 20px) + 4px);
  border: 1px solid color-mix(in srgb, var(--hr-brand-soft) 24%, transparent);
  pointer-events: none;
  z-index: 0;
}
.hr-hero-glance {
  position: absolute;
  bottom: 1.25rem;
  inset-inline: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md, 12px);
  background: color-mix(in srgb, var(--color-surface-elevated) 96%, transparent);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-surface);
  backdrop-filter: blur(10px);
  z-index: 2;
  animation: hr-reveal-section 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both;
}
.hr-hero-glance dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
}
.hr-hero-glance dt {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.hr-hero-glance dd {
  font-family: var(--font-display), "Playfair Display", serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-foreground);
}

.hr-hero-glance-strip {
  margin-top: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-md, 12px);
  background: var(--color-surface-elevated);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-surface);
}
.hr-hero-glance-strip dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
}

.hr-about-pull {
  padding-inline-start: 1.25rem;
  border-inline-start: 3px solid var(--hr-accent);
  margin-inline: 0;
}
.hr-about-pull .hr-quote {
  font-size: 1.25rem;
  margin: 0;
}

.hr-hero-media {
  z-index: 1;
}
.hr-hero-media img {
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.hr-hero-media:hover img {
  transform: scale(1.04);
}

.hr-feature-card {
  position: relative;
  overflow: hidden;
}
.hr-feature-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 1.5rem;
  right: 1.5rem;
  height: 2px;
  border-radius: 999px;
  background: var(--hr-accent);
  opacity: 0;
  transition: opacity 0.35s ease;
}
.hr-feature-card:hover::after { opacity: 1; }

.hr-floating-cta {
  animation: hr-cta-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  box-shadow: 0 12px 40px color-mix(in srgb, var(--hr-brand) 24%, transparent);
  backdrop-filter: blur(8px);
}

.hr-nav-bar--scrolled {
  box-shadow: var(--shadow-card);
}

.hr-focus-ring:focus-visible { outline: 2px solid var(--hr-accent); outline-offset: 2px; }
.hr-input, .hr-textarea {
  width: 100%;
  border: 1.5px solid var(--border-subtle);
  background: var(--color-background);
  border-radius: var(--radius-sm, 6px);
  padding: 0.875rem 1rem;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.9375rem;
  color: var(--color-foreground);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.hr-input::placeholder, .hr-textarea::placeholder {
  color: color-mix(in srgb, var(--color-muted) 85%, transparent);
}
.hr-input:hover, .hr-textarea:hover {
  border-color: color-mix(in srgb, var(--hr-brand-soft) 28%, var(--border-subtle));
}
.hr-input:focus-visible, .hr-textarea:focus-visible {
  outline: none;
  border-color: var(--hr-brand);
  background: var(--color-surface-elevated);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--hr-brand) 10%, transparent);
}

@supports (animation-timeline: view()) {
  .hr-reveal:not(.hr-reveal-js) {
    opacity: 0;
    transform: translateY(20px);
    animation: hr-reveal-section linear both;
    animation-timeline: view();
    animation-range: entry 5% cover 30%;
  }
  .hr-reveal-stagger:not(.hr-reveal-js) > * {
    opacity: 0;
    transform: translateY(14px);
    animation: hr-reveal-section linear both;
    animation-timeline: view();
    animation-range: entry 8% cover 32%;
  }
  .hr-reveal-stagger:not(.hr-reveal-js) > *:nth-child(2) { animation-range: entry 10% cover 34%; }
  .hr-reveal-stagger:not(.hr-reveal-js) > *:nth-child(3) { animation-range: entry 12% cover 36%; }
  .hr-reveal-stagger:not(.hr-reveal-js) > *:nth-child(4) { animation-range: entry 14% cover 38%; }
  .hr-split-left:not(.hr-reveal-js) {
    animation: hr-slide-left linear both;
    animation-timeline: view();
    animation-range: entry 8% cover 34%;
  }
  .hr-split-right:not(.hr-reveal-js) {
    animation: hr-slide-right linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 36%;
  }
  .hr-form-enter:not(.hr-reveal-js) {
    animation: hr-slide-right linear both;
    animation-timeline: view();
    animation-range: entry 12% cover 38%;
  }
  .hr-about-panel:not(.hr-reveal-js) {
    animation: hr-scale-in linear both;
    animation-timeline: view();
    animation-range: entry 6% cover 32%;
  }
  .hr-section-band:not(.hr-reveal-js) .hr-metric {
    animation: hr-metric-pop linear both;
    animation-timeline: view();
    animation-range: entry 12% cover 38%;
  }
}

@media (max-width: 767px) {
  [data-v2-package="hotel-resort-premium"] .hr-headline,
  [data-v2-package="hotel-resort-premium"] .hr-display {
    font-size: clamp(2rem, 7vw, 2.5rem);
  }
  [data-v2-package="hotel-resort-premium"] .hr-headline-sm {
    font-size: clamp(1.375rem, 5vw, 1.625rem);
  }
}
`;
}

/** Monolith Estate design system — real-estate-prestige V2 global layer */
function buildRealEstatePrestigeGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Noto+Sans+Arabic:wght@400;500;600&family=Outfit:wght@300;400;500;600&family=Tajawal:wght@500;600;700&display=swap");

@keyframes rep-parallax-lift {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rep-stone-rise {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rep-brass-draw {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes rep-ken-burns {
  from { transform: scale(1.03); }
  to { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .rep-animate, [data-rep-motion] { animation: none !important; transition: none !important; }
}

.rep-font-display { font-family: var(--font-display), "Fraunces", Georgia, serif; }
.rep-font-body { font-family: var(--font-body), "Outfit", system-ui, sans-serif; }
.rep-eyebrow {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-brass, #B8956B);
}
.rep-headline {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(2.5rem, 5.5vw, 4.5rem);
  font-weight: 400;
  line-height: 1.06;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}
.rep-headline-sm {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(1.75rem, 3.2vw, 2.75rem);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
}
.rep-body {
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.72;
  color: var(--color-muted, rgba(28,25,23,0.58));
}
.rep-brass-rule {
  height: 1px;
  width: 3.5rem;
  background: linear-gradient(90deg, var(--color-brass, #B8956B), transparent);
  transform-origin: left;
}
[dir="rtl"] .rep-brass-rule { transform-origin: right; }
.rep-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 2rem;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-linen, #FAF8F5);
  background: var(--color-primary, #1C1917);
  border: 1px solid var(--border-brass, rgba(184,149,107,0.32));
  transition: background 0.4s ease, box-shadow 0.4s ease;
}
.rep-btn-primary:hover {
  background: var(--color-secondary, #3D3A36);
  box-shadow: var(--shadow-glow);
}
.rep-btn-primary:focus-visible { outline: 2px solid var(--color-brass); outline-offset: 3px; }
.rep-btn-ghost {
  display: inline-flex;
  align-items: center;
  min-height: 2.875rem;
  padding: 0.875rem 1.75rem;
  font-family: var(--font-body), "Outfit", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-foreground);
  border: 1px solid var(--border-default, rgba(28,25,23,0.1));
  background: transparent;
  transition: border-color 0.35s ease, color 0.35s ease;
}
.rep-btn-ghost:hover { border-color: var(--color-brass); color: var(--color-brass); }
.rep-btn-ghost:focus-visible { outline: 2px solid var(--color-brass); outline-offset: 3px; }
.rep-section { padding-block: clamp(5rem, 11vw, 7.5rem); }
.rep-card {
  border: 1px solid var(--border-subtle);
  background: var(--color-surface);
  transition: box-shadow 0.5s ease, transform 0.5s ease;
}
.rep-card:hover { box-shadow: var(--shadow-surface); transform: translateY(-2px); }
.rep-focus-ring:focus-visible { outline: 2px solid var(--color-brass); outline-offset: 2px; }
`;
}

/** Prestige Estates design system — real-estate-premium V2 global layer */
function buildRealEstatePremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Noto+Sans+Arabic:wght@400;500;600&family=Tajawal:wght@500;600;700&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap");

@keyframes rep-parallax-lift {
  from { opacity: 0; transform: translateY(48px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rep-stone-rise {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rep-brass-draw {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes rep-ken-burns {
  from { transform: scale(1.05); }
  to { transform: scale(1); }
}
@keyframes rep-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .rep-animate, [data-rep-motion] { animation: none !important; transition: none !important; }
}

.rep-grain {
  position: relative;
}
.rep-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.rep-font-display { font-family: var(--font-display), "Cormorant", Georgia, serif; }
.rep-font-body { font-family: var(--font-body), "Work Sans", system-ui, sans-serif; }
.rep-eyebrow {
  font-family: var(--font-body), "Work Sans", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--color-brass, #A67C52);
}
.rep-headline {
  font-family: var(--font-display), "Cormorant", Georgia, serif;
  font-size: clamp(2.75rem, 6vw, 5rem);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--color-foreground);
}
.rep-headline-sm {
  font-family: var(--font-display), "Cormorant", Georgia, serif;
  font-size: clamp(1.875rem, 3.5vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
}
.rep-headline-lg {
  font-family: var(--font-display), "Cormorant", Georgia, serif;
  font-size: clamp(3.25rem, 7vw, 5.5rem);
  font-weight: 400;
  line-height: 0.98;
  letter-spacing: -0.03em;
  color: var(--color-foreground);
}
.rep-body {
  font-family: var(--font-body), "Work Sans", system-ui, sans-serif;
  font-size: 1.0625rem;
  font-weight: 300;
  line-height: 1.75;
  color: var(--color-muted, rgba(28,28,30,0.58));
}
.rep-body-sm {
  font-family: var(--font-body), "Work Sans", system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.65;
  color: var(--color-muted, rgba(28,28,30,0.58));
}
.rep-brass-rule {
  height: 1px;
  width: 4rem;
  background: linear-gradient(90deg, var(--color-brass, #A67C52), transparent);
  transform-origin: left;
}
.rep-brass-rule-lg {
  height: 2px;
  width: 5rem;
  background: linear-gradient(90deg, var(--color-brass, #A67C52) 60%, transparent);
  transform-origin: left;
}
[dir="rtl"] .rep-brass-rule,
[dir="rtl"] .rep-brass-rule-lg { transform-origin: right; }
.rep-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.9375rem 2.25rem;
  font-family: var(--font-body), "Work Sans", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-linen, #FAF7F3);
  background: var(--color-primary, #1C1C1E);
  border: 1px solid var(--border-brass, rgba(166,124,82,0.35));
  transition: background 0.45s ease, box-shadow 0.45s ease, transform 0.3s ease;
}
.rep-btn-primary:hover {
  background: var(--color-secondary, #3A3A3C);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.rep-btn-primary:focus-visible { outline: 2px solid var(--color-brass); outline-offset: 3px; }
.rep-btn-ghost {
  display: inline-flex;
  align-items: center;
  min-height: 3rem;
  padding: 0.9375rem 2rem;
  font-family: var(--font-body), "Work Sans", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-foreground);
  border: 1px solid var(--border-default, rgba(28,28,30,0.1));
  background: transparent;
  transition: border-color 0.35s ease, color 0.35s ease, background 0.35s ease;
}
.rep-btn-ghost:hover {
  border-color: var(--color-brass);
  color: var(--color-brass);
  background: rgba(166,124,82,0.04);
}
.rep-btn-ghost:focus-visible { outline: 2px solid var(--color-brass); outline-offset: 3px; }
.rep-section { padding-block: clamp(5.5rem, 12vw, 8rem); }
.rep-section-tight { padding-block: clamp(4rem, 9vw, 6rem); }
.rep-card {
  border: 1px solid var(--border-subtle);
  background: var(--color-surface);
  transition: box-shadow 0.55s ease, transform 0.55s ease;
}
.rep-card:hover { box-shadow: var(--shadow-surface); transform: translateY(-3px); }
.rep-card-dark {
  border: 1px solid rgba(166,124,82,0.2);
  background: var(--color-primary);
  color: var(--color-linen);
}
.rep-editorial-index {
  font-family: var(--font-display), "Cormorant", Georgia, serif;
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 400;
  line-height: 1;
  color: var(--color-brass);
  opacity: 0.35;
}
.rep-focus-ring:focus-visible { outline: 2px solid var(--color-brass); outline-offset: 2px; }
`;
}

/** Serenity Clinical design system — medical-premium V2 global layer */
function buildMedicalPremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Arabic:wght@400;500;600&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap");

@keyframes mp-clinical-fade {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes mp-gentle-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes mp-scale-in {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes mp-draw-sage {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes mp-pulse-calm {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
}
@keyframes mp-ken-burns {
  from { transform: scale(1.04); }
  to { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .mp-animate, [data-mp-motion] { animation: none !important; transition: none !important; }
}

.mp-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
}
.mp-font-display { font-family: var(--font-display), "Libre Baskerville", Georgia, serif; }
.mp-font-body { font-family: var(--font-body), "Source Sans 3", system-ui, sans-serif; }
.mp-eyebrow {
  font-family: var(--font-body), "Source Sans 3", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-healing, #6B9B8A);
}
.mp-sage-rule {
  display: block;
  width: 3.5rem;
  height: 2px;
  background: linear-gradient(90deg, var(--color-healing), var(--color-accent, #C4A882));
  transform-origin: left center;
}
.mp-headline {
  font-family: var(--font-display), "Libre Baskerville", Georgia, serif;
  font-size: clamp(2.5rem, 5.2vw, 4rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
}
.mp-headline-sm {
  font-family: var(--font-display), "Libre Baskerville", Georgia, serif;
  font-size: clamp(1.75rem, 3.2vw, 2.625rem);
  font-weight: 400;
  line-height: 1.14;
  letter-spacing: -0.01em;
  color: var(--color-foreground);
}
.mp-body {
  font-family: var(--font-body), "Source Sans 3", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.72;
  color: var(--color-muted, rgba(22,40,38,0.58));
}
.mp-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.875rem 1.875rem;
  font-family: var(--font-body), "Source Sans 3", system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  color: var(--color-pearl, #FAFCFA);
  background: var(--color-primary, #1A4D4A);
  border-radius: var(--radius-md, 10px);
  border: 2px solid transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
}
.mp-btn-primary:hover {
  background: var(--color-secondary, #2A6560);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.mp-btn-primary:focus-visible { outline: 3px solid var(--color-healing); outline-offset: 2px; }
.mp-btn-secondary {
  display: inline-flex;
  align-items: center;
  min-height: 3rem;
  padding: 0.875rem 1.875rem;
  font-family: var(--font-body), "Source Sans 3", system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--color-primary);
  background: transparent;
  border: 1.5px solid var(--border-healing, rgba(107,155,138,0.28));
  border-radius: var(--radius-md, 10px);
  transition: border-color 0.35s ease, background 0.35s ease, color 0.35s ease;
}
.mp-btn-secondary:hover {
  border-color: var(--color-primary);
  background: var(--color-surface, #E8EDE6);
}
.mp-btn-secondary:focus-visible { outline: 3px solid var(--color-healing); outline-offset: 2px; }
.mp-section { padding-block: clamp(4.5rem, 11vw, 7rem); }
.mp-card {
  border: 1px solid var(--border-subtle);
  background: var(--color-pearl);
  border-radius: var(--radius-lg, 18px);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.4s ease, transform 0.4s ease, border-color 0.4s ease;
}
.mp-card:hover {
  box-shadow: var(--shadow-surface);
  border-color: var(--border-healing);
  transform: translateY(-2px);
}
.mp-focus-ring:focus-visible { outline: 3px solid var(--color-healing); outline-offset: 2px; }
.mp-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4375rem 1rem;
  font-family: var(--font-body), "Source Sans 3", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
  background: var(--color-pearl);
  border: 1px solid var(--border-healing);
  border-radius: 9999px;
}
.mp-stat-value {
  font-family: var(--font-display), "Libre Baskerville", Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 400;
  line-height: 1;
  color: var(--color-primary);
}
.mp-quote-mark {
  font-family: var(--font-display), "Libre Baskerville", Georgia, serif;
  font-size: 4rem;
  line-height: 0.6;
  color: var(--color-healing);
  opacity: 0.35;
}
`;
}

/** Studio Volt design system — creative-agency-premium V2 global layer */
function buildCreativeAgencyPremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Alexandria:wght@500;600;700&family=Inter:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+Arabic:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap");

@keyframes sv-volt-slam {
  from { opacity: 0; transform: translateY(56px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes sv-slide-rise {
  from { opacity: 0; transform: translateX(-32px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes sv-scroll-pulse {
  0%, 100% { transform: scaleY(1); opacity: 0.5; }
  50% { transform: scaleY(1.5); opacity: 1; }
}
@keyframes sv-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes sv-reveal-wipe {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
@keyframes sv-glow-pulse {
  0%, 100% { box-shadow: 0 0 40px rgba(212,255,0,0.08); }
  50% { box-shadow: 0 0 80px rgba(212,255,0,0.2); }
}

@media (prefers-reduced-motion: reduce) {
  .sv-animate-slam, .sv-animate-rise, .sv-marquee-track, .sv-overlay-active { animation: none !important; transition: none !important; }
}

.sv-font-display { font-family: var(--font-display), "Space Grotesk", ui-sans-serif, system-ui, sans-serif; }
.sv-font-body { font-family: var(--font-body), "Inter", ui-sans-serif, system-ui, sans-serif; }
.sv-font-mono { font-family: var(--font-mono, "Space Mono"), ui-monospace, monospace; }
.sv-eyebrow {
  font-family: var(--font-mono, "Space Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 400;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--color-volt, #D4FF00);
}
.sv-display {
  font-family: var(--font-display), "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2.75rem, 9.5vw, 7.5rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  color: var(--color-ghost, #F4F4F0);
}
.sv-headline {
  font-family: var(--font-display), "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.875rem, 4.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.035em;
  text-transform: uppercase;
  color: var(--color-foreground);
}
.sv-headline-sm {
  font-family: var(--font-display), "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.375rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  color: var(--color-foreground);
}
.sv-body {
  font-family: var(--font-body), "Inter", ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--color-muted, rgba(244,244,240,0.55));
}
.sv-btn-volt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding: 0.875rem 2rem;
  font-family: var(--font-mono, "Space Mono"), ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-primary, #0A0A0B);
  background: var(--color-volt, #D4FF00);
  border: 2px solid var(--color-volt, #D4FF00);
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
}
.sv-btn-volt:hover {
  background: transparent;
  color: var(--color-volt, #D4FF00);
  box-shadow: var(--shadow-volt);
  transform: translateY(-2px);
}
.sv-btn-volt:focus-visible { outline: 3px solid var(--color-volt); outline-offset: 3px; }
.sv-btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  padding: 0.875rem 2rem;
  font-family: var(--font-mono, "Space Mono"), ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-ghost);
  background: transparent;
  border: 1px solid var(--border-default);
  transition: border-color 0.25s ease, color 0.25s ease;
}
.sv-btn-ghost:hover { border-color: var(--color-volt); color: var(--color-volt); }
.sv-link-volt {
  text-decoration: none;
  color: var(--color-muted);
  transition: color 0.2s ease;
}
.sv-link-volt:hover { color: var(--color-volt, #D4FF00); }
.sv-link-volt:focus-visible { outline: 2px solid var(--color-volt); outline-offset: 2px; }
.sv-section { padding-block: clamp(4.5rem, 13vw, 8rem); }
.sv-focus-ring:focus-visible { outline: 2px solid var(--color-volt); outline-offset: 3px; }
.sv-card-lift { transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease; }
.sv-card-lift:hover { transform: translateY(-6px); border-color: var(--border-volt); box-shadow: var(--shadow-volt); }
.sv-case-row:focus-visible { outline: 2px solid var(--color-volt); outline-offset: -2px; }
.sv-animate-slam { animation: sv-volt-slam 0.85s cubic-bezier(0.16, 1, 0.3, 1) both; }
.sv-animate-rise { animation: sv-slide-rise 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
.sv-marquee-track { animation: sv-marquee 32s linear infinite; }
.sv-overlay-active .sv-marquee-track { animation-play-state: running; }
.sv-overlay-active { animation: sv-reveal-wipe 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
.sv-volt-line { background: linear-gradient(90deg, var(--color-volt) 0%, transparent 100%); height: 2px; }
.sv-index-num { font-variant-numeric: tabular-nums; }
`;
}

/** Kinetic Atelier design system — creative-portfolio V2 global layer */
function buildCreativePortfolioGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Alexandria:wght@500;600;700&family=DM+Mono:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+Arabic:wght@400;500;600&family=Syne:wght@500;600;700;800&display=swap");

@keyframes cp-kinetic-slam {
  from { opacity: 0; transform: translateY(48px) skewY(-2deg); }
  to { opacity: 1; transform: translateY(0) skewY(0); }
}
@keyframes cp-asymmetric-rise {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes cp-scroll-pulse {
  0%, 100% { transform: scaleY(1); opacity: 0.6; }
  50% { transform: scaleY(1.4); opacity: 1; }
}
@keyframes cp-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes cp-reveal-wipe {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

@media (prefers-reduced-motion: reduce) {
  .cp-animate-slam, .cp-animate-rise, .cp-marquee-track, .cp-overlay-active { animation: none !important; transition: none !important; }
}

.cp-font-display { font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif; }
.cp-font-body { font-family: var(--font-body), "Instrument Sans", ui-sans-serif, system-ui, sans-serif; }
.cp-font-mono { font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace; }
.cp-eyebrow {
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.6875rem;
  font-weight: 400;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-volt, #E8FF47);
}
.cp-display {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(3rem, 11vw, 7.5rem);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--color-ghost, #F4F4EF);
}
.cp-headline {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-foreground);
}
.cp-headline-sm {
  font-family: var(--font-display), "Syne", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--color-foreground);
}
.cp-body {
  font-family: var(--font-body), "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--color-muted, rgba(244,244,239,0.55));
}
.cp-btn-volt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.875rem 1.75rem;
  font-family: var(--font-mono, "DM Mono"), ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-primary, #09090B);
  background: var(--color-volt, #E8FF47);
  border: 2px solid var(--color-volt, #E8FF47);
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}
.cp-btn-volt:hover {
  background: transparent;
  color: var(--color-volt, #E8FF47);
  box-shadow: var(--shadow-volt);
}
.cp-btn-volt:focus-visible { outline: 3px solid var(--color-volt); outline-offset: 3px; }
.cp-link-volt {
  text-decoration: none;
  color: var(--color-muted);
  transition: color 0.2s ease;
}
.cp-link-volt:hover { color: var(--color-volt, #E8FF47); }
.cp-link-volt:focus-visible { outline: 2px solid var(--color-volt); outline-offset: 2px; }
.cp-section { padding-block: clamp(4rem, 12vw, 7rem); }
.cp-focus-ring:focus-visible { outline: 2px solid var(--color-volt); outline-offset: 3px; }
.cp-card-tilt { transition: transform 0.4s ease, border-color 0.4s ease; }
.cp-card-tilt:hover { transform: translateY(-4px); border-color: var(--border-volt); }
.cp-case-row:focus-visible { outline: 2px solid var(--color-volt); outline-offset: -2px; }
.cp-animate-slam { animation: cp-kinetic-slam 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
.cp-animate-rise { animation: cp-asymmetric-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
.cp-marquee-track { animation: cp-marquee 28s linear infinite; }
.cp-overlay-active .cp-marquee-track { animation-play-state: running; }
.cp-overlay-active { animation: cp-reveal-wipe 1.1s cubic-bezier(0.16, 1, 0.3, 1) both; }
`;
}

/** Atelier Commerce design system — ecommerce-premium V2 global layer */
function buildEcommercePremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&family=Manrope:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap");

@keyframes ec-editorial-reveal {
  from { opacity: 0; transform: translateY(32px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes ec-gentle-rise {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ec-slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ec-gold-draw {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes ec-image-zoom {
  from { transform: scale(1.06); }
  to { transform: scale(1); }
}
@keyframes ec-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .ec-animate, [data-ec-motion] { animation: none !important; transition: none !important; }
}

.ec-font-display { font-family: var(--font-display), "Playfair Display", Georgia, serif; }
.ec-font-body { font-family: var(--font-body), "Manrope", system-ui, sans-serif; }
.ec-font-mono { font-family: var(--font-body), "Manrope", system-ui, sans-serif; }
.ec-eyebrow {
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-champagne, #C9A962);
}
.ec-headline {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: clamp(2.5rem, 5.5vw, 4.25rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.ec-headline-sm {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: clamp(1.625rem, 3vw, 2.5rem);
  font-weight: 400;
  line-height: 1.14;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.ec-body {
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.72;
  color: var(--color-muted, rgba(18,16,14,0.58));
}
.ec-section { padding-block: clamp(4rem, 8vw, 6.5rem); }
.ec-section-alt { background: var(--color-surface); }
.ec-section-glow { position: relative; overflow: hidden; }
.ec-gold-rule {
  height: 1px;
  width: 3rem;
  background: linear-gradient(90deg, var(--color-champagne, #C9A962), transparent);
  transform-origin: left;
}
[dir="rtl"] .ec-gold-rule { transform-origin: right; }
.ec-card {
  border: 1px solid var(--border-subtle, rgba(18,16,14,0.05));
  background: var(--color-surface);
  border-radius: var(--radius-lg, 8px);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease;
}
.ec-card:hover { box-shadow: var(--shadow-surface); border-color: var(--border-accent, rgba(201,169,98,0.32)); }
.ec-card-featured {
  border-color: var(--border-accent, rgba(201,169,98,0.32));
  box-shadow: var(--shadow-surface), var(--shadow-glow);
}
.ec-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 2rem;
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-linen, #FAF8F5);
  background: var(--color-primary, #12100E);
  border: 1px solid var(--border-accent, rgba(201,169,98,0.32));
  border-radius: var(--radius-sm, 2px);
  transition: background 0.35s ease, box-shadow 0.35s ease, transform 0.25s ease;
}
.ec-btn-primary:hover {
  background: var(--color-secondary, #2A2724);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.ec-btn-primary:focus-visible { outline: 2px solid var(--color-champagne); outline-offset: 3px; }
.ec-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 1.75rem;
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-foreground);
  background: transparent;
  border: 1px solid var(--border-default, rgba(18,16,14,0.1));
  border-radius: var(--radius-sm, 2px);
  transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease;
}
.ec-btn-secondary:hover {
  border-color: var(--color-champagne, #C9A962);
  color: var(--color-champagne, #C9A962);
}
.ec-btn-secondary:focus-visible { outline: 2px solid var(--color-champagne); outline-offset: 3px; }
.ec-focus-ring:focus-visible { outline: 2px solid var(--color-champagne); outline-offset: 3px; }
.ec-metric {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 400;
  line-height: 1;
  color: var(--color-foreground);
}
.ec-input, .ec-textarea {
  width: 100%;
  border: 1px solid var(--border-default, rgba(18,16,14,0.1));
  border-radius: var(--radius-sm, 2px);
  background: var(--color-background, #FAF8F5);
  padding: 0.75rem 1rem;
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 0.9375rem;
  color: var(--color-foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ec-input:focus, .ec-textarea:focus {
  outline: none;
  border-color: var(--color-champagne, #C9A962);
  box-shadow: 0 0 0 3px rgba(201,169,98,0.12);
}
.ec-quote-mark {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--color-champagne, #C9A962);
  opacity: 0.35;
}
.ec-star { color: var(--color-champagne, #C9A962); letter-spacing: 0.1em; }
.ec-glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  pointer-events: none;
}
.ec-grain {
  position: relative;
}
.ec-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.ec-editorial-frame {
  overflow: hidden;
  border-radius: var(--radius-lg, 8px);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-card);
}
.ec-editorial-accent {
  border-radius: var(--radius-lg, 8px);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
}
.ec-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 2px;
  background: var(--color-surface);
  padding: 0.3rem 0.625rem;
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-champagne, #C9A962);
  border: 1px solid var(--border-accent, rgba(201,169,98,0.32));
}
.ec-link-arrow {
  color: var(--color-champagne, #C9A962);
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.06em;
  transition: color 0.2s ease;
}
.ec-link-arrow:hover { color: var(--color-primary, #12100E); }
.ec-product-card { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.ec-product-card:hover { transform: translateY(-3px); }
.ec-product-media { background: var(--color-linen, #F3EFE8); }
.ec-trust-strip { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ec-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 2px;
  padding: 0.375rem 0.75rem;
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ec-signal { color: var(--color-champagne, #C9A962); }
.ec-grid-bg {
  background-image:
    linear-gradient(var(--color-grid, rgba(18,16,14,0.05)) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid, rgba(18,16,14,0.05)) 1px, transparent 1px);
  background-size: 56px 56px;
}
.ec-marquee-track { animation: ec-marquee 32s linear infinite; }
.ec-animate-reveal { animation: ec-editorial-reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both; }
.ec-animate-rise { animation: ec-gentle-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* Aliases for shared flagship section components */
.se-section-glow, .ec-section-glow { position: relative; overflow: hidden; }
.se-glow-orb, .ec-glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  pointer-events: none;
}
.se-card-featured, .ec-card-featured {
  border-color: var(--border-accent, rgba(201,169,98,0.32));
  box-shadow: var(--shadow-surface), var(--shadow-glow);
}
.se-quote-mark, .ec-quote-mark {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 3.5rem;
  line-height: 1;
  color: var(--color-champagne, #C9A962);
  opacity: 0.35;
}
.se-star, .ec-star { color: var(--color-champagne, #C9A962); letter-spacing: 0.1em; }
.se-input, .ec-input, .se-textarea, .ec-textarea {
  width: 100%;
  border: 1px solid var(--border-default, rgba(18,16,14,0.1));
  border-radius: var(--radius-sm, 2px);
  background: var(--color-background, #FAF8F5);
  padding: 0.75rem 1rem;
  font-family: var(--font-body), "Manrope", system-ui, sans-serif;
  font-size: 0.9375rem;
  color: var(--color-foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.se-input:focus, .ec-input:focus, .se-textarea:focus, .ec-textarea:focus {
  outline: none;
  border-color: var(--color-champagne, #C9A962);
  box-shadow: 0 0 0 3px rgba(201,169,98,0.12);
}
`;
}

/** Scholar's Hall design system — education-premium V2 global layer */
function buildEducationPremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital@0;1&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Sans+Arabic:wght@400;500;600&family=Nunito+Sans:ital,opsz,wght@0,6..12,300;0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;1,6..12,400&display=swap");

@keyframes ed-slide-up {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ed-grid-reveal {
  from { opacity: 0; transform: translateY(18px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ed-fade-rise {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ed-line-draw {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes ed-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes ed-scholarly-rise {
  from { opacity: 0; transform: translateY(36px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes ed-ken-burns {
  from { transform: scale(1.05); }
  to { transform: scale(1); }
}
[dir="rtl"] .ed-marquee-track { animation-direction: reverse; }

@media (prefers-reduced-motion: reduce) {
  .ed-animate, [data-ed-motion] { animation: none !important; transition: none !important; }
}

.ed-font-display { font-family: var(--font-display), "EB Garamond", Georgia, serif; }
.ed-font-body { font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif; }
.ed-font-mono { font-family: "DM Mono", ui-monospace, monospace; }
.ed-eyebrow {
  font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-signal, #C5A572);
}
.ed-headline {
  font-family: var(--font-display), "EB Garamond", Georgia, serif;
  font-size: clamp(2.75rem, 5.8vw, 4.5rem);
  font-weight: 500;
  line-height: 1.06;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.ed-headline-sm {
  font-family: var(--font-display), "EB Garamond", Georgia, serif;
  font-size: clamp(1.875rem, 3.4vw, 2.875rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.ed-body {
  font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.74;
  color: var(--color-muted);
  font-weight: 400;
}
.ed-section { padding-block: clamp(5rem, 11vw, 7.5rem); }
.ed-section-alt {
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%);
}
.ed-section-glow { position: relative; isolation: isolate; }
.ed-section-glow::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 75% 45% at 50% -8%, color-mix(in srgb, var(--color-signal) 10%, transparent), transparent 68%);
}
.ed-section-ink {
  background: var(--color-ink, #0F1829);
  color: #fff;
}
.ed-grid-bg {
  background-image:
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
  background-size: 52px 52px;
}
.ed-paper-grain {
  position: relative;
}
.ed-paper-grain::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.ed-accent-line {
  height: 2px;
  width: 3.75rem;
  background: linear-gradient(90deg, var(--color-signal, #C5A572), transparent);
  transform-origin: left;
}
.ed-gold-rule {
  height: 1px;
  width: 4.5rem;
  background: linear-gradient(90deg, var(--color-signal, #C5A572) 70%, transparent);
  transform-origin: left;
}
[dir="rtl"] .ed-accent-line,
[dir="rtl"] .ed-gold-rule { transform-origin: right; }
.ed-card {
  border: 1px solid var(--border-subtle);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease;
}
.ed-card:hover {
  box-shadow: var(--shadow-surface);
  border-color: var(--border-accent);
  transform: translateY(-3px);
}
.ed-card-featured {
  border-color: var(--border-accent);
  background: linear-gradient(165deg, color-mix(in srgb, var(--color-signal) 5%, var(--color-surface)), var(--color-surface));
  box-shadow: var(--shadow-surface);
}
.ed-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 1.875rem;
  font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-cream, #F7F3EC);
  background: var(--color-primary, #1B2A4A);
  border: 1px solid color-mix(in srgb, var(--color-primary) 85%, #000);
  border-radius: var(--radius-sm);
  transition: background 0.35s ease, box-shadow 0.35s ease, transform 0.25s ease;
}
.ed-btn-primary:hover {
  background: var(--color-secondary, #2A3F66);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.ed-btn-primary:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }
.ed-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 1.875rem;
  font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-primary);
  background: transparent;
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-sm);
  transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease;
}
.ed-btn-secondary:hover {
  border-color: var(--color-signal);
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-signal) 8%, transparent);
}
.ed-btn-secondary:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }
.ed-metric {
  font-family: var(--font-display), "EB Garamond", Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.375rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  line-height: 1;
}
.ed-signal { color: var(--color-signal, #C5A572); }
.ed-focus-ring:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }
.ed-trust-logo {
  font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-foreground) 38%, transparent);
}
.ed-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  padding: 0.3rem 0.75rem;
  font-family: var(--font-body), "Nunito Sans", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.ed-trust-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
}
.ed-crest {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-signal);
  font-family: var(--font-display), "EB Garamond", Georgia, serif;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid color-mix(in srgb, var(--color-signal) 30%, transparent);
}
`;
}

/** Apex Ledger design system — finance-premium V2 global layer */
function buildFinancePremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Lato:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Noto+Sans+Arabic:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap");

@keyframes fn-slide-up {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fn-grid-reveal {
  from { opacity: 0; transform: translateY(14px) scale(0.988); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fn-fade-rise {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fn-line-draw {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes fn-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes fn-gold-shimmer {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
[dir="rtl"] .fn-marquee-track { animation-direction: reverse; }

@media (prefers-reduced-motion: reduce) {
  .fn-animate, [data-fn-motion] { animation: none !important; transition: none !important; }
}

.fn-font-display { font-family: var(--font-display), "Playfair Display", Georgia, serif; }
.fn-font-body { font-family: var(--font-body), "Lato", system-ui, sans-serif; }
.fn-font-mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }
.fn-eyebrow {
  font-family: var(--font-body), "Lato", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-signal, #C9A227);
}
.fn-headline {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: clamp(2.5rem, 5.2vw, 3.75rem);
  font-weight: 500;
  line-height: 1.06;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.fn-headline-sm {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: clamp(1.875rem, 3.2vw, 2.75rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.fn-body {
  font-family: var(--font-body), "Lato", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.72;
  color: var(--color-muted);
  font-weight: 400;
}
.fn-section { padding-block: clamp(5rem, 11vw, 7.5rem); }
.fn-section-alt {
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%);
}
.fn-section-glow { position: relative; isolation: isolate; }
.fn-section-glow::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 75% 45% at 50% -8%, color-mix(in srgb, var(--color-signal) 10%, transparent), transparent 72%);
}
.fn-section-ink {
  background: var(--color-ink, #0A1520);
  color: #E8E6E1;
}
.fn-grid-bg {
  background-image:
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
  background-size: 48px 48px;
}
.fn-paper-grain::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.fn-accent-line {
  height: 2px;
  width: 3.5rem;
  background: linear-gradient(90deg, var(--color-signal, #C9A227), color-mix(in srgb, var(--color-signal) 30%, transparent));
  transform-origin: left;
}
[dir="rtl"] .fn-accent-line { transform-origin: right; }
.fn-gold-rule {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--color-signal), transparent);
  opacity: 0.45;
}
.fn-card {
  border: 1px solid var(--border-subtle);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease;
}
.fn-card:hover {
  box-shadow: var(--shadow-surface);
  border-color: var(--border-accent);
  transform: translateY(-2px);
}
.fn-card-featured {
  border-color: var(--border-accent);
  background: linear-gradient(165deg, color-mix(in srgb, var(--color-signal) 5%, var(--color-surface)), var(--color-surface));
  box-shadow: var(--shadow-surface);
}
.fn-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 1.875rem;
  font-family: var(--font-body), "Lato", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-ink, #0A1520);
  background: var(--color-signal, #C9A227);
  border: 1px solid color-mix(in srgb, var(--color-signal) 75%, #000);
  border-radius: var(--radius-sm);
  transition: background 0.35s ease, box-shadow 0.35s ease, transform 0.25s ease;
}
.fn-btn-primary:hover {
  background: color-mix(in srgb, var(--color-signal) 90%, #fff);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.fn-btn-primary:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }
.fn-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 1.875rem;
  font-family: var(--font-body), "Lato", system-ui, sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-foreground);
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease;
}
.fn-btn-secondary:hover {
  border-color: var(--color-signal);
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-signal) 8%, transparent);
}
.fn-btn-secondary:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }
.fn-metric {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: clamp(1.75rem, 3vw, 2.375rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  line-height: 1;
}
.fn-signal { color: var(--color-signal, #C9A227); }
.fn-focus-ring:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 3px; }
.fn-trust-logo {
  font-family: var(--font-body), "Lato", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-foreground) 38%, transparent);
}
.fn-trust-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem 1.75rem;
}
.fn-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  border: 1px solid var(--border-default);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  padding: 0.3rem 0.75rem;
  font-family: var(--font-body), "Lato", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.fn-marquee-track { animation: fn-marquee 36s linear infinite; }
.fn-glow-orb {
  pointer-events: none;
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  opacity: 0.35;
}
.fn-quote-mark {
  font-family: var(--font-display), "Playfair Display", Georgia, serif;
  font-size: 4rem;
  line-height: 1;
  color: color-mix(in srgb, var(--color-signal) 28%, transparent);
}
.fn-star { color: var(--color-signal); letter-spacing: 0.1em; }
.fn-input, .fn-textarea {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: var(--color-background);
  padding: 0.75rem 1rem;
  font-family: var(--font-body), "Lato", system-ui, sans-serif;
  font-size: 0.875rem;
  color: var(--color-foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.fn-input:focus-visible, .fn-textarea:focus-visible {
  outline: none;
  border-color: var(--color-signal);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-signal) 14%, transparent);
}
`;
}

export function applyV2DesignTokensToGlobals(
  files: GeneratedProjectFile[],
  bundle: TemplateV2PackageBundle,
): GeneratedProjectFile[] {
  const idx = files.findIndex(
    (f) => f.path === "app/globals.css" || f.path.endsWith("/globals.css"),
  );
  const tokenBlock = buildV2DesignTokenCss(bundle.tokens, bundle);
  const displayFont = extractFontFamily(bundle.tokens.typography.display);
  const bodyFont = extractFontFamily(bundle.tokens.typography.body);

  let css =
    idx >= 0
      ? files[idx]!.content
      : `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {}\n`;

  css = setCssVar(css, "color-primary", bundle.tokens.colors.primary ?? "#0E4D64");
  css = setCssVar(css, "color-secondary", bundle.tokens.colors.secondary ?? bundle.tokens.colors.primary ?? "#155E75");
  css = setCssVar(css, "color-accent", bundle.tokens.colors.accent ?? "#14B8A6");
  css = setCssVar(css, "color-background", bundle.tokens.colors.background ?? "#F4FAFB");
  css = setCssVar(css, "color-foreground", bundle.tokens.colors.foreground ?? "#0C3547");
  css = setCssVar(css, "color-surface", bundle.tokens.colors.surface ?? "#FFFFFF");
  css = setCssVar(css, "font-display", `${displayFont}, ui-sans-serif, system-ui, sans-serif`);
  css = setCssVar(css, "font-body", `${bodyFont}, ui-sans-serif, system-ui, sans-serif`);
  css = setCssVar(css, "container-max", bundle.responsive.containerMaxWidth ?? "78rem");

  if (!css.includes("Template Architecture V2")) {
    css += `\n${tokenBlock}\n`;
  } else {
    css = css.replace(
      /\/\* Template Architecture V2[\s\S]*?(?=\n\/\*|$)/,
      tokenBlock.trim(),
    );
  }

  const next = [...files];
  if (idx >= 0) {
    next[idx] = { ...next[idx]!, content: css };
  } else {
    next.push({ path: "app/globals.css", content: css, language: "css" });
  }
  return next;
}
