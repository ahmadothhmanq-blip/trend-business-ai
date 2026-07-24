#!/usr/bin/env node
/** Final Website Builder i18n wiring pass */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function patchFile(rel, replacements) {
  const file = path.join(ROOT, rel);
  let c = fs.readFileSync(file, "utf8");
  let n = 0;
  for (const [from, to] of replacements) {
    if (c.includes(from)) {
      c = c.replaceAll(from, to);
      n++;
    }
  }
  fs.writeFileSync(file, c);
  return n;
}

const tool = "components/dashboard/website-builder-tool.tsx";
const mgmt = "components/dashboard/website-builder/website-management-dashboard.tsx";
const deploy = "components/dashboard/website-builder/deployment-dashboard-panel.tsx";
const seo = "components/dashboard/website-builder/seo-agent-panel.tsx";
const exp = "components/dashboard/website-builder/experiments-panel.tsx";
const analytics = "components/dashboard/website-builder/analytics-intelligence-panel.tsx";

let total = 0;

total += patchFile(tool, [
  ['One Prompt · Idea → Strategy → Design → Assets → Generation → Quality → Ready', '{wb("hero.tagline")}'],
  ['Generation status', '{wb("sections.generationStatus")}'],
  ['streamStatus ?? "Generating..."', 'streamStatus ?? wb("stream.generating")'],
  ['Editing <span className="font-semibold text-white">{activeProject.title}</span>.\n                Previous version stays in history. Example: "Change colors to navy and gold, add a Pricing page, tighten the hero copy."', '{wb("editMode.editing")} <span className="font-semibold text-white">{activeProject.title}</span>. {wb("editMode.historyNote")} {wb("editMode.exampleInline")}'],
  ['<p className="font-semibold text-white">AI Auto Design ready</p>', '<p className="font-semibold text-white">{wb("hints.aiAutoDesignReady")}</p>'],
  ['Marketplace template ready', '{wb("hints.marketplaceTemplateReady")}'],
  ['seeds Design Intelligence, Brand Identity, Assets, Editor, Quality', '{wb("hints.seedsPipeline")}'],
  ['Browse all', '{wb("labels.browseAll")}'],
  ['>Clear<', '>{wb("labels.clear")}<'],
  ['Template Intelligence selected', '{wb("hints.templateIntelligenceSelected")}'],
  ['auto layout, theme & components for generation', '{wb("hints.autoLayoutTheme")}'],
  ['Browse Template Marketplace →', '{wb("hints.browseMarketplace")}'],
  ['Examples', '{wb("labels.examples")}'],
  ['Resume generation', '{wb("stream.resumeGeneration")}'],
  ['<DialogTitle>Rename Project</DialogTitle>', '<DialogTitle>{wb("dialogs.renameTitle")}</DialogTitle>'],
  ['Update the saved project name in your workspace history.', '{wb("dialogs.renameDescriptionWorkspace")}'],
  ['>Cancel<', '>{t("common.cancel")}<'],
  ['>Save<', '>{t("common.save")}<'],
  ['"Design, SEO, performance, and UX readiness"', 'wb("qualityScores.description")'],
  ['["Overall", overallScore]', '[wb("qualityScores.overall"), overallScore]'],
  ['["Design", designScore]', '[wb("qualityScores.design"), designScore]'],
  ['["SEO", seoScore]', '[wb("qualityScores.seo"), seoScore]'],
  ['["UX", uxScore]', '[wb("qualityScores.ux"), uxScore]'],
  ['["Perf", perfScore]', '[wb("qualityScores.perf"), perfScore]'],
  ['` · Keyword: "', '` · ${wb("qualityScores.keyword")}: "'],
  ['` · Goal: ${conversion.goal.goal}`', '` · ${wb("qualityScores.goal")}: ${conversion.goal.goal}`'],
  ['Applied: {project.optimizationReport.appliedFixes.slice(0, 3).join(" · ")}', '{wb("qualityScores.applied")}: {project.optimizationReport.appliedFixes.slice(0, 3).join(" · ")}'],
  ['"Design, UX, conversion, and missing-section ideas from Website Editor Intelligence"', 'wb("designEngine.editorSuggestionsDescription")'],
  ['>Apply<', '>{wb("designEngine.apply")}<'],
  ['Or type a natural-language edit (e.g. "Improve luxury feeling") and use Improve with AI.', '{wb("designEngine.editHint")}'],
  ['Sitemap: {strategy.sitemap.join(" → ")}', '{wb("designEngine.sitemap")}: {strategy.sitemap.join(" → ")}'],
  ['CTAs: {strategy.ctas.slice(0, 3).join(", ")}', '{wb("designEngine.ctas")}: {strategy.ctas.slice(0, 3).join(", ")}'],
  ['Voice: {strategy.contentStrategy.brandVoice}', '{wb("designEngine.voice")}: {strategy.contentStrategy.brandVoice}'],
  ['Sections: {profile.requiredSections.slice(0, 5).join(", ")}', '{wb("designEngine.sections")}: {profile.requiredSections.slice(0, 5).join(", ")}'],
  ['"Refine positioning, sitemap, and conversion CTAs for higher conversions."', 'wb("designEngine.improveStrategyHint")'],
  ['Improve strategy', '{wb("designEngine.improveStrategy")}'],
  ['Preset: {design.stylePreset ?? "modern"} · Pattern:', '{wb("designEngine.preset")}: {design.stylePreset ?? "modern"} · {wb("designEngine.pattern")}:'],
  ['"Refresh the color system, typography, and layout rules for a more premium look."', 'wb("designEngine.improveDesignHint")'],
  ['Improve design', '{wb("designEngine.improveDesign")}'],
  ['? `Provider: ${project.assetManifest.provider}`', '? `${wb("designEngine.provider")}: ${project.assetManifest.provider}`'],
  ['QA: {quality.weakSections.slice(0, 2).join("; ")}', '{wb("designEngine.qa")}: {quality.weakSections.slice(0, 2).join("; ")}'],
  ['"Regenerate hero and section visuals to better match the brand and audience."', 'wb("designEngine.improveAssetsHint")'],
  ['Improve assets', '{wb("designEngine.improveAssets")}'],
  ['Open live preview', '{wb("previewExport.openLivePreview")}'],
  ['Improve with AI', '{wb("actions.createWebsite").replace("Create Website", "Improve with AI")}'],
  ['Download ZIP', '{wb("labels.downloadZip")}'],
  ['Sandboxed live preview (no npm install). Navigate pages inside the preview. ZIP remains\n          available for full Next.js export.', '{wb("previewExport.sandboxHint")}'],
  ['Pre-publish quality', '{wb("qualityScores.prePublish")}'],
  ['<p className="text-[10px] text-white/40">SEO</p>', '<p className="text-[10px] text-white/40">{wb("qualityScores.seo")}</p>'],
  ['<p className="text-[10px] text-white/40">Perf</p>', '<p className="text-[10px] text-white/40">{wb("qualityScores.perf")}</p>'],
  ['<p className="text-[10px] text-white/40">Mobile</p>', '<p className="text-[10px] text-white/40">{wb("qualityScores.mobile")}</p>'],
  ['Ready for public publishing', '{wb("qualityScores.readyForPublishing")}'],
  ['Review quality & prepare', '{wb("qualityScores.reviewPrepare")}'],
  ['Publishing…', '{wb("qualityScores.publishing")}'],
  ['Open public URL', '{wb("previewExport.openPublicUrl")}'],
  ['>Unpublish<', '>{wb("publish.unpublishAction")}<'],
  ['In-platform website preview · sandboxed static delivery', '{wb("previewExport.liveDialogDescription")}'],
  ['>Improve<', '>{wb("previewExport.improve")}<'],
  ['>ZIP<', '>{wb("previewExport.zip")}<'],
  ['>Refresh<', '>{wb("previewExport.refresh")}<'],
  ['>Open<', '>{wb("previewExport.open")}<'],
  ['activeProject?.title ?? "Generated project"} live preview`', 'activeProject?.title ?? wb("previewExport.generatedProject")} ${wb("previewExport.livePreviewSuffix")}`'],
  ['activeProject?.title ?? "Premium Project Concept"', 'activeProject?.title ?? wb("previewExport.premiumConcept")'],
  ['"A polished website and app structure will appear here after you generate the interface concept."', 'wb("previewExport.conceptDescription")'],
  ['<p className="text-[11px] text-white/35">Style</p>', '<p className="text-[11px] text-white/35">{wb("labels.style")}</p>'],
  ['<p className="text-[11px] text-white/35">Theme</p>', '<p className="text-[11px] text-white/35">{wb("labels.theme")}</p>'],
  ['The generated React, Next.js and Tailwind files are compiling inside a temporary project.', '{wb("previewExport.buildingDescription")}'],
  ['Prompt Used', '{wb("workspaceMeta.promptUsed")}'],
  ['Generation Metadata', '{wb("workspaceMeta.generationMetadata")}'],
  ['<p>Kind: {project?.projectKind ?? "Unknown"}</p>', '<p>{wb("workspaceMeta.kind")}: {project?.projectKind ?? wb("workspaceMeta.unknown")}</p>'],
  ['<p>Generated: {project?.generatedAt ? formatGenerationDate(project.generatedAt) : "Unknown"}</p>', '<p>{wb("workspaceMeta.generated")}: {project?.generatedAt ? formatGenerationDate(project.generatedAt) : wb("workspaceMeta.unknown")}</p>'],
  ['<p>Files: {project?.files.length ?? 0}</p>', '<p>{wb("workspaceMeta.fileCount")}: {project?.files.length ?? 0}</p>'],
  ['<p className="font-semibold text-white">Project Settings</p>', '<p className="font-semibold text-white">{wb("sections.projectSettings")}</p>'],
  ['<p>Framework: {project?.settings?.framework ?? "Next.js App Router"}</p>', '<p>{wb("workspaceMeta.framework")}: {project?.settings?.framework ?? wb("workspaceMeta.defaultFramework")}</p>'],
  ['<p>Styling: {project?.settings?.styling ?? "Tailwind CSS"}</p>', '<p>{wb("workspaceMeta.styling")}: {project?.settings?.styling ?? wb("workspaceMeta.defaultStyling")}</p>'],
  ['<p>Package manager: {project?.settings?.packageManager ?? "npm"}</p>', '<p>{wb("workspaceMeta.packageManager")}: {project?.settings?.packageManager ?? "npm"}</p>'],
  ['<p>Deploy: {project?.settings?.deploymentTarget ?? "Vercel or Node hosting"}</p>', '<p>{wb("workspaceMeta.deployTarget")}: {project?.settings?.deploymentTarget ?? wb("workspaceMeta.defaultDeploy")}</p>'],
  ['Open Settings Page', '{wb("workspaceMeta.openSettingsPage")}'],
  ['AI Actions', '{wb("workspaceMeta.aiActions")}'],
  ['Rename Project', '{wb("workspaceMeta.renameProject")}'],
  ['Toggle Favorite', '{wb("workspaceMeta.toggleFavorite")}'],
  ['activeProject?.title ?? "No generated project yet"', 'activeProject?.title ?? wb("previewExport.noProjectYet")'],
  ['"Compiled Next.js export is loaded below."', 'wb("previewExport.compiledLoaded")'],
  ['"Generate a project to build and render the live preview."', 'wb("previewExport.generateToPreview")'],
  ['Refresh Preview', '{wb("previewExport.refreshPreview")}'],
  ['Open in New Tab', '{wb("previewExport.openInNewTab")}'],
  ['activeProject?.title ?? "Generated project"} full preview`', 'activeProject?.title ?? wb("previewExport.generatedProject")} ${wb("previewExport.fullPreviewSuffix")}`'],
  ['The generated files are being written to a temporary project and compiled.', '{wb("previewExport.buildingFilesDescription")}'],
  ['Generate a website or web app to build and render the real project.', '{wb("previewExport.generateToRender")}'],
  ['<p className="font-semibold">Build failed</p>', '<p className="font-semibold">{wb("panels.buildFailed")}</p>'],
  ['Optimized sections, pages and components for this product type.', '{wb("choiceCard.description")}'],
  [': "ZIP download started"', ': wb("toasts.zipDownloadStarted")'],
  ['onStatus("Connection interrupted — recovering saved progress…")', 'onStatus(wb("stream.connectionInterrupted"))'],
  ['"Generation failed — you can Resume from saved progress."', 'wb("stream.generationFailedResume")'],
  [': "Still generating on server…"', ': wb("stream.stillGenerating")'],
]);

