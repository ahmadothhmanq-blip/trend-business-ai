#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const write = (rel, c) => fs.writeFileSync(path.join(ROOT, rel), c, "utf8");

const en = JSON.parse(read("locales/en.json"));

Object.assign(en.products.videoStudio.management, {
  ffmpegReady: "FFmpeg ready · {version}",
  renderPreview: "Render preview",
  aiPresenter: "AI Human Presenter",
  socialExportTitle: "Social media export",
  captionsVtt: "Captions VTT",
  mediaLibrary: "Media library",
  brandIntegration: "Brand integration",
  voiceAudio: "Voice & audio",
  subtitleCueEditor: "Subtitle cue editor (one line = one cue)",
  qualitySystem: "Quality system",
  versionControl: "Version control",
  noVersionsYet: "No versions yet.",
  manualCheckpoint: "Manual checkpoint",
  qualityScore: "Quality {score}/100",
});

Object.assign(en.products.brandIdentity.management, {
  noBlueprint: "No blueprint available for this brand.",
  backToStudio: "Back to Brand Studio",
  qualityScore: "Quality {score}/100",
  logosBtn: "Logos",
  pdfHtml: "PDF/HTML",
  share: "Share",
  shareLinkCopied: "Share link copied",
  fontsTab: "Fonts",
  mission: "Mission",
  vision: "Vision",
  tagline: "Tagline",
  typography: "Typography",
  primaryHeadings: "Primary / Headings",
  secondaryBody: "Secondary / Body",
  saveFonts: "Save Fonts",
  toneLabel: "Tone:",
  noLogosYet: "No logos yet",
  generateLogoConcepts: "Generate Logo Concepts",
  copySvg: "Copy SVG",
  brandAssistant: "Brand Assistant",
  assistantHint: 'Try: "Make it more luxury", "Change colors to gold", "Create younger identity"',
  assistantPlaceholder: "Describe how to improve your brand...",
  applying: "Applying...",
  apply: "Apply",
  copyTokens: "Copy Tokens",
  copyTokensFor: "Copy brand tokens for {target}",
  tokensCopied: "{target} tokens copied — paste in target builder",
  targets: {
    websiteBuilder: "website builder",
    appBuilder: "app builder",
    videoStudio: "video studio",
  },
});

write("locales/en.json", JSON.stringify(en, null, 2) + "\n");

function patch(rel, reps) {
  let c = read(rel);
  for (const [from, to] of reps) {
    if (c.includes(from)) c = c.replaceAll(from, to);
  }
  write(rel, c);
}

patch("components/dashboard/video-studio/video-management-dashboard.tsx", [
  [">Process queue<", ">{p(\"management.processQueue\")}<"],
  [">Resume job<", ">{p(\"management.resumeJob\")}<"],
  [">Retry failed<", ">{p(\"management.retryFailed\")}<"],
  [">Export TikTok<", ">{p(\"management.exportTiktok\")}<"],
  ['note: "Manual checkpoint"', 'note: p("management.manualCheckpoint")'],
  [
    '`FFmpeg ready · ${json.ffmpeg.version || "ok"}`',
    'p("management.ffmpegReady", { version: json.ffmpeg.version || "ok" })',
  ],
  ["<DashboardCardTitle>Production model</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.productionModel\")}</DashboardCardTitle>"],
  [
    "Structured video project — editable without regenerating from scratch",
    '{p("management.productionDescription")}',
  ],
  [
    "<DashboardCardTitle>Professional timeline</DashboardCardTitle>",
    "<DashboardCardTitle>{p(\"management.professionalTimeline\")}</DashboardCardTitle>",
  ],
  ["<DashboardCardTitle>Render preview</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.renderPreview\")}</DashboardCardTitle>"],
  ["<DashboardCardTitle>AI Human Presenter</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.aiPresenter\")}</DashboardCardTitle>"],
  [
    "<DashboardCardTitle>Social media export</DashboardCardTitle>",
    "<DashboardCardTitle>{p(\"management.socialExportTitle\")}</DashboardCardTitle>",
  ],
  ['<summary className="cursor-pointer text-white/60">Captions VTT</summary>', '<summary className="cursor-pointer text-white/60">{p("management.captionsVtt")}</summary>'],
  ["<DashboardCardTitle>Media library</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.mediaLibrary\")}</DashboardCardTitle>"],
  ["<DashboardCardTitle>Brand integration</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.brandIntegration\")}</DashboardCardTitle>"],
  ["<DashboardCardTitle>Voice & audio</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.voiceAudio\")}</DashboardCardTitle>"],
  [
    '<label className="text-xs text-white/45">Subtitle cue editor (one line = one cue)</label>',
    '<label className="text-xs text-white/45">{p("management.subtitleCueEditor")}</label>',
  ],
  ["<DashboardCardTitle>Quality system</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.qualitySystem\")}</DashboardCardTitle>"],
  ["<DashboardCardTitle>Version control</DashboardCardTitle>", "<DashboardCardTitle>{p(\"management.versionControl\")}</DashboardCardTitle>"],
  ['<p className="text-sm text-white/40">No versions yet.</p>', '<p className="text-sm text-white/40">{p("management.noVersionsYet")}</p>'],
]);

