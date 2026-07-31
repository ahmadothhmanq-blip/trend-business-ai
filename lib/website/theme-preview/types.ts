import type { ThemePageArchitecture } from "@/lib/website/builder/theme-architecture";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";

export type ThemePreviewColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
};

export type ThemePreviewContent = {
  title: string;
  description: string;
  brandName: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroEyebrow: string;
  primaryCta: string;
  secondaryCta: string;
  heroImageUrl?: string | null;
  heroLayout?: string | null;
  content: string[];
  navLinks: Array<{ href: string; label: string }>;
  language?: string | null;
};

export type ThemePreviewContext = {
  themeId: WebsiteThemePresetId;
  architecture: ThemePageArchitecture;
  componentIds: string[];
  colors: ThemePreviewColors;
  typography: {
    display: string;
    heading: string;
    body: string;
  };
  templateIntelligenceId: string | null;
};