// Fix improve with AI button - use a proper key
let toolContent = fs.readFileSync(path.join(ROOT, tool), "utf8");
toolContent = toolContent.replace(
  '{wb("actions.createWebsite").replace("Create Website", "Improve with AI")}',
  '{wb("sections.improveWithAi")}',
);
fs.writeFileSync(path.join(ROOT, tool), toolContent);

total += patchFile(mgmt, [
  ['"Failed to load"', 'wb("management.errors.loadFailed")'],
  ['"Action failed"', 'wb("management.errors.actionFailed")'],
  ['json.notes?.[0] || "Saved"', 'json.notes?.[0] || wb("management.saved")'],
  ['error.message : "Failed"', 'error.message : wb("management.failed")'],
  ['Loading website management…', '{wb("management.loading")}'],
  ['Back to Website Builder', '{wb("management.backToBuilder")}'],
  ['"Website Management"', 'wb("management.title")'],
  ['"Business"} · manage content, brand, catalog & quality', 'wb("management.business")} · {wb("management.subtitle")'],
  ['Open editor', '{wb("management.openEditor")}'],
  ['Re-check quality', '{wb("management.recheckQuality")}'],
  ['>Pages<', '>{wb("management.pages")}<'],
  ['>Navigation<', '>{wb("management.navigation")}<'],
  ['Quality score{" "}', '{wb("management.qualityScore")}{" "}'],
  ['? " · Ready" : " · Needs fixes"', '? ` · ${wb("management.ready")}` : ` · ${wb("management.needsFixes")}`'],
  ['Business catalog', '{wb("management.businessCatalog")}'],
  ['title: "New item"', 'title: wb("management.catalog.newItem")'],
  ['price: "Custom"', 'price: wb("management.customPrice")'],
  ['description: "Added from management dashboard"', 'description: wb("management.catalog.newItemDescription")'],
  ['Add item', '{wb("management.addItem")}'],
  ['window.prompt("New price", item.price || "")', 'window.prompt(wb("management.catalog.pricePrompt"), item.price || "")'],
  ['Edit price', '{wb("management.editPrice")}'],
  ['>Delete<', '>{t("common.delete")}<'],
  ['Content management', '{wb("management.contentManagement")}'],
  ['placeholder="Content title"', 'placeholder={wb("management.cms.titlePlaceholder")}'],
  ['placeholder="Body / announcement / media note"', 'placeholder={wb("management.bodyPlaceholder")}'],
  ['Publish content', '{wb("management.publishContent")}'],
  ['? ` · scheduled ${entry.scheduledAt}`', '? ` · ${wb("management.scheduled")} ${entry.scheduledAt}`'],
  ['Brand management', '{wb("management.brandManagement")}'],
  ['["businessName", "Business name"]', '["businessName", wb("management.brand.businessName")]'],
  ['["logoUrl", "Logo URL"]', '["logoUrl", wb("management.logoUrl")]'],
  ['["primary", "Primary color"]', '["primary", wb("management.brand.primary")]'],
  ['["secondary", "Secondary color"]', '["secondary", wb("management.brand.secondary")]'],
  ['["accent", "Accent color"]', '["accent", wb("management.brand.accent")]'],
  ['["displayFont", "Display font"]', '["displayFont", wb("management.brand.displayFont")]'],
  ['["bodyFont", "Body font"]', '["bodyFont", wb("management.brand.bodyFont")]'],
  ['Apply brand to website', '{wb("management.applyBrand")}'],
  ['Form leads', '{wb("management.formLeads")}'],
  ['No leads yet.', '{wb("management.noLeads")}'],
  ['placeholder="Tell the assistant what to change…"', 'placeholder={wb("management.assistant.placeholder")}'],
  ['? "Ready to publish" : "Blocked"', '? wb("management.quality.readyToPublish") : wb("management.quality.blocked")'],
]);

