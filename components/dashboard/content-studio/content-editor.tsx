"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Minus,
  Sparkles,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { countCharacters, countWords } from "@/lib/content-studio/documents";
import { CONTENT_PLATFORM_STYLES, CONTENT_PLATFORM_TONES } from "@/lib/constants/content-studio";
import type { ContentActionType } from "@/types/content";
import { toast } from "sonner";

type Props = {
  documentId?: string;
  title: string;
  body: string;
  status?: "draft" | "published" | "archived";
  brandIdentityId?: string | null;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
  onStatusChange?: (status: "draft" | "published" | "archived") => void;
  onAutosave?: (payload: { title: string; body: string }) => Promise<void>;
  className?: string;
};

const AI_ACTIONS: { action: ContentActionType; label: string }[] = [
  { action: "improve", label: "Improve" },
  { action: "rewrite", label: "Rewrite" },
  { action: "expand", label: "Expand" },
  { action: "shorten", label: "Shorten" },
  { action: "summarize", label: "Summarize" },
  { action: "translate", label: "Translate" },
  { action: "change_tone", label: "Change Tone" },
  { action: "change_style", label: "Change Style" },
];

export function ContentEditor({
  documentId,
  title,
  body,
  status = "draft",
  brandIdentityId,
  onTitleChange,
  onBodyChange,
  onStatusChange,
  onAutosave,
  className,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [aiTone, setAiTone] = useState("Professional");
  const [aiStyle, setAiStyle] = useState("Standard");
  const [aiBusy, setAiBusy] = useState(false);
  const [viewMode, setViewMode] = useState<"rich" | "markdown">("rich");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = countWords(body);
  const charCount = countCharacters(body);

  useEffect(() => {
    if (viewMode !== "rich" || !editorRef.current) return;
    if (editorRef.current.innerText !== body) {
      editorRef.current.innerHTML = bodyToHtml(body);
    }
  }, [body, viewMode]);

  const scheduleAutosave = useCallback(
    (nextTitle: string, nextBody: string) => {
      if (!onAutosave) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void onAutosave({ title: nextTitle, body: nextBody });
      }, 1500);
    },
    [onAutosave],
  );

  const handleEditorInput = () => {
    const html = editorRef.current?.innerHTML ?? "";
    const text = htmlToText(html);
    onBodyChange(text);
    scheduleAutosave(title, text);
  };

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleEditorInput();
  };

  const runAiAction = async (action: ContentActionType) => {
    const selection = window.getSelection()?.toString().trim();
    const text = selection || body;
    if (!text.trim()) {
      toast.error("Select text or add content first.");
      return;
    }

    setAiBusy(true);
    try {
      const res = await fetch("/api/content-studio/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text,
          tone: action === "change_tone" ? aiTone : undefined,
          style: action === "change_style" ? aiStyle : undefined,
          brandIdentityId: brandIdentityId ?? undefined,
          documentId,
          saveToDocument: Boolean(documentId && !selection),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");

      if (selection && editorRef.current) {
        document.execCommand("insertText", false, data.result);
        handleEditorInput();
      } else {
        onBodyChange(data.result);
        scheduleAutosave(title, data.result);
      }
      toast.success(`${action.replace("_", " ")} complete`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI action failed");
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className={cn("flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.02]", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-white/[0.06] p-2">
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("bold")}>
          <Bold className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("italic")}>
          <Italic className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("strikeThrough")}>
          <Strikethrough className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("formatBlock", "h1")}>
          <Heading1 className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("formatBlock", "h2")}>
          <Heading2 className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("insertUnorderedList")}>
          <List className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/60" onClick={() => exec("insertHorizontalRule")}>
          <Minus className="size-4" />
        </Button>

        <div className="mx-2 h-5 w-px bg-white/10" />

        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as "rich" | "markdown")}
          className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/70"
        >
          <option value="rich">Rich Text</option>
          <option value="markdown">Markdown</option>
        </select>

        {onStatusChange && (
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as "draft" | "published" | "archived")}
            className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/70"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        )}

        <div className="ml-auto flex items-center gap-2 text-xs text-white/40">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      <div className="border-b border-white/[0.06] p-2">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="size-4 text-premium-gold" />
          {AI_ACTIONS.map(({ action, label }) => (
            <Button
              key={action}
              type="button"
              size="sm"
              variant="outline"
              disabled={aiBusy}
              className="h-7 rounded-lg border-white/10 text-xs text-white/70"
              onClick={() => void runAiAction(action)}
            >
              {label}
            </Button>
          ))}
          <select
            value={aiTone}
            onChange={(e) => setAiTone(e.target.value)}
            className="h-7 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/60"
          >
            {CONTENT_PLATFORM_TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={aiStyle}
            onChange={(e) => setAiStyle(e.target.value)}
            className="h-7 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white/60"
          >
            {CONTENT_PLATFORM_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          scheduleAutosave(e.target.value, body);
        }}
        placeholder="Document title"
        className="border-b border-white/[0.06] bg-transparent px-4 py-3 text-lg font-semibold text-white outline-none placeholder:text-white/30"
      />

      {viewMode === "rich" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="min-h-[420px] flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-white/80 outline-none prose-invert"
        />
      ) : (
        <textarea
          value={body}
          onChange={(e) => {
            onBodyChange(e.target.value);
            scheduleAutosave(title, e.target.value);
          }}
          className="min-h-[420px] flex-1 resize-none bg-transparent px-4 py-4 font-mono text-sm leading-relaxed text-white/80 outline-none"
          placeholder="Write in markdown…"
        />
      )}
    </div>
  );
}

function bodyToHtml(text: string): string {
  if (text.includes("<p>") || text.includes("<h")) return text;
  return text
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function htmlToText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
