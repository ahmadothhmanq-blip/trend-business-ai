#!/usr/bin/env node
/**
 * Wire website-builder-tool.tsx to products.websiteBuilder i18n keys.
 * Run: node scripts/wire-website-builder-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";

const file = path.join(
  process.cwd(),
  "components/dashboard/website-builder-tool.tsx",
);
let c = fs.readFileSync(file, "utf8");

if (!c.includes("useProductT")) {
  c = c.replace(
    'import { translateOption } from "@/lib/i18n/product-options";',
    'import { translateOption } from "@/lib/i18n/product-options";\nimport { useProductT } from "@/lib/i18n/use-scoped-t";',
  );
}

if (!c.includes("const wb = useProductT")) {
  c = c.replace(
    "const { t } = useTranslation();",
    "const { t } = useTranslation();\n  const wb = useProductT(\"websiteBuilder\");",
  );
}

const replacements = [
  // Section headers
  ['title="Project Type"', 'title={wb("sections.projectType")}'],
  ['description="Choose a website or application architecture. DeepSeek will also auto-detect from your prompt."', 'description={wb("sectionDescriptions.projectType")}'],
  ['title="Color Theme" description="Pick the primary brand mood."', 'title={wb("sections.colorTheme")} description={wb("sectionDescriptions.colorTheme")}'],
  ['title="Language" description="Select output language."', 'title={wb("sections.outputLanguage")} description={wb("sectionDescriptions.language")}'],
  ['title="Features" description="Select the capabilities this project needs."', 'title={wb("sections.features")} description={wb("sectionDescriptions.features")}'],
  ['title={wb("products.websiteBuilder.designStyle")}', 'title={wb("sections.designStyle")}'],
  ['description={wb("products.websiteBuilder.designStyleDescription")}', 'description={wb("sectionDescriptions.designStyle")}'],
  ['title="Website Quality Report"', 'title={wb("sections.quality")}'],
  ['title="AI Improvement Suggestions"', 'title={wb("seoAgent.improvementSuggestions")}'],
  ['title="Strategy"', 'title={wb("sections.strategy")}'],
  ['title="Design system"', 'title={wb("sections.designSystem")}'],
  ['title="Assets"', 'title={wb("labels.assets")}'],
  ['title="Publish website"', 'title={wb("publish.title")}'],
  ['description="Publish a public, SEO-ready URL for this version (/w/{slug})."', 'description={wb("publish.description")}'],
  ['title="Live Preview"', 'title={wb("preview.title")}'],
  ['description="Compiled generated project rendered in a sandbox."', 'description={wb("preview.description")}'],
  ['title="Website Structure"', 'title={wb("sections.websiteStructure")}'],
  ['description="Pages and flow generated from your brief."', 'description={wb("sectionDescriptions.websiteStructure")}'],
  ['title="Generated Result"', 'title={wb("sections.generatedResult")}'],
  ['description="DeepSeek output for this project."', 'description={wb("sectionDescriptions.generatedResult")}'],
  ['title="Progress"', 'title={wb("sections.generationStatus")}'],
  ['description="Live server status during generation."', 'description={wb("sectionDescriptions.generationStatus")}'],
  ['title="Recent Projects"', 'title={wb("sections.recentProjects")}'],
  ['description="Review generated interface concepts."', 'description={wb("sectionDescriptions.recentProjects")}'],
  ['title="Templates"', 'title={wb("labels.templates")}'],
  ['description="Click a card to review details, then Use Template."', 'description={wb("sectionDescriptions.templates")}'],
  ['title="Favorites"', 'title={wb("labels.favorites")}'],
  ['description="Pinned workspace concepts."', 'description={wb("sectionDescriptions.favorites")}'],
  // Labels
  ['label="Website"', 'label={wb("labels.website")}'],
  ['label="Files"', 'label={wb("labels.files")}'],
  ['label="Status"', 'label={wb("labels.status")}'],
  ['label="Public URL"', 'label={wb("labels.publicUrl")}'],
  ['label="Typical Time"', 'label={wb("labels.typicalTime")}'],
  ['label="Language"', 'label={wb("labels.language")}'],
  ['label="Favorite"', 'label={wb("labels.favorite")}'],
  ['label="Duplicate"', 'label={wb("labels.duplicate")}'],
  ['label="Download"', 'label={wb("labels.downloadZip")}'],
  ['label="Delete"', 'label={wb("labels.delete")}'],
  // Placeholders
  ['placeholder="Project name"', 'placeholder={wb("placeholders.rename")}'],
  ['placeholder="Search files..."', 'placeholder={wb("placeholders.searchFiles")}'],
  // Result lists
  ['title="Sections"', 'title={wb("resultLists.sections")}'],
  ['title="Color Palette"', 'title={wb("resultLists.colorPalette")}'],
  ['title="Typography"', 'title={wb("resultLists.typography")}'],
  ['title="Components"', 'title={wb("resultLists.components")}'],
  ['title="Content"', 'title={wb("resultLists.content")}'],
  ['title="SEO"', 'title={wb("resultLists.seo")}'],
  ['title="Roadmap"', 'title={wb("resultLists.roadmap")}'],
  // UI text
  ['{advancedOpen ? "Hide advanced settings" : "Show advanced settings"}', '{advancedOpen ? wb("labels.hideAdvanced") : wb("labels.showAdvanced")}'],
  ['{isGenerating ? "Designing" : "Ready"}', '{isGenerating ? wb("labels.designing") : wb("labels.ready")}'],
  ['{product?.generateLabel ?? "Create Website"}', '{product?.generateLabel ?? wb("actions.createWebsite")}'],
  ['<span>{streamStatus ?? "Generation in progress"}</span>', '<span>{streamStatus ?? wb("statuses.generating")}</span>'],
  ['title={editMode ? "Improve with AI" : "Website brief"}', 'title={editMode ? wb("sections.improveWithAi") : wb("sections.websiteBrief")}'],
  // Toasts - common patterns
  ['toast.error("Select a saved website first.");', 'toast.error(wb("toasts.selectWebsiteFirst"));'],
  ['toast.error("Create or select a website first.");', 'toast.error(wb("toasts.createOrSelectFirst"));'],
  ['toast.success("Website created and saved. Review the preview, then improve with AI.");', 'toast.success(wb("toasts.websiteCreated"));'],
  ['toast.success("Project duplicated")', 'toast.success(wb("toasts.projectDuplicated"))'],
  ['toast.success("Project deleted")', 'toast.success(wb("toasts.projectDeleted"))'],
  ['toast.success("Project renamed")', 'toast.success(wb("toasts.projectRenamed"))'],
  ['toast.success("File copied to clipboard")', 'toast.success(wb("toasts.fileCopied"))'],
  ['toast.success("ZIP download started")', 'toast.success(wb("toasts.zipDownloadStarted"))'],
  ['toast.success("Visual template applied — content & images preserved.")', 'toast.success(wb("toasts.templateApplied"))'],
  ['toast.success("SEO fix applied.")', 'toast.success(wb("toasts.seoFixApplied"))'],
  ['toast.message("Edit the instruction, then click Improve with AI.")', 'toast.message(wb("toasts.editInstructionHint"))'],
  ['project.favorite ? "Removed from favorites" : "Added to favorites"', 'project.favorite ? wb("toasts.removedFromFavorites") : wb("toasts.addedToFavorites")'],
  ['value={publishStatus === "none" ? "Not published" : publishStatus}', 'value={publishStatus === "none" ? wb("publish.notPublished") : publishStatus}'],
  ['value={activeProject?.title ?? "Not created yet"}', 'value={activeProject?.title ?? wb("labels.notCreatedYet")}'],
  ['value="1-3 min"', 'value={wb("labels.typicalTimeValue")}'],
  // Stream status
  ['onStatus("Connection interrupted — recovering saved progress…");', 'onStatus(wb("stream.connectionInterrupted"));'],
  ['"Generation failed — you can Resume from saved progress."', 'wb("stream.generationFailedResume")'],
  ['"Still generating on server…"', 'wb("stream.stillGenerating")'],
  ['setStreamStatus("Website saved to workspace.");', 'setStreamStatus(wb("stream.websiteSaved"));'],
  ['setStreamStatus("Website Editor Intelligence: applying edit…");', 'setStreamStatus(wb("stream.applyingEdit"));'],
  ['setStreamStatus("Website edit saved.");', 'setStreamStatus(wb("stream.editSaved"));'],
  ['"Running AI Website Optimizer…"', 'wb("stream.runningOptimizer")'],
  ['"Resuming generation from saved progress…"', 'wb("stream.resuming")'],
  ['"Connecting to AI website engine..."', 'wb("stream.connecting")'],
  ['"AI Auto Design: analyzing industry, audience & brand style…"', 'wb("stream.aiAutoDesign")'],
  // Meta
  ['{product?.eyebrow ?? "Website and app generation workspace"}', '{product?.eyebrow ?? wb("meta.eyebrow")}'],
  ['{product?.title ?? "AI Website & App Builder"}', '{product?.title ?? wb("meta.title")}'],
];

let count = 0;
for (const [from, to] of replacements) {
  if (c.includes(from) && from !== to) {
    c = c.split(from).join(to);
    count++;
  }
}

// Add missing keys to en.json if needed via checking - skip for now

fs.writeFileSync(file, c);
console.log(`Applied ${count} replacements to website-builder-tool.tsx`);