// Add useTranslation to management dashboard
let mgmtContent = fs.readFileSync(path.join(ROOT, mgmt), "utf8");
if (!mgmtContent.includes("useTranslation")) {
  mgmtContent = mgmtContent.replace(
    'import { useProductT } from "@/lib/i18n/use-scoped-t";',
    'import { useProductT } from "@/lib/i18n/use-scoped-t";\nimport { useTranslation } from "@/lib/i18n/use-translation";',
  );
  mgmtContent = mgmtContent.replace(
    "const wb = useProductT(\"websiteBuilder\");",
    'const { t } = useTranslation();\n  const wb = useProductT("websiteBuilder");',
  );
  fs.writeFileSync(path.join(ROOT, mgmt), mgmtContent);
}

total += patchFile(deploy, [
  ['Loading deployment dashboard…', '{wb("panels.loadingDeployment")}'],
  ['Publishing & Domains', '{wb("panels.publishingDomains")}'],
  ['{dashboard.projectName || "Website"} deployment', '{wb("panels.deploymentTitle", { name: dashboard.projectName || wb("labels.website") })}'],
  ['Publish instantly, connect custom domains, and track SSL + deployment\n            history. Integrates with Analytics and SEO Agent readiness.', '{wb("panels.deploymentDescription")}'],
  ['>Prepare<', '>{wb("panels.prepare")}<'],
  ['{isPublished ? "Update & republish" : "Publish"}', '{isPublished ? wb("panels.updateRepublish") : wb("panels.publish")}'],
  ['label="Status"', 'label={wb("panels.status")}'],
  ['label="Website URL"', 'label={wb("panels.websiteUrl")}'],
  ['? "Ready" : "—"', '? wb("panels.ready") : "—"'],
  ['label="SSL"', 'label={wb("panels.ssl")}'],
  ['label="Integrations"', 'label={wb("panels.integrations")}'],
  ['dashboard.analyticsReady ? "Analytics" : null', 'dashboard.analyticsReady ? wb("sections.analytics") : null'],
  ['dashboard.seoAgentReady ? "SEO" : null', 'dashboard.seoAgentReady ? wb("sections.seo") : null'],
  ['<h4 className="text-sm font-semibold text-white">Website URL</h4>', '<h4 className="text-sm font-semibold text-white">{wb("panels.websiteUrl")}</h4>'],
  ['Open <ExternalLink', '{wb("panels.open")} <ExternalLink'],
  ['label="Subdomain"', 'label={wb("panels.subdomain")}'],
  ['>Unpublish<', '>{wb("panels.unpublish")}<'],
  ['>Archive<', '>{wb("panels.archive")}<'],
  ['Domain settings', '{wb("panels.domainSettings")}'],
  ['Connect customer.com with CNAME / A records and TXT verification. SSL\n          provisioning is marked ready after successful verification.', '{wb("panels.domainSettingsHint")}'],
  ['placeholder="www.yourdomain.com"', 'placeholder={wb("panels.domainPlaceholder")}'],
  ['Connect domain', '{wb("panels.connectDomain")}'],
  ['No domains yet. Platform subdomain appears after publish when a\n              username handle is available.', '{wb("panels.noDomainsYet")}'],
  ['Deployment history', '{wb("panels.deploymentHistory")}'],
  ['? `Published${data.publicUrl ? `: ${data.publicUrl}` : ""}`', '? wb("panels.publishedToast", { url: data.publicUrl ? `: ${data.publicUrl}` : "" })'],
  [': `Deployment: ${action}`', ': wb("panels.deploymentAction", { action })'],
]);

