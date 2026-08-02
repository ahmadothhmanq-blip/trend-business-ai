import type { VisualDesignQualityContext } from "@/lib/ai-core/visual-design-quality/types";

export function buildVisualDesignQualityContext(params: {
  files: Array<{ path: string; content: string }>;
  designSystem?: VisualDesignQualityContext["designSystem"];
  brandName?: string;
  pages?: string[];
}): VisualDesignQualityContext {
  return {
    files: params.files,
    designSystem: params.designSystem,
    brandName: params.brandName,
    pages: params.pages,
  };
}
