import type { WebsiteGoal } from "@/lib/ai-core/components/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";

/** Business-facing conversion goals (product language). */
export type ConversionGoal =
  | "sales"
  | "bookings"
  | "leads"
  | "service-requests"
  | "brand-awareness";

export type ConversionRecommendationArea =
  | "hero"
  | "cta"
  | "section-order"
  | "trust"
  | "journey"
  | "content"
  | "industry";

export type ConversionRecommendationSeverity =
  | "critical"
  | "major"
  | "minor"
  | "opportunity";

export type ConversionRecommendation = {
  id: string;
  area: ConversionRecommendationArea;
  severity: ConversionRecommendationSeverity;
  title: string;
  detail: string;
  action: string;
  /** Optional section / component hint. */
  target?: string;
};

export type IndustryConversionRule = {
  industryId: IndustryId;
  label: string;
  defaultGoal: ConversionGoal;
  /** Must-have conversion elements (matched against content/section labels). */
  requiredElements: string[];
  /** Preferred home section order labels (substring match). */
  sectionOrder: string[];
  heroGuidance: string;
  ctaGuidance: string;
  trustElements: string[];
  journeySteps: string[];
  contentStructure: string[];
};

export type ConversionGoalDetection = {
  goal: ConversionGoal;
  /** Mapped internal WebsiteGoal used by templates/components. */
  websiteGoal: WebsiteGoal;
  confidence: number;
  reason: string;
  source: "explicit" | "strategy" | "industry" | "heuristic";
};

export type ConversionOptimizationReport = {
  goal: ConversionGoalDetection;
  industryId: IndustryId | string;
  score: number;
  conversionReady: boolean;
  recommendations: ConversionRecommendation[];
  missingElements: string[];
  suggestedSectionOrder: string[];
  suggestedJourney: string[];
  improveThemes: string[];
  summary: string;
  generatedAt: string;
};
