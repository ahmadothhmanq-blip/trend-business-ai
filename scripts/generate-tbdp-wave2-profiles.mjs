/**
 * Generate TBDP profiles for wave-2 flagship packages.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const profilesRoot = path.join(root, "lib/website/template-v2/tbdp/profiles");

const SCALE = {
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.625rem",
  display: "clamp(1.875rem, 3vw, 2.5rem)",
};

const PROFILES = [
  {
    dir: "prism-aurora",
    file: "aurora-prism.ts",
    exportPrefix: "AURORA_PRISM",
    title: "Aurora Prism",
    packageId: "prism-aurora",
    heroId: "prism-aurora-hero",
    identity: "aurora-prism",
    motionPreset: "prism-aurora-reveal",
    display: "Plus Jakarta Sans",
    body: "Inter",
    colors: {
      primary: "#5B21B6",
      secondary: "#1E1B4B",
      accent: "#A78BFA",
      background: "#FAFAFF",
      foreground: "#0F0A1E",
      muted: "rgba(15,10,30,0.58)",
      surface: "#FFFFFF",
      signal: "#8B5CF6",
      grid: "rgba(139,92,246,0.08)",
      ink: "#0F0A1E",
    },
  },
  {
    dir: "obsidian-noir",
    file: "noir-obsidian.ts",
    exportPrefix: "NOIR_OBSIDIAN",
    title: "Noir Obsidian",
    packageId: "obsidian-noir",
    heroId: "obsidian-noir-hero",
    identity: "noir-obsidian",
    motionPreset: "obsidian-noir-reveal",
    display: "Cormorant Garamond",
    body: "Inter",
    colors: {
      primary: "#050505",
      secondary: "#111111",
      accent: "#D4AF37",
      background: "#050505",
      foreground: "#F5F0E8",
      muted: "rgba(245,240,232,0.58)",
      surface: "#111111",
      signal: "#D4AF37",
      grid: "rgba(212,175,55,0.06)",
      ink: "#050505",
    },
  },
  {
    dir: "pulse-fintech",
    file: "neon-pulse.ts",
    exportPrefix: "NEON_PULSE",
    title: "Neon Pulse",
    packageId: "pulse-fintech",
    heroId: "pulse-fintech-hero",
    identity: "neon-pulse",
    motionPreset: "pulse-fintech-reveal",
    display: "IBM Plex Sans",
    body: "IBM Plex Sans",
    colors: {
      primary: "#021A14",
      secondary: "#042F24",
      accent: "#10B981",
      background: "#010F0C",
      foreground: "#ECFDF5",
      muted: "rgba(236,253,245,0.58)",
      surface: "#042F24",
      signal: "#34D399",
      grid: "rgba(16,185,129,0.1)",
      ink: "#010F0C",
    },
  },
  {
    dir: "forge-industrial",
    file: "industrial-forge.ts",
    exportPrefix: "INDUSTRIAL_FORGE",
    title: "Industrial Forge",
    packageId: "forge-industrial",
    heroId: "forge-industrial-hero",
    identity: "industrial-forge",
    motionPreset: "forge-industrial-reveal",
    display: "Archivo",
    body: "Inter",
    colors: {
      primary: "#1C1917",
      secondary: "#292524",
      accent: "#EA580C",
      background: "#F5F5F4",
      foreground: "#1C1917",
      muted: "rgba(28,25,23,0.58)",
      surface: "#FFFFFF",
      signal: "#EA580C",
      grid: "rgba(234,88,12,0.08)",
      ink: "#1C1917",
    },
  },
  {
    dir: "citadel-trust",
    file: "trust-citadel.ts",
    exportPrefix: "TRUST_CITADEL",
    title: "Trust Citadel",
    packageId: "citadel-trust",
    heroId: "citadel-trust-hero",
    identity: "trust-citadel",
    motionPreset: "citadel-trust-reveal",
    display: "Libre Baskerville",
    body: "Source Sans 3",
    colors: {
      primary: "#0B1F33",
      secondary: "#132C45",
      accent: "#7BA3C7",
      background: "#071018",
      foreground: "#E8EEF4",
      muted: "rgba(232,238,244,0.58)",
      surface: "#0F2236",
      signal: "#7BA3C7",
      grid: "rgba(123,163,199,0.08)",
      ink: "#071018",
    },
  },
  {
    dir: "lumina-wellness",
    file: "glow-lumina.ts",
    exportPrefix: "GLOW_LUMINA",
    title: "Glow Lumina",
    packageId: "lumina-wellness",
    heroId: "lumina-wellness-hero",
    identity: "glow-lumina",
    motionPreset: "lumina-wellness-reveal",
    display: "Fraunces",
    body: "Nunito Sans",
    colors: {
      primary: "#4A3F55",
      secondary: "#6B5C7A",
      accent: "#E8B4B8",
      background: "#FFF9F7",
      foreground: "#2D2433",
      muted: "rgba(45,36,51,0.58)",
      surface: "#FFFFFF",
      signal: "#E8B4B8",
      grid: "rgba(232,180,184,0.12)",
      ink: "#2D2433",
    },
  },
];

function profileTs(p) {
  return `import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** ${p.title} — TBDP identity for ${p.packageId}. */
