"use client";

import {
  AlertTriangle,
  ChevronDown,
  FileUp,
  ImagePlus,
  Loader2,
  Settings2,
  Wand2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import type { WorkspaceMetadata } from "@/lib/workspace/metadata";
import {
  WORKSPACE_LANGUAGES,
  WORKSPACE_THEMES,
  type WorkspaceLanguage,
  type WorkspaceTheme,
} from "@/lib/workspace/metadata";
import type { GenerationDepth } from "@/lib/hooks/use-workspace-tool";
import type { GenerationAttachmentMeta, PromptVersion } from "@/types/database";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type WorkspaceGeneratorFormProps = {
  metadata: WorkspaceMetadata;
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedTemplate: string;
  onTemplateChange: (value: string) => void;
  language: WorkspaceLanguage;
  onLanguageChange: (value: WorkspaceLanguage) => void;
  theme: WorkspaceTheme;
  onThemeChange: (value: WorkspaceTheme) => void;
  depth: GenerationDepth;
  onDepthChange: (value: GenerationDepth) => void;
  selectedOutputs: string[];
  onToggleOutput: (value: string) => void;
  advancedOpen: boolean;
  onAdvancedOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  isStreaming?: boolean;
  streamStatus?: string | null;
  progress: number;
  apiError: string | null;
  onGenerate: () => void;
  onRetry?: () => void;
  attachments?: GenerationAttachmentMeta[];
  uploading?: boolean;
  onUploadFiles?: (files: FileList | null) => void;
  onRemoveAttachment?: (id: string) => void;
  promptVersions?: PromptVersion[];
  onRestorePromptVersion?: (version: PromptVersion) => void;
  autosaveState?: "idle" | "saving" | "saved";
};

const DEPTH_VALUES: GenerationDepth[] = ["focused", "standard", "deep"];

export function WorkspaceGeneratorForm({
  metadata,
  prompt,
  onPromptChange,
  selectedTemplate,
  onTemplateChange,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  depth,
  onDepthChange,
  selectedOutputs,
  onToggleOutput,
  advancedOpen,
  onAdvancedOpenChange,
  isGenerating,
  isStreaming,
  streamStatus,
  progress,
  apiError,
  onGenerate,
  onRetry,
  attachments = [],
  uploading,
  onUploadFiles,
  onRemoveAttachment,
  promptVersions = [],
  onRestorePromptVersion,
  autosaveState = "idle",
}: WorkspaceGeneratorFormProps) {
  const { t } = useTranslation();
  const depthOptions = DEPTH_VALUES.map((value) => ({
    value,
    label: t(`dashboard.workspaceGenerator.depth.${value}.label`),
    hint: t(`dashboard.workspaceGenerator.depth.${value}.hint`),
  }));

  return (
    <DashboardPanel className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-premium-gold/50 to-transparent" />
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">{t("dashboard.workspaceGenerator.title")}</h3>
          <p className="mt-1 text-[13px] text-white/40">
            {t("dashboard.workspaceGenerator.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {autosaveState !== "idle" ? (
            <span className="text-[11px] text-white/35">
              {autosaveState === "saving" ? t("dashboard.workspaceGenerator.autosaving") : t("dashboard.workspaceGenerator.draftSaved")}
            </span>
          ) : null}
          <Badge className="border-premium-gold/20 bg-premium-gold/10 text-premium-gold-light">
            {metadata.generateLabel}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
            {metadata.promptLabel}
          </span>
          <Textarea
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder={metadata.promptPlaceholder}
            className="min-h-[170px] rounded-2xl border-white/[0.08] bg-black/25 p-4 text-white placeholder:text-white/30 focus-visible:border-premium-gold/35 focus-visible:ring-premium-gold/15"
          />
        </label>

        {promptVersions.length > 0 && onRestorePromptVersion ? (
          <div>
            <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
              {t("dashboard.workspaceGenerator.promptVersionHistory")}
            </span>
            <div className="flex flex-wrap gap-2">
              {promptVersions
                .slice()
                .reverse()
                .slice(0, 6)
                .map((version, index) => (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => onRestorePromptVersion(version)}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/50 hover:border-premium-gold/25 hover:text-white/75"
                    title={version.prompt}
                  >
                    v{promptVersions.length - index}
                    {version.mode ? ` · ${version.mode}` : ""}
                  </button>
                ))}
            </div>
          </div>
        ) : null}

        <div>
          <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
            {t("dashboard.workspaceGenerator.templates")}
          </span>
          <div className="flex flex-wrap gap-2">
            {metadata.templates.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => {
                  onTemplateChange(template);
                  if (!prompt.trim()) onPromptChange(template);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] transition-all",
                  selectedTemplate === template
                    ? "border-premium-gold/35 bg-premium-gold/12 text-premium-gold-light"
                    : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:border-premium-gold/25 hover:text-white/75",
                )}
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            value={selectedTemplate}
            onChange={(event) => onTemplateChange(event.target.value)}
            className="h-12 rounded-2xl border-white/[0.08] bg-white/[0.035] px-4 text-white focus-visible:border-premium-gold/35 focus-visible:ring-premium-gold/15"
            aria-label={t("dashboard.workspaceGenerator.selectedTemplateAria")}
            placeholder={t("dashboard.workspaceGenerator.selectedTemplatePlaceholder")}
          />
          <Button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn-gold h-12 rounded-2xl px-6 font-bold text-luxury-black"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            {isGenerating ? t("dashboard.workspaceGenerator.generating") : metadata.generateLabel}
          </Button>
        </div>

        {onUploadFiles ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-white/55 hover:border-premium-gold/25">
              <FileUp className="size-3.5" />
              {uploading ? t("dashboard.workspaceGenerator.uploading") : t("dashboard.workspaceGenerator.uploadFile")}
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.md,.txt,.json,.doc,.docx,image/*"
                onChange={(event) => onUploadFiles(event.target.files)}
                disabled={uploading || isGenerating}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] text-white/55 hover:border-premium-gold/25">
              <ImagePlus className="size-3.5" />
              {t("dashboard.workspaceGenerator.uploadImage")}
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) => onUploadFiles(event.target.files)}
                disabled={uploading || isGenerating}
              />
            </label>
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-white/55"
              >
                {file.fileType === "image" ? t("dashboard.workspaceGenerator.attachmentImage") : t("dashboard.workspaceGenerator.attachmentFile")}: {file.fileName}
                {onRemoveAttachment ? (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(file.id)}
                    className="text-white/35 hover:text-white/70"
                    aria-label={t("dashboard.workspaceGenerator.removeAttachmentAria", { fileName: file.fileName })}
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onAdvancedOpenChange(!advancedOpen)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition hover:border-premium-gold/25"
        >
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/75">
            <Settings2 className="size-4 text-premium-gold-light" />
            {t("dashboard.workspaceGenerator.advancedSettings")}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-white/40 transition-transform",
              advancedOpen && "rotate-180",
            )}
          />
        </button>

        {advancedOpen ? (
          <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
                  {t("dashboard.workspaceGenerator.language")}
                </span>
                <select
                  value={language}
                  onChange={(event) =>
                    onLanguageChange(event.target.value as WorkspaceLanguage)
                  }
                  className="h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 text-white"
                >
                  {WORKSPACE_LANGUAGES.map((option) => (
                    <option key={option} value={option} className="bg-luxury-black">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
                  {t("dashboard.workspaceGenerator.theme")}
                </span>
                <select
                  value={theme}
                  onChange={(event) => onThemeChange(event.target.value as WorkspaceTheme)}
                  className="h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 text-white"
                >
                  {WORKSPACE_THEMES.map((option) => (
                    <option key={option} value={option} className="bg-luxury-black">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
                {t("dashboard.workspaceGenerator.generationDepth")}
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                {depthOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onDepthChange(option.value)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-left transition",
                      depth === option.value
                        ? "border-premium-gold/35 bg-premium-gold/10"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-premium-gold/20",
                    )}
                  >
                    <p className="text-[13px] font-semibold text-white">{option.label}</p>
                    <p className="mt-1 text-[11px] text-white/40">{option.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
                {t("dashboard.workspaceGenerator.focusOutputs")}
              </span>
              <div className="flex flex-wrap gap-2">
                {metadata.outputs.map((output) => (
                  <button
                    key={output}
                    type="button"
                    onClick={() => onToggleOutput(output)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] transition-all",
                      selectedOutputs.includes(output)
                        ? "border-premium-gold/35 bg-premium-gold/12 text-premium-gold-light"
                        : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:border-premium-gold/25 hover:text-white/75",
                    )}
                  >
                    {output}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {isGenerating || isStreaming ? (
          <div className="rounded-2xl border border-premium-gold/20 bg-premium-gold/5 p-4">
            <div className="mb-2 flex items-center justify-between text-[12px] text-premium-gold-light">
              <span>{streamStatus ?? t("dashboard.workspaceGenerator.generationInProgress")}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-premium-gold to-premium-gold-light transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {apiError ? (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-[13px] text-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{apiError}</p>
            </div>
            {onRetry ? (
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-xl border-red-400/30 text-red-100"
                onClick={onRetry}
              >
                {t("dashboard.workspaceGenerator.retry")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </DashboardPanel>
  );
}