total += patchFile(seo, [
  ['"Failed to load SEO Agent"', 'wb("panels.failedLoadSeo")'],
  ['Generate or select a website to open the AI SEO Agent.', '{wb("panels.selectWebsiteSeo")}'],
  ['Running AI SEO Agent…', '{wb("panels.runningSeoAgent")}'],
  ['AI SEO Agent', '{wb("panels.aiSeoAgent")}'],
  ['{data.projectName || "Website"} SEO intelligence', '{wb("panels.seoIntelligenceTitle", { name: data.projectName || wb("labels.website") })}'],
  ['Google Search, AI Overviews, ChatGPT Search, Gemini, and Perplexity —\n            titles, meta, headings, keywords, schema, and Apply Fix actions.', '{wb("panels.seoDescription")}'],
  ['Re-analyze', '{wb("panels.reAnalyze")}'],
  ['SEO Score', '{wb("panels.seoScoreLabel")}'],
  ['Optimized assets', '{wb("panels.optimizedAssets")}'],
  ['<dt className="text-white/35">SEO title</dt>', '<dt className="text-white/35">{wb("panels.seoTitle")}</dt>'],
  ['<dt className="text-white/35">Meta description</dt>', '<dt className="text-white/35">{wb("panels.metaDescription")}</dt>'],
  ['<dt className="text-white/35">Target keywords</dt>', '<dt className="text-white/35">{wb("panels.targetKeywords")}</dt>'],
]);

