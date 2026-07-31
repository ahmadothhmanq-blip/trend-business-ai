import type { GeneratedProjectFile } from "@/plugins/website/types";

export type StaticPreviewInput = {
  title?: string;
  description?: string;
  pages?: string[];
  sections?: string[];
  colorPalette?: string[];
  typography?: string[];
  content?: string[];
  components?: string[];
  heroImageUrl?: string | null;
  primaryCta?: string;
  templateIntelligenceId?: string | null;
  websiteThemeId?: string | null;
  /** Website language — drives RTL preview when Arabic (etc.). */
  language?: string | null;
  industryId?: string | null;
  /** Generated project files — preferred scaffold source when present. */
  files?: GeneratedProjectFile[];
};
