/**
 * A/B Testing System — variants, traffic split, conversion winners.
 */

export type ExperimentStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed"
  | "archived";

export type ExperimentChangeType =
  | "headline"
  | "image"
  | "button"
  | "layout"
  | "color"
  | "pricing"
  | "section"
  | "page";

export type ExperimentVariant = {
  id: string;
  key: "A" | "B" | string;
  name: string;
  /** Traffic weight 0–100 (relative). */
  weight: number;
  changes: ExperimentVariantChange[];
  /** Runtime metrics. */
  impressions: number;
  conversions: number;
  clicks: number;
};

export type ExperimentVariantChange = {
  type: ExperimentChangeType;
  /** Section / page / node target. */
  target: string;
  /** Human-readable original. */
  controlValue?: string;
  /** Variant value. */
  variantValue: string;
  notes?: string;
};

export type WebsiteExperiment = {
  id: string;
  generationId: string;
  userId?: string | null;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  changeTypes: ExperimentChangeType[];
  variants: ExperimentVariant[];
  /** Minimum sample before auto-winner. */
  minSampleSize: number;
  /** Confidence threshold 0–1. */
  confidenceThreshold: number;
  winnerVariantId?: string | null;
  winnerDeclaredAt?: string | null;
  winnerReason?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExperimentInput = {
  generationId: string;
  userId?: string | null;
  name: string;
  hypothesis?: string;
  changeTypes?: ExperimentChangeType[];
  /** Variant A control changes (optional baseline notes). */
  variantA?: {
    name?: string;
    weight?: number;
    changes?: ExperimentVariantChange[];
  };
  variantB: {
    name?: string;
    weight?: number;
    changes: ExperimentVariantChange[];
  };
  minSampleSize?: number;
  confidenceThreshold?: number;
  start?: boolean;
};

export type ExperimentAssignment = {
  experimentId: string;
  variantId: string;
  variantKey: string;
};

export type ExperimentResults = {
  experiment: WebsiteExperiment;
  conversionRates: Array<{
    variantId: string;
    key: string;
    name: string;
    impressions: number;
    conversions: number;
    clicks: number;
    conversionRate: number;
  }>;
  liftPercent: number | null;
  winnerVariantId: string | null;
  autoDeclared: boolean;
  summary: string;
};