patch("components/dashboard/brand-identity/brand-management-dashboard.tsx", [
  ['<p className="text-white/50">No blueprint available for this brand.</p>', '<p className="text-white/50">{p("management.noBlueprint")}</p>'],
  [">Back to Brand Studio<", ">{p(\"management.backToStudio\")}<"],
  [
    `  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "colors", label: "Colors" },
    { key: "typography", label: "Fonts" },
    { key: "voice", label: "Voice" },
    { key: "logos", label: "Logos" },
    { key: "assets", label: "Assets" },
    { key: "assistant", label: "Assistant" },
    { key: "apply", label: "Apply" },
  ];`,
    `  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: p("management.tabs.overview") },
    { key: "colors", label: p("management.tabs.colors") },
    { key: "typography", label: p("management.tabs.fonts") },
    { key: "voice", label: p("management.tabs.voice") },
    { key: "logos", label: p("management.tabs.logos") },
    { key: "assets", label: p("management.tabs.assets") },
    { key: "assistant", label: p("management.tabs.assistant") },
    { key: "apply", label: p("management.tabs.apply") },
  ];`,
  ],
  ["{generation.brand_type} · Quality {bp.qualityScore ?? \"—\"}/100", '{generation.brand_type} · {p("management.qualityScore", { score: bp.qualityScore ?? "—" })}'],
  ['<RefreshCw className={cn("size-3", logoBusy && "animate-spin")} /> Logos', '<RefreshCw className={cn("size-3", logoBusy && "animate-spin")} /> {p("management.logosBtn")}'],
  ['<Sparkles className="size-3" /> Create Kit', '<Sparkles className="size-3" /> {p("management.createKit")}'],
  ['<Download className="size-3" /> PDF/HTML', '<Download className="size-3" /> {p("management.pdfHtml")}'],
  ['toast.success("Share link copied");', 'toast.success(p("management.shareLinkCopied"));'],
  ['<Share2 className="size-3" /> Share', '<Share2 className="size-3" /> {p("management.share")}'],
  ['tracking-wider text-premium-gold-light">Mission</span>', 'tracking-wider text-premium-gold-light">{p("management.mission")}</span>'],
  ['tracking-wider text-premium-gold-light">Vision</span>', 'tracking-wider text-premium-gold-light">{p("management.vision")}</span>'],
  ['tracking-wider text-premium-gold-light">Tagline</span>', 'tracking-wider text-premium-gold-light">{p("management.tagline")}</span>'],
  ['<Type className="size-4" /> Typography', '<Type className="size-4" /> {p("management.typography")}'],
  ['<label className="mb-1 block text-xs text-white/50">Primary / Headings</label>', '<label className="mb-1 block text-xs text-white/50">{p("management.primaryHeadings")}</label>'],
  ['<label className="mb-1 block text-xs text-white/50">Secondary / Body</label>', '<label className="mb-1 block text-xs text-white/50">{p("management.secondaryBody")}</label>'],
  [">Save Fonts<", ">{p(\"management.saveFonts\")}<"],
  ['<strong>Tone:</strong>', '<strong>{p("management.toneLabel")}</strong>'],
  ['<p className="mt-3 text-sm text-white/50">No logos yet</p>', '<p className="mt-3 text-sm text-white/50">{p("management.noLogosYet")}</p>'],
  [">Generate Logo Concepts<", ">{p(\"management.generateLogoConcepts\")}<"],
  [">Copy SVG<", ">{p(\"management.copySvg\")}<"],
  ['<MessageSquare className="size-4" /> Brand Assistant', '<MessageSquare className="size-4" /> {p("management.brandAssistant")}'],
  [
    'Try: &quot;Make it more luxury&quot;, &quot;Change colors to gold&quot;, &quot;Create younger identity&quot;',
    '{p("management.assistantHint")}',
  ],
  ['placeholder="Describe how to improve your brand..."', 'placeholder={p("placeholders.assistantMessage")}'],
  ['{assistantBusy ? "Applying..." : "Apply"}', '{assistantBusy ? p("management.applying") : p("management.apply")}'],
  ['<ExternalLink className="size-3" /> Copy Tokens', '<ExternalLink className="size-3" /> {p("management.copyTokens")}'],
  [
    'toast.success(`${target} tokens copied — paste in target builder`);',
    'toast.success(p("management.tokensCopied", { target }));',
  ],
  ['Copy brand tokens for {target}', '{p("management.copyTokensFor", { target })}'],
]);

// Add fonts tab key
en.products.brandIdentity.management.tabs.fonts = "Fonts";
write("locales/en.json", JSON.stringify(en, null, 2) + "\n");

console.log("finish-management-dashboards complete");
