/**
 * Benchmark Prompt Optimization Engine metadata + prompt size (no LLM).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { websiteFilePrompt } from "@/lib/ai/prompts/website";
import { assemblePrompt } from "@/lib/ai-core/prompt-engine";

const analysis = {
  projectName: "Trend Dental Clinic",
  projectType: "website",
  pages: ["Home", "Services", "Team", "Contact"],
  features: ["booking", "testimonials", "maps"],
  designSystem: ["modern", "clinical"],
  technologies: ["next", "tailwind", "typescript"],
  databaseProvider: "none",
  requiresAuth: false,
  requiresDatabase: false,
  requiresDashboard: false,
  isEcommerce: false,
  isSaas: false,
  businessProfile: {
    projectName: "Trend Dental Clinic",
    industry: "healthcare",
    targetAudience: "families and professionals",
    businessGoals: ["appointments", "trust", "local SEO"],
    offer: "Comprehensive dental care with modern technology. ".repeat(25),
    tone: "professional",
    geography: "Riyadh",
    competitors: ["Clinic A", "Clinic B", "Clinic C"],
    kpis: ["appointments", "calls"],
    summary: "A modern dental practice focused on patient comfort. ".repeat(35),
    requiredSections: ["hero", "services", "team", "testimonials", "contact"],
  },
};

const blueprint = {
  title: "Trend Dental Clinic",
  description: "Modern dental clinic website with booking and trust signals. ".repeat(20),
  pages: ["Home", "Services", "Team", "Contact"],
  sections: ["hero", "services", "team", "testimonials", "contact", "cta"],
  colorPalette: ["#0f766e", "#ecfeff", "#134e4a"],
  typography: ["Manrope", "Inter"],
  components: ["HeroLuxury", "ServicesModern", "TeamSection", "ContactSection"],
  content: Array.from({ length: 12 }, (_, index) => `Content block ${index + 1} `.repeat(12)),
  seo: ["dental clinic riyadh", "teeth cleaning", "cosmetic dentistry"],
  roadmap: ["launch mvp", "add blog", "add patient portal"],
};

const dynamicPlan = {
  complexity: "professional",
  estimatedFileCount: 24,
  layouts: ["app/layout.tsx"],
  pages: ["app/page.tsx", "app/services/page.tsx"],
  components: Array.from({ length: 10 }, (_, index) => `components/sections/Section${index + 1}.tsx`),
  apiRoutes: ["app/api/contact/route.ts"],
  hooks: ["hooks/useBooking.ts"],
  utilities: ["lib/utils.ts", "lib/site-images.ts"],
  types: ["types/index.ts"],
  configs: ["package.json", "tsconfig.json", "tailwind.config.ts"],
};

const strategy = {
  positioning: "Trusted modern dental care",
  sitemap: ["/", "/services", "/team", "/contact"],
  pages: [
    { name: "Home", path: "/", purpose: "Convert visitors", keySections: ["hero", "services"] },
    { name: "Services", path: "/services", purpose: "Explain offerings", keySections: ["services"] },
  ],
  sectionPlan: Array.from({ length: 8 }, (_, index) => ({
    id: `section-${index + 1}`,
    page: "Home",
    name: `Section${index + 1}`,
    goal: `Goal ${index + 1}`,
    contentNotes: `Detailed content guidance ${index + 1}. `.repeat(18),
  })),
  conversionFunnel: ["visit", "trust", "book"],
  contentStructure: ["hero", "proof", "services", "cta"],
  contentStrategy: {
    brandVoice: "professional and reassuring",
    messagingPillars: ["expertise", "comfort", "technology"],
    proofPoints: ["15+ years", "modern equipment"],
    objectionHandlers: ["affordable plans"],
    seoTopics: ["dental care", "riyadh dentist"],
  },
  ctas: ["Book appointment", "Call now"],
  seoFocus: ["dental clinic", "riyadh"],
};

const designSystem = {
  style: "modern",
  stylePreset: "modern",
  industryPattern: "healthcare",
  colors: {
    primary: "#0f766e",
    secondary: "#ecfeff",
    accent: "#14b8a6",
    neutral: "#64748b",
    surface: "#ffffff",
    background: "#f8fafc",
    foreground: "#0f172a",
  },
  typography: { headingFont: "Manrope", bodyFont: "Inter", scale: ["sm", "base", "lg", "xl"] },
  layoutRules: ["clean grid", "generous whitespace", "trust-first hierarchy"],
  layoutStyle: "clinical-modern",
  uiPatterns: ["split-hero", "card-grid", "testimonial-band"],
  componentPalette: ["HeroLuxury", "ServicesModern", "TeamSection", "ContactSection"],
  spacingScale: ["0", "1", "2", "4", "8", "12", "16"],
  borderRadius: "16px",
  shadowStyle: "soft",
  premium: { tokens: "x".repeat(4000) },
};

const projectTree = Array.from({ length: 24 }, (_, index) => ({
  path: `components/sections/Section${index + 1}.tsx`,
  category: "components",
  purpose: `Section ${index + 1} with detailed purpose notes `.repeat(6),
}));

const promptInput = {
  input: {
    prompt: "Modern dental clinic website",
    projectType: "website",
    projectKind: "website" as const,
    language: "en",
    theme: "modern",
    features: ["booking"],
  },
  filePlan: {
    path: "components/sections/HeroLuxury.tsx",
    purpose: "Primary hero section",
    language: "tsx",
    category: "components",
  },
  existingFiles: [],
};

async function main() {
  const payload = {
    analysis,
    blueprint,
    dynamicPlan,
    projectTree,
    strategy,
    designSystem,
    filePlan: promptInput.filePlan,
    productId: "website" as const,
  };

  process.env.WB_PROMPT_OPTIMIZATION = "0";
  const legacy = assemblePrompt(payload, (compacted) =>
    websiteFilePrompt({
      ...promptInput,
      analysis: compacted.analysis,
      blueprint: compacted.blueprint,
      dynamicPlan: compacted.dynamicPlan,
      projectTree: compacted.projectTree,
      strategy: compacted.strategy,
      designSystem: compacted.designSystem,
    }),
  );

  process.env.WB_PROMPT_OPTIMIZATION = "1";
  const optimized = assemblePrompt(payload, (compacted) =>
    websiteFilePrompt({
      ...promptInput,
      analysis: compacted.analysis,
      blueprint: compacted.blueprint,
      dynamicPlan: compacted.dynamicPlan,
      projectTree: compacted.projectTree,
      strategy: compacted.strategy,
      designSystem: compacted.designSystem,
    }),
  );

  const promptReductionPercent = Math.round(
    (1 - optimized.prompt.length / legacy.prompt.length) * 100,
  );

  const result = {
    timestamp: new Date().toISOString(),
    legacyPromptChars: legacy.prompt.length,
    optimizedPromptChars: optimized.prompt.length,
    promptReductionPercent,
    metadataReductionPercent: optimized.stats.metadataReductionPercent,
    estimatedTokenReductionPercent: Math.round(promptReductionPercent * 0.9),
    estimatedApiCostReductionPercent: Math.round(promptReductionPercent * 0.85),
    assemblyLatencyMs: {
      legacy: legacy.assemblyDurationMs,
      optimized: optimized.assemblyDurationMs,
    },
    metadataStats: optimized.stats,
    preservesInstructions:
      optimized.prompt.includes("Generate exactly one production-ready file") &&
      optimized.prompt.includes("Architecture rules:") &&
      optimized.prompt.includes("Rules:"),
  };

  const outDir = join(process.cwd(), "scripts", "benchmark-results");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `prompt-optimization-benchmark-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  console.log(`written: ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
