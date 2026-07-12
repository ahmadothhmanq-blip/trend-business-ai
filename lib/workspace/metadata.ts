import type { LucideIcon } from "lucide-react";

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

export const WORKSPACE_LANGUAGES = ["English", "Arabic", "Bilingual"] as const;
export const WORKSPACE_THEMES = ["Gold", "Blue", "Purple", "Green", "Custom"] as const;

export type WorkspaceLanguage = (typeof WORKSPACE_LANGUAGES)[number];
export type WorkspaceTheme = (typeof WORKSPACE_THEMES)[number];