export const ${p.exportPrefix}_V2_TOKENS: TemplateV2DesignTokens = {
  colors: ${JSON.stringify(p.colors, null, 4).replace(/"([^"]+)":/g, "$1:")},
  typography: {
    display: ${JSON.stringify(p.display)},
    body: ${JSON.stringify(p.body)},
    scale: ${JSON.stringify(SCALE, null, 6).replace(/"([^"]+)":/g, "$1:")},
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: { display: "Alexandria", body: "Noto Sans Arabic" },
    ltrTypography: { display: ${JSON.stringify(p.display)}, body: ${JSON.stringify(p.body)} },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: { sm: "10px", md: "16px", lg: "24px", xl: "32px" },
  shadows: {
    surface: "0 12px 40px rgba(0,0,0,0.12)",
    glow: "0 0 96px color-mix(in srgb, var(--color-accent) 22%, transparent)",
    card: "0 0 0 1px color-mix(in srgb, var(--color-foreground) 6%, transparent), 0 12px 40px rgba(0,0,0,0.08)",
  },
  borders: {
    default: "color-mix(in srgb, var(--color-foreground) 10%, transparent)",
    accent: "color-mix(in srgb, var(--color-accent) 32%, transparent)",
    subtle: "color-mix(in srgb, var(--color-foreground) 5%, transparent)",
  },
};

export const ${p.exportPrefix}_MOTION: TemplateV2MotionConfig = {
  preset: ${JSON.stringify(p.motionPreset)},
  reducedMotion: "fade",
  entrances: {
    hero: { type: "slide-up", durationMs: 720, staggerMs: 55 },
    section: { type: "slide-up", durationMs: 560, staggerMs: 45 },
    metric: { type: "count-up", durationMs: 900, staggerMs: 80 },
  },
  microInteractions: {
    button: { hover: "glow", active: "press" },
    card: { hover: "lift", focus: "ring" },
  },
  imports: [],
};

export const ${p.exportPrefix}_RESPONSIVE_BASE: Pick<
  TemplateV2ResponsiveRules,
  "breakpoints" | "containerMaxWidth"
> = {
  breakpoints: [
    { name: "sm", minWidth: 640 },
    { name: "md", minWidth: 768 },
    { name: "lg", minWidth: 1024 },
    { name: "xl", minWidth: 1280 },
    { name: "2xl", minWidth: 1536 },
  ],
  containerMaxWidth: "88rem",
};

export const ${p.exportPrefix}_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    utility: { collapseBelow: "md", collapseMode: "stack" },
    main: { collapseBelow: "sm" },
    overlay: { collapseBelow: "sm", collapseMode: "fixed-bottom" },
  },
  components: {
    ${JSON.stringify(p.heroId)}: {
      layout: { lg: "split-trust", sm: "stacked" },
    },
  },
};
`;
}

for (const p of PROFILES) {
  const dir = path.join(profilesRoot, p.dir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, p.file), profileTs(p), "utf8");
  console.log("wrote", p.file);
}
