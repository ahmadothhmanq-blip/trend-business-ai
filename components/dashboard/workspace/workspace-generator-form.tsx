import { AlertTriangle, Loader2, Wand2 } from "lucide-react";
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
  isGenerating: boolean;
  progress: number;
  apiError: string | null;
  onGenerate: () => void;
};

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
  isGenerating,
  progress,
  apiError,
  onGenerate,
}: WorkspaceGeneratorFormProps) {
  return (
    <DashboardPanel className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-premium-gold/50 to-transparent" />
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">AI Generation Studio</h3>
          <p className="mt-1 text-[13px] text-white/40">
            Generate structured, production-ready workspace output.
          </p>
        </div>
        <Badge className="border-premium-gold/20 bg-premium-gold/10 text-premium-gold-light">
          {metadata.generateLabel}
        </Badge>
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold tracking-wide text-white/45 uppercase">
              Language
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
              Theme
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

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            value={selectedTemplate}
            onChange={(event) => onTemplateChange(event.target.value)}
            className="h-12 rounded-2xl border-white/[0.08] bg-white/[0.035] px-4 text-white focus-visible:border-premium-gold/35 focus-visible:ring-premium-gold/15"
            aria-label="Selected template"
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
            {isGenerating ? "Generating..." : metadata.generateLabel}
          </Button>
        </div>

        {isGenerating ? (
          <div className="rounded-2xl border border-premium-gold/20 bg-premium-gold/5 p-4">
            <div className="mb-2 flex items-center justify-between text-[12px] text-premium-gold-light">
              <span>Generation in progress</span>
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
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-[13px] text-red-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{apiError}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {metadata.templates.map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => onTemplateChange(template)}
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
    </DashboardPanel>
  );
}
