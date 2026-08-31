"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProductT } from "@/lib/i18n/use-scoped-t";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { EditorDocument, EditorScenePreview, ScenePatch } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
import {
  createEditorHistory,
  pushEditorCommand,
  redoEditorCommand,
  undoEditorCommand,
} from "@/lib/ai-core/video-production-platform/editor-mvp/history";
import { editorStateOf } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function useVideoEditor(projectId: string) {
  const p = useProductT("videoStudio");
  const et = useCallback(
    (key: string, values?: Record<string, string | number>) => p(`editor.${key}`, values),
    [p],
  );

  const parseJson = useCallback(
    async (res: Response) => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || json.message || et("errors.requestFailed", { status: res.status }));
      }
      return json;
    },
    [et],
  );
  const [doc, setDoc] = useState<EditorDocument | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<EditorScenePreview | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [dirty, setDirty] = useState(false);
  const [regen, setRegen] = useState<{
    status: string;
    attempt?: number;
    oldArtifactId?: string | null;
    newArtifactId?: string | null;
    error?: string | null;
  } | null>(null);
  const historyRef = useRef(createEditorHistory());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatch = useRef<{ sceneId: string; patch: ScenePatch } | null>(null);
  const textAnchorRef = useRef<{ sceneId: string; before: ScenePatch } | null>(null);

  const scenes = doc?.scenes || [];
  const selected = useMemo(() => scenes.find((scene) => scene.id === selectedId) || scenes[0] || null, [scenes, selectedId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await parseJson(await fetch(`/api/video-studio/projects/${projectId}/editor`));
      setDoc(json);
      setSelectedId((current) => current || json.scenes[0]?.id || null);
      setSaveStatus("saved");
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : et("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [projectId, parseJson, et]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadPreview = useCallback(
    async (sceneId: string) => {
      try {
        const json = await parseJson(await fetch(`/api/video-studio/projects/${projectId}/scenes/${sceneId}`));
        setPreview(json.preview);
      } catch {
        setPreview({ sceneId, artifactId: null, hasPlayable: false });
      }
    },
    [projectId, parseJson],
  );

  useEffect(() => {
    if (selected?.id) void loadPreview(selected.id);
  }, [selected?.id, loadPreview]);

  const applyScenes = (next: Scene[]) => {
    setDoc((current) => (current ? { ...current, scenes: next } : current));
  };

  const persistPatch = async (sceneId: string, patch: ScenePatch, immediate = false) => {
    const run = async () => {
      setSaveStatus("saving");
      const json = await parseJson(
        await fetch(`/api/video-studio/projects/${projectId}/scenes/${sceneId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }),
      );
      if (textAnchorRef.current?.sceneId === sceneId) {
        historyRef.current = pushEditorCommand(historyRef.current, {
          type: "patch",
          sceneId,
          before: textAnchorRef.current.before,
          after: patch,
        });
        textAnchorRef.current = null;
      }
      setDoc((current) =>
        current
          ? { ...current, scenes: current.scenes.map((scene) => (scene.id === json.scene.id ? json.scene : scene)) }
          : current,
      );
      setSaveStatus("saved");
      setDirty(false);
      pendingPatch.current = null;
    };
    const fail = (err: unknown) => {
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : et("errors.saveFailed"));
    };
    if (immediate) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      try {
        await run();
      } catch (err) {
        fail(err);
      }
      return;
    }
    pendingPatch.current = { sceneId, patch };
    setDirty(true);
    setSaveStatus("unsaved");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void run().catch(fail);
    }, 800);
  };

  const save = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const pending = pendingPatch.current;
    if (!pending || !doc) {
      setSaveStatus("saved");
      setDirty(false);
      return;
    }
    await persistPatch(pending.sceneId, pending.patch, true);
  };

  const selectScene = (id: string) => {
    setSelectedId(id);
    const start = scenes.filter((scene) => scene.order < (scenes.find((row) => row.id === id)?.order || 0)).reduce((sum, scene) => sum + scene.duration, 0);
    setPlayhead(start);
  };

  const updateSelected = async (patch: ScenePatch, historyKind: "text" | "duration" | "immediate" = "text") => {
    if (!selected) return;
    const before: ScenePatch = {
      prompt: selected.prompt,
      duration: selected.duration,
      camera: selected.camera,
      visualStyle: selected.visualStyle,
      transition: selected.transition,
      dialogue: selected.dialogue,
      voiceRequired: selected.voiceRequired,
      providerPreference: selected.providerPreference === "omni_flash" ? "auto" : selected.providerPreference,
      fallbackProvider: selected.fallbackProvider,
      characters: selected.characters,
      products: selected.products,
      references: selected.references,
      editor: editorStateOf(selected),
    };
    if (historyKind === "text") {
      if (!textAnchorRef.current || textAnchorRef.current.sceneId !== selected.id) {
        textAnchorRef.current = { sceneId: selected.id, before };
      }
    } else {
      textAnchorRef.current = null;
      historyRef.current = pushEditorCommand(historyRef.current, {
        type: "patch",
        sceneId: selected.id,
        before,
        after: patch,
      });
    }
    await persistPatch(selected.id, patch, historyKind === "immediate" || historyKind === "duration");
  };

  const reorder = async (orderedSceneIds: string[], record = true) => {
    const before = scenes.map((scene) => scene.id);
    if (record) {
      historyRef.current = pushEditorCommand(historyRef.current, { type: "reorder", before, after: orderedSceneIds });
    }
    const json = await parseJson(
      await fetch(`/api/video-studio/projects/${projectId}/scenes/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedSceneIds }),
      }),
    );
    applyScenes(json.scenes);
  };

  const trim = async (edge: "start" | "end", seconds = 0.5) => {
    if (!selected) return;
    historyRef.current = pushEditorCommand(historyRef.current, {
      type: "trim",
      sceneId: selected.id,
      beforeDuration: selected.duration,
      afterDuration: Math.max(0.5, selected.duration - seconds),
      beforeTrimIn: editorStateOf(selected).trimInSec || 0,
      afterTrimIn: (editorStateOf(selected).trimInSec || 0) + (edge === "start" ? seconds : 0),
    });
    const json = await parseJson(
      await fetch(`/api/video-studio/projects/${projectId}/scenes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trim: { edge, seconds } }),
      }),
    );
    setDoc((current) =>
      current ? { ...current, scenes: current.scenes.map((scene) => (scene.id === json.scene.id ? json.scene : scene)) } : current,
    );
  };

  const split = async () => {
    if (!selected) return;
    const start = scenes.filter((scene) => scene.order < selected.order).reduce((sum, scene) => sum + scene.duration, 0);
    const atSec = Math.min(selected.duration - 0.5, Math.max(0.5, playhead - start));
    const json = await parseJson(
      await fetch(`/api/video-studio/projects/${projectId}/scenes/${selected.id}/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atSec, requestId: `split-${selected.id}-${Math.round(atSec * 100)}` }),
      }),
    );
    historyRef.current = pushEditorCommand(historyRef.current, {
      type: "split",
      sceneId: selected.id,
      newSceneId: json.right.id,
      atSec,
      beforeDuration: selected.duration,
      rightScene: json.right,
    });
    applyScenes(json.scenes);
  };

  const duplicate = async () => {
    if (!selected) return;
    const json = await parseJson(
      await fetch(`/api/video-studio/projects/${projectId}/scenes/${selected.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: `dup-${selected.id}-${Date.now()}` }),
      }),
    );
    historyRef.current = pushEditorCommand(historyRef.current, {
      type: "duplicate",
      sceneId: selected.id,
      newSceneId: json.scene.id,
      copy: json.scene,
      index: json.scenes.findIndex((scene: Scene) => scene.id === json.scene.id),
    });
    applyScenes(json.scenes);
    setSelectedId(json.scene.id);
  };

  const remove = async () => {
    if (!selected) return;
    const index = scenes.findIndex((scene) => scene.id === selected.id);
    const json = await removeById(selected.id);
    historyRef.current = pushEditorCommand(historyRef.current, { type: "delete", scene: selected, index });
    setSelectedId(json.scenes[Math.max(0, index - 1)]?.id || json.scenes[0]?.id || null);
  };

  const removeById = async (sceneId: string) => {
    const json = await parseJson(
      await fetch(`/api/video-studio/projects/${projectId}/scenes/${sceneId}`, { method: "DELETE" }),
    );
    applyScenes(json.scenes);
    return json as { scenes: Scene[] };
  };

  const restoreScene = async (scene: Scene, index: number) => {
    const json = await parseJson(
      await fetch(`/api/video-studio/projects/${projectId}/scenes/${scene.id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, scene }),
      }),
    );
    applyScenes(json.scenes);
    return json as { scene: Scene; scenes: Scene[] };
  };

  const undo = async () => {
    textAnchorRef.current = null;
    const result = undoEditorCommand(historyRef.current);
    historyRef.current = result.history;
    const command = result.command;
    if (!command) return;
    try {
      if (command.type === "reorder") await reorder(command.before, false);
      if (command.type === "patch") await persistPatch(command.sceneId, command.before, true);
      if (command.type === "trim") {
        await persistPatch(
          command.sceneId,
          { duration: command.beforeDuration, editor: { trimInSec: command.beforeTrimIn } },
          true,
        );
      }
      if (command.type === "split") {
        await removeById(command.newSceneId);
        await persistPatch(command.sceneId, { duration: command.beforeDuration }, true);
      }
      if (command.type === "duplicate") await removeById(command.newSceneId);
      if (command.type === "delete") {
        await restoreScene(command.scene, command.index);
        setSelectedId(command.scene.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : et("errors.undoFailed"));
    }
  };

  const redo = async () => {
    textAnchorRef.current = null;
    const result = redoEditorCommand(historyRef.current);
    historyRef.current = result.history;
    const command = result.command;
    if (!command) return;
    try {
      if (command.type === "reorder") await reorder(command.after, false);
      if (command.type === "patch") await persistPatch(command.sceneId, command.after, true);
      if (command.type === "trim") {
        await persistPatch(
          command.sceneId,
          { duration: command.afterDuration, editor: { trimInSec: command.afterTrimIn } },
          true,
        );
      }
      if (command.type === "split") {
        await persistPatch(command.sceneId, { duration: command.atSec }, true);
        await restoreScene(command.rightScene, command.rightScene.order);
      }
      if (command.type === "duplicate") await restoreScene(command.copy, command.index);
      if (command.type === "delete") {
        const json = await removeById(command.scene.id);
        setSelectedId(json.scenes[Math.max(0, command.index - 1)]?.id || json.scenes[0]?.id || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : et("errors.redoFailed"));
    }
  };

  const regenerate = async (promptOverride?: string) => {
    if (!selected || !doc) return;
    setRegen({ status: "queued", attempt: 1, oldArtifactId: selected.artifactId || null });
    try {
      const json = await parseJson(
        await fetch(`/api/video-studio/projects/${projectId}/scenes/${selected.id}/regenerate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: doc.plan.id,
            promptOverride,
            providerPreference: selected.providerPreference === "omni_flash" ? "auto" : selected.providerPreference,
            requestId: `editor-regen-${selected.id}-${Date.now()}`,
          }),
        }),
      );
      setRegen({
        status: json.status,
        attempt: json.attempt,
        oldArtifactId: json.preservedArtifactId,
        newArtifactId: json.activeArtifactId,
        error: json.errorMessage,
      });
      await load();
      await loadPreview(selected.id);
    } catch (err) {
      setRegen({
        status: "failed",
        oldArtifactId: selected.artifactId || null,
        newArtifactId: selected.artifactId || null,
        error: err instanceof Error ? err.message : et("errors.regenerationFailed"),
      });
    }
  };

  return {
    doc,
    scenes,
    selected,
    selectedId,
    preview,
    playhead,
    zoom,
    loading,
    error,
    saveStatus,
    dirty,
    regen,
    setPlayhead,
    setZoom,
    selectScene,
    updateSelected,
    reorder,
    trim,
    split,
    duplicate,
    remove,
    undo,
    redo,
    save,
    regenerate,
    reload: load,
  };
}
