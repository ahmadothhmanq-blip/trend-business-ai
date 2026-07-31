import type {
  DesignDNAPrinciples,
  DesignQualityBenchmark,
} from "@/lib/ai-core/design-dna/types";

const BASE: Omit<DesignDNAPrinciples, "benchmark" | "label" | "philosophy" | "qualityBar"> = {
  typography: {
    scale: "modular scale 1.25 with clear display/body separation",
    pairing: "geometric sans display + humanist sans body",
    weight: "display 600–700, body 400–500, labels 500",
    lineHeight: "headings 1.1–1.2, body 1.55–1.65",
  },
  spacing: {
    rhythm: "8px base grid with 16/24/32/48/64/96 section rhythm",
    density: "balanced",
    whitespace: "generous section breathing room, never cramped",
    sectionPadding: "py-16 md:py-24 lg:py-32",
  },
  color: {
    approach: "limited palette with one dominant brand hue",
    contrast: "WCAG AA minimum, AAA for body text where possible",
    paletteStrategy: "neutral surfaces + one accent for CTAs",
  },
  layout: {
    grid: "12-column responsive with intentional asymmetry",
    hierarchy: "single focal point per viewport, clear scan path",
    maxWidth: "max-w-7xl content, full-bleed heroes",
    sectionFlow: "hero → proof → offer → detail → trust → action",
  },
  motion: {
    approach: "purposeful micro-interactions, never decorative noise",
    duration: "150–300ms UI, 400–600ms section reveals",
    easing: "cubic-bezier ease-out for entrances",
  },
  components: {
    cards: "subtle elevation, 12–16px radius, hover lift",
    buttons: "primary filled + ghost secondary, clear hit targets",
    forms: "inline validation, generous input padding",
    density: "medium — readable without feeling sparse",
  },
  interaction: [
    "hover states on all interactive elements",
    "focus rings for keyboard navigation",
    "smooth scroll for anchor links",
  ],
  accessibility: [
    "semantic landmarks",
    "skip navigation",
    "reduced-motion support",
    "color not sole information carrier",
  ],
};

export const DESIGN_DNA_BENCHMARKS: Record<
  DesignQualityBenchmark,
  DesignDNAPrinciples
> = {
  "agency-elite": {
    benchmark: "agency-elite",
    label: "Elite Digital Agency",
    philosophy: [
      "Every section earns its place — no filler blocks",
      "Photography-led heroes with confident typography",
      "Commercial clarity: visitor knows what, who, and why in 3 seconds",
      "Premium restraint — fewer elements, higher craft",
    ],
    qualityBar:
      "Must feel like a $25k+ agency deliverable: bespoke, credible, conversion-aware.",
    ...BASE,
  },
  "apple-quality": {
    benchmark: "apple-quality",
    label: "Refined Product Excellence",
    philosophy: [
      "Radical simplicity — remove until only essentials remain",
      "Product and craft photography over decoration",
      "Large type, tight tracking on headlines, airy layouts",
      "Confidence through whitespace, not ornament",
    ],
    qualityBar:
      "Calm, precise, product-forward — inspired by refined consumer tech aesthetics.",
    ...BASE,
    spacing: {
      ...BASE.spacing,
      density: "minimal",
      whitespace: "extreme negative space as a design element",
      sectionPadding: "py-20 md:py-28 lg:py-36",
    },
    typography: {
      ...BASE.typography,
      pairing: "system-adjacent sans with optical sizing",
      weight: "display 600, body 400, ultra-clean hierarchy",
    },
    components: {
      ...BASE.components,
      cards: "borderless, photography-forward, minimal chrome",
      density: "low — one idea per section",
    },
  },
  "stripe-quality": {
    benchmark: "stripe-quality",
    label: "Developer-Grade Clarity",
    philosophy: [
      "Gradient accents used sparingly for depth, not flash",
      "Crystal-clear value proposition above the fold",
      "Structured proof: logos, metrics, product screenshots",
      "Professional B2B trust without corporate stiffness",
    ],
    qualityBar:
      "Sharp, credible, technically polished — inspired by best-in-class SaaS marketing.",
    ...BASE,
    color: {
      approach: "deep neutral base + vibrant gradient accent on CTAs",
      contrast: "high contrast headlines on dark or light sections",
      paletteStrategy: "navy/slate surfaces + electric accent",
    },
    layout: {
      ...BASE.layout,
      sectionFlow: "hero → social proof → product → features → developers → CTA",
    },
  },
  "notion-quality": {
    benchmark: "notion-quality",
    label: "Calm Productivity",
    philosophy: [
      "Friendly, approachable, low cognitive load",
      "Soft surfaces and gentle borders over hard shadows",
      "Illustration or icon-led when photography is sparse",
      "Content-first, tool-second hierarchy",
    ],
    qualityBar:
      "Warm, organized, instantly understandable — inspired by modern productivity tools.",
    ...BASE,
    spacing: { ...BASE.spacing, density: "balanced", whitespace: "comfortable, not sparse" },
    components: {
      ...BASE.components,
      cards: "soft border, minimal shadow, rounded-lg",
      density: "medium-high — information-rich but scannable",
    },
  },
  "linear-quality": {
    benchmark: "linear-quality",
    label: "Precision Dark UI",
    philosophy: [
      "Dark-first with subtle luminous accents",
      "Tight typographic rhythm, monospace accents for technical cues",
      "Micro-animations that feel engineered, not animated",
      "Speed and focus as brand values",
    ],
    qualityBar:
      "Dark, fast, precise — inspired by elite product software interfaces.",
    ...BASE,
    color: {
      approach: "near-black surfaces + single saturated accent",
      contrast: "high contrast text on dark, glow accents sparingly",
      paletteStrategy: "zinc/slate dark + indigo or violet accent",
    },
    motion: {
      approach: "snappy, almost instant feedback",
      duration: "100–200ms interactions",
      easing: "sharp ease-out",
    },
  },
  "vercel-quality": {
    benchmark: "vercel-quality",
    label: "Modern Web Platform",
    philosophy: [
      "Monochrome foundation with one sharp accent",
      "Geometric precision in grid and alignment",
      "Code-adjacent credibility without being developer-only",
      "Performance and craft as implicit brand signals",
    ],
    qualityBar:
      "Clean, geometric, platform-native — inspired by modern web infrastructure brands.",
    ...BASE,
    typography: {
      ...BASE.typography,
      pairing: "geometric sans mono-accent for labels",
    },
    layout: {
      ...BASE.layout,
      grid: "strict grid with monospace-aligned elements",
    },
  },
  "claude-quality": {
    benchmark: "claude-quality",
    label: "Thoughtful Intelligence",
    philosophy: [
      "Warm neutrals with terracotta or earth-tone accents",
      "Editorial typography with generous line length limits",
      "Human-centered copy paired with calm visuals",
      "Trust through clarity, not hype",
    ],
    qualityBar:
      "Warm, intelligent, editorial — inspired by thoughtful AI product design.",
    ...BASE,
    color: {
      approach: "warm cream/stone surfaces + terracotta accent",
      contrast: "soft but readable, never harsh",
      paletteStrategy: "earth tones + one warm accent",
    },
  },
};

export function getDesignDNABenchmark(
  id: DesignQualityBenchmark,
): DesignDNAPrinciples {
  return DESIGN_DNA_BENCHMARKS[id];
}
