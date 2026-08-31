import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import type { WebsiteStrategy } from "@/lib/website/types/layers";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  CAPABILITY_MANIFEST_SPEC_VERSION,
} from "@/lib/website/builder/capabilities/constants";

/** Stable capability identifiers — not tied to industry or template. */
export const WEBSITE_CAPABILITY_IDS = [
  "blog",
  "products",
  "booking",
  "appointments",
  "team",
  "gallery",
  "portfolio",
  "testimonials",
  "faq",
  "forms",
  "analytics",
  "seo",
  "authentication",
  "dashboard",
  "multi-language",
  "search",
  "payments",
  "inventory",
  "orders",
  "reviews",
  "maps",
  "chat",
  "newsletter",
  "pricing",
] as const;

export type WebsiteCapabilityId = (typeof WEBSITE_CAPABILITY_IDS)[number];

export type CapabilityEvidenceSource =
  | "blueprint"
  | "strategy"
  | "route"
  | "component"
  | "setting"
  | "file"
  | "content"
  | "dependency";

export type CapabilityConfidence = "high" | "medium" | "low";

export type CapabilityManifestPhase = "initial" | "verified" | "final";

export type CapabilityEvidence = {
  source: CapabilityEvidenceSource;
  ref: string;
  weight: number;
  detail?: string;
};

export type CapabilityManifestEntry = {
  id: WebsiteCapabilityId;
  status: "active" | "latent";
  confidence: CapabilityConfidence;
  score: number;
  evidence: CapabilityEvidence[];
  metadata?: Record<string, unknown>;
};

export type WebsiteCapabilityManifest = {
  specVersion: typeof CAPABILITY_MANIFEST_SPEC_VERSION;
  projectId?: string;
  generatedAt: string;
  analyzerSetVersion: string;
  phase: CapabilityManifestPhase;
  capabilities: CapabilityManifestEntry[];
};

export type ProjectAnalysisSignals = {
  project: GeneratedWebsiteProject;
  files: GeneratedProjectFile[];
  filePaths: string[];
  routes: string[];
  componentIds: string[];
  sectionLabels: string[];
  dependencies: string[];
  settings: Record<string, unknown>;
  strategy?: WebsiteStrategy;
  blueprint: WebsiteBlueprint | null;
  pages: string[];
  contentBlocks: string[];
  hasSeoPackage: boolean;
  language?: string;
};

export type CapabilityMatchContext = ProjectAnalysisSignals & {
  /** Restrict scoring to blueprint + strategy only (initial manifest). */
  phase: CapabilityManifestPhase;
};

export type CapabilityDetectionMatcher = {
  source: CapabilityEvidenceSource;
  weight: number;
  ref: string;
  test: (ctx: CapabilityMatchContext) => boolean;
};

export type CapabilityDetectionDefinition = {
  id: WebsiteCapabilityId;
  matchers: CapabilityDetectionMatcher[];
};

export type CapabilityScoreResult = {
  id: WebsiteCapabilityId;
  score: number;
  confidence: CapabilityConfidence;
  evidence: CapabilityEvidence[];
};
