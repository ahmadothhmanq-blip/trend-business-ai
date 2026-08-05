import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import { buildTbdpNativeAuthorityCss } from "@/lib/website/template-v2/tbdp";
import { buildCorporateBusinessGlobalCss } from "@/lib/website/template-v2/tokens/corporate-business-global-css";

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
    "packageId" | "manifest" | "tbdpNative" | "tbdpDesignContext"
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

/** Ember Table design system — restaurant-premium V2 global layer */
function buildRestaurantPremiumGlobalCss(): string {
  return `${buildRestaurantSignatureGlobalCss()
    .replaceAll("restaurant-signature", "restaurant-premium")
    .replaceAll(".rs-", ".rp-")
    .replaceAll("@keyframes rs-", "@keyframes rp-")
    .replaceAll("v2-motion", "rp-motion")
    .replaceAll("Forest Table", "Ember Table")
    .replaceAll("restaurant-signature V2", "restaurant-premium V2")}
.rp-card {
  border: 1px solid var(--border-subtle, rgba(244,237,228,0.06));
  background: var(--color-surface);
  border-radius: var(--radius-md, 4px);
  box-shadow: var(--shadow-surface);
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.rp-card:hover {
  border-color: color-mix(in srgb, var(--color-copper) 35%, transparent);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}
.rp-section-alt {
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 6%, var(--color-background)), var(--color-background));
}
.rp-headline-sm {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(1.75rem, 3.2vw, 2.5rem);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
}
.rp-metric {
  font-family: var(--font-display), "Fraunces", Georgia, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1;
  color: var(--color-copper, #D4A574);
}
`;
}

/** Azure Haven design system — hotel-resort-premium V2 global layer */
function buildHotelResortPremiumGlobalCss(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Noto+Sans+Arabic:wght@400;500;600&display=swap");

@keyframes hr-reveal-hero {
  from { opacity: 0; transform: translateY(40px); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes hr-reveal-section {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hr-draw-line {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes hr-scroll-pulse {
  0%, 100% { opacity: 0.35; transform: scaleY(0.6); }
  50% { opacity: 1; transform: scaleY(1); }
}
@keyframes hr-ken-burns {
  from { transform: scale(1.06); }
  to { transform: scale(1); }
}
@keyframes hr-ocean-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .hr-motion, [data-hr-motion] { animation: none !important; transition: none !important; }
}

.hr-font-display { font-family: var(--font-display), "Cormorant Garamond", Georgia, serif; }
.hr-font-body { font-family: var(--font-body), "Jost", system-ui, sans-serif; }
.hr-eyebrow {
  font-family: var(--font-body), "Jost", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: var(--color-azure, #4A9FD4);
}
.hr-headline {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
  font-size: clamp(2.75rem, 6vw, 5rem);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--color-foreground);
  text-wrap: balance;
}
.hr-headline-sm {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
  font-size: clamp(1.75rem, 3.2vw, 2.5rem);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.015em;
  color: var(--color-foreground);
}
.hr-body {
  font-family: var(--font-body), "Jost", system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.75;
  font-weight: 300;
  color: color-mix(in srgb, var(--color-foreground) 68%, transparent);
}
.hr-azure-rule {
  height: 1px;
  width: 4rem;
  background: linear-gradient(90deg, var(--color-azure, #4A9FD4), transparent);
  transform-origin: left;
}
[dir="rtl"] .hr-azure-rule { transform-origin: right; }
.hr-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.875rem;
  padding: 0.875rem 2rem;
  font-family: var(--font-body), "Jost", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-sand, #F2E8DC);
  background: var(--color-azure, #4A9FD4);
  border: 1px solid color-mix(in srgb, var(--color-azure) 70%, var(--color-primary));
  transition: background 0.4s ease, box-shadow 0.4s ease, transform 0.35s ease;
}
.hr-btn-primary:hover {
  background: color-mix(in srgb, var(--color-azure) 85%, #fff);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.hr-btn-primary:focus-visible {
  outline: 2px solid var(--color-azure);
  outline-offset: 3px;
}
.hr-btn-ghost {
  display: inline-flex;
  align-items: center;
  min-height: 2.875rem;
  padding: 0.875rem 1.75rem;
  font-family: var(--font-body), "Jost", system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 400;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  text-decoration: none;
  color: color-mix(in srgb, var(--color-foreground) 85%, transparent);
  border: 1px solid var(--border-azure, rgba(74,159,212,0.32));
  background: transparent;
  transition: border-color 0.35s ease, color 0.35s ease, background 0.35s ease;
}
.hr-btn-ghost:hover {
  border-color: var(--color-azure);
  color: var(--color-azure);
  background: color-mix(in srgb, var(--color-azure) 6%, transparent);
}
.hr-btn-ghost:focus-visible { outline: 2px solid var(--color-azure); outline-offset: 3px; }
.hr-section { padding-block: clamp(5rem, 12vw, 8rem); }
.hr-section-alt {
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 8%, var(--color-background)), var(--color-background));
}
.hr-section-sand {
  background: var(--color-sand, #F2E8DC);
  color: var(--color-primary, #0C2340);
}
.hr-card {
  border: 1px solid var(--border-subtle, rgba(242,232,220,0.06));
  background: var(--color-surface);
  border-radius: var(--radius-md, 4px);
  box-shadow: var(--shadow-surface);
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.hr-card:hover {
  border-color: color-mix(in srgb, var(--color-azure) 35%, transparent);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}
.hr-metric {
  font-family: var(--font-display), "Cormorant Garamond", Georgia, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400;
  line-height: 1;
  color: var(--color-azure, #4A9FD4);
}
.hr-focus-ring:focus-visible { outline: 2px solid var(--color-azure); outline-offset: 2px; }
.hr-grain {
  position: relative;
}
.hr-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.hr-input, .hr-textarea {
  width: 100%;
  border: 1px solid var(--border-subtle);
  background: transparent;
  padding: 0.75rem 1rem;
  font-family: var(--font-body), "Jost", system-ui, sans-serif;
  font-size: 0.875rem;
  color: var(--color-foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.hr-input:focus-visible, .hr-textarea:focus-visible {
  outline: none;
  border-color: var(--color-azure);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-azure) 15%, transparent);
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
