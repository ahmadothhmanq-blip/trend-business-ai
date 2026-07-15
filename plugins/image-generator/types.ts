export type ImagePluginInput = {
  prompt: string;
  negativePrompt: string;
  imageType: string;
  style: string;
  aspectRatio: string;
  mood: string;
  options: string[];
  batchCount: number;
  brandColors: string[];
};

export type ImageAnalysis = {
  subject: string;
  imageType: string;
  style: string;
  mood: string;
  colorDirection: string;
  compositionNotes: string;
  targetUse: string;
  technicalRequirements: string[];
};

export type ImageConcept = {
  name: string;
  description: string;
  compositionNotes: string;
  colorPalette: string[];
  lightingDirection: string;
};

export type ImagePlanResult = {
  concepts: ImageConcept[];
  colorDirection: string;
  moodBoard: string[];
  outputFormats: string[];
  compositionApproach: string;
};

export type ImageVariation = {
  name: string;
  description: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  style: string;
  svgConcept: string;
};

export type ImageOutput = {
  title: string;
  description: string;
  imageType: string;
  style: string;
  concepts: ImageVariation[];
  colorDirection: string;
  moodBoard: string[];
  promptLibrary: { name: string; prompt: string; negativePrompt: string; style: string }[];
  files: { path: string; content: string; language: string }[];
};

export type ImageProgressEvent = string;
