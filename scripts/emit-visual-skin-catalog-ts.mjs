/**
 * Emit TypeScript catalog + theme bridge from manifest.
 * Usage: node scripts/emit-visual-skin-catalog-ts.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function shadowBlock(shadows) {
  const sm = shadows?.sm ?? "0 4px 24px rgba(0,0,0,0.08)";
  const md = shadows?.md ?? "0 24px 64px rgba(0,0,0,0.12)";
  const lg = shadows?.lg ?? "0 48px 120px rgba(0,0,0,0.16)";
  return `{ sm: ${JSON.stringify(sm)}, md: ${JSON.stringify(md)}, lg: ${JSON.stringify(lg)} }`;
}

function catalogEntry(s) {
  const accent = s.tokens.accent;
  const isDark = s.tokens.background.startsWith("#0") || s.tokens.background.startsWith("#1") && parseInt(s.tokens.background.slice(1,3), 16) < 0x30;
  const frameAlpha = isDark ? "0.22" : "0.14";
  const shadows = isDark
    ? {
        sm: `0 0 24px color-mix(in srgb, ${accent} 12%, transparent)`,
        md: `0 32px 80px rgba(0,0,0,0.45)`,
        lg: `0 0 120px color-mix(in srgb, ${accent} 18%, transparent)`,
      }
    : {
        sm: "0 2px 12px rgba(0,0,0,0.06)",
        md: "0 24px 64px rgba(0,0,0,0.1)",
        lg: "0 48px 96px rgba(0,0,0,0.12)",
      };
  return `  base(
    ${JSON.stringify(s.skinId)},
    ${JSON.stringify(s.label)},
    ${JSON.stringify(s.description)},
    {
      primary: ${JSON.stringify(s.tokens.primary)},
      secondary: ${JSON.stringify(s.tokens.secondary)},
      accent: ${JSON.stringify(s.tokens.accent)},
      background: ${JSON.stringify(s.tokens.background)},
      foreground: ${JSON.stringify(s.tokens.foreground)},
      radius: ${JSON.stringify(s.tokens.radius)},
    },
    { headingFont: ${JSON.stringify(s.typography.headingFont)}, bodyFont: ${JSON.stringify(s.typography.bodyFont)} },
    ${JSON.stringify(s.sectionShell)},
    {
      shadows: ${shadowBlock(shadows)},
      imageTreatment: {
        radius: ${JSON.stringify(s.tokens.radius)},
        aspectRatio: ${JSON.stringify(isDark ? "16 / 10" : "4 / 3")},
        frame: ${JSON.stringify(`1px solid color-mix(in srgb, ${accent} ${frameAlpha}, transparent)`)},
        shadow: ${JSON.stringify(`0 0 48px color-mix(in srgb, ${accent} 12%, transparent)`)},
      },
      motionIntensity: ${JSON.stringify(s.motionIntensity)},
      rtlTypography: { display: "Alexandria", body: "Noto Sans Arabic" },
      flagship: true,
    },
  )`;
}

function bridgeEntry(s) {
  return `  ${s.skinId}: {
    templateV2PackageId: ${JSON.stringify(s.packageId)},
    tbdpTemplateIdentity: ${JSON.stringify(s.tbdpIdentity)},
    websiteThemeId: ${JSON.stringify(s.websiteThemeId)},
    templateIntelligenceId: ${JSON.stringify(s.templateIntelligenceId)},
    defaultLayoutId: "default",
    navigationVariant: ${JSON.stringify(s.navigationVariant)},
    pageTopology: ${JSON.stringify(s.pageTopology)},
    heroLayoutMode: ${JSON.stringify(s.heroLayoutMode)},
  }`;
}

const catalogTs = `import type { VisualSkin, VisualSkinImageTreatment } from "@/lib/website/visual-skin/types";

const base = (
  id: string,
  label: string,
  description: string,
  tokens: VisualSkin["tokens"],
  typography: VisualSkin["typography"],
  sectionShellVariant: string,
  extras: {
    shadows: VisualSkin["shadows"];
    imageTreatment: VisualSkinImageTreatment;
    motionIntensity: VisualSkin["motionIntensity"];
    rtlTypography?: VisualSkin["rtlTypography"];
    flagship?: boolean;
  },
): VisualSkin => ({
  id,
  label,
  description,
  tokens,
  typography,
  sectionShellVariant,
  shadows: extras.shadows,
  imageTreatment: extras.imageTreatment,
  motionIntensity: extras.motionIntensity,
  rtlTypography: extras.rtlTypography,
  flagship: extras.flagship,
});

/** Published visual skins — global-grade full-frame design systems. */
export const VISUAL_SKIN_CATALOG: readonly VisualSkin[] = [
${FLAGSHIP_SKIN_MANIFEST.map(catalogEntry).join(",\n")},
] as const;

export const DEFAULT_VISUAL_SKIN_ID = "signal";

/** @deprecated Retired flagship skins — kept for migration lookups only. */
export const LEGACY_VISUAL_SKIN_ALIASES: Record<string, string> = {
  sovereign: "signal",
  prestige: "volt",
};
`;

const bridgeTs = `import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import type { ThemePageTopology } from "@/lib/website/contracts/theme-architecture";
import type { VisualSkinId } from "@/lib/website/visual-skin/types";

export type VisualSkinThemeBridge = {
  templateV2PackageId: string;
  tbdpTemplateIdentity?: string;
  websiteThemeId?: WebsiteThemePresetId;
  templateIntelligenceId: string;
  defaultLayoutId: string;
  navigationVariant?: string;
  pageTopology?: ThemePageTopology;
  heroLayoutMode?: string;
};

export const VISUAL_SKIN_THEME_BRIDGE: Record<VisualSkinId, VisualSkinThemeBridge> = {
${FLAGSHIP_SKIN_MANIFEST.map(bridgeEntry).join(",\n")},
  /** @deprecated Use \`signal\` */
  sovereign: {
    templateV2PackageId: "ai-startup-signal",
    tbdpTemplateIdentity: "aura-signal",
    websiteThemeId: "technology",
    templateIntelligenceId: "ti-ai-company-signal",
    defaultLayoutId: "default",
    navigationVariant: "product",
    pageTopology: "sidebar-rail",
    heroLayoutMode: "dashboard-command",
  },
  /** @deprecated Use \`volt\` */
  prestige: {
    templateV2PackageId: "creative-agency-premium",
    tbdpTemplateIdentity: "studio-volt",
    websiteThemeId: "creative",
    templateIntelligenceId: "ti-creative-studio",
    defaultLayoutId: "default",
    navigationVariant: "creative",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "kinetic-type",
  },
};

export function resolveVisualSkinThemeBridge(skinId: string): VisualSkinThemeBridge | null {
  return VISUAL_SKIN_THEME_BRIDGE[skinId] ?? null;
}

export function resolveVisualSkinV2PackageId(skinId: string): string | null {
  return resolveVisualSkinThemeBridge(skinId)?.templateV2PackageId ?? null;
}

export function isVisualSkinV2PackageId(packageId: string): boolean {
  const id = packageId.trim();
  return Object.values(VISUAL_SKIN_THEME_BRIDGE).some(
    (bridge) => bridge.templateV2PackageId === id,
  );
}
`;

await writeFile(path.join(root, "lib/website/visual-skin/catalog.ts"), catalogTs, "utf8");
await writeFile(path.join(root, "lib/website/visual-skin/theme-bridge.ts"), bridgeTs, "utf8");
console.log("Emitted catalog.ts and theme-bridge.ts with", FLAGSHIP_SKIN_MANIFEST.length, "skins");
