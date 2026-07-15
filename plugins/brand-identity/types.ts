export type BrandIdentityPluginInput = {
  prompt: string;
  brandName: string;
  brandType: string;
  industry: string;
  targetAudience: string;
  brandPersonality: string;
  deliverables: string[];
};

export type BrandAnalysis = {
  brandName: string;
  industry: string;
  positioning: string;
  targetAudience: string;
  competitors: string[];
  differentiators: string[];
  personality: string;
  coreValues: string[];
  emotionalAppeal: string;
};

export type BrandVoiceTone = {
  tone: string;
  doExamples: string[];
  dontExamples: string[];
  tagline: string;
  elevatorPitch: string;
};

export type BrandColorEntry = {
  name: string;
  hex: string;
  role: string;
  usage: string;
};

export type BrandTypographySystem = {
  primary: string;
  secondary: string;
  weight: string;
  headingStyle: string;
  bodyStyle: string;
  notes: string;
};

export type BrandPlanResult = {
  mission: string;
  vision: string;
  values: string[];
  voiceTone: BrandVoiceTone;
  colorPalette: BrandColorEntry[];
  typography: BrandTypographySystem;
  deliverables: string[];
  brandArchetype: string;
};

export type BrandAsset = {
  name: string;
  category: string;
  description: string;
  content: string;
  format: string;
};

export type BrandOutput = {
  title: string;
  description: string;
  brandType: string;
  mission: string;
  vision: string;
  values: string[];
  voiceTone: BrandVoiceTone;
  colorPalette: BrandColorEntry[];
  typography: BrandTypographySystem;
  logoGuidelines: string;
  brandStory: string;
  brandStrategy: string;
  assets: BrandAsset[];
  files: { path: string; content: string; language: string }[];
};

export type BrandProgressEvent = string;
