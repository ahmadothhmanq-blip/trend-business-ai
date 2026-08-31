"use client";

import { useEffect, useRef, useState } from "react";
import { EditorActions } from "@/components/dashboard/video-studio/editor/editor-actions";
import { EditorAudioPanel } from "@/components/dashboard/video-studio/editor/editor-audio-panel";
import { EditorCaptionsPanel } from "@/components/dashboard/video-studio/editor/editor-captions-panel";
import { EditorInspector } from "@/components/dashboard/video-studio/editor/editor-inspector";
import { EditorPreview } from "@/components/dashboard/video-studio/editor/editor-preview";
import { EditorSceneList } from "@/components/dashboard/video-studio/editor/editor-scene-list";
import { EditorTimeline } from "@/components/dashboard/video-studio/editor/editor-timeline";
import { useVideoEditorT } from "@/components/dashboard/video-studio/editor/use-video-editor-t";
import { useVideoEditor } from "@/components/dashboard/video-studio/editor/use-video-editor";

export function VideoEditorWorkspace({ generationId }: { generationId: string }) {
  const { et } = useVideoEditorT();
  const editor = useVideoEditor(generationId);
  const [rightTab, setRightTab] = useState<"inspect" | "audio" | "captions">("inspect");
  const saveRef = useRef(editor.save);
  const undoRef = useRef(editor.undo);
  const redoRef = useRef(editor.redo);
  useEffect(() => {
    saveRef.current = editor.save;
    undoRef.current = editor.undo;
    redoRef.current = editor.redo;
  }, [editor.save, editor.undo, editor.redo]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveRef.current();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) void redoRef.current();
        else void undoRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (editor.loading) {
    return <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-sm text-white/60">{et("loading")}</div>;
  }
  if (editor.error || !editor.doc) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-sm text-amber-200">
        {editor.error || et("errors.noActivePlan")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] text-white">
      <EditorActions
        projectTitle={editor.doc.project.title}
        saveStatus={editor.saveStatus}
        dirty={editor.dirty}
        onSave={() => void editor.save()}
        onUndo={() => void editor.undo()}
        onRedo={() => void editor.redo()}
        onSplit={() => void editor.split()}
        onDuplicate={() => void editor.duplicate()}
        onDelete={() => void editor.remove()}
        onTrimStart={() => void editor.trim("start")}
        onTrimEnd={() => void editor.trim("end")}
        onRegenerate={() => void editor.regenerate()}
        manageHref={`/dashboard/video-studio/${generationId}?view=manage`}
      />
      <div className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)_20rem]">
        <EditorSceneList scenes={editor.scenes} selectedId={editor.selectedId} onSelect={editor.selectScene} />
        <div className="flex min-w-0 flex-col">
          <EditorPreview
            scene={editor.selected}
            preview={editor.preview}
            compositeUrl={editor.doc.compositePreview?.url}
            playhead={editor.playhead}
            onPlayhead={editor.setPlayhead}
          />
          <EditorTimeline
            scenes={editor.scenes}
            selectedId={editor.selectedId}
            playhead={editor.playhead}
            zoom={editor.zoom}
            onSelect={editor.selectScene}
            onPlayhead={editor.setPlayhead}
            onReorder={(ids) => void editor.reorder(ids)}
            onZoom={editor.setZoom}
          />
          {editor.regen ? (
            <div className="border-t border-white/10 px-3 py-2 text-xs text-white/70">
              {et("regeneration.label", { status: editor.regen.status })}
              {editor.regen.attempt != null ? et("regeneration.attempt", { attempt: editor.regen.attempt }) : ""}
              {editor.regen.oldArtifactId
                ? et("regeneration.previous", { id: editor.regen.oldArtifactId.slice(0, 8) })
                : ""}
              {editor.regen.newArtifactId
                ? et("regeneration.active", { id: editor.regen.newArtifactId.slice(0, 8) })
                : ""}
              {editor.regen.error ? et("regeneration.errorSuffix", { error: editor.regen.error }) : ""}
            </div>
          ) : null}
        </div>
        <aside className="border-t border-white/10 lg:border-l lg:border-t-0">
          <div className="flex border-b border-white/10 text-xs">
            {(["inspect", "audio", "captions"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`flex-1 px-2 py-2 capitalize ${rightTab === tab ? "bg-premium-gold/10 text-premium-gold" : "text-white/50"}`}
                onClick={() => setRightTab(tab)}
              >
                {tab === "inspect" ? et("tabs.inspector") : tab === "audio" ? et("tabs.audio") : et("tabs.text")}
              </button>
            ))}
          </div>
          {rightTab === "inspect" ? (
            <EditorInspector scene={editor.selected} onChange={(patch, kind) => void editor.updateSelected(patch, kind)} />
          ) : null}
          {rightTab === "audio" ? (
            <EditorAudioPanel
              audio={editor.doc.audio}
              scene={editor.selected}
              onChange={(patch) => void editor.updateSelected(patch, "immediate")}
            />
          ) : null}
          {rightTab === "captions" ? (
            <EditorCaptionsPanel scene={editor.selected} onChange={(patch) => void editor.updateSelected(patch, "text")} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
