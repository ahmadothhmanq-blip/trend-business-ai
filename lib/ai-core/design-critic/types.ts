export type DesignCriticSeverity = "critical" | "major" | "minor" | "opportunity";

export type DesignCriticArea =
  | "layout"
  | "spacing"
  | "typography"
  | "hierarchy"
  | "ux"
  | "premium-feel"
  | "motion"
  | "mobile"
  | "imagery";

export type DesignCriticFinding = {
  id: string;
  area: DesignCriticArea;
  severity: DesignCriticSeverity;
  title: string;
  detail: string;
  action: string;
};

export type DesignCriticReport = {
  score: number;
  premiumFeel: number;
  findings: DesignCriticFinding[];
  improveThemes: string[];
  weakSections: string[];
  summary: string;
  designReady: boolean;
  generatedAt: string;
};
