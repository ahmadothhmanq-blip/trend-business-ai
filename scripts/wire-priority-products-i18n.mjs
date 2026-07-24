#!/usr/bin/env node
/**
 * Wire priority product tool components to useProductT keys.
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

function ensureImports(c, product) {
  if (!c.includes("useProductT")) {
    const anchor = c.includes('from "@/lib/utils"')
      ? 'import { cn } from "@/lib/utils";'
      : '"use client";\n';
    const extra =
      'import { useTranslation } from "@/lib/i18n/client";\nimport { useProductT } from "@/lib/i18n/use-scoped-t";';
    if (anchor === '"use client";\n') {
      c = c.replace('"use client";\n', `"use client";\n\n${extra}\n`);
    } else {
      c = c.replace(anchor, `${anchor}\n${extra}`);
    }
  }
  return c;
}

function addHookInFunction(c, fnPattern, hookLine) {
  if (c.includes(hookLine.trim())) return c;
  return c.replace(fnPattern, (m) => `${m}\n  ${hookLine}`);
}

function apply(file, transforms) {
  const rel = file;
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.log("skip (missing)", rel);
    return;
  }
  let c = read(rel);
  const before = c;
  for (const t of transforms) c = t(c);
  if (c !== before) {
    write(rel, c);
    console.log("wired", rel);
  } else {
    console.log("unchanged", rel);
  }
}

// --- content-studio-tool.tsx ---
apply("components/dashboard/content-studio/content-studio-tool.tsx", [
  (c) => c,
  (c) =>
    addHookInFunction(
      c,
      /function ContentPreview\(\{[\s\S]*?\}\) \{\n  const \{ t \} = useTranslation\(\);/,
      'const p = useProductT("contentStudio");',
    ),
  (c) =>
    c
      .replace(
        '<p className="mt-4 text-white/50">No content to preview</p>',
        '<p className="mt-4 text-white/50">{p("preview.noContent")}</p>',
      )
      .replace(
        /const tabs: \{ key: PreviewTab; label: string; show: boolean \}\[\] = \[[\s\S]*?\];/,
        `const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "content", label: p("preview.content"), show: true },
    { key: "seo", label: bp.seo ? p("preview.seoTab", { score: bp.seo.score }) : p("seo.score"), show: !!bp.seo },
    { key: "headlines", label: p("preview.headlines", { count: bp.headlines.length }), show: bp.headlines.length > 1 },
    { key: "review", label: p("preview.review"), show: bp.suggestions.length > 0 || bp.improvements.length > 0 },
    { key: "files", label: p("preview.files", { count: bp.files.length }), show: bp.files.length > 0 },
  ];`,
      )
      .replace('toast.success("Content copied to clipboard")', 'toast.success(p("preview.contentCopied"))')
      .replace(
        '{copied ? <Check className="size-3" /> : <ClipboardCopy className="size-3" />} {copied ? "Copied" : "Copy"}',
        '{copied ? <Check className="size-3" /> : <ClipboardCopy className="size-3" />} {copied ? p("preview.copied") : t("common.copy")}',
      )
      .replace('toast.success("Content exported")', 'toast.success(p("preview.contentExported"))')
      .replace("> Export ZIP", "> {p(\"preview.exportZip\")}")
      .replace("<RefreshCw className=\"size-3\" /> Regenerate", "<RefreshCw className=\"size-3\" /> {p(\"actions.regenerate\")}")
      .replace("<Wand2 className=\"size-3\" /> Improve with AI", "<Wand2 className=\"size-3\" /> {p(\"actions.improveWithAi\")}")
      .replace('{wordCount} words', '{wordCount} {p("preview.words")}')
      .replace('label="SEO Score"', 'label={p("seo.score")}')
      .replace('label="Readability"', 'label={p("seo.readability")}')
      .replace('label="Word Count"', 'label={p("seo.wordCount")}')
      .replace(">Meta Title<", ">{p(\"seo.metaTitle\")}<")
      .replace(">Meta Description<", ">{p(\"seo.metaDescription\")}<")
      .replace(">Keyword Density<", ">{p(\"seo.keywordDensity\")}<")
      .replace(">Generated FAQ<", ">{p(\"seo.generatedFaq\")}<")
      .replace(">Heading Structure<", ">{p(\"seo.headingStructure\")}<")
      .replace(">Internal Linking Suggestions<", ">{p(\"seo.internalLinking\")}<")
      .replace(">Schema Suggestions<", ">{p(\"seo.schemaSuggestions\")}<")
      .replace(">Suggestions<", ">{p(\"preview.suggestions\")}<")
      .replace(">Improvements<", ">{p(\"preview.improvements\")}<")
      .replaceAll('toast.success("Copied")', 'toast.success(p("preview.copied"))')
      .replace(
        'mode === "continue"\n          ? "Describe the changes you want in natural language."\n          : "Enter your idea to generate content."',
        'mode === "continue"\n          ? p("errors.describeChanges")\n          : p("errors.enterIdeaContent")',
      )
      .replace('toast.error(d.error ?? "Generation failed")', 'toast.error(d.error ?? p("errors.generationFailed"))')
      .replace('toast.success(d.message ?? "Content created!")', 'toast.success(d.message ?? p("toasts.contentCreated"))')
      .replace('} catch { toast.error("Request failed.");', '} catch { toast.error(p("errors.requestFailed"));')
      .replace(
        'toast.message("Describe your changes in natural language, then click Improve with AI.")',
        'toast.message(p("errors.editThenImprove"))',
      )
      .replace('toast.success("Deleted")', 'toast.success(p("toasts.deleted"))')
      .replace(
        'title="Creating your content..." subtitle="AI is writing, analyzing, and optimizing your content"',
        'title={p("generating.title")} subtitle={p("generating.subtitle")}',
      )
      .replace('{ key: "tool" as const, label: "New Content" }', '{ key: "tool" as const, label: p("nav.newContent") }')
      .replace('{ key: "history" as const, label: "My Content" }', '{ key: "history" as const, label: p("nav.myContent") }')
      .replace("<DashboardCardTitle>Or choose a content tool</DashboardCardTitle>", "<DashboardCardTitle>{p(\"steps.chooseTool\")}</DashboardCardTitle>")
      .replace(
        "Optional — One Prompt uses Content Writer by default",
        '{p("steps.chooseToolHint")}',
      )
      .replace(">Configure <ArrowRight", ">{p(\"nav.configure\")} <ArrowRight")
      .replace(
        '{parentId ? "Describe changes (natural language)" : "Content brief *"}',
        '{parentId ? p("steps.describeChanges") : p("steps.contentBrief")}',
      )
      .replace(
        /placeholder=\{\s*parentId\s*\?\s*"Example: Make the tone more conversational[\s\S]*?"Describe the content you want to create[\s\S]*?"\s*\}/,
        'placeholder={parentId ? p("placeholders.editExample") : p("placeholders.contentBrief")}',
      )
      .replace('>Tone</label>', ">{p(\"labels.tone\")}</label>")
      .replace('>Audience</label>', ">{p(\"steps.audience\")}</label>")
      .replace('>Language</label>', ">{p(\"labels.language\")}</label>")
      .replace('>Writing Style</label>', ">{p(\"steps.writingStyle\")}</label>")
      .replace('>Creativity Level</label>', ">{p(\"steps.creativity\")}</label>")
      .replace(
        'placeholder="Describe your brand\'s voice — e.g. \'Tech-savvy, friendly, authoritative\'"',
        'placeholder={p("placeholders.brandVoice")}',
      )
      .replace('placeholder="Search content..."', 'placeholder={p("placeholders.searchContent")}')
      .replace("> Back</Button>", "> {t(\"common.back\")}</Button>")
      .replace("<Sparkles className=\"size-4\" /> Improve with AI", "<Sparkles className=\"size-4\" /> {p(\"actions.improveWithAi\")}")
      .replace("<Sparkles className=\"size-4\" /> Generate Content", "<Sparkles className=\"size-4\" /> {p(\"actions.generate\")}")
      .replace(
        '"[idea] Understanding your topic..."',
        'p("generating.ideaEvent")',
      )
      .replace(
        '"[strategy] Structuring channel-ready copy..."',
        'p("generating.strategyEvent")',
      ),
]);

// --- content-editor.tsx ---
apply("components/dashboard/content-studio/content-editor.tsx", [
  (c) => ensureImports(c),
  (c) =>
    addHookInFunction(
      c,
      /export function ContentEditor\(\{[\s\S]*?\}: Props\) \{/,
      'const { t } = useTranslation();\n  const p = useProductT("contentStudio");',
    ),
  (c) =>
    c
      .replace(
        /const AI_ACTIONS: \{ action: ContentActionType; label: string \}\[\] = \[[\s\S]*?\];/,
        `const AI_ACTION_KEYS: { action: ContentActionType; key: string }[] = [
  { action: "improve", key: "editor.improve" },
  { action: "rewrite", key: "editor.rewrite" },
  { action: "expand", key: "editor.expand" },
  { action: "shorten", key: "editor.shorten" },
  { action: "summarize", key: "editor.summarize" },
  { action: "translate", key: "editor.translate" },
  { action: "change_tone", key: "editor.changeTone" },
  { action: "change_style", key: "editor.changeStyle" },
];`,
      )
      .replace(
        'toast.error("Select text or add content first.")',
        'toast.error(p("errors.selectTextFirst"))',
      )
      .replace('throw new Error(data.error ?? "Action failed")', 'throw new Error(data.error ?? p("errors.actionFailed"))')
      .replace(
        'toast.success(`${action.replace("_", " ")} complete`)',
        'toast.success(p("toasts.actionComplete", { action: action.replace("_", " ") }))',
      )
      .replace(
        'toast.error(e instanceof Error ? e.message : "AI action failed")',
        'toast.error(e instanceof Error ? e.message : p("errors.aiActionFailed"))',
      )
      .replace("<option value=\"rich\">Rich Text</option>", "<option value=\"rich\">{p(\"editor.richText\")}</option>")
      .replace("<option value=\"markdown\">Markdown</option>", "<option value=\"markdown\">{p(\"editor.markdown\")}</option>")
      .replace("<option value=\"draft\">Draft</option>", "<option value=\"draft\">{p(\"editor.draft\")}</option>")
      .replace("<option value=\"published\">Published</option>", "<option value=\"published\">{p(\"editor.published\")}</option>")
      .replace("<option value=\"archived\">Archived</option>", "<option value=\"archived\">{p(\"editor.archived\")}</option>")
      .replace("<span>{wordCount} words</span>", '<span>{p("editor.wordCount", { count: wordCount })}</span>')
      .replace("<span>{charCount} chars</span>", '<span>{p("editor.charCount", { count: charCount })}</span>')
      .replace("{AI_ACTIONS.map(({ action, label }) =>", "{AI_ACTION_KEYS.map(({ action, key }) =>")
      .replace("{label}", "{p(key)}")
      .replace('placeholder="Document title"', 'placeholder={p("placeholders.documentTitle")}')
      .replace('placeholder="Write in markdown…"', 'placeholder={p("placeholders.writeMarkdown")}'),
]);

// --- content-platform-workspace.tsx ---
apply("components/dashboard/content-studio/content-platform-workspace.tsx", [
  (c) => ensureImports(c),
  (c) =>
    addHookInFunction(
      c,
      /export function ContentPlatformWorkspace\(\{ initialDocuments = \[\], initialProjects = \[\] \}: Props\) \{/,
      'const { t } = useTranslation();\n  const p = useProductT("contentStudio");',
    ),
  (c) =>
    c
      .replace('title: "Untitled Document"', 'title: p("workspace.untitledDocument")')
      .replace('toast.error(data.error ?? "Failed to create document")', 'toast.error(data.error ?? p("errors.createDocumentFailed"))')
      .replace('const name = window.prompt("Folder name")', 'const name = window.prompt(p("workspace.folderNamePrompt"))')
      .replace('toast.error("Failed to create folder")', 'toast.error(p("errors.createFolderFailed"))')
      .replace('const name = window.prompt("Project name")', 'const name = window.prompt(p("workspace.projectNamePrompt"))')
      .replace('toast.error("Failed to create project")', 'toast.error(p("errors.createProjectFailed"))')
      .replace('toast.error(data.error ?? "Restore failed")', 'toast.error(data.error ?? p("errors.restoreFailed"))')
      .replace('toast.success("Version restored")', 'toast.success(p("toasts.versionRestored"))')
      .replace("<Plus className=\"mr-1 size-4\" /> New Doc", "<Plus className=\"mr-1 size-4\" /> {p(\"workspace.newDoc\")}")
      .replace(">Project</Button>", "> {p(\"workspace.project\")}</Button>")
      .replace('placeholder="Search documents…"', 'placeholder={p("placeholders.searchDocuments")}')
      .replace(">Templates</Button>", "> {p(\"workspace.templates\")}</Button>")
      .replace("<History className=\"mr-1 size-4\" /> History", "<History className=\"mr-1 size-4\" /> {p(\"workspace.history\")}")
      .replace("<option value=\"\">No brand voice</option>", "<option value=\"\">{p(\"workspace.noBrandVoice\")}</option>")
      .replace(">Projects</p>", "> {p(\"workspace.projects\")}</p>")
      .replace("<FolderOpen className=\"size-4\" /> All Documents", "<FolderOpen className=\"size-4\" /> {p(\"workspace.allDocuments\")}")
      .replace(">Folders</p>", "> {p(\"workspace.folders\")}</p>")
      .replace(">Documents</p>", "> {p(\"workspace.documents\")}</p>")
      .replace(">No documents yet</p>", "> {p(\"workspace.noDocuments\")}</p>")
      .replace(">Version History</p>", "> {p(\"workspace.versionHistory\")}</p>")
      .replace(">No versions yet</p>", "> {p(\"workspace.noVersions\")}</p>")
      .replace(">Restore</Button>", "> {p(\"workspace.restore\")}</Button>")
      .replace(">Select or create a document to start writing</p>", "> {p(\"workspace.selectDocument\")}</p>")
      .replace("<Plus className=\"mr-2 size-4\" /> New Document", "<Plus className=\"mr-2 size-4\" /> {p(\"workspace.newDocument\")}")
      .replace(
        'toast.success(`Template loaded — use AI Studio to generate (${contentTool}/${contentType})`)',
        'toast.success(p("toasts.templateLoaded", { tool: contentTool, type: contentType }))',
      ),
]);

// --- content-calendar.tsx ---
apply("components/dashboard/content-studio/content-calendar.tsx", [
  (c) => ensureImports(c),
  (c) =>
    addHookInFunction(c, /export function ContentCalendar\(\) \{/, 'const { t } = useTranslation();\n  const p = useProductT("contentStudio");'),
  (c) =>
    c
      .replace(
        'const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];',
        'const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;',
      )
      .replace(
        'const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];',
        'const MONTH_KEYS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"] as const;',
      )
      .replace('toast.error("Title is required")', 'toast.error(p("errors.titleRequired"))')
      .replace('toast.error(d.error ?? "Update failed")', 'toast.error(d.error ?? p("errors.updateFailed"))')
      .replace('toast.success("Entry updated")', 'toast.success(p("calendar.entryUpdated"))')
      .replace('toast.error(d.error ?? "Creation failed")', 'toast.error(d.error ?? p("errors.creationFailed"))')
      .replace('toast.success("Entry created")', 'toast.success(p("calendar.entryCreated"))')
      .replace('} catch { toast.error("Request failed"); }', '} catch { toast.error(p("errors.requestFailed")); }')
      .replace('toast.success("Deleted")', 'toast.success(p("toasts.deleted"))')
      .replace("{MONTHS[month]} {year}", '{p(`calendar.months.${MONTH_KEYS[month]}`)} {year}')
      .replace('{v === "month" ? "Month" : "Week"}', '{v === "month" ? p("calendar.month") : p("calendar.week")}')
      .replace("<Plus className=\"size-3\" /> Add Entry", "<Plus className=\"size-3\" /> {p(\"calendar.addEntry\")}")
      .replace("{DAYS.map((d) =>", "{DAY_KEYS.map((d) =>")
      .replace("{d}</div>", '{p(`calendar.days.${d}`)}</div>')
      .replace('>+{dayEntries.length - 3} more</span>', '>+{p("calendar.moreEntries", { count: dayEntries.length - 3 })}</span>')
      .replace("<DashboardCardTitle>Scheduled Content</DashboardCardTitle>", "<DashboardCardTitle>{p(\"calendar.scheduledContent\")}</DashboardCardTitle>")
      .replace(
        "<DashboardCardDescription>{entries.length} entries in {MONTHS[month]}</DashboardCardDescription>",
        '<DashboardCardDescription>{p("calendar.entriesInMonth", { count: entries.length, month: p(`calendar.months.${MONTH_KEYS[month]}`) })}</DashboardCardDescription>',
      )
      .replace('{editingId ? "Edit Entry" : "New Calendar Entry"}', '{editingId ? p("calendar.editEntry") : p("calendar.newEntry")}')
      .replace(">Title *</label>", "> {p(\"calendar.titleLabel\")}</label>")
      .replace('placeholder="Content title"', 'placeholder={p("placeholders.contentTitle")}')
      .replace(">Date *</label>", "> {p(\"calendar.dateLabel\")}</label>")
      .replace(">Time</label>", "> {p(\"calendar.timeLabel\")}</label>")
      .replace(">Content Type</label>", "> {p(\"calendar.contentType\")}</label>")
      .replace(">Status</label>", "> {p(\"calendar.status\")}</label>")
      .replace(">Category</label>", "> {p(\"calendar.category\")}</label>")
      .replace(">Platform</label>", "> {p(\"calendar.platform\")}</label>")
      .replace('<option value="">None</option>', '<option value="">{p("calendar.none")}</option>')
      .replace(">Description</label>", "> {p(\"calendar.description\")}</label>")
      .replace('placeholder="Brief description..."', 'placeholder={p("placeholders.briefDescription")}')
      .replace(">Tags <span", "> {p(\"calendar.tags\")} <span")
      .replace('placeholder="e.g. SEO, Product Launch"', 'placeholder={p("placeholders.tags")}')
      .replace(">Notes</label>", "> {p(\"calendar.notes\")}</label>")
      .replace('placeholder="Internal notes..."', 'placeholder={p("placeholders.internalNotes")}')
      .replace(">Cancel</Button>", "> {t(\"common.cancel\")}</Button>")
      .replace('{editingId ? "Save Changes" : "Add Entry"}', '{editingId ? p("calendar.saveChanges") : p("calendar.addEntry")}'),
]);

// --- video-studio-tool.tsx ---
apply("components/dashboard/video-studio/video-studio-tool.tsx", [
  (c) =>
    addHookInFunction(
      c,
      /function VideoPreview\(\{[\s\S]*?\}\) \{\n  const \{ t \} = useTranslation\(\);/,
      'const p = useProductT("videoStudio");',
    ),
  (c) =>
    c
      .replace('<p className="mt-4 text-white/50">No video project to preview</p>', '<p className="mt-4 text-white/50">{p("preview.noProject")}</p>')
      .replace(
        /const tabs: \{ key: PreviewTab; label: string; show: boolean \}\[\] = \[[\s\S]*?\];/,
        `const tabs: { key: PreviewTab; label: string; show: boolean }[] = [
    { key: "storyboard", label: p("preview.storyboard", { count: bp.scenes.length }), show: bp.scenes.length > 0 },
    { key: "script", label: p("preview.script"), show: !!bp.script || !!bp.voiceoverScript },
    { key: "audio", label: p("preview.audio"), show: bp.musicSuggestions.length > 0 },
    { key: "subtitles", label: p("preview.subtitles"), show: bp.subtitles.length > 0 },
    { key: "thumbnail", label: p("preview.thumbnail"), show: !!bp.thumbnailSvg },
    { key: "files", label: p("preview.files", { count: bp.files.length }), show: bp.files.length > 0 },
  ];`,
      )
      .replace(">Open Production Studio</a>", ">{p(\"preview.openProductionStudio\")}</a>")
      .replaceAll('toast.success("Copied")', 'toast.success(p("preview.copied"))')
      .replace('toast.success("Prompt copied")', 'toast.success(p("preview.promptCopied"))')
      .replace('toast.success("Video project downloaded")', 'toast.success(p("preview.projectDownloaded"))')
      .replace("> Download Project", "> {p(\"preview.downloadProject\")}")
      .replace("{bp.scenes.length} scenes", '{bp.scenes.length} {p("preview.scenes")}')
      .replaceAll("<RefreshCw className=\"size-3\" /> Regenerate", "<RefreshCw className=\"size-3\" /> {p(\"actions.regenerate\")}")
      .replaceAll("<Wand2 className=\"size-3\" /> Improve with AI", "<Wand2 className=\"size-3\" /> {p(\"actions.improveWithAi\")}")
      .replace('toast.error("Enter a batch brief (e.g. Create 20 motivational videos).")', 'toast.error(p("errors.enterBatchBrief"))')
      .replace('toast.error(d.error ?? "Batch failed")', 'toast.error(d.error ?? p("errors.batchFailed"))')
      .replace('toast.success(d.message ?? "Batch updated")', 'toast.success(d.message ?? p("toasts.batchUpdated"))')
      .replace('toast.error("Batch request failed")', 'toast.error(p("errors.batchRequestFailed"))')
      .replace('toast.success("Template applied — refine and generate.")', 'toast.success(p("toasts.templateApplied"))')
      .replace(
        'mode === "continue"\n          ? "Describe the changes you want in natural language."\n          : "Enter your idea to generate a video concept."',
        'mode === "continue"\n          ? p("errors.describeChanges")\n          : p("errors.enterIdeaVideo")',
      )
      .replace('toast.error(d.error ?? "Generation failed")', 'toast.error(d.error ?? p("errors.generationFailed"))')
      .replace('toast.success(d.message ?? "Video project created!")', 'toast.success(d.message ?? p("toasts.videoCreated"))')
      .replace('} catch { toast.error("Request failed.");', '} catch { toast.error(p("errors.requestFailed"));')
      .replace('toast.message("Describe your changes in natural language, then click Improve with AI.")', 'toast.message(p("errors.editThenImprove"))')
      .replace('toast.success("Deleted")', 'toast.success(p("toasts.deleted"))')
      .replace(
        'title="Creating your video project..." subtitle="AI is building storyboard, script, scenes, and audio direction"',
        'title={p("generating.title")} subtitle={p("generating.subtitle")}',
      )
      .replace('{ key: "type" as const, label: "New Video" }', '{ key: "type" as const, label: p("nav.newVideo") }')
      .replace('{ key: "history" as const, label: "My Videos" }', '{ key: "history" as const, label: p("nav.myVideos") }')
      .replace('{ key: "single" as const, label: "Single" }', '{ key: "single" as const, label: p("nav.single") }')
      .replace('{ key: "batch" as const, label: "Batch" }', '{ key: "batch" as const, label: p("nav.batch") }')
      .replace('{ key: "marketplace" as const, label: "Templates" }', '{ key: "marketplace" as const, label: p("nav.templates") }')
      .replace(': "Generate batch"', ': p("steps.generateBatch")')
      .replace('placeholder="Search templates…"', 'placeholder={p("placeholders.searchTemplates")}')
      .replace(">Configure Video <ArrowRight", ">{p(\"steps.configureVideo\")} <ArrowRight")
      .replace('{parentId ? "Describe changes (natural language)" : "Video description *"}', '{parentId ? p("steps.describeChanges") : p("steps.videoDescription")}')
      .replace(
        /placeholder=\{\s*parentId\s*\?\s*"Example: Shorten the intro[\s\S]*?"Describe your video[\s\S]*?"\s*\}/,
        'placeholder={parentId ? p("placeholders.editExample") : p("placeholders.videoBrief")}',
      )
      .replace('placeholder="Search videos..."', 'placeholder={p("placeholders.searchVideos")}'),
]);

// --- image-generator-tool.tsx ---
apply("components/dashboard/image-generator/image-generator-tool.tsx", [
  (c) =>
    addHookInFunction(
      c,
      /function ImagePreview\(\{[\s\S]*?\}\) \{\n  const \{ t \} = useTranslation\(\);/,
      'const p = useProductT("imageGenerator");',
    ),
  (c) =>
    c
      .replace('<p className="mt-4 text-white/50">No generated concepts to preview</p>', '<p className="mt-4 text-white/50">{p("preview.noImages")}</p>')
      .replace('label: "Mood Board"', 'label: p("preview.moodBoard")')
      .replaceAll('toast.success("Prompt copied")', 'toast.success(p("preview.promptCopied"))')
      .replaceAll('toast.success("Copied")', 'toast.success(p("preview.copied"))')
      .replace('toast.success("URL copied")', 'toast.success(p("preview.urlCopied"))')
      .replace('toast.success("Image kit downloaded")', 'toast.success(p("preview.kitDownloaded"))')
      .replace("> Download Kit", "> {p(\"preview.downloadKit\")}")
      .replaceAll("<RefreshCw className=\"size-3\" /> Regenerate", "<RefreshCw className=\"size-3\" /> {p(\"actions.regenerate\")}")
      .replaceAll("<Wand2 className=\"size-3\" /> Improve with AI", "<Wand2 className=\"size-3\" /> {p(\"actions.improveWithAi\")}")
      .replace('mode === "continue"\n          ? "Describe the changes you want in natural language."\n          : "Select an image type and describe your image."', 'mode === "continue"\n          ? p("errors.describeChanges")\n          : p("errors.enterIdeaImage")')
      .replace('setProgressEvents(["Sending request..."])', 'setProgressEvents([p("generating.sendingRequest")])')
      .replace('toast.error(d.error ?? "Generation failed")', 'toast.error(d.error ?? p("errors.generationFailed"))')
      .replace('toast.success(d.message ?? "Images generated!")', 'toast.success(d.message ?? p("toasts.imagesGenerated"))')
      .replace('} catch { toast.error("Request failed.");', '} catch { toast.error(p("errors.requestFailed"));')
      .replace('toast.message("Describe your changes in natural language, then click Improve with AI.")', 'toast.message(p("errors.editThenImprove"))')
      .replace('toast.success("Deleted")', 'toast.success(p("toasts.deleted"))')
      .replace('title="Creating your images..." subtitle="AI is generating concepts, raster images, prompts, and mood board"', 'title={p("generating.title")} subtitle={p("generating.subtitle")}')
      .replace('{ key: "type" as const, label: "New Image" }', '{ key: "type" as const, label: p("nav.newImage") }')
      .replace('{ key: "history" as const, label: "My Images" }', '{ key: "history" as const, label: p("nav.myImages") }')
      .replace(">Configure Image <ArrowRight", ">{p(\"steps.configureImage\")} <ArrowRight")
      .replace('{parentId ? "Describe changes (natural language)" : "Image description *"}', '{parentId ? p("steps.describeChanges") : p("steps.imageDescription")}')
      .replace(/placeholder=\{\s*parentId\s*\?\s*"Example: Make the lighting[\s\S]*?"Describe the image in detail[\s\S]*?"\s*\}/, 'placeholder={parentId ? p("placeholders.editExample") : p("placeholders.imageBrief")}')
      .replace('placeholder="e.g. blurry, text, watermark, low quality..."', 'placeholder={p("placeholders.negativePrompt")}')
      .replace('label="Use my brand identity"', 'label={p("steps.useBrandIdentity")}')
      .replace('placeholder="Brand name"', 'placeholder={p("placeholders.brandName")}')
      .replace('placeholder="Primary color"', 'placeholder={p("placeholders.primaryColor")}')
      .replace('placeholder="Secondary color"', 'placeholder={p("placeholders.secondaryColor")}')
      .replace('placeholder="Accent color"', 'placeholder={p("placeholders.accentColor")}')
      .replace('placeholder="Search images..."', 'placeholder={p("placeholders.searchImages")}'),
]);

// --- webapp-builder-tool.tsx ---
apply("components/dashboard/webapp-builder/webapp-builder-tool.tsx", [
  (c) =>
    c
      .replace('mode === "continue"\n          ? "Describe the changes you want in natural language."\n          : "Enter your idea to generate an app."', 'mode === "continue"\n          ? p("errors.describeChanges")\n          : p("errors.enterIdeaApp")')
      .replace('toast.error(data.error ?? "Generation failed")', 'toast.error(data.error ?? p("errors.generationFailed"))')
      .replace('toast.success(data.message ?? "App created!")', 'toast.success(data.message ?? p("toasts.appCreated"))')
      .replace('} catch { toast.error("Request failed. Check your connection.");', '} catch { toast.error(p("errors.requestFailedConnection"));')
      .replace('toast.message("Describe your changes in natural language, then click Improve with AI.")', 'toast.message(p("errors.editThenImprove"))')
      .replace('toast.success("Deleted")', 'toast.success(p("toasts.deleted"))')
      .replace('title="Creating your app..." subtitle="AI is designing screens, data model, and component architecture"', 'title={p("generating.title")} subtitle={p("generating.subtitle")}')
      .replace('{ key: "type" as const, label: "New App" }', '{ key: "type" as const, label: p("nav.newApp") }')
      .replace('{ key: "history" as const, label: "My Apps" }', '{ key: "history" as const, label: p("nav.myApps") }')
      .replace(">Configure App <ArrowRight", ">{p(\"steps.configureApp\")} <ArrowRight")
      .replace('{parentId ? "Describe changes (natural language)" : "App description *"}', '{parentId ? p("steps.describeChanges") : p("steps.appDescription")}')
      .replace(/placeholder=\{\s*parentId\s*\?\s*"Example:[\s\S]*?"Describe your app[\s\S]*?"\s*\}/, 'placeholder={parentId ? p("placeholders.editExample") : p("placeholders.appBrief")}')
      .replace('>Language</label>', ">{p(\"labels.language\")}</label>")
      .replace('>Design Style</label>', ">{p(\"steps.designStyle\")}</label>")
      .replace('>Color Style</label>', ">{p(\"steps.colorStyle\")}</label>")
      .replace('>Features</label>', ">{p(\"steps.features\")}</label>"),
]);

// --- brand-identity-tool.tsx ---
apply("components/dashboard/brand-identity/brand-identity-tool.tsx", [
  (c) =>
    addHookInFunction(
      c,
      /function BrandPreview\(\{[\s\S]*?\}\) \{\n  const \{ t \} = useTranslation\(\);/,
      'const p = useProductT("brandIdentity");',
    ),
  (c) =>
    c
      .replaceAll('toast.success("Copied")', 'toast.success(p("preview.copied"))')
      .replace('toast.success(`Copied ${color.hex}`)', 'toast.success(p("preview.colorCopied", { hex: color.hex }))')
      .replace('toast.error(d.error ?? "Generation failed")', 'toast.error(d.error ?? p("errors.generationFailed"))')
      .replace('toast.success(d.message ?? "Brand identity created!")', 'toast.success(d.message ?? p("toasts.brandCreated"))')
      .replace('} catch { toast.error("Request failed.");', '} catch { toast.error(p("errors.requestFailed"));')
      .replace('toast.message("Describe your changes in natural language, then click Improve with AI.")', 'toast.message(p("errors.editThenImprove"))')
      .replace('toast.success("Deleted")', 'toast.success(p("toasts.deleted"))')
      .replace('title="Creating your brand identity..." subtitle="AI is designing colors, typography, voice, and brand assets"', 'title={p("generating.title")} subtitle={p("generating.subtitle")}')
      .replace('{ key: "type" as const, label: "New Brand" }', '{ key: "type" as const, label: p("nav.newBrand") }')
      .replace('{ key: "history" as const, label: "My Brands" }', '{ key: "history" as const, label: p("nav.myBrands") }')
      .replace(">Configure Brand <ArrowRight", ">{p(\"steps.configureBrand\")} <ArrowRight")
      .replace('placeholder="Search brands..."', 'placeholder={p("placeholders.searchBrands")}'),
]);

// --- ai-agents-tool.tsx ---
apply("components/dashboard/ai-agents/ai-agents-tool.tsx", [
  (c) =>
    c
      .replace('toast.error("Agent name is required")', 'toast.error(p("errors.agentNameRequired"))')
      .replace('toast.error(d.error ?? "Failed to create agent")', 'toast.error(d.error ?? p("errors.createAgentFailed"))')
      .replace('toast.success("Agent created")', 'toast.success(p("toasts.agentCreated"))')
      .replace('toast.error("Describe your task")', 'toast.error(p("errors.describeTask"))')
      .replace('toast.error(d.error ?? "Agent task failed")', 'toast.error(d.error ?? p("errors.agentTaskFailed"))')
      .replace('toast.success(d.message ?? "Task completed")', 'toast.success(d.message ?? p("toasts.taskCompleted"))')
      .replace('} catch { toast.error("Request failed");', '} catch { toast.error(p("errors.requestFailed"));')
      .replace('toast.success("Agent deleted")', 'toast.success(p("toasts.agentDeleted"))')
      .replace("<Plus className=\"size-3\" /> Create Agent", "<Plus className=\"size-3\" /> {p(\"steps.createAgent\")}")
      .replace("<History className=\"size-3\" /> Execution History", "<History className=\"size-3\" /> {p(\"steps.executionHistory\")}")
      .replace("<DashboardCardTitle>Agent Templates</DashboardCardTitle>", "<DashboardCardTitle>{p(\"steps.agentTemplates\")}</DashboardCardTitle>")
      .replace("Start from a pre-configured agent template", '{p("steps.templatesHint")}')
      .replace("<Copy className=\"size-3\" /> Use Template", "<Copy className=\"size-3\" /> {p(\"steps.useTemplate\")}")
      .replace('>Save Agent</Button>', "> {p(\"steps.saveAgent\")}</Button>"),
]);

// --- workflow-builder.tsx ---
apply("components/dashboard/ai-agents/workflow-builder.tsx", [
  (c) => ensureImports(c),
  (c) => addHookInFunction(c, /export function WorkflowBuilder\(\) \{/, 'const { t } = useTranslation();\n  const p = useProductT("aiAgents");'),
  (c) =>
    c
      .replace('toast.error("Workflow name is required")', 'toast.error(p("errors.workflowNameRequired"))')
      .replace('toast.error("Add at least one step")', 'toast.error(p("errors.addStepRequired"))')
      .replace('toast.error(d.error ?? "Failed")', 'toast.error(d.error ?? p("errors.workflowFailed"))')
      .replace('toast.success("Workflow created")', 'toast.success(p("toasts.workflowCreated"))')
      .replace("<ChevronLeft className=\"size-3\" /> Back", "<ChevronLeft className=\"size-3\" /> {t(\"common.back\")}")
      .replace("<DashboardCardTitle>Create Workflow</DashboardCardTitle>", "<DashboardCardTitle>{p(\"workflows.createWorkflow\")}</DashboardCardTitle>")
      .replace('placeholder="My Workflow"', 'placeholder={p("placeholders.workflowName")}')
      .replace('placeholder="What this workflow does..."', 'placeholder={p("placeholders.workflowDescription")}')
      .replace('placeholder="Step name"', 'placeholder={p("placeholders.stepName")}')
      .replace('<option value="">Select service...</option>', '<option value="">{p("placeholders.selectService")}</option>')
      .replace(">Cancel</Button>", "> {t(\"common.cancel\")}</Button>")
      .replace(">Save Workflow</Button>", "> {p(\"workflows.saveWorkflow\")}</Button>")
      .replace("<h2 className=\"text-sm font-bold text-white/80\">Workflows</h2>", "<h2 className=\"text-sm font-bold text-white/80\">{p(\"workflows.title\")}</h2>")
      .replace("<Plus className=\"size-3\" /> Create Workflow", "<Plus className=\"size-3\" /> {p(\"workflows.createWorkflow\")}"),
]);

// --- prompt-library.tsx ---
apply("components/dashboard/ai-agents/prompt-library.tsx", [
  (c) => ensureImports(c),
  (c) => addHookInFunction(c, /export function PromptLibrary\(\) \{/, 'const { t } = useTranslation();\n  const p = useProductT("aiAgents");'),
  (c) =>
    c
      .replace('toast.error("Title and prompt text are required")', 'toast.error(p("errors.titleAndPromptRequired"))')
      .replace('toast.error(d.error ?? "Failed")', 'toast.error(d.error ?? p("errors.workflowFailed"))')
      .replace('toast.success("Prompt saved")', 'toast.success(p("toasts.promptSaved"))')
      .replace('toast.success("Copied to clipboard")', 'toast.success(p("actions.copyToClipboard"))')
      .replace("<h2 className=\"text-sm font-bold text-white/80\">Prompt Library</h2>", "<h2 className=\"text-sm font-bold text-white/80\">{p(\"prompts.title\")}</h2>")
      .replace('<option value="">All Categories</option>', '<option value="">{p("prompts.allCategories")}</option>')
      .replace("<Plus className=\"size-3\" /> Add Prompt", "<Plus className=\"size-3\" /> {p(\"prompts.addPrompt\")}")
      .replace("<DashboardCardTitle>Save New Prompt</DashboardCardTitle>", "<DashboardCardTitle>{p(\"prompts.saveNewPrompt\")}</DashboardCardTitle>")
      .replace('placeholder="Prompt title"', 'placeholder={p("placeholders.promptTitle")}')
      .replace('placeholder="Write your reusable prompt here..."', 'placeholder={p("placeholders.promptText")}')
      .replace(">Save Prompt</Button>", "> {p(\"prompts.savePrompt\")}</Button>"),
]);

// --- image editor toolbar ---
apply("components/dashboard/image-generator/editor/toolbar.tsx", [
  (c) => ensureImports(c),
  (c) =>
    c.replace(
      /export function EditorToolbar\(props: \{[\s\S]*?\}\) \{/,
      (m) => `${m}\n  const p = useProductT("imageGenerator");`,
    ),
  (c) =>
    c
      .replace("<Save className=\"size-3.5\" /> Save", "<Save className=\"size-3.5\" /> {p(\"editor.save\")}")
      .replace("> PNG</Button>", "> {p(\"editor.png\")}</Button>")
      .replace(">PDF</Button>", "> {p(\"editor.pdf\")}</Button>")
      .replace(">Project</Button>", "> {p(\"editor.project\")}</Button>")
      .replace("<Type className=\"size-3.5\" /> Text", "<Type className=\"size-3.5\" /> {p(\"editor.text\")}")
      .replace("<Square className=\"size-3.5\" /> Shape", "<Square className=\"size-3.5\" /> {p(\"editor.shape\")}")
      .replace("<ImageIcon className=\"size-3.5\" /> Image", "<ImageIcon className=\"size-3.5\" /> {p(\"editor.image\")}")
      .replace("<Star className=\"size-3.5\" /> Icon", "<Star className=\"size-3.5\" /> {p(\"editor.icon\")}")
      .replace("<Layers className=\"size-3.5\" /> Logo", "<Layers className=\"size-3.5\" /> {p(\"editor.logo\")}")
      .replace("<Palette className=\"size-3.5\" /> Brand Kit", "<Palette className=\"size-3.5\" /> {p(\"editor.brandKit\")}")
      .replace("<Wand2 className=\"size-3.5\" /> Enhance", "<Wand2 className=\"size-3.5\" /> {p(\"editor.enhance\")}")
      .replace(">Remove BG</Button>", "> {p(\"editor.removeBg\")}</Button>")
      .replace(">Upscale</Button>", "> {p(\"editor.upscale\")}</Button>"),
]);

// --- video-management-dashboard.tsx (header + tabs) ---
apply("components/dashboard/video-studio/video-management-dashboard.tsx", [
  (c) => ensureImports(c),
  (c) =>
    addHookInFunction(
      c,
      /export function VideoManagementDashboard\(\{ generationId \}: \{ generationId: string \}\) \{/,
      'const { t } = useTranslation();\n  const p = useProductT("videoStudio");',
    ),
  (c) =>
    c
      .replace("Loading video production studio…", '{p("management.loading")}')
      .replace('{ id: "overview", label: "Overview" }', '{ id: "overview", label: p("management.tabs.overview") }')
      .replace('{ id: "timeline", label: "Timeline" }', '{ id: "timeline", label: p("management.tabs.timeline") }')
      .replace('{ id: "preview", label: "Preview / Render" }', '{ id: "preview", label: p("management.tabs.preview") }')
      .replace('{ id: "presenter", label: "Presenter" }', '{ id: "presenter", label: p("management.tabs.presenter") }')
      .replace('{ id: "brand", label: "Brand" }', '{ id: "brand", label: p("management.tabs.brand") }')
      .replace('{ id: "audio", label: "Voice & Audio" }', '{ id: "audio", label: p("management.tabs.audio") }')
      .replace('{ id: "export", label: "Social Export" }', '{ id: "export", label: p("management.tabs.export") }')
      .replace('{ id: "media", label: "Media" }', '{ id: "media", label: p("management.tabs.media") }')
      .replace('{ id: "quality", label: "Quality" }', '{ id: "quality", label: p("management.tabs.quality") }')
      .replace('{ id: "versions", label: "Versions" }', '{ id: "versions", label: p("management.tabs.versions") }')
      .replace("<ArrowLeft className=\"mr-2 size-4\" /> Back", "<ArrowLeft className=\"mr-2 size-4\" /> {t(\"common.back\")}")
      .replace("<RefreshCw className=\"mr-2 size-4\" /> Refresh", "<RefreshCw className=\"mr-2 size-4\" /> {p(\"management.refresh\")}")
      .replace("<Play className=\"mr-2 size-4\" /> Preview render", "<Play className=\"mr-2 size-4\" /> {p(\"management.previewRender\")}")
      .replace("<Film className=\"mr-2 size-4\" /> Full MP4 render", "<Film className=\"mr-2 size-4\" /> {p(\"management.fullRender\")}")
      .replace(">Process queue</Button>", "> {p(\"management.processQueue\")}</Button>")
      .replace(">Resume job</Button>", "> {p(\"management.resumeJob\")}</Button>")
      .replace(">Retry failed</Button>", "> {p(\"management.retryFailed\")}</Button>")
      .replace("<Sparkles className=\"mr-2 size-4\" /> Real TTS", "<Sparkles className=\"mr-2 size-4\" /> {p(\"management.realTts\")}")
      .replace(">Export TikTok</Button>", "> {p(\"management.exportTiktok\")}</Button>")
      .replace("<Save className=\"mr-2 size-4\" /> Save version", "<Save className=\"mr-2 size-4\" /> {p(\"management.saveVersion\")}")
      .replace('toast.error(json.error ?? "Queue processing failed")', 'toast.error(json.error ?? p("management.queueFailed"))')
      .replace('toast.success(json.message ?? "Queue processed")', 'toast.success(json.message ?? p("management.queueProcessed"))')
      .replace('toast.error("Queue processing failed")', 'toast.error(p("management.queueFailed"))')
      .replace('toast.error(json.error ?? "Failed to load")', 'toast.error(json.error ?? p("errors.loadFailed"))')
      .replace('toast.error("Failed to load video management")', 'toast.error(p("management.loadFailed"))')
      .replace('toast.error(json.error ?? "Action failed")', 'toast.error(json.error ?? p("management.actionFailed"))')
      .replace('toast.success(json.message ?? "Updated")', 'toast.success(json.message ?? p("management.updated"))')
      .replace('toast.error("Request failed")', 'toast.error(p("errors.requestFailed"))'),
]);

// --- app-management-dashboard.tsx (header) ---
apply("components/dashboard/webapp-builder/app-management-dashboard.tsx", [
  (c) => ensureImports(c),
  (c) =>
    addHookInFunction(
      c,
      /export function AppManagementDashboard\(\{ generationId \}: \{ generationId: string \}\) \{/,
      'const { t } = useTranslation();\n  const p = useProductT("webappBuilder");',
    ),
  (c) =>
    c
      .replace('toast.error(json.error ?? "Failed to load app")', 'toast.error(json.error ?? p("errors.loadFailed"))')
      .replace('toast.error("Failed to load management data")', 'toast.error(p("errors.loadManagementFailed"))')
      .replace('toast.error(json.error ?? "Action failed")', 'toast.error(json.error ?? p("errors.actionFailed"))')
      .replace('toast.success(json.message ?? "Updated")', 'toast.success(json.message ?? p("management.updated"))')
      .replace('toast.error("Request failed")', 'toast.error(p("errors.requestFailed"))'),
]);

// --- brand-management-dashboard.tsx ---
apply("components/dashboard/brand-identity/brand-management-dashboard.tsx", [
  (c) => ensureImports(c),
  (c) =>
    addHookInFunction(
      c,
      /export function BrandManagementDashboard\(\{ generation: initial \}: Props\) \{/,
      'const { t } = useTranslation();\n  const p = useProductT("brandIdentity");',
    ),
  (c) =>
    c
      .replace('toast.success("Colors updated")', 'toast.success(p("toasts.colorsUpdated"))')
      .replace('toast.success("Typography saved")', 'toast.success(p("toasts.typographySaved"))')
      .replace('toast.error(data.error ?? "Logo generation failed")', 'toast.error(data.error ?? p("errors.logoGenerationFailed"))')
      .replace('toast.success(data.message ?? "Logos generated")', 'toast.success(data.message ?? p("toasts.logosGenerated"))')
      .replace('toast.error(data.error ?? "Kit creation failed")', 'toast.error(data.error ?? p("errors.kitCreationFailed"))')
      .replace('toast.success(data.message ?? "Brand kit created")', 'toast.success(data.message ?? p("toasts.kitCreated"))')
      .replace('toast.error(data.error ?? "Assistant failed")', 'toast.error(data.error ?? p("errors.assistantFailed"))'),
]);

console.log("wire-priority-products-i18n.mjs done");
