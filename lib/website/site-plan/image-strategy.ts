export type SiteImageStrategyMode =
  | "with-images"
  | "without-images"
  | "user-adds-later";

export type SiteImageStrategy = {
  mode: SiteImageStrategyMode;
  /** Industry-aware image generation when mode is with-images. */
  industryGate: boolean;
};

export const DEFAULT_SITE_IMAGE_STRATEGY: SiteImageStrategy = {
  mode: "with-images",
  industryGate: true,
};

export function resolveSiteImageStrategy(
  partial?: Partial<SiteImageStrategy> | SiteImageStrategyMode | null,
): SiteImageStrategy {
  if (!partial) return { ...DEFAULT_SITE_IMAGE_STRATEGY };
  if (typeof partial === "string") {
    return { mode: partial, industryGate: true };
  }
  return {
    mode: partial.mode ?? DEFAULT_SITE_IMAGE_STRATEGY.mode,
    industryGate: partial.industryGate ?? DEFAULT_SITE_IMAGE_STRATEGY.industryGate,
  };
}

export function siteImageStrategyUsesGeneration(
  strategy: SiteImageStrategy,
): boolean {
  return strategy.mode === "with-images";
}
