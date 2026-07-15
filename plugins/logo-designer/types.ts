export type GeneratedProjectFile = {
  path: string;
  content: string;
  language: string;
};

export type LogoPluginInput = {
  prompt: string;
  brandName: string;
  logoStyle: string;
  industry: string;
  colorPalette: string;
  iconStyle: string;
  typography: string;
  personality: string;
  options: string[];
};

export type LogoAnalysis = {
  brandName: string;
  industry: string;
  style: string;
  mood: string;
  personality: string;
  colorDirection: string;
  typographyDirection: string;
  conceptSuggestions: string[];
  targetAudience: string;
  brandValues: string[];
};

export type LogoConcept = {
  name: string;
  description: string;
  approach: string;
  iconDescription: string;
  layoutDescription: string;
  colorUsage: string;
};

export type LogoPlanResult = {
  concepts: LogoConcept[];
  colorPalette: { name: string; hex: string; role: string }[];
  typography: { primary: string; secondary: string; weight: string };
  deliverables: string[];
  svgApproach: string;
};

export type LogoVariation = {
  name: string;
  description: string;
  useCase: string;
  svgCode: string;
};

export type LogoOutput = {
  title: string;
  description: string;
  logoStyle: string;
  concepts: { name: string; description: string; svgCode: string }[];
  colorPalette: { name: string; hex: string; role: string }[];
  typography: { primary: string; secondary: string; notes: string };
  variations: LogoVariation[];
  guidelines: string;
  files: GeneratedProjectFile[];
};

export type LogoProgressEvent = string;

export { type GeneratedProjectFile as LogoFile };