total += patchFile(exp, [
  ['Generate or select a website to run A/B experiments.', '{wb("panels.selectWebsiteExperiments")}'],
  ['Loading experiments…', '{wb("panels.loadingExperiments")}'],
  ['A/B Testing', '{wb("panels.abTesting")}'],
  ['<h3 className="text-lg font-bold text-white">Experiments</h3>', '<h3 className="text-lg font-bold text-white">{wb("panels.experimentsTitle")}</h3>'],
  ['Create Variant A / Variant B, duplicate sections, split traffic, and\n            automatically declare winning variants by conversion rate.', '{wb("panels.experimentsDescription")}'],
  ['New experiment', '{wb("panels.newExperiment")}'],
  ['No experiments yet. Create Variant A and B to start optimizing.', '{wb("panels.noExperimentsYet")}'],
  ['Winner declared', '{wb("panels.winnerDeclared")}'],
  ['useState("Hero headline & CTA test")', 'useState(wb("panels.defaultExperimentName"))'],
  ['useState("Original headline")', 'useState(wb("panels.defaultControlHeadline"))'],
  ['"Grow faster with a conversion-ready website"', 'wb("panels.defaultVariantHeadline")'],
  ['useState("Get started")', 'useState(wb("panels.defaultButtonControl"))'],
  ['useState("Book a free consult")', 'useState(wb("panels.defaultButtonVariant"))'],
  ['name: "Control (A)"', 'name: wb("panels.controlA")'],
  ['name: "Challenger (B)"', 'name: wb("panels.challengerB")'],
  ['placeholder="Hypothesis"', 'placeholder={wb("panels.hypothesisPlaceholder")}'],
  ['placeholder="Variant A (control) value"', 'placeholder={wb("panels.variantAPlaceholder")}'],
  ['placeholder="Variant B value"', 'placeholder={wb("panels.variantBPlaceholder")}'],
  ['placeholder="Button A"', 'placeholder={wb("panels.buttonAPlaceholder")}'],
  ['placeholder="Button B"', 'placeholder={wb("panels.buttonBPlaceholder")}'],
]);

