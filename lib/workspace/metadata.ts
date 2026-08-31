import type { LucideIcon } from "lucide-react";
import { getGlsGenerationLanguageValues } from "@/lib/language-platform/generation/options";

export type WorkspaceMetadata = {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  promptLabel: string;
  promptPlaceholder: string;
  generateLabel: string;
  templates: string[];
  outputs: string[];
  metrics: { label: string; value: string }[];
  dashboardHref: string;
  label: string;
};

export type AIWorkspaceConfig = {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  promptLabel: string;
  promptPlaceholder: string;
  generateLabel: string;
  templates: string[];
  recentProjects: string[];
  outputs: string[];
  metrics: { label: string; value: string }[];
};

/** All GLS world languages — shared workspace generator (no Bilingual). */
export const WORKSPACE_LANGUAGES = getGlsGenerationLanguageValues(
  "content-studio",
) as readonly string[];

export const WORKSPACE_THEMES = ["Gold", "Blue", "Purple", "Green", "Custom"] as const;

export type WorkspaceLanguage = string;
export type WorkspaceTheme = (typeof WORKSPACE_THEMES)[number];
