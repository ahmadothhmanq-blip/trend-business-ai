#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function patch(rel, reps) {
  const file = path.join(ROOT, rel);
  let c = fs.readFileSync(file, "utf8");
  let n = 0;
  for (const [from, to] of reps) {
    if (c.includes(from)) {
      c = c.replaceAll(from, to);
      n++;
    }
  }
  fs.writeFileSync(file, c);
  return n;
}

// --- webapp app-management-dashboard ---
patch("components/dashboard/webapp-builder/app-management-dashboard.tsx", [
  ['{ id: "overview", label: "Overview" }', '{ id: "overview", label: p("management.tabs.overview") }'],
  ['{ id: "screens", label: "Screens" }', '{ id: "screens", label: p("management.tabs.screens") }'],
  ['{ id: "catalog", label: "Content" }', '{ id: "catalog", label: p("management.tabs.catalog") }'],
  ['{ id: "brand", label: "Brand" }', '{ id: "brand", label: p("management.tabs.brand") }'],
  ['{ id: "preview", label: "Live Preview" }', '{ id: "preview", label: p("management.tabs.preview") }'],
  ['{ id: "editor", label: "Visual Editor" }', '{ id: "editor", label: p("management.tabs.editor") }'],
  ['{ id: "deploy", label: "Deploy" }', '{ id: "deploy", label: p("management.tabs.deploy") }'],
  ['{ id: "assistant", label: "AI Assistant" }', '{ id: "assistant", label: p("management.tabs.assistant") }'],
  ['{ id: "intelligence", label: "Intelligence" }', '{ id: "intelligence", label: p("management.tabs.intelligence") }'],
  ['{ id: "versions", label: "Versions" }', '{ id: "versions", label: p("management.tabs.versions") }'],
  ['{ id: "data", label: "Data" }', '{ id: "data", label: p("management.tabs.data") }'],
  ['<ArrowLeft className="mr-2 size-4" /> Back', '<ArrowLeft className="mr-2 size-4" /> {p("management.backToBuilder")}'],
  ['<RefreshCw className="mr-2 size-4" /> Refresh', '<RefreshCw className="mr-2 size-4" /> {p("management.refresh")}'],
  ['>Sync code<', '>{p("management.syncCode")}<'],
  ['<Save className="mr-2 size-4" /> Save version', '<Save className="mr-2 size-4" /> {p("management.saveVersion")}'],
  ['<DashboardCardTitle>Application blueprint</DashboardCardTitle>', '<DashboardCardTitle>{p("management.blueprintTitle")}</DashboardCardTitle>'],
  ['Structured model — editable without regenerating source files', '{p("management.blueprintDescription")}'],
  ['["Screens", model.screens.length]', '[p("management.stats.screens"), model.screens.length]'],
  ['["Data models", model.dataModels.length]', '[p("management.stats.dataModels"), model.dataModels.length]'],
  ['["Roles", model.roles.length]', '[p("management.stats.roles"), model.roles.length]'],
  ['["Catalog", model.catalog.length]', '[p("management.stats.catalog"), model.catalog.length]'],
  ['<div className="mb-1 text-xs text-white/40">Features</div>', '<div className="mb-1 text-xs text-white/40">{p("management.features")}</div>'],
  ['Flow: {template.userFlows[0]}', '{p("management.flow")}: {template.userFlows[0]}'],
  ['<DashboardCardTitle>Quality score</DashboardCardTitle>', '<DashboardCardTitle>{p("management.qualityScore")}</DashboardCardTitle>'],
  ['>Add screen<', '>{p("management.addScreen")}<'],
  ['name: "New Screen"', 'name: p("management.newScreenName")'],
  ['purpose: "Custom screen"', 'purpose: p("management.customScreenPurpose")'],
  ['placeholder="Item title"', 'placeholder={p("management.itemTitlePlaceholder")}'],
  ['placeholder="Price"', 'placeholder={p("management.pricePlaceholder")}'],
  ['>Add item<', '>{p("management.addItem")}<'],
  ['>Apply brand<', '>{p("management.applyBrand")}<'],
  ['title="App live preview"', 'title={p("management.livePreviewTitle")}'],
  ['placeholder="Component title"', 'placeholder={p("management.componentTitlePlaceholder")}'],
  ['placeholder="Primary color override"', 'placeholder={p("management.primaryColorPlaceholder")}'],
  ['toast.error(json.error ?? "Deploy failed")', 'toast.error(json.error ?? p("management.deployFailed"))'],
  ['toast.success(json.message ?? "Deployed")', 'toast.success(json.message ?? p("management.deployed"))'],
  ['toast.error("Deploy failed")', 'toast.error(p("management.deployFailed"))'],
  ['toast.success(json.message ?? "Production deploy started")', 'toast.success(json.message ?? p("management.productionDeployStarted"))'],
  ['placeholder=\'Try: "Add payment system" · "Create orders dashboard" · "Connect database" · "Create admin panel"\'', 'placeholder={p("management.assistantPlaceholder")}'],
  ['>Run assistant<', '>{p("management.runAssistant")}<'],
  ['>Deploy staging<', '>{p("management.deployStaging")}<'],
  ['>Deploy production<', '>{p("management.deployProduction")}<'],
]);

