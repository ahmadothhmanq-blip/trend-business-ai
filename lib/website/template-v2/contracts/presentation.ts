export type TemplateV2RegionRole =
  | "header"
  | "main"
  | "sidebar"
  | "footer"
  | "overlay"
  | "utility";

export type TemplateV2PresentationRegion = {
  role: TemplateV2RegionRole;
  sticky?: boolean;
  collapseBelow?: "sm" | "md" | "lg" | "xl";
};

export type TemplateV2PresentationProfile = {
  packageId: string;
  templateIntelligenceHint?: string;
  layout: {
    defaultLayoutId: string;
    regions: Record<string, TemplateV2PresentationRegion>;
  };
  navigation: {
    componentId: string;
    variant?: string;
  };
  hero: {
    componentId: string;
    region: string;
  };
  footer: {
    componentId: string;
    region: string;
  };
  homeFlow: {
    regions: Record<string, string[]>;
  };
  sectionShell?: {
    strategy: "none" | "package" | "shared-primitive";
    componentId?: string;
  };
  aiGeneration?: {
    contentProfile?: string;
    suggestedPages?: string[];
  };
};
