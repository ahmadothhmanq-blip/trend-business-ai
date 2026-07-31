/** Design quality benchmarks — principles only, never brand copies. */
export type DesignQualityBenchmark =
  | "agency-elite"
  | "apple-quality"
  | "stripe-quality"
  | "notion-quality"
  | "linear-quality"
  | "vercel-quality"
  | "claude-quality";

export type DesignDNAPrinciples = {
  benchmark: DesignQualityBenchmark;
  label: string;
  philosophy: string[];
  typography: {
    scale: string;
    pairing: string;
    weight: string;
    lineHeight: string;
  };
  spacing: {
    rhythm: string;
    density: "minimal" | "balanced" | "rich";
    whitespace: string;
    sectionPadding: string;
  };
  color: {
    approach: string;
    contrast: string;
    paletteStrategy: string;
  };
  layout: {
    grid: string;
    hierarchy: string;
    maxWidth: string;
    sectionFlow: string;
  };
  motion: {
    approach: string;
    duration: string;
    easing: string;
  };
  components: {
    cards: string;
    buttons: string;
    forms: string;
    density: string;
  };
  interaction: string[];
  accessibility: string[];
  qualityBar: string;
};

export const DESIGN_DNA_KEY = "designDNA";
