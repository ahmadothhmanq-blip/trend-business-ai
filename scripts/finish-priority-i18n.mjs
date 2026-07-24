#!/usr/bin/env node
/**
 * Finish i18n wiring for priority product management dashboards and tools.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function write(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, "utf8");
}

function patch(rel, reps) {
  const file = path.join(ROOT, rel);
  let c = read(rel);
  let n = 0;
  for (const [from, to] of reps) {
    if (c.includes(from)) {
      c = c.replaceAll(from, to);
      n++;
    }
  }
  if (n) write(rel, c);
  return n;
}

// --- Expand en.json ---
const enPath = path.join(ROOT, "locales/en.json");
const en = JSON.parse(read("locales/en.json"));

const deep = (obj, pathParts, value) => {
  let cur = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!cur[pathParts[i]]) cur[pathParts[i]] = {};
    cur = cur[pathParts[i]];
  }
  cur[pathParts[pathParts.length - 1]] = value;
};

Object.assign(en.products.webappBuilder.management, {
  syncCode: "Sync code",
  saveVersion: "Save version",
  blueprintTitle: "Application blueprint",
  blueprintDescription: "Structured model — editable without regenerating source files",
  stats: {
    screens: "Screens",
    dataModels: "Data models",
    roles: "Roles",
    catalog: "Catalog",
  },
  features: "Features",
  flow: "Flow",
  quality: "Quality",
  intelligenceGrade: "Intelligence {grade} · {score}/100",
  screensNav: "Screens & navigation",
  navigation: "Navigation",
  roles: "Roles",
  screensCount: "{count} screens",
  businessContent: "Business content",
  businessContentDescription: "Products, menu items, and catalog — update without rebuilding the app",
  noCatalogItems: "No catalog items yet.",
  brandSettings: "Brand & settings",
  appName: "App name",
  primaryColor: "Primary color",
  saveName: "Save name",
  applyBrandColors: "Apply brand colors",
  liveAppPreview: "Live app preview",
  liveAppPreviewDescription: "Sandbox runtime from generated files + structured app model",
  livePreviewTitle: "App live preview",
  componentLibrary: "Component library",
  addToSelectedScreen: "Add to selected screen",
  visualEditor: "Visual editor",
  visualEditorDescription: "Drag to reorder · edit props · syncs to code",
  applyProperties: "Apply properties",
  deployment: "Deployment",
  deploymentDescription: "One-click preview or production deploy",
  deployPreview: "Deploy preview",
  deployProduction: "Deploy production",
  provisionBackend: "Provision backend",
  livePreviewPath: "Live preview:",
  aiAssistant: "AI App Assistant",
  aiAssistantDescription: "Natural language edits to the structured app model",
  applyWithAi: "Apply with AI",
  appIntelligence: "App intelligence",
  qualityChecks: "Quality checks",
  versionHistory: "Version history",
  noVersions: "No versions saved yet.",
  restore: "Restore",
  dataModels: "Data models",
  workflowsSchema: "Workflows & schema",
  crud: "CRUD:",
  newScreenName: "New Screen",
  customScreenPurpose: "Custom screen",
  deployFailed: "Deploy failed",
  deployed: "Deployed",
  productionDeployStarted: "Production deploy started",
  assistantPlaceholder:
    'Try: "Add payment system" · "Create orders dashboard" · "Connect database" · "Create admin panel"',
  manualCheckpoint: "Manual checkpoint",
});

en.products.webappBuilder.management.tabs = {
  ...en.products.webappBuilder.management.tabs,
  content: "Content",
  livePreview: "Live Preview",
  visualEditor: "Visual Editor",
};

Object.assign(en.products.videoStudio.management, {
  previewRenderHint: "Run a preview render to generate clip posters from storyboards.",
  compositePreview: "Composite preview",
  noPreviewUrl: "No preview URL",
  deleteFailed: "Delete failed",
  mediaDeleted: "Media deleted",
  ttsProvider: "TTS: {provider}",
  platforms: {
    tiktok: "TikTok",
    instagramReels: "Instagram Reels",
    youtubeShorts: "YouTube Shorts",
    youtube: "YouTube",
    linkedin: "LinkedIn",
  },
});

Object.assign(en.products.brandIdentity.preview, {
  strategy: "Strategy",
  story: "Story",
  logoRules: "Logo Rules",
  workspace: "Workspace",
  mission: "Mission",
  vision: "Vision",
  coreValues: "Core Values",
  tagline: "Tagline",
  elevatorPitch: "Elevator Pitch",
  notSpecified: "Not specified",
  primaryTypography: "Primary: {font}",
  secondaryTypography: "Secondary: {font}",
  headings: "Headings",
  bodyText: "Body Text",
  bodySample:
    "The quick brown fox jumps over the lazy dog. Quality design communicates value and builds trust.",
  tone: "Tone",
  downloadKit: "Download Kit",
  filesTab: "Files",
});

Object.assign(en.products.aiAgents.steps, {
  backToAgents: "Back to Agents",
  createNewAgent: "Create New Agent",
  quickTask: "Quick Task",
  quickTaskDescription: "Run a one-off AI agent task without creating an agent",
  runQuick: "Run",
  type: "Type",
  description: "Description",
  conservative: "Conservative (0.3)",
  balanced: "Balanced (0.5)",
  creative: "Creative (0.7)",
  experimental: "Experimental (1.0)",
  availableTools: "Available Tools",
  createAgentBtn: "Create Agent",
  runAgentTitle: "Run: {name}",
  taskDescription: "Task Description *",
  additionalContext: "Additional Context (optional)",
  maxStepsLabel: "Max Steps",
  stepsFast: "3 steps (Fast)",
  stepsStandard: "6 steps (Standard)",
  stepsThorough: "9 steps (Thorough)",
  stepsComprehensive: "12 steps (Comprehensive)",
  toolsAvailable: "Tools Available:",
  executeAgent: "Execute Agent",
  runs: "{count} runs",
});

en.products.imageGenerator.editor = {
  properties: {
    selectElement: "Select an element to edit properties.",
    title: "Properties — {name}",
    content: "Content",
    fontFamily: "Font family",
    fontSize: "Font size",
    color: "Color",
    alignment: "Alignment",
    alignLeft: "Left",
    alignCenter: "Center",
    alignRight: "Right",
    fill: "Fill",
  },
};

write("locales/en.json", JSON.stringify(en, null, 2) + "\n");
console.log("expanded en.json");

// --- app-management-dashboard ---
patch("components/dashboard/webapp-builder/app-management-dashboard.tsx", [
  ["Loading app management…", '{p("management.loading")}'],
  [
    `  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "screens", label: "Screens" },
    { id: "catalog", label: "Content" },
    { id: "brand", label: "Brand" },
    { id: "preview", label: "Live Preview" },
    { id: "editor", label: "Visual Editor" },
    { id: "deploy", label: "Deploy" },
    { id: "assistant", label: "AI Assistant" },
    { id: "intelligence", label: "Intelligence" },
    { id: "versions", label: "Versions" },
    { id: "data", label: "Data" },
  ];`,
    `  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: p("management.tabs.overview") },
    { id: "screens", label: p("management.tabs.screens") },
    { id: "catalog", label: p("management.tabs.content") },
    { id: "brand", label: p("management.tabs.brand") },
    { id: "preview", label: p("management.tabs.livePreview") },
    { id: "editor", label: p("management.tabs.visualEditor") },
    { id: "deploy", label: p("management.tabs.deploy") },
    { id: "assistant", label: p("management.tabs.assistant") },
    { id: "intelligence", label: p("management.tabs.intelligence") },
    { id: "versions", label: p("management.tabs.versions") },
    { id: "data", label: p("management.tabs.data") },
  ];`,
  ],
  ['<ArrowLeft className="mr-2 size-4" /> Back', '<ArrowLeft className="mr-2 size-4" /> {p("management.backToBuilder")}'],
  ['<RefreshCw className="mr-2 size-4" /> Refresh', '<RefreshCw className="mr-2 size-4" /> {p("management.refresh")}'],
  [">Sync code<", '>{p("management.syncCode")}<'],
  ['<Save className="mr-2 size-4" /> Save version', '<Save className="mr-2 size-4" /> {p("management.saveVersion")}'],
  ["<DashboardCardTitle>Application blueprint</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.blueprintTitle\")}</DashboardCardTitle>"],
  ["Structured model — editable without regenerating source files", '{p("management.blueprintDescription")}'],
  ['["Screens", model.screens.length]', '[p("management.stats.screens"), model.screens.length]'],
  ['["Data models", model.dataModels.length]', '[p("management.stats.dataModels"), model.dataModels.length]'],
  ['["Roles", model.roles.length]', '[p("management.stats.roles"), model.roles.length]'],
  ['["Catalog", model.catalog.length]', '[p("management.stats.catalog"), model.catalog.length]'],
  ['<div className="mb-1 text-xs text-white/40">Features</div>', '<div className="mb-1 text-xs text-white/40">{p("management.features")}</div>'],
  ['Flow: {template.userFlows[0]}', '{p("management.flow")}: {template.userFlows[0]}'],
  ["<DashboardCardTitle>Quality</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.quality\")}</DashboardCardTitle>"],
  [
    "Intelligence {intelligence.grade} · {intelligence.score}/100",
    '{p("management.intelligenceGrade", { grade: intelligence.grade, score: intelligence.score })}',
  ],
  ["<DashboardCardTitle>Screens & navigation</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.screensNav\")}</DashboardCardTitle>"],
  ['name: "New Screen"', 'name: p("management.newScreenName")'],
  ['purpose: "Custom screen"', 'purpose: p("management.customScreenPurpose")'],
  ["<Plus className=\"mr-2 size-4\" /> Add screen", "<Plus className=\"mr-2 size-4\" /> {p(\"management.addScreen\")}"],
  ['<div className="mb-2 text-xs text-white/40">Navigation</div>', '<div className="mb-2 text-xs text-white/40">{p("management.navigation")}</div>'],
  ['<div className="mb-2 text-xs text-white/40">Roles</div>', '<div className="mb-2 text-xs text-white/40">{p("management.roles")}</div>'],
  ["{permissions.map((p) => (", "{permissions.map((perm) => ("],
  ['<div key={p.role}', '<div key={perm.role}'],
  ['<div className="font-medium text-white">{p.role}</div>', '<div className="font-medium text-white">{perm.role}</div>'],
  [
    "{p.screens} screens · {p.dataAccess} data · {p.actions.join(\", \")}",
    '{perm.screens} {p("management.stats.screens").toLowerCase()} · {perm.dataAccess} data · {perm.actions.join(", ")}',
  ],
  ["<DashboardCardTitle>Business content</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.businessContent\")}</DashboardCardTitle>"],
  [
    "Products, menu items, and catalog — update without rebuilding the app",
    '{p("management.businessContentDescription")}',
  ],
  ['placeholder="Item title"', 'placeholder={p("placeholders.itemTitle")}'],
  ['placeholder="Price"', 'placeholder={p("placeholders.itemPrice")}'],
  ["<Plus className=\"mr-2 size-4\" /> Add item", "<Plus className=\"mr-2 size-4\" /> {p(\"management.addItem\")}"],
  ['<p className="text-sm text-white/40">No catalog items yet.</p>', '<p className="text-sm text-white/40">{p("management.noCatalogItems")}</p>'],
  ["<DashboardCardTitle>Brand & settings</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.brandSettings\")}</DashboardCardTitle>"],
  ['<label className="mb-1 block text-xs text-white/50">App name</label>', '<label className="mb-1 block text-xs text-white/50">{p("management.appName")}</label>'],
  ['<label className="mb-1 block text-xs text-white/50">Primary color</label>', '<label className="mb-1 block text-xs text-white/50">{p("management.primaryColor")}</label>'],
  [">Save name<", '>{p("management.saveName")}<'],
  [">Apply brand colors<", '>{p("management.applyBrandColors")}<'],
  ["<DashboardCardTitle>Live app preview</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.liveAppPreview\")}</DashboardCardTitle>"],
  [
    "Sandbox runtime from generated files + structured app model",
    '{p("management.liveAppPreviewDescription")}',
  ],
  ['title="App live preview"', 'title={p("management.livePreviewTitle")}'],
  ["<DashboardCardTitle>Component library</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.componentLibrary\")}</DashboardCardTitle>"],
  ["<DashboardCardDescription>Add to selected screen</DashboardCardDescription>", "<DashboardCardDescription>{p(\"management.addToSelectedScreen\")}</DashboardCardDescription>"],
  ["<DashboardCardTitle>Visual editor</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.visualEditor\")}</DashboardCardTitle>"],
  [
    "<DashboardCardDescription>Drag to reorder · edit props · syncs to code</DashboardCardDescription>",
    "<DashboardCardDescription>{p(\"management.visualEditorDescription\")}</DashboardCardDescription>",
  ],
  ['placeholder="Component title"', 'placeholder={p("management.componentTitlePlaceholder")}'],
  ['placeholder="Primary color override"', 'placeholder={p("management.primaryColorPlaceholder")}'],
  [">Apply properties<", '>{p("management.applyProperties")}<'],
  ["<DashboardCardTitle>Deployment</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.deployment\")}</DashboardCardTitle>"],
  [
    "<DashboardCardDescription>One-click preview or production deploy</DashboardCardDescription>",
    "<DashboardCardDescription>{p(\"management.deploymentDescription\")}</DashboardCardDescription>",
  ],
  ['toast.error(json.error ?? "Deploy failed")', 'toast.error(json.error ?? p("management.deployFailed"))'],
  ['toast.success(json.message ?? "Deployed")', 'toast.success(json.message ?? p("management.deployed"))'],
  ['toast.error("Deploy failed")', 'toast.error(p("management.deployFailed"))'],
  [
    'toast.success(json.message ?? "Production deploy started")',
    'toast.success(json.message ?? p("management.productionDeployStarted"))',
  ],
  [">Deploy preview<", '>{p("management.deployPreview")}<'],
  [">Deploy production<", '>{p("management.deployProduction")}<'],
  [">Provision backend<", '>{p("management.provisionBackend")}<'],
  ["Live preview:", '{p("management.livePreviewPath")}'],
  ["<DashboardCardTitle>AI App Assistant</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.aiAssistant\")}</DashboardCardTitle>"],
  [
    "Natural language edits to the structured app model",
    '{p("management.aiAssistantDescription")}',
  ],
  [
    'placeholder=\'Try: "Add payment system" · "Create orders dashboard" · "Connect database" · "Create admin panel"\'',
    'placeholder={p("management.assistantPlaceholder")}',
  ],
  ["<Sparkles className=\"mr-2 size-4\" /> Apply with AI", "<Sparkles className=\"mr-2 size-4\" /> {p(\"management.applyWithAi\")}"],
  ["<DashboardCardTitle>App intelligence</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.appIntelligence\")}</DashboardCardTitle>"],
  ["<DashboardCardTitle>Quality checks</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.qualityChecks\")}</DashboardCardTitle>"],
  ["<DashboardCardTitle>Version history</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.versionHistory\")}</DashboardCardTitle>"],
  ['<p className="text-sm text-white/40">No versions saved yet.</p>', '<p className="text-sm text-white/40">{p("management.noVersions")}</p>'],
  [">Restore<", '>{p("management.restore")}<'],
  ["<DashboardCardTitle>Data models</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.dataModels\")}</DashboardCardTitle>"],
  ["<DashboardCardTitle>Workflows & schema</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.workflowsSchema\")}</DashboardCardTitle>"],
  ["CRUD: {m.crud.join(", ")}", '{p("management.crud")} {m.crud.join(", ")}'],
  ['note: "Manual checkpoint"', 'note: p("management.manualCheckpoint")'],
]);

// Add missing componentTitlePlaceholder if not in management
if (!en.products.webappBuilder.management.componentTitlePlaceholder) {
  en.products.webappBuilder.management.componentTitlePlaceholder = "Component title";
  en.products.webappBuilder.management.primaryColorPlaceholder = "Primary color override";
  write("locales/en.json", JSON.stringify(en, null, 2) + "\n");
}

// --- video-management-dashboard ---
patch("components/dashboard/video-studio/video-management-dashboard.tsx", [
  [">Process queue<", '>{p("management.processQueue")}<'],
  [">Resume job<", '>{p("management.resumeJob")}<'],
  [">Retry failed<", '>{p("management.retryFailed")}<'],
  [">Export TikTok<", '>{p("management.exportTiktok")}<'],
  ['["Scenes", model.scenes.length]', '[p("management.scenes"), model.scenes.length]'],
  ['["Chapters", model.chapters.length]', '[p("management.chapters"), model.chapters.length]'],
  ['["Assets", model.assets.length]', '[p("management.assets"), model.assets.length]'],
  ['["Jobs", model.jobs.length]', '[p("management.jobs"), model.jobs.length]'],
  [': "FFmpeg missing — multi-scene merge limited"', ': p("management.ffmpegMissing")'],
  ['dbOk ? "DB ok" : "DB: apply 044"', 'dbOk ? p("management.dbOk") : p("management.dbApply")'],
  [
    'providerOk ? `Provider: ${json.preferredProvider}` : "No video API key"',
    'providerOk ? p("management.providerOk", { provider: json.preferredProvider }) : p("management.noVideoApiKey")',
  ],
  [
    'ttsOk ? `TTS: ${json.tts?.provider}` : "TTS preview"',
    'ttsOk ? p("management.ttsProvider", { provider: json.tts?.provider }) : p("management.ttsPreview")',
  ],
  ['json.strictMode ? "Strict" : "Stub allowed"', 'json.strictMode ? p("management.strict") : p("management.stubAllowed")'],
  ['{ffmpegStatus || "Checking assembly tooling…"}', '{ffmpegStatus || p("management.checkingTooling")}'],
  ['title="Trim to seconds"', 'title={p("management.trimToSeconds")}'],
  [
    '{job?.message || "Run a preview render to generate clip posters from storyboards."}',
    '{job?.message || p("management.previewRenderHint")}',
  ],
  ['alt="Composite preview"', 'alt={p("management.compositePreview")}'],
  ['["tiktok", "TikTok"]', '["tiktok", p("management.platforms.tiktok")]'],
  ['["instagram-reels", "Instagram Reels"]', '["instagram-reels", p("management.platforms.instagramReels")]'],
  ['["youtube-shorts", "YouTube Shorts"]', '["youtube-shorts", p("management.platforms.youtubeShorts")]'],
  ['["youtube", "YouTube"]', '["youtube", p("management.platforms.youtube")]'],
  ['["linkedin", "LinkedIn"]', '["linkedin", p("management.platforms.linkedin")]'],
  ['toast.error("No preview URL")', 'toast.error(p("management.noPreviewUrl"))'],
  ['toast.error(json.error ?? "Delete failed")', 'toast.error(json.error ?? p("management.deleteFailed"))'],
  ['toast.success("Media deleted")', 'toast.success(p("management.mediaDeleted"))'],
  ['placeholder="Business name"', 'placeholder={p("placeholders.brandName")}'],
  ['placeholder="Primary color"', 'placeholder={p("placeholders.primaryColor")}'],
]);

// --- ai-agents-workspace ---
let aws = read("components/dashboard/ai-agents/ai-agents-workspace.tsx");
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
  aws = aws.replace("{TABS.map(({ id, label, icon: Icon }) => (", "{TABS.map(({ id, labelKey, icon: Icon }) => (");
  aws = aws.replace(
    '<Icon className="size-3.5" /> <span className="hidden sm:inline">{label}</span>',
    '<Icon className="size-3.5" /> <span className="hidden sm:inline">{p(labelKey)}</span>',
  );
  write("components/dashboard/ai-agents/ai-agents-workspace.tsx", aws);
  console.log("wired ai-agents-workspace");
}

// --- brand-identity-tool preview ---
patch("components/dashboard/brand-identity/brand-identity-tool.tsx", [
  [
    `  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "overview", label: "Overview", show: true },
    { key: "strategy", label: "Strategy", show: !!bp.brandStrategy },
    { key: "story", label: "Story", show: !!bp.brandStory },
    { key: "colors", label: "Colors", show: bp.colorPalette.length > 0 },
    { key: "typography", label: "Typography", show: !!bp.typography.primary },
    { key: "voice", label: "Voice & Tone", show: !!bp.voiceTone.tone },
    { key: "logo", label: "Logo Rules", show: !!bp.logoGuidelines },
    { key: "assets", label: "Assets", show: bp.assets.length > 0 },
    { key: "files", label: "Files", show: bp.files.length > 0 },
  ];`,
    `  const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "overview", label: p("preview.overview"), show: true },
    { key: "strategy", label: p("preview.strategy"), show: !!bp.brandStrategy },
    { key: "story", label: p("preview.story"), show: !!bp.brandStory },
    { key: "colors", label: p("preview.colors"), show: bp.colorPalette.length > 0 },
    { key: "typography", label: p("preview.typography"), show: !!bp.typography.primary },
    { key: "voice", label: p("preview.voice"), show: !!bp.voiceTone.tone },
    { key: "logo", label: p("preview.logoRules"), show: !!bp.logoGuidelines },
    { key: "assets", label: p("preview.assets"), show: bp.assets.length > 0 },
    { key: "files", label: p("preview.filesTab"), show: bp.files.length > 0 },
  ];`,
  ],
  ['<Settings2 className="size-3" /> Workspace', '<Settings2 className="size-3" /> {p("preview.workspace")}'],
  ['<RefreshCw className="size-3" /> Regenerate', '<RefreshCw className="size-3" /> {p("actions.regenerate")}'],
  ['<Wand2 className="size-3" /> Improve with AI', '<Wand2 className="size-3" /> {p("actions.improveWithAi")}'],
  ['URL.revokeObjectURL(url); toast.success("Brand kit downloaded");', 'URL.revokeObjectURL(url); toast.success(p("preview.kitDownloaded"));'],
  ['<Download className="size-3" /> Download Kit', '<Download className="size-3" /> {p("preview.downloadKit")}'],
  ['tracking-wider">Mission</span>', 'tracking-wider">{p("preview.mission")}</span>'],
  ['{bp.mission || "Not specified"}', '{bp.mission || p("preview.notSpecified")}'],
  ['tracking-wider">Vision</span>', 'tracking-wider">{p("preview.vision")}</span>'],
  ['{bp.vision || "Not specified"}', '{bp.vision || p("preview.notSpecified")}'],
  ['tracking-wider">Core Values</span>', 'tracking-wider">{p("preview.coreValues")}</span>'],
  ['tracking-wider">Tagline</span>', 'tracking-wider">{p("preview.tagline")}</span>'],
  ['tracking-wider text-white/40">Elevator Pitch</span>', 'tracking-wider text-white/40">{p("preview.elevatorPitch")}</span>'],
  ['<p className="text-sm font-semibold text-white">Primary: {bp.typography.primary}</p>', '<p className="text-sm font-semibold text-white">{p("preview.primaryTypography", { font: bp.typography.primary })}</p>'],
  ['<p className="text-xs text-white/40">Secondary: {bp.typography.secondary}</p>', '<p className="text-xs text-white/40">{p("preview.secondaryTypography", { font: bp.typography.secondary })}</p>'],
  ['tracking-wider text-white/40">Headings</span>', 'tracking-wider text-white/40">{p("preview.headings")}</span>'],
  ['tracking-wider text-white/40">Body Text</span>', 'tracking-wider text-white/40">{p("preview.bodyText")}</span>'],
  [
    'className="text-base leading-relaxed text-white/60">The quick brown fox jumps over the lazy dog. Quality design communicates value and builds trust.</p>',
    'className="text-base leading-relaxed text-white/60">{p("preview.bodySample")}</p>',
  ],
  ['tracking-wider text-premium-gold-light">Tone</span>', 'tracking-wider text-premium-gold-light">{p("preview.tone")}</span>'],
  ['tracking-wider text-green-400">Do</span>', 'tracking-wider text-green-400">{p("preview.doExamples")}</span>'],
  [`tracking-wider text-red-400">Don&apos;t</span>`, `tracking-wider text-red-400">{p("preview.dontExamples")}</span>`],
]);

// --- ai-agents-tool ---
patch("components/dashboard/ai-agents/ai-agents-tool.tsx", [
  [
    "<DashboardCardTitle>Your Agents ({agents.filter((a) => !a.is_template).length})</DashboardCardTitle>",
    "<DashboardCardTitle>{p(\"steps.yourAgents\", { count: agents.filter((a) => !a.is_template).length })}</DashboardCardTitle>",
  ],
  [
    '<p className="mt-3 text-xs text-white/30">No agents created yet. Use a template or create a custom agent.</p>',
    '<p className="mt-3 text-xs text-white/30">{p("steps.noAgentsYet")}</p>',
  ],
  ['<Play className="size-3" /> Run', '<Play className="size-3" /> {p("nav.run")}'],
  ["<DashboardCardTitle>Quick Task</DashboardCardTitle>", "<DashboardCardTitle>{p(\"steps.quickTask\")}</DashboardCardTitle>"],
  [
    "<DashboardCardDescription>Run a one-off AI agent task without creating an agent</DashboardCardDescription>",
    "<DashboardCardDescription>{p(\"steps.quickTaskDescription\")}</DashboardCardDescription>",
  ],
  ['placeholder="Describe your task..."', 'placeholder={p("placeholders.task")}'],
  ['<Zap className="size-4" /> Run', '<Zap className="size-4" /> {p("steps.runQuick")}'],
  ['<ChevronLeft className="size-3" /> Back to Agents', '<ChevronLeft className="size-3" /> {p("steps.backToAgents")}'],
  ["<DashboardCardTitle>Create New Agent</DashboardCardTitle>", "<DashboardCardTitle>{p(\"steps.createNewAgent\")}</DashboardCardTitle>"],
  ['<label className="mb-1 block text-xs font-medium text-white/60">Agent Name *</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.agentName")}</label>'],
  ['placeholder="My Marketing Agent"', 'placeholder={p("placeholders.agentName")}'],
  ['<label className="mb-1 block text-xs font-medium text-white/60">Type</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.type")}</label>'],
  ['<label className="mb-1 block text-xs font-medium text-white/60">Description</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.description")}</label>'],
  ['placeholder="What this agent does..."', 'placeholder={p("placeholders.agentDescription")}'],
  ['<label className="mb-1 block text-xs font-medium text-white/60">Category</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.category")}</label>'],
  ['<label className="mb-1 block text-xs font-medium text-white/60">Temperature</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.temperature")}</label>'],
  ['<option value="0.3">Conservative (0.3)</option>', '<option value="0.3">{p("steps.conservative")}</option>'],
  ['<option value="0.5">Balanced (0.5)</option>', '<option value="0.5">{p("steps.balanced")}</option>'],
  ['<option value="0.7">Creative (0.7)</option>', '<option value="0.7">{p("steps.creative")}</option>'],
  ['<option value="1.0">Experimental (1.0)</option>', '<option value="1.0">{p("steps.experimental")}</option>'],
  ['<label className="mb-1 block text-xs font-medium text-white/60">System Prompt</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.systemPrompt")}</label>'],
  [
    'placeholder="You are a specialist in... Help users by..."',
    'placeholder={p("placeholders.systemPrompt")}',
  ],
  ['<label className="mb-1.5 block text-xs font-medium text-white/60">Available Tools</label>', '<label className="mb-1.5 block text-xs font-medium text-white/60">{p("steps.availableTools")}</label>'],
  ['onClick={handleCreateAgent}>Create Agent</Button>', 'onClick={handleCreateAgent}>{p("steps.createAgentBtn")}</Button>'],
  [
    '<DashboardCardTitle>{selectedAgent ? `Run: ${selectedAgent.name}` : "Quick Task"}</DashboardCardTitle>',
    '<DashboardCardTitle>{selectedAgent ? p("steps.runAgentTitle", { name: selectedAgent.name }) : p("steps.quickTask")}</DashboardCardTitle>',
  ],
  ['<label className="mb-1 block text-xs font-medium text-white/60">Task Description *</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.task")}</label>'],
  [
    'placeholder="Describe what you want the agent to do..."',
    'placeholder={p("placeholders.task")}',
  ],
  [
    '<label className="mb-1 block text-xs font-medium text-white/60">Additional Context (optional)</label>',
    '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.additionalContext")}</label>',
  ],
  [
    'placeholder="Any additional context, data, or requirements..."',
    'placeholder={p("placeholders.context")}',
  ],
  ['<label className="mb-1 block text-xs font-medium text-white/60">Max Steps</label>', '<label className="mb-1 block text-xs font-medium text-white/60">{p("steps.maxStepsLabel")}</label>'],
  ['<option value="3">3 steps (Fast)</option>', '<option value="3">{p("steps.stepsFast")}</option>'],
  ['<option value="6">6 steps (Standard)</option>', '<option value="6">{p("steps.stepsStandard")}</option>'],
  ['<option value="9">9 steps (Thorough)</option>', '<option value="9">{p("steps.stepsThorough")}</option>'],
  ['<option value="12">12 steps (Comprehensive)</option>', '<option value="12">{p("steps.stepsComprehensive")}</option>'],
  ['<p className="mb-1 text-xs font-medium text-white/60">Tools Available:</p>', '<p className="mb-1 text-xs font-medium text-white/60">{p("steps.toolsAvailable")}</p>'],
  ['<Play className="size-4" /> Execute Agent', '<Play className="size-4" /> {p("steps.executeAgent")}'],
  ['&middot; {agent.total_runs} runs</p>', '&middot; {p("steps.runs", { count: agent.total_runs })}</p>'],
]);

// --- properties-panel ---
let pp = read("components/dashboard/image-generator/editor/properties-panel.tsx");
if (!pp.includes("useProductT")) {
  pp = pp.replace(
    '"use client";\n\nimport { Input }',
    '"use client";\n\nimport { useProductT } from "@/lib/i18n/use-scoped-t";\nimport { Input }',
  );
  pp = pp.replace(
    "export function PropertiesPanel(props: {",
    "export function PropertiesPanel(props: {",
  );
  pp = pp.replace(
    "}) {\n  const el = props.element;",
    "}) {\n  const p = useProductT(\"imageGenerator\");\n  const el = props.element;",
  );
  pp = pp.replace(
    '<p className="text-sm text-white/40">Select an element to edit properties.</p>',
    '<p className="text-sm text-white/40">{p("editor.properties.selectElement")}</p>',
  );
  pp = pp.replace(
    '<p className="text-xs font-semibold uppercase tracking-wide text-white/50">Properties — {el.name}</p>',
    '<p className="text-xs font-semibold uppercase tracking-wide text-white/50">{p("editor.properties.title", { name: el.name })}</p>',
  );
  pp = pp.replace(
    '<label className="mb-1 block text-[10px] uppercase text-white/40">Content</label>',
    '<label className="mb-1 block text-[10px] uppercase text-white/40">{p("editor.properties.content")}</label>',
  );
  pp = pp.replace(
    '<label className="block text-[10px] uppercase text-white/40">Content</label>',
    '<label className="block text-[10px] uppercase text-white/40">{p("editor.properties.content")}</label>',
  );
  pp = pp.replace(
    '<label className="block text-[10px] uppercase text-white/40">Font family</label>',
    '<label className="block text-[10px] uppercase text-white/40">{p("editor.properties.fontFamily")}</label>',
  );
  pp = pp.replace(
    '<label className="block text-[10px] uppercase text-white/40">Font size</label>',
    '<label className="block text-[10px] uppercase text-white/40">{p("editor.properties.fontSize")}</label>',
  );
  pp = pp.replace(
    '<label className="block text-[10px] uppercase text-white/40">Color</label>',
    '<label className="block text-[10px] uppercase text-white/40">{p("editor.properties.color")}</label>',
  );
  pp = pp.replace(
    '<label className="block text-[10px] uppercase text-white/40">Alignment</label>',
    '<label className="block text-[10px] uppercase text-white/40">{p("editor.properties.alignment")}</label>',
  );
  pp = pp.replace('<option value="left">Left</option>', '<option value="left">{p("editor.properties.alignLeft")}</option>');
  pp = pp.replace('<option value="center">Center</option>', '<option value="center">{p("editor.properties.alignCenter")}</option>');
  pp = pp.replace('<option value="right">Right</option>', '<option value="right">{p("editor.properties.alignRight")}</option>');
  pp = pp.replace(
    '<label className="mb-1 block text-[10px] uppercase text-white/40">Fill</label>',
    '<label className="mb-1 block text-[10px] uppercase text-white/40">{p("editor.properties.fill")}</label>',
  );
  write("components/dashboard/image-generator/editor/properties-panel.tsx", pp);
  console.log("wired properties-panel");
}

console.log("finish-priority-i18n complete");