total += patchFile(analytics, [
  ['{data.projectName || "Website"} performance', '{wb("panels.performanceTitle", { name: data.projectName || wb("labels.website") })}'],
  ['Analytics Engine', '{wb("panels.analyticsEngine")}'],
  ['Page views, visitors, sessions, clicks, conversions, traffic sources,\n            and devices — with AI conversion recommendations.', '{wb("panels.analyticsDescription")}'],
  ['? " Includes seeded baseline traffic until live events accumulate." : null', '? wb("panels.analyticsSeededHint") : null'],
  ['Conversion score', '{wb("panels.conversionScore")}'],
  ['label="Conversions"', 'label={wb("panels.conversions")}'],
  ['Performance (14 days)', '{wb("panels.performance14Days")}'],
  ['title="Top pages"', 'title={wb("panels.topPages")}'],
  ['title="Top buttons"', 'title={wb("panels.topButtons")}'],
  ['AI conversion recommendations', '{wb("panels.aiConversionRecommendations")}'],
  ['title="Better CTA text"', 'title={wb("panels.betterCta")}'],
  ['title="Layout"', 'title={wb("panels.layout")}'],
  ['title="Missing trust"', 'title={wb("panels.missingTrust")}'],
]);

console.log(`Applied ${total} file patch groups`);
