#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const write = (rel, c) => fs.writeFileSync(path.join(ROOT, rel), c, "utf8");

const en = JSON.parse(read("locales/en.json"));

Object.assign(en.products.common, {
  templateGallery: "Template Gallery",
  optionalOnePrompt: "Optional — One Prompt uses a smart default if you skip this",
  custom: "Custom",
  options: "Options",
  count: "Count",
  quality: "Quality",
  standard: "Standard",
  hd: "HD",
  maxScenes: "Max 8",
  maxVariations: "Max 4",
  matches: "{count} matches",
  recommended: "Recommended",
  negativePromptExclude: "(what to exclude)",
  openWorkspace: "Open workspace →",
});

Object.assign(en.products.videoStudio.preview, {
  narration: "Narration",
  videoAiPrompt: "Video AI Prompt",
  fullScript: "Full Script",
  voiceoverScript: "Voice-over Script",
  sceneLabel: "Scene {index}: {name}",
  scenePreview: "Scene {index}",
  thumbnailLabel: "Thumbnail",
});

Object.assign(en.products.videoStudio.steps, {
  advancedBatch: "Advanced batch production",
  batchDescription:
    "Plan up to 100 videos · generate up to 50 per request (chunk with offset) · rotate presenters, voices, scenes",
  planOnly: "Plan only",
  continueFrom: "Continue from #{index}",
  videosCount: "{count} videos",
  batchProgress: "{completed}/{total} done · {failed} failed",
  batchCredits: "Credits {spent}/{estimated} · {percent}%",
  templateMarketplace: "Template marketplace",
  scalableTemplates: "{count} scalable templates across industries",
  chooseVideoType: "Or choose a video type",
  productionOptions: "Production Options",
  numberOfScenes: "Number of scenes",
});

Object.assign(en.products.videoStudio.management, {
  timelineDescription: "Visual track · trim · reorder · replace scene / voice / music",
  qualityTitle: "Quality · {score}",
  presenterLabel: "Presenter",
  locationLabel: "Location",
  contentLabel: "Content",
  assemblyLabel: "Assembly",
  renderLabel: "Render",
  clipsProgress: "{completed}/{total} clips",
  clipReady: "clip ready",
  noClip: "no clip",
  editScript: "Edit script",
  trim25: "Trim −25%",
  replaceVisual: "Replace visual",
  saveScript: "Save script",
  replaceMusic: "Replace music",
  reverseSceneOrder: "Reverse scene order (demo)",
  previewRenderBtn: "Preview render",
  fullMp4Render: "Full MP4 / WebM render",
  avatarRender: "Avatar render",
  resumeAsyncJobs: "Resume async jobs",
  retryFailedClips: "Retry failed clips",
  lipSync: "Lip sync",
  bodyLabel: "Body",
  voiceLabel: "Voice",
  languagesLabel: "Languages",
  generateAvatarClip: "Generate real avatar clip",
  socialExportDescription: "Aspect ratios, quality presets, and caption packages",
  publishReady: " · publish-ready",
  openVideoAsset: "Open video asset",
  mediaLibraryDescription: "Stored clips, audio, and thumbnails (not JSONB-only)",
  noMediaYet: "No media yet. Run Full MP4 render or Real TTS.",
  previewLink: "Preview",
  signUrl: "Sign URL",
  synthesizeVoicePreview: "Synthesize voice preview",
  rebuildSubtitles: "Rebuild subtitles",
  saveSubtitleCues: "Save subtitle cues",
  cueLinesPlaceholder: "Cue lines…",
});

en.products.videoStudio.placeholders.batchExample =
  "Example: Create 20 motivational videos about discipline and morning routines";
en.products.videoStudio.labels.allIndustries = "All industries";

Object.assign(en.products.webappBuilder.preview, {
  liveAppPreview: "Live app preview",
  liveAppPreviewDescription: "Sandbox runtime from your generated app model",
  livePreviewIframeTitle: "Generated app live preview",
  openLivePreview: "Open Live Preview",
});

Object.assign(en.products.webappBuilder.steps, {
  orChooseAppType: "Or choose an app type",
  describeYourApp: "Describe your app",
  generateWebApp: "Generate Web App",
});

Object.assign(en.products.webappBuilder.generating, {
  titleLong: "Generating your web app...",
  subtitleLong: "This may take 1-3 minutes depending on complexity",
});

en.products.webappBuilder.placeholders.appBriefContinue =
  "Example: Add a dark mode toggle, simplify the dashboard layout, and add export to CSV...";
en.products.webappBuilder.placeholders.appBriefNew =
  "Describe the web application you want to build in detail...";

Object.assign(en.products.imageGenerator.preview, {
  aiPrompt: "AI Prompt",
  negativeLabel: "Negative",
  moodBoardKeywords: "Mood Board Keywords",
  colorDirection: "Color Direction: {value}",
  styleLabel: "Style: {value}",
});

Object.assign(en.products.imageGenerator.steps, {
  templateGalleryDescription: "Start from social, ad, product, or business templates",
  chooseImageType: "Choose Image Type",
  chooseImageTypeDescription: "Select the type of image you want to generate",
  negativePrompt: "Negative prompt",
  numberOfVariations: "Number of variations",
  generateImages: "Generate {count} Images",
});

en.products.imageGenerator.history = {
  count: "{count} image",
  countPlural: "{count} images",
};

Object.assign(en.products.brandIdentity.steps, {
  templateGalleryDescription: "Start from a professional industry or style template",
  orChooseBrandType: "Or choose a brand type",
  customBrandIdentity: "{type} Brand Identity",
  defineBrandDescription: "Define your brand and select deliverables",
  brandVision: "Describe your brand vision *",
  generateBrandIdentity: "Generate Brand Identity",
  selectIndustry: "Select industry",
  targetAudience: "Target Audience",
});

Object.assign(en.products.brandIdentity.generating, {
  titleLong: "Building your brand identity...",
  subtitleLong: "AI is crafting strategy, visual system, voice guidelines, and assets",
});

en.products.brandIdentity.errors.enterBusinessIdea =
  "Enter your business idea to generate a brand system.";
en.products.brandIdentity.placeholders.brandNameExample = "e.g. Trend Business";
en.products.brandIdentity.placeholders.targetAudienceExample =
  "e.g. Young professionals, tech-savvy entrepreneurs";
en.products.brandIdentity.placeholders.brandVisionContinue =
  "Example: Make the tone more playful, expand the color palette with earth tones, and add social media templates...";
en.products.brandIdentity.placeholders.brandVisionNew =
  "Describe your brand, its mission, values, the identity you envision, and what makes it unique...";
en.products.brandIdentity.history = {
  count: "{count} brand",
  countPlural: "{count} brands",
  emptyNoun: "brand identities",
};

write("locales/en.json", JSON.stringify(en, null, 2) + "\n");
console.log("expanded en.json");
