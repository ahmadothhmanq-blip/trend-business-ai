import type { LucideIcon } from "lucide-react";
import type { WorkspaceType } from "@/lib/workspace/types";

export type ProductEngineKind = "workspace" | "website";

export type ProductId =
  | "website-builder"
  | "landing-page-builder"
  | "app-builder"
  | "logo-designer"
  | "brand-studio"
  | "image-generator"
  | "video-studio"
  | "content-studio"
  | "social-media-manager"
  | "marketing-strategy"
  | "business-intelligence"
  | "feasibility-study";

export type ProductDefinition = {
  id: ProductId;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  href: string;
  kind: ProductEngineKind;
  /** Shared AI workspace backend type (text products). */
  workspaceType?: WorkspaceType;
  /** Default website/app project type for website engine products. */
  defaultProjectType?: string;
  promptLabel: string;
  promptPlaceholder: string;
  generateLabel: string;
  templates: string[];
  outputs: string[];
  settingsHints: string[];
  metrics: { label: string; value: string }[];
};
