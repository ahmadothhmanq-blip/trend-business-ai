#!/usr/bin/env node
/** Add missing websiteBuilder keys used by wire script */
import fs from "node:fs";

const en = JSON.parse(fs.readFileSync("locales/en.json", "utf8"));
const wb = en.products.websiteBuilder;

Object.assign(wb.sections, {
  strategy: wb.sections.strategy ?? "Strategy",
  designSystem: wb.sections.designSystem ?? "Design system",
  websiteStructure: wb.sections.websiteStructure ?? "Website Structure",
  generatedResult: wb.sections.generatedResult ?? "Generated Result",
  quality: wb.sections.quality ?? "Website Quality Report",
});

Object.assign(wb.sectionDescriptions, {
  projectType: wb.sectionDescriptions.projectType ?? "Choose a website or application architecture. DeepSeek will also auto-detect from your prompt.",
  features: wb.sectionDescriptions.features ?? "Select the capabilities this project needs.",
  websiteStructure: wb.sectionDescriptions.websiteStructure ?? "Pages and flow generated from your brief.",
  generatedResult: wb.sectionDescriptions.generatedResult ?? "DeepSeek output for this project.",
  generationStatus: wb.sectionDescriptions.generationStatus ?? "Live server status during generation.",
  recentProjects: wb.sectionDescriptions.recentProjects ?? "Review generated interface concepts.",
  templates: wb.sectionDescriptions.templates ?? "Click a card to review details, then Use Template.",
  favorites: wb.sectionDescriptions.favorites ?? "Pinned workspace concepts.",
});

Object.assign(wb.labels, {
  website: "Website",
  files: "Files",
  status: "Status",
  publicUrl: "Public URL",
  typicalTime: "Typical Time",
  typicalTimeValue: "1-3 min",
  favorite: "Favorite",
  assets: "Assets",
  notCreatedYet: "Not created yet",
  hideAdvanced: "Hide advanced settings",
  showAdvanced: "Show advanced settings",
});

Object.assign(wb.placeholders, {
  searchFiles: "Search files...",
});

wb.resultLists = {
  sections: "Sections",
  colorPalette: "Color Palette",
  typography: "Typography",
  components: "Components",
  content: "Content",
  seo: "SEO",
  roadmap: "Roadmap",
};

Object.assign(wb.meta, {
  eyebrow: "Website and app generation workspace",
});

Object.assign(wb.actions, {
  createWebsite: "Create Website",
});

Object.assign(wb.publish, {
  description: "Publish a public, SEO-ready URL for this version (/w/{slug}).",
  notPublished: "Not published",
});

Object.assign(wb.preview, {
  description: "Compiled generated project rendered in a sandbox.",
});

Object.assign(wb.seoAgent, {
  improvementSuggestions: "AI Improvement Suggestions",
});

Object.assign(wb.toasts, {
  websiteCreated: wb.toasts.createdAndSaved,
  projectDuplicated: wb.toasts.duplicated,
  projectDeleted: wb.toasts.deleted,
  projectRenamed: wb.toasts.renamed,
  zipDownloadStarted: wb.toasts.zipStarted,
  templateApplied: wb.templates?.applied ?? "Visual template applied.",
  addedToFavorites: wb.favorites?.added,
  removedFromFavorites: wb.favorites?.removed,
});

Object.assign(wb.stream, {
  connectionInterrupted: "Connection interrupted — recovering saved progress…",
  generationFailedResume: "Generation failed — you can Resume from saved progress.",
  stillGenerating: "Still generating on server…",
  websiteSaved: "Website saved to workspace.",
  applyingEdit: "Website Editor Intelligence: applying edit…",
  editSaved: "Website edit saved.",
  runningOptimizer: "Running AI Website Optimizer…",
  resuming: "Resuming generation from saved progress…",
  connecting: "Connecting to AI website engine...",
  aiAutoDesign: "AI Auto Design: analyzing industry, audience & brand style…",
});

fs.writeFileSync("locales/en.json", JSON.stringify(en, null, 2) + "\n");
console.log("Patched en.json websiteBuilder keys");
