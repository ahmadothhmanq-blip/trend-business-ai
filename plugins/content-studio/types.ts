export type ContentPluginInput = {
  prompt: string;
  contentTool: string;
  contentType: string;
  tone: string;
  audience: string;
  language: string;
  brandVoice: string;
  writingStyle: string;
  creativityLevel: string;
  options: string[];
  seoKeywords: string;
};

export type ContentAnalysis = {
  title: string;
  contentType: string;
  targetAudience: string;
  mainMessage: string;
  keyPoints: string[];
  suggestedStructure: string;
  toneAnalysis: string;
  competitiveAngle: string;
};

export type ContentSection = {
  heading: string;
  purpose: string;
  wordCount: number;
  keyPoints: string[];
};

export type ContentPlanResult = {
  sections: ContentSection[];
  totalWordCount: number;
  seoStrategy: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  headlineVariants: string[];
};

export type ContentSeoResult = {
  score: number;
  keywordDensity: Record<string, number>;
  metaTitle: string;
  metaDescription: string;
  headingStructure: string[];
  internalLinkingSuggestions: string[];
  faqItems: { question: string; answer: string }[];
  schemaSuggestions: string[];
  readabilityScore: number;
  wordCount: number;
};

export type ContentOutput = {
  title: string;
  contentTool: string;
  contentType: string;
  body: string;
  headlines: string[];
  seo: ContentSeoResult | null;
  suggestions: string[];
  improvements: string[];
  summary: string;
  files: { path: string; content: string; language: string }[];
};