// --- video management dashboard ---
patch("components/dashboard/video-studio/video-management-dashboard.tsx", [
  ['>Process queue<', '>{p("management.processQueue")}<'],
  ['>Resume job<', '>{p("management.resumeJob")}<'],
  ['>Retry failed<', '>{p("management.retryFailed")}<'],
  ['>Export TikTok<', '>{p("management.exportTiktok")}<'],
  ['["Scenes", model.scenes.length]', '[p("management.scenes"), model.scenes.length]'],
  ['["Chapters", model.chapters.length]', '[p("management.chapters"), model.chapters.length]'],
  ['["Assets", model.assets.length]', '[p("management.assets"), model.assets.length]'],
  ['["Jobs", model.jobs.length]', '[p("management.jobs"), model.jobs.length]'],
  [': "FFmpeg missing — multi-scene merge limited"', ': p("management.ffmpegMissing")'],
  ['dbOk ? "DB ok" : "DB: apply 044"', 'dbOk ? p("management.dbOk") : p("management.dbApply")'],
  ['providerOk ? `Provider: ${json.preferredProvider}` : "No video API key"', 'providerOk ? p("management.providerOk", { provider: json.preferredProvider }) : p("management.noVideoApiKey")'],
  ['ttsOk ? `TTS: ${json.tts?.provider}` : "TTS preview"', 'ttsOk ? p("management.ttsProvider", { provider: json.tts?.provider }) : p("management.ttsPreview")'],
  ['json.strictMode ? "Strict" : "Stub allowed"', 'json.strictMode ? p("management.strict") : p("management.stubAllowed")'],
  ['{ffmpegStatus || "Checking assembly tooling…"}', '{ffmpegStatus || p("management.checkingTooling")}'],
  ['title="Trim to seconds"', 'title={p("management.trimToSeconds")}'],
  ['{job?.message || "Run a preview render to generate clip posters from storyboards."}', '{job?.message || p("management.previewRenderHint")}'],
  ['alt="Composite preview"', 'alt={p("management.compositePreview")}'],
  ['["tiktok", "TikTok"]', '[ "tiktok", p("management.platforms.tiktok") ]'],
  ['["instagram-reels", "Instagram Reels"]', '[ "instagram-reels", p("management.platforms.instagramReels") ]'],
  ['["youtube-shorts", "YouTube Shorts"]', '[ "youtube-shorts", p("management.platforms.youtubeShorts") ]'],
  ['["youtube", "YouTube"]', '[ "youtube", p("management.platforms.youtube") ]'],
  ['["linkedin", "LinkedIn"]', '[ "linkedin", p("management.platforms.linkedin") ]'],
  ['toast.error("No preview URL")', 'toast.error(p("management.noPreviewUrl"))'],
  ['toast.error(json.error ?? "Delete failed")', 'toast.error(json.error ?? p("management.deleteFailed"))'],
  ['toast.success("Media deleted")', 'toast.success(p("management.mediaDeleted"))'],
  ['placeholder="Business name"', 'placeholder={p("placeholders.brandName")}'],
  ['placeholder="Primary color"', 'placeholder={p("placeholders.primaryColor")}'],
]);

// --- ai-agents-workspace ---
let aws = fs.readFileSync(path.join(ROOT, "components/dashboard/ai-agents/ai-agents-workspace.tsx"), "utf8");
if (!aws.includes("useProductT")) {
  aws = aws.replace(
    'import { cn } from "@/lib/utils";',
    'import { cn } from "@/lib/utils";\nimport { useProductT } from "@/lib/i18n/use-scoped-t";',
  );
  aws = aws.replace(
    "export function AiAgentsWorkspace({ initialAgents = [], initialExecutions = [], analyticsSummary }: Props) {\n  const [tab, setTab]",
    'export function AiAgentsWorkspace({ initialAgents = [], initialExecutions = [], analyticsSummary }: Props) {\n  const p = useProductT("aiAgents");\n  const [tab, setTab]',
  );
  aws = aws.replace(
    `const TABS = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "builder", label: "Builder", icon: Brain },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "memory", label: "Memory", icon: History },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "runner", label: "Runner", icon: GitBranch },
  { id: "monitor", label: "Monitor", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "prompts", label: "Prompts", icon: BookOpen },
] as const;`,
    `const TABS = [
  { id: "agents", labelKey: "nav.agents", icon: Bot },
  { id: "builder", labelKey: "workspace.tabs.builder", icon: Brain },
  { id: "tools", labelKey: "workspace.tabs.tools", icon: Wrench },
  { id: "memory", labelKey: "workspace.tabs.memory", icon: History },
  { id: "knowledge", labelKey: "workspace.tabs.knowledge", icon: BookOpen },
  { id: "workflows", labelKey: "nav.workflows", icon: GitBranch },
  { id: "runner", labelKey: "workspace.tabs.runner", icon: GitBranch },
  { id: "monitor", labelKey: "workspace.tabs.monitor", icon: History },
  { id: "analytics", labelKey: "workspace.tabs.analytics", icon: BarChart3 },
  { id: "prompts", labelKey: "nav.prompts", icon: BookOpen },
] as const;`,
  );
  aws = aws.replace(
    "{TABS.map(({ id, label, icon: Icon }) => (",
    "{TABS.map(({ id, labelKey, icon: Icon }) => (",
  );
  aws = aws.replace(
    '<Icon className="size-3.5" /> <span className="hidden sm:inline">{label}</span>',
    '<Icon className="size-3.5" /> <span className="hidden sm:inline">{p(labelKey)}</span>',
  );
  fs.writeFileSync(path.join(ROOT, "components/dashboard/ai-agents/ai-agents-workspace.tsx"), aws);
  console.log("wired ai-agents-workspace.tsx");
}

console.log("wire-management-finishing complete");
