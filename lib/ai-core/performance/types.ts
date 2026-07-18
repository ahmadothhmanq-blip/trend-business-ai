/**
 * AI Performance Engine contracts (Phase 8).
 */

export type CorePerformanceCheckName =
  | "image_optimization"
  | "asset_size"
  | "loading_performance"
  | "mobile_responsiveness"
  | "core_web_vitals";

export type CorePerformanceCheck = {
  name: CorePerformanceCheckName;
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
};

export type CorePerformanceReport = {
  passed: boolean;
  score: number;
  checks: CorePerformanceCheck[];
  issues: string[];
  recommendations: string[];
  generatedAt: string;
};
